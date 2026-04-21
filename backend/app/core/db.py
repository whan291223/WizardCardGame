from sqlmodel import create_engine, Session
from app.models.models import SQLModel

sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

engine = create_engine(sqlite_url, echo=True)

def get_session():
    with Session(engine) as session:
        yield session

def init_db():
    SQLModel.metadata.create_all(engine)
    # Create a default user for testing if it doesn't exist
    from app.models.models import User
    from app.core.security import get_password_hash
    from sqlmodel import Session, select
    with Session(engine) as session:
        user = session.exec(select(User).where(User.id == 1)).first()
        if not user:
            default_user = User(id=1, username="WizardUser", email="wizard@example.com", hashed_password=get_password_hash("password"))
            session.add(default_user)
            session.commit()
