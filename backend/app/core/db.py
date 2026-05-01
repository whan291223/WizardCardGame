from sqlmodel import create_engine, Session, select
from app.models.models import SQLModel, User
from app.core.config import settings
from app.core.security import get_password_hash

engine = create_engine(settings.DATABASE_URL)

def get_session():
    with Session(engine) as session:
        yield session

def init_db():
    SQLModel.metadata.create_all(engine)

    # Create a default user for testing if it doesn't exist
    with Session(engine) as session:
        # Check if table exists by trying to select
        try:
            user = session.exec(select(User).where(User.id == 1)).first()
            if not user:
                default_user = User(id=1, username="WizardUser", email="wizard@example.com", hashed_password=get_password_hash("password"))
                session.add(default_user)
                session.commit()
        except Exception as e:
            print(f"Error initializing default user (might be expected if DB is fresh): {e}")
