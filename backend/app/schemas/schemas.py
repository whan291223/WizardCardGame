from pydantic import BaseModel, EmailStr
from typing import Optional

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserRead(UserBase):
    id: int

class GameBase(BaseModel):
    name: str

class GameCreate(GameBase):
    pass

class GameRead(GameBase):
    id: int
    status: str
    current_round: int
