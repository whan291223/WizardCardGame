from sqlmodel import Session, select
from app.models.models import User, Game
from app.schemas.schemas import UserCreate, GameCreate
from app.core.security import get_password_hash

def create_user(session: Session, user: UserCreate):
    db_user = User(username=user.username, email=user.email, hashed_password=get_password_hash(user.password))
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user

def get_games(session: Session):
    return session.exec(select(Game)).all()

def create_game(session: Session, game: GameCreate):
    db_game = Game(name=game.name)
    session.add(db_game)
    session.commit()
    session.refresh(db_game)
    return db_game
