import re
from functools import lru_cache
from pathlib import Path

import joblib
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.services.symptom_fusion_service import predict_fused
from app.api.auth import get_current_user
from app.core.database import get_db
from app.models.symptom_prediction import SymptomPrediction
from app.models.user import User


router = APIRouter(
    prefix="/predictions",
    tags=["Symptom Analysis"],
)


BASE_DIR = Path(__file__).resolve().parents[2]

MODEL_FILE = (
    BASE_DIR
    / "training"
    / "artifacts"
    / "symptom_model_best.joblib"
)


class SymptomRequest(BaseModel):
    text: str = Field(
        min_length=1,
        max_length=5000,
    )


MEDICAL_TERMS = {
    "pain",
    "ache",
    "aches",
    "fever",
    "chills",
    "cough",
    "cold",
    "sneeze",
    "sneezing",
    "headache",
    "migraine",
    "dizziness",
    "dizzy",
    "nausea",
    "vomiting",
    "vomit",
    "diarrhea",
    "diarrhoea",
    "constipation",
    "fatigue",
    "weakness",
    "weak",
    "tired",
    "tiredness",
    "rash",
    "itch",
    "itching",
    "swelling",
    "bleeding",
    "blood",
    "breathing",
    "breath",
    "shortness",
    "chest",
    "stomach",
    "tummy",
    "belly",
    "abdomen",
    "abdominal",
    "back",
    "throat",
    "urine",
    "urination",
    "urinary",
    "burning",
    "infection",
    "discharge",
    "sore",
    "soreness",
    "temperature",
    "appetite",
    "weight",
    "sleep",
    "seizure",
    "seizures",
    "fainting",
    "faint",
    "heartbeat",
    "palpitations",
    "pressure",
    "vision",
    "blurred",
    "hearing",
    "joint",
    "muscle",
    "breast",
    "skin",
    "lesion",
    "ulcer",
    "painful",
    "swollen",
    "yellow",
    "jaundice",
    "thirst",
    "dehydration",
    "drowsiness",
    "numbness",
    "tingling",
    "cramp",
    "cramps",
    "breathlessness",
}


ASSOCIATED_SYMPTOM_TERMS = {
    "fever",
    "chills",
    "vomiting",
    "vomit",
    "nausea",
    "diarrhea",
    "diarrhoea",
    "cough",
    "rash",
    "swelling",
    "bleeding",
    "dizziness",
    "headache",
    "weakness",
    "fatigue",
    "burning",
    "discharge",
    "shortness",
    "breathlessness",
    "fainting",
    "faint",
    "palpitations",
    "numbness",
    "tingling",
}


MEDICAL_PHRASES = {
    "i have",
    "i am having",
    "i've been having",
    "i feel",
    "i am feeling",
    "symptoms",
    "medical problem",
    "health problem",
    "not feeling well",
    "feeling sick",
    "feeling ill",
    "suffering from",
}


CONTEXT_TERMS = {
    "for",
    "since",
    "days",
    "day",
    "weeks",
    "week",
    "months",
    "month",
    "hours",
    "hour",
    "today",
    "yesterday",
    "morning",
    "night",
    "severe",
    "mild",
    "moderate",
    "worse",
    "worsening",
    "started",
    "right",
    "left",
    "upper",
    "lower",
    "center",
    "centre",
}


