from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from datetime import datetime
from typing import List, Optional
from models import Transaction, TransactionType, Category, Budget
from schemas import TransactionCreate, TransactionOut, TransactionUpdate
from database import get_db
from Routes.auth import get_current_user
from utils.alerts import send_overspending_alert

router = APIRouter(prefix="/transactions", tags=["Transactions"])

# Create a new transaction
@router.post("/", response_model=TransactionOut, status_code=201)
def create_transaction(
    transaction: TransactionCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Set transaction date to now if not provided
    transaction.date = transaction.date or datetime.utcnow()

    # Validate that the category exists
    category = db.query(Category).filter(Category.id == transaction.category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    # Create and persist the new transaction
    new_transaction = Transaction(
        amount=transaction.amount,
        description=transaction.description,
        date=transaction.date,
        category_id=transaction.category_id,
        type=transaction.type,
        owner_id=current_user.id
    )
    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)

    # Calculate total spent in this category by the user
    total_spent = db.query(Transaction).filter(
        Transaction.owner_id == current_user.id,
        Transaction.category_id == transaction.category_id
    ).with_entities(func.sum(Transaction.amount)).scalar() or 0

    # Retrieve the budget for this category
    budget = db.query(Budget).filter_by(
        user_id=current_user.id,
        category_id=transaction.category_id
    ).first()

    # If total spending exceeds the budget, send an alert
    if budget and total_spent > budget.amount:
        send_overspending_alert(current_user, category.name, total_spent, budget)

    return new_transaction


# List transactions with optional filters and pagination
@router.get("/", response_model=List[TransactionOut])
def list_transactions(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    limit: int = Query(10, ge=1, le=100),           # Pagination limit
    offset: int = Query(0, ge=0),                    # Pagination offset
    category_id: Optional[int] = None,               # Optional filter by category
    date_from: Optional[datetime] = None,            # Filter transactions from this date
    date_to: Optional[datetime] = None,              # Filter transactions up to this date
    type: Optional[TransactionType] = None           # Filter by transaction type (income/expense)
):
    # Build base query filtering by owner
    query = db.query(Transaction)\
              .options(joinedload(Transaction.category))\
              .filter(Transaction.owner_id == current_user.id)

    # Apply optional filters
    if category_id:
        query = query.filter(Transaction.category_id == category_id)
    if date_from:
        query = query.filter(Transaction.date >= date_from)
    if date_to:
        query = query.filter(Transaction.date <= date_to)
    if type:
        query = query.filter(Transaction.type == type)

    # Apply pagination and return results
    transactions = query.offset(offset).limit(limit).all()
    return transactions


# Get a specific transaction by ID
@router.get("/{transaction_id}", response_model=TransactionOut)
def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Retrieve transaction if it belongs to current user
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.owner_id == current_user.id
    ).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction


# Update a transaction by ID
@router.put("/{transaction_id}", response_model=TransactionOut)
def update_transaction(
    transaction_id: int,
    transaction: TransactionUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Find existing transaction for current user
    db_transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.owner_id == current_user.id
    ).first()
    if not db_transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    # Update fields from request
    db_transaction.amount = transaction.amount
    db_transaction.description = transaction.description
    db_transaction.date = transaction.date or datetime.utcnow()
    db_transaction.category_id = transaction.category_id
    db_transaction.type = transaction.type

    # Commit changes and return updated transaction
    db.commit()
    db.refresh(db_transaction)
    return db_transaction


# Delete a transaction by ID
@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Find transaction owned by current user
    db_transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.owner_id == current_user.id
    ).first()
    if not db_transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    # Delete and commit
    db.delete(db_transaction)
    db.commit()
    return
