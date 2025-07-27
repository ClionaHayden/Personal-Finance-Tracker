from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from fastapi import status
from enum import Enum as PyEnum

# User schemas

class UserCreate(BaseModel):
    # Schema for creating a new user
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    # Schema for user login
    email: EmailStr
    password: str

class UserOut(BaseModel):
    # Schema for returning user info (safe fields only)
    id: int
    email: str
    username: str

    class Config:
        orm_mode = True  # Enable ORM compatibility

class UserUpdate(BaseModel):
    # Schema for updating user profile (partial)
    username: str | None = Field(default=None, min_length=3, max_length=30)
    email: EmailStr | None = None

# Authentication token schemas

class Token(BaseModel):
    # Schema for access and refresh tokens returned on login
    access_token: str
    refresh_token: str
    token_type: str

class TokenData(BaseModel):
    # Data extracted from token payload (optional)
    email: EmailStr | None = None

class TokenRefreshRequest(BaseModel):
    # Schema to request a new access token using refresh token
    refresh_token: str

class TokenRefreshResponse(BaseModel):
    # Schema for access token returned on refresh
    access_token: str
    token_type: str

# Category schemas

class CategoryType(str, PyEnum):
    # Enum for category types
    INCOME = "income"
    EXPENSE = "expense"

class CategoryBase(BaseModel):
    # Base schema for categories
    name: str
    type: CategoryType

class CategoryCreate(CategoryBase):
    # Schema for creating category (same as base)
    pass

class CategoryUpdate(BaseModel):
    # Schema for updating category (partial)
    name: Optional[str] = None
    type: Optional[CategoryType] = None

class CategoryOut(CategoryBase):
    # Schema for returning category with id
    id: int
    name: str
    type: CategoryType

    class Config:
        orm_mode = True

# Transaction schemas

class TransactionType(str, PyEnum):
    # Enum for transaction types
    INCOME = "income"
    EXPENSE = "expense"

class TransactionBase(BaseModel):
    # Base schema for transactions
    amount: float
    description: Optional[str] = None
    date: Optional[datetime] = None
    category_id: int
    type: TransactionType 

class TransactionCreate(TransactionBase):
    # Schema for creating a transaction
    pass

class TransactionUpdate(TransactionBase):
    # Schema for updating a transaction (consider making fields optional)
    pass

class TransactionOut(TransactionBase):
    # Schema for returning transaction info including related category
    id: int
    amount: float
    description: str | None = None
    date: datetime
    category_id: int
    category: Optional[CategoryOut]
    owner_id: Optional[int]

    class Config:
        orm_mode = True

# Budget schemas

class BudgetBase(BaseModel):
    # Base schema for budget entries
    category_id: int
    amount: float
    month: datetime

class BudgetCreate(BudgetBase):
    # Schema for creating budgets
    pass

class BudgetUpdate(BudgetBase):
    # Schema for updating budgets (consider making fields optional)
    pass

class BudgetOut(BudgetBase):
    # Schema for returning budget with id
    id: int

    class Config:
        orm_mode = True
