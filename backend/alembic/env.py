from logging.config import fileConfig

from alembic import context
from dotenv import load_dotenv
from sqlalchemy import create_engine

from app.core.database import DATABASE_URL, Base
from app.models import User


load_dotenv()


config = context.config


if config.config_file_name is not None:
    fileConfig(config.config_file_name)


# Importing the models makes sure SQLAlchemy knows about
# all tables before Alembic compares the metadata.
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """
    Run migrations without creating a live database connection.
    """

    context.configure(
        url=str(DATABASE_URL),
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={
            "paramstyle": "named",
        },
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """
    Run migrations using a live database connection.
    """

    connectable = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=3600,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()

    connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()