PHRASE_EXPANSIONS = [
    (
        r"\b(?:very\s+)?tired\b",
        {
            "fatigue",
        },
    ),
    (
        r"\b(?:really\s+)?exhausted\b",
        {
            "fatigue",
        },
    ),
    (
        r"\b(?:no|low)\s+energy\b",
        {
            "fatigue",
        },
    ),
    (
        r"\bworn\s*out\b",
        {
            "fatigue",
        },
    ),
    (
        r"\bstomach\s+pain\b",
        {
            "stomach pain",
            "abdominal pain",
        },
    ),
    (
        r"\bbelly\s+pain\b",
        {
            "belly pain",
            "abdominal pain",
        },
    ),
    (
        r"\btummy\s+pain\b",
        {
            "tummy pain",
            "abdominal pain",
        },
    ),
    (
        r"\bpain\s+(?:in|around)\s+(?:my\s+)?(?:stomach|belly|tummy)\b",
        {
            "stomach pain",
            "abdominal pain",
        },
    ),
    (
        r"\b(?:head\s+hurts|head\s+is\s+hurting|head\s+pain)\b",
        {
            "headache",
        },
    ),
    (
        r"\b(?:feel|feeling)\s+dizzy\b",
        {
            "dizziness",
            "dizzy",
        },
    ),
    (
        r"\blight[-\s]?headed\b",
        {
            "dizziness",
        },
    ),
    (
        r"\b(?:feel|feeling)\s+faint\b",
        {
            "fainting",
            "faint",
        },
    ),
    (
        r"\b(?:throwing\s+up|throw\s+up|puking|puke)\b",
        {
            "vomiting",
            "vomit",
        },
    ),
    (
        r"\bfeel(?:ing)?\s+like\s+(?:i\s+am\s+going\s+to\s+)?(?:throw\s+up|vomit)\b",
        {
            "nausea",
            "vomiting",
        },
    ),
    (
        r"\b(?:feel|feeling)\s+sick\b",
        {
            "nausea",
        },
    ),
    (
        r"\b(?:sore\s+throat|throat\s+hurts|throat\s+is\s+hurting)\b",
        {
            "sore throat",
            "throat",
        },
    ),
    (
        r"\b(?:can't|cannot|can not)\s+breathe\b",
        {
            "shortness of breath",
            "breathlessness",
        },
    ),
    (
        r"\b(?:hard|difficult|difficulty|trouble)\s+(?:to\s+)?breathe\b",
        {
            "difficulty breathing",
            "shortness of breath",
            "breathlessness",
        },
    ),
    (
    r"\b(?:struggling|struggle)\s+to\s+breathe\b",
    {
        "difficulty breathing",
        "shortness of breath",
        "breathlessness",
    },
),
(
    r"\b(?:coughing|cough)\b",
    {
        "cough",
    },
),
    (
        r"\b(?:short\s+of\s+breath|out\s+of\s+breath)\b",
        {
            "shortness of breath",
            "breathlessness",
        },
    ),
    (
        r"\b(?:chest\s+hurts|chest\s+is\s+hurting|pain\s+in\s+my\s+chest)\b",
        {
            "chest pain",
            "chest",
            "pain",
        },
    ),
    (
        r"\b(?:back\s+hurts|back\s+is\s+hurting|pain\s+in\s+my\s+back)\b",
        {
            "back pain",
            "back",
            "pain",
        },
    ),
    (
        r"\b(?:joint\s+pain|joints\s+hurt)\b",
        {
            "joint pain",
            "joint",
            "pain",
        },
    ),
    (
        r"\b(?:muscle\s+pain|muscles\s+hurt|body\s+aches?)\b",
        {
            "muscle pain",
            "muscle",
            "body pain",
            "ache",
        },
    ),
    (
        r"\b(?:runny\s+nose|nose\s+is\s+running)\b",
        {
            "runny nose",
            "cold",
        },
    ),
    (
        r"\b(?:blocked\s+nose|stuffy\s+nose|nose\s+is\s+blocked)\b",
        {
            "nasal congestion",
            "cold",
        },
    ),
    (
        r"\b(?:loose\s+motions?|loose\s+stools?)\b",
        {
            "diarrhea",
        },
    ),
    (
        r"\b(?:burning|pain)\s+(?:when|while)\s+(?:i\s+)?(?:pee|urinate|urinating)\b",
        {
            "burning urination",
            "urination",
        },
    ),
    (
    r"\b(?:(?:frequently|often|constantly)\s+(?:need\s+to\s+)?(?:urinate|pee|pass\s+urine)|(?:need\s+to\s+)?(?:urinate|pee|pass\s+urine)\s+(?:frequently|often|constantly))\b",
    {
        "frequent urination",
        "urination",
    },
),
    (
        r"\b(?:pee|urinate|urinating)\s+(?:a\s+lot|very\s+often)\b",
        {
            "frequent urination",
            "urination",
        },
    ),
    (
        r"\b(?:yellow\s+eyes?|yellow\s+skin)\b",
        {
            "jaundice",
            "yellow",
        },
    ),
    (
        r"\b(?:skin\s+is\s+itchy|skin\s+feels\s+itchy)\b",
        {
            "itching",
            "skin",
        },
    ),
    (
        r"\b(?:heart\s+is\s+racing|heart\s+racing|heart\s+is\s+pounding)\b",
        {
            "palpitations",
            "heartbeat",
        },
    ),
    (
        r"\b(?:high\s+temperature|temperature\s+is\s+high)\b",
        {
            "fever",
        },
    ),
    (
        r"\b(?:shivering|shaking\s+with\s+cold)\b",
        {
            "chills",
        },
    ),
    (
        r"\b(?:keep\s+sneezing|sneezing\s+a\s+lot)\b",
        {
            "sneezing",
        },
    ),
]


