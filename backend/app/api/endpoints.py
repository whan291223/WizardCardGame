from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.crud import crud
from app.schemas import schemas
from app.core.db import get_session
from typing import List

router = APIRouter()

@router.post("/users/", response_model=schemas.UserRead)
def create_user(user: schemas.UserCreate, session: Session = Depends(get_session)):
    return crud.create_user(session=session, user=user)

@router.get("/games/", response_model=List[schemas.GameRead])
def read_games(session: Session = Depends(get_session)):
    return crud.get_games(session=session)

@router.post("/games/", response_model=schemas.GameRead)
def create_game(game: schemas.GameCreate, session: Session = Depends(get_session)):
    return crud.create_game(session=session, game=game)
