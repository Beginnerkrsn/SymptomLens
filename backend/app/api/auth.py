import os
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.password_reset import (
    generate_reset_token,
    hash_reset_token,
)
from app.models.password_reset_token import PasswordResetToken
from app.models.user import User
from app.schemas.auth import (
    AuthResponse,
    ForgotPasswordRequest,
    LoginRequest,
    RegisterRequest,
    ResetPasswordRequest,
    UserResponse,
)

load_dotenv()


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


bearer_scheme = HTTPBearer(
    auto_error=False
)


FRONTEND_BASE_URL = os.getenv(
    "FRONTEND_BASE_URL",
    "http://localhost:5173",
).rstrip("/")


RESET_TOKEN_EXPIRE_MINUTES = 30


DEV_ENVIRONMENT = os.getenv(
    "ENVIRONMENT",
    "development",
).lower() in {
    "development",
    "dev",
    "local",
}


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_user(
    payload: RegisterRequest,
    db: Session = Depends(get_db),
):
    from app.core.security import (
        create_access_token,
        hash_password,
    )

    full_name = payload.full_name.strip()
    email = str(
        payload.email
    ).strip().lower()

    if len(full_name) < 2:
        raise HTTPException(
            status_code=400,
            detail="Please enter a valid full name.",
        )

    if payload.password != payload.confirm_password:
        raise HTTPException(
            status_code=400,
            detail="Passwords do not match.",
        )

    existing_user = db.scalar(
        select(User).where(
            User.email == email
        )
    )

    if existing_user:
        raise HTTPException(
            status_code=409,
            detail=(
                "An account with this email already exists."
            ),
        )

    user = User(
        full_name=full_name,
        email=email,
        password_hash=hash_password(
            payload.password
        ),
        is_email_verified=False,
        is_active=True,
    )

    db.add(user)

    try:
        db.commit()
        db.refresh(user)

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=409,
            detail=(
                "An account with this email already exists."
            ),
        )

    access_token = create_access_token(
        user_id=user.id
    )

    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        user=user,
    )


@router.post(
    "/login",
    response_model=AuthResponse,
)
def login_user(
    payload: LoginRequest,
    db: Session = Depends(get_db),
):
    from app.core.security import (
        create_access_token,
        verify_password,
    )

    email = str(
        payload.email
    ).strip().lower()

    user = db.scalar(
        select(User).where(
            User.email == email
        )
    )

    if (
        not user
        or not verify_password(
            payload.password,
            user.password_hash,
        )
    ):
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password.",
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )

    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="This account is inactive.",
        )

    access_token = create_access_token(
        user_id=user.id
    )

    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        user=user,
    )


@router.post(
    "/forgot-password",
)
def forgot_password(
    payload: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    email = str(
        payload.email
    ).strip().lower()

    user = db.scalar(
        select(User).where(
            User.email == email
        )
    )

    generic_response = {
        "message": (
            "If an account exists for this email, "
            "a password reset link has been generated."
        )
    }

    if not user or not user.is_active:
        return generic_response

    now = datetime.now(
        timezone.utc
    )

    expires_at = now + timedelta(
        minutes=RESET_TOKEN_EXPIRE_MINUTES
    )

    db.execute(
        update(PasswordResetToken)
        .where(
            PasswordResetToken.user_id
            == user.id,
            PasswordResetToken.used_at.is_(None),
        )
        .values(
            used_at=now
        )
    )

    raw_token = generate_reset_token()
    token_hash = hash_reset_token(
        raw_token
    )

    reset_record = PasswordResetToken(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=expires_at,
        used_at=None,
    )

    db.add(reset_record)

    try:
        db.commit()

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to create a password reset request."
            ),
        )

    reset_link = (
        f"{FRONTEND_BASE_URL}"
        f"/reset-password?token={raw_token}"
    )

    if DEV_ENVIRONMENT:
        print("")
        print("=" * 70)
        print(
            "SYMPTOMLENS PASSWORD RESET - DEVELOPMENT LINK"
        )
        print("=" * 70)
        print(
            f"User: {user.email}"
        )
        print(
            f"Expires in: "
            f"{RESET_TOKEN_EXPIRE_MINUTES} minutes"
        )
        print(
            f"Reset link: {reset_link}"
        )
        print("=" * 70)
        print("")

    return generic_response


@router.post(
    "/reset-password",
)
def reset_password(
    payload: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    from app.core.security import hash_password

    if (
        payload.new_password
        != payload.confirm_password
    ):
        raise HTTPException(
            status_code=400,
            detail="Passwords do not match.",
        )

    token_hash = hash_reset_token(
        payload.token
    )

    reset_record = db.scalar(
        select(PasswordResetToken).where(
            PasswordResetToken.token_hash
            == token_hash
        )
    )

    if not reset_record:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid or expired password reset link."
            ),
        )

    now = datetime.now(
        timezone.utc
    )

    if reset_record.used_at is not None:
        raise HTTPException(
            status_code=400,
            detail=(
                "This password reset link has already "
                "been used."
            ),
        )

    if reset_record.expires_at <= now:
        raise HTTPException(
            status_code=400,
            detail=(
                "This password reset link has expired."
            ),
        )

    user = db.get(
        User,
        reset_record.user_id,
    )

    if not user or not user.is_active:
        raise HTTPException(
            status_code=400,
            detail=(
                "This password reset request is no longer valid."
            ),
        )

    user.password_hash = hash_password(
        payload.new_password
    )

    reset_record.used_at = now

    try:
        db.commit()

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Unable to reset the password.",
        )

    return {
        "message": (
            "Your password has been reset successfully. "
            "You can now sign in with your new password."
        )
    }


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(
        bearer_scheme
    ),
    db: Session = Depends(get_db),
) -> User:
    from app.core.security import decode_access_token

    if credentials is None:
        raise HTTPException(
            status_code=401,
            detail="Authentication required.",
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )

    try:
        payload = decode_access_token(
            credentials.credentials
        )

        subject = payload.get(
            "sub"
        )

        if not subject:
            raise ValueError(
                "Missing token subject."
            )

        user_id = int(subject)

    except (
        ValueError,
        TypeError,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token.",
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )

    except Exception:
        raise HTTPException(
            status_code=401,
            detail=(
                "Invalid or expired authentication token."
            ),
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )

    user = db.get(
        User,
        user_id,
    )

    if not user or not user.is_active:
        raise HTTPException(
            status_code=401,
            detail="User account is unavailable.",
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )

    return user


@router.get(
    "/me",
    response_model=UserResponse,
)
def get_my_profile(
    current_user: User = Depends(
        get_current_user
    ),
):
    return current_user