WORD_EXPANSIONS = {
    "tummy": {"stomach", "abdomen"},
    "belly": {"stomach", "abdomen"},
    "queasy": {"nausea"},
    "woozy": {"dizzy", "dizziness"},
    "giddy": {"dizzy", "dizziness"},
    "breathless": {"breathlessness", "shortness"},
    "shaky": {"tremor", "shaking"},
    "weakish": {"weakness"},
    "aching": {"ache", "pain"},
    "aches": {"ache", "pain"},
}


SPELLING_CORRECTIONS = {
    "feaver": "fever",
    "headake": "headache",
    "headche": "headache",
    "dizzyness": "dizziness",
    "diarhea": "diarrhea",
    "diarrhoea": "diarrhea",
    "vomitting": "vomiting",
    "breathlessnes": "breathlessness",
    "stomache": "stomach",
    "swellling": "swelling",
    "naseous": "nausea",
    "nausous": "nausea",
}


SPECIFIC_SINGLE_SYMPTOMS = {
    "fever",
    "chills",
    "cough",
    "headache",
    "migraine",
    "dizziness",
    "nausea",
    "vomiting",
    "diarrhea",
    "constipation",
    "fatigue",
    "weakness",
    "rash",
    "itching",
    "swelling",
    "breathing",
    "breathlessness",
    "shortness",
    "chest",
    "stomach",
    "abdominal",
    "back",
    "throat",
    "urination",
    "burning",
    "palpitations",
    "vision",
    "joint",
    "muscle",
    "jaundice",
    "numbness",
    "tingling",
}


def load_model():
    if not MODEL_FILE.exists():
        raise FileNotFoundError(
            "Symptom model is not available."
        )

    return joblib.load(MODEL_FILE)


@lru_cache(maxsize=1)
def get_model():
    return load_model()


def confidence_level(score: float) -> str:
    if score >= 0.60:
        return "high"

    if score >= 0.35:
        return "moderate"

    if score >= 0.20:
        return "low"

    return "very_low"


def normalize_input(text: str) -> str:
    text = text.strip()

    text = (
        text.replace("\u2018", "'")
        .replace("\u2019", "'")
        .replace("\u201c", '"')
        .replace("\u201d", '"')
        .replace("\u2013", "-")
        .replace("\u2014", "-")
    )

    text = re.sub(
        r"\s+",
        " ",
        text,
    )

    return text


def build_model_text(
    text: str,
) -> tuple[str, list[str]]:
    """
    Preserve the user's original language while adding
    controlled symptom terms that the trained NLP model
    is more likely to recognize.
    """

    lower_text = text.lower()

    symptom_terms = set()

    for pattern, terms in PHRASE_EXPANSIONS:
        if re.search(
            pattern,
            lower_text,
            flags=re.IGNORECASE,
        ):
            symptom_terms.update(terms)

    tokens = tokenize(text)

    for token in tokens:
        corrected = SPELLING_CORRECTIONS.get(
            token,
            token,
        )

        if corrected != token:
            symptom_terms.add(corrected)

        symptom_terms.update(
            WORD_EXPANSIONS.get(
                token,
                set(),
            )
        )

    # Add direct medical words already present.
    symptom_terms.update(
        tokens & MEDICAL_TERMS
    )

    canonical_terms = sorted(
        term
        for term in symptom_terms
        if term.strip()
    )

    if canonical_terms:
        model_text = (
            f"{text} "
            f"{' '.join(canonical_terms)}"
        )
    else:
        model_text = text

    return (
        model_text,
        canonical_terms,
    )


def tokenize(text: str) -> set[str]:
    return {
        token.lower()
        for token in re.findall(
            r"[a-zA-Z]+",
            text,
        )
    }


