import enum
from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
from enum import Enum as PyEnum

# Enum for category type (income or expense)
class CategoryType(str, PyEnum):
    INCOME = "income"
    EXPENSE = "expense"

# Category model linked to a user
class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    type = Column(Enum(CategoryType, native_enum=False), nullable=False)  # income or expense
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Relationships
    transactions = relationship("Transaction", back_populates="category")
    incomes = relationship('Income', back_populates='category')
    expenses = relationship("Expense", back_populates="category")
    user = relationship("User", back_populates="categories")
    budgets = relationship("Budget", back_populates="category")

# Enum for transaction type
class TransactionType(str, PyEnum):
    INCOME = "income"
    EXPENSE = "expense"

# Transaction model linked to user and category
class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float)
    description = Column(String, nullable=True)
    date = Column(DateTime, default=datetime.utcnow)
    type = Column(Enum(TransactionType), nullable=False)

    owner_id = Column(Integer, ForeignKey("users.id"))
    category_id = Column(Integer, ForeignKey("categories.id"))

    owner = relationship("User", back_populates="transactions")
    category = relationship("Category", back_populates="transactions")

# Income model (separate from Transaction for specific use cases)
class Income(Base):
    __tablename__ = 'incomes'

    id = Column(Integer, primary_key=True)
    amount = Column(Float, nullable=False)
    date = Column(DateTime, default=datetime.utcnow)
    description = Column(String)

    user_id = Column(Integer, ForeignKey('users.id'))
    category_id = Column(Integer, ForeignKey('categories.id'))

    user = relationship("User", back_populates="incomes")
    category = relationship('Category', back_populates='incomes')

# Expense model (separate from Transaction)
class Expense(Base):
    __tablename__ = 'expenses'

    id = Column(Integer, primary_key=True)
    amount = Column(Float, nullable=False)
    date = Column(DateTime, default=datetime.utcnow)
    description = Column(String)

    user_id = Column(Integer, ForeignKey('users.id'))
    category_id = Column(Integer, ForeignKey('categories.id'))

    user = relationship("User", back_populates="expenses")
    category = relationship('Category', back_populates='expenses')

# User model
class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    incomes = relationship("Income", back_populates="user")
    expenses = relationship("Expense", back_populates="user")
    transactions = relationship("Transaction", back_populates="owner")
    categories = relationship("Category", back_populates="user", cascade="all, delete-orphan")
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")
    budgets = relationship("Budget", back_populates="user")

# Refresh tokens for authentication
class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="refresh_tokens")

# Budget model to track limits per category and month
class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    amount = Column(Float, nullable=False)
    month = Column(DateTime, default=datetime.today)

    user = relationship("User", back_populates="budgets")
    category = relationship("Category", back_populates="budgets")
