from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(..., max_length=72)

class User(UserBase):
    id: int

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class ChatStats(BaseModel):
    num_messages: int
    num_words: int
    num_media: int
    num_links: int

class UserPercentage(BaseModel):
    name: str
    percent: float

class BusiestUsersResponse(BaseModel):
    top_users: dict
    user_percentages: List[UserPercentage]