def contains_medical_content(
    text: str,
) -> bool:
    tokens = tokenize(text)

    if tokens & MEDICAL_TERMS:
        return True

    lower_text = text.lower()

    return any(
        phrase in lower_text
        for phrase in MEDICAL_PHRASES
    )


def contains_obvious_non_medical_content(
    text: str,
) -> bool:
    lower_text = text.lower().strip()

    non_medical_phrases = {
        "hello",
        "hi",
        "hey",
        "how are you",
        "good morning",
        "good afternoon",
        "good evening",
        "thank you",
        "thanks",
        "who are you",
        "what are you",
        "what can you do",
        "tell me a joke",
        "joke",
    }

    return lower_text in non_medical_phrases


def assess_input_information(
    text: str,
) -> tuple[bool, str]:
    """
    Be permissive with natural human descriptions.

    The old gate required several medical terms before
    allowing the model to run. That can reject perfectly
    normal descriptions such as:
        "I have a headache"
        "my tummy hurts"
        "I feel dizzy"

    We now allow the trained model to attempt prediction
    whenever there is at least one recognizable symptom,
    while confidence/review handling remains active.
    """

    tokens = tokenize(text)

    medical_tokens = (
        tokens & MEDICAL_TERMS
    )

    specific_tokens = (
        tokens & SPECIFIC_SINGLE_SYMPTOMS
    )

    associated_tokens = (
        tokens & ASSOCIATED_SYMPTOM_TERMS
    )

    context_tokens = (
        tokens & CONTEXT_TERMS
    )

    word_count = len(tokens)

    if not medical_tokens:
        return (
            False,
            "Please describe at least one symptom "
            "or health-related problem.",
        )

    if word_count <= 2:
        if specific_tokens:
            return (
                True,
                "",
            )

        return (
            False,
            "Please describe your symptom in a little "
            "more detail so the model has useful context.",
        )

    if (
        len(associated_tokens) > 0
        or len(specific_tokens) > 0
        or context_tokens
        or len(medical_tokens) >= 2
    ):
        return (
            True,
            "",
        )

    return (
        True,
        "",
    )


def save_prediction(
    db: Session,
    current_user: User,
    text: str,
    status: str,
    predictions: list,
    top_prediction: dict | None,
    confidence: str,
    requires_review: bool,
):
    record = SymptomPrediction(
        user_id=current_user.id,
        input_text=text,
        top_condition=(
            top_prediction["condition"]
            if top_prediction
            else None
        ),
        top_score=(
            top_prediction["score"]
            if top_prediction
            else None
        ),
        confidence_level=confidence,
        requires_review=requires_review,
        status=status,
        predictions=predictions,
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return record


def serialize_prediction(
    record: SymptomPrediction,
) -> dict:
    return {
        "id": record.id,
        "input_text": record.input_text,
        "top_condition": record.top_condition,
        "top_score": record.top_score,
        "confidence_level": record.confidence_level,
        "requires_review": record.requires_review,
        "status": record.status,
        "predictions": record.predictions or [],
        "created_at": (
            record.created_at.isoformat()
            if record.created_at
            else None
        ),
    }


@router.post("")
def predict_symptoms(
    payload: SymptomRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    original_text = normalize_input(
        payload.text
    )

    if not original_text:
        raise HTTPException(
            status_code=400,
            detail="Please describe your symptoms.",
        )

    (
        model_text,
        interpreted_symptoms,
    ) = build_model_text(
        original_text
    )

    if contains_obvious_non_medical_content(
        original_text
    ):
        result = {
            "input_text": original_text,
            "status": "insufficient_medical_input",
            "predictions": [],
            "top_prediction": None,
            "confidence_level": "very_low",
            "requires_review": True,
            "interpreted_symptoms": [],
            "message": (
                "No clear medical symptoms were detected. "
                "Please describe what you are experiencing "
                "in your own words."
            ),
            "disclaimer": (
                "These are model-generated possibilities, "
                "not a medical diagnosis. Seek professional "
                "medical advice for serious, severe, or "
                "worsening symptoms."
            ),
        }

        record = save_prediction(
            db=db,
            current_user=current_user,
            text=original_text,
            status=result["status"],
            predictions=[],
            top_prediction=None,
            confidence="very_low",
            requires_review=True,
        )

        result["history_id"] = record.id

        return result

    if not contains_medical_content(
        model_text
    ):
        result = {
            "input_text": original_text,
            "status": "insufficient_medical_input",
            "predictions": [],
            "top_prediction": None,
            "confidence_level": "very_low",
            "requires_review": True,
            "interpreted_symptoms": interpreted_symptoms,
            "message": (
                "I couldn't identify a clear health-related "
                "symptom from that description. Please tell "
                "me what you are feeling, where the problem "
                "is, or what has changed."
            ),
            "disclaimer": (
                "These are model-generated possibilities, "
                "not a medical diagnosis. Seek professional "
                "medical advice for serious, severe, or "
                "worsening symptoms."
            ),
        }

        record = save_prediction(
            db=db,
            current_user=current_user,
            text=original_text,
            status=result["status"],
            predictions=[],
            top_prediction=None,
            confidence="very_low",
            requires_review=True,
        )

        result["history_id"] = record.id

        return result

    (
        enough_information,
        information_message,
    ) = assess_input_information(
        model_text
    )

    if not enough_information:
        result = {
            "input_text": original_text,
            "status": "insufficient_symptom_detail",
            "predictions": [],
            "top_prediction": None,
            "confidence_level": "very_low",
            "requires_review": True,
            "interpreted_symptoms": interpreted_symptoms,
            "message": information_message,
            "disclaimer": (
                "The model should not be used as a medical "
                "diagnosis. Seek professional medical advice "
                "for serious, severe, or worsening symptoms."
            ),
        }

        record = save_prediction(
            db=db,
            current_user=current_user,
            text=original_text,
            status=result["status"],
            predictions=[],
            top_prediction=None,
            confidence="very_low",
            requires_review=True,
        )

        result["history_id"] = record.id

        return result

    try:
        fused_predictions = predict_fused(
            original_text,
            top_k=3,
        )

        predictions = [
            {
                "condition": item["condition"],
                "score": item["fused_score"],
                "percentage": round(
                    item["fused_score"] * 100,
                    2,
                ),
            }
            for item in fused_predictions
        ]

        if not predictions:
            raise ValueError(
                "No symptom predictions were generated."
            )

        top_prediction = predictions[0]
        top_score = top_prediction["score"]

        level = confidence_level(top_score)
        requires_review = top_score < 0.20

        record = save_prediction(
            db=db,
            current_user=current_user,
            text=original_text,
            status="success",
            predictions=predictions,
            top_prediction=top_prediction,
            confidence=level,
            requires_review=requires_review,
        )

        return {
            "input_text": original_text,
            "status": "success",
            "predictions": predictions,
            "top_prediction": top_prediction,
            "confidence_level": level,
            "requires_review": requires_review,
            "interpreted_symptoms": interpreted_symptoms,
            "history_id": record.id,
            "disclaimer": (
                "These are model-generated possibilities, "
                "not a medical diagnosis. Seek professional "
                "medical advice for serious, severe, or "
                "worsening symptoms."
            ),
        }

    except FileNotFoundError as exc:
        db.rollback()

        raise HTTPException(
            status_code=503,
            detail=(
                "The symptom analysis model is currently "
                "unavailable. Please try again later."
            ),
        ) from exc

    except Exception as exc:
        db.rollback()

        print(
            "Symptom prediction error:",
            repr(exc),
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Symptom prediction failed. "
                "Please try again."
            ),
        ) from exc


@router.get("/history")
def get_prediction_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    records = db.scalars(
        select(SymptomPrediction).where(
            SymptomPrediction.user_id
            == current_user.id
        ).order_by(
            SymptomPrediction.created_at.desc()
        )
    ).all()

    return {
        "items": [
            serialize_prediction(record)
            for record in records
        ],
        "count": len(records),
    }


@router.get("/{prediction_id}")
def get_prediction(
    prediction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    record = db.scalar(
        select(SymptomPrediction).where(
            SymptomPrediction.id
            == prediction_id,
            SymptomPrediction.user_id
            == current_user.id,
        )
    )

    if not record:
        raise HTTPException(
            status_code=404,
            detail="Symptom analysis not found.",
        )

    return serialize_prediction(record)