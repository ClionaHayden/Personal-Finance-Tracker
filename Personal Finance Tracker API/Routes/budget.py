from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime
from database import get_db
from Routes.auth import get_current_user
from models import Budget
from schemas import BudgetCreate, BudgetOut

router = APIRouter()

# Create a new budget for the authenticated user
@router.post("/budgets/", response_model=BudgetOut, status_code=201)
def create_budget(budget: BudgetCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    # Instantiate a new Budget with the provided data and user_id
    new_budget = Budget(**budget.dict(), user_id=user.id)
    db.add(new_budget)          # Add the new budget to the session
    db.commit()                 # Commit to save in the database
    db.refresh(new_budget)      # Refresh to get updated fields (like id)
    return new_budget           # Return the newly created budget

# Get all budgets for the authenticated user
@router.get("/budgets/", response_model=list[BudgetOut])
def get_budgets(db: Session = Depends(get_db), user=Depends(get_current_user)):
    # Query budgets filtered by user_id
    return db.query(Budget).filter(Budget.user_id == user.id).all()

# Update an existing budget by ID for the authenticated user
@router.put("/budgets/{budget_id}", response_model=BudgetOut)
def update_budget(budget_id: int, updated: BudgetCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    # Fetch the budget to update; must belong to the current user
    budget = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == user.id).first()
    if not budget:
        # Return 404 if not found or not owned by user
        raise HTTPException(status_code=404, detail="Budget not found")
    
    # Update each field in the budget with new values
    for field, value in updated.dict().items():
        setattr(budget, field, value)
    
    db.commit()  # Commit changes to the database
    return budget

# Delete a budget by ID for the authenticated user
@router.delete("/budgets/{budget_id}")
def delete_budget(budget_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    # Fetch the budget to delete; must belong to the current user
    budget = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == user.id).first()
    if not budget:
        # Return 404 if budget doesn't exist or user doesn't own it
        raise HTTPException(status_code=404, detail="Budget not found")
    
    db.delete(budget)  # Delete budget from the session
    db.commit()        # Commit to save deletion in database
    return {"message": "Budget deleted"}

# Get a summary of budgets vs. spending for a specific month
@router.get("/budgets/summary")
def budget_summary(month: datetime, db: Session = Depends(get_db), user=Depends(get_current_user)):
    """
    Summarize budgeted amounts and actual spending per category for the given month.
    - month: datetime representing the month to summarize.
    - Filters transactions and budgets by user and month.
    - Calculates spent amount and percentage of budget used.
    """
    # Raw SQL query joining budgets, transactions, and categories
    results = db.execute(text("""
        SELECT b.category_id, c.name, b.amount AS budget_amount,
            COALESCE(SUM(t.amount), 0) AS spent
        FROM budgets b
        LEFT JOIN transactions t
            ON t.category_id = b.category_id
                AND date(t.date, 'start of month') = date(:month, 'start of month')
                AND t.owner_id = :user_id
                AND t.type = 'expense'
        JOIN categories c ON c.id = b.category_id
        WHERE b.user_id = :user_id
            AND date(b.month, 'start of month') = date(:month, 'start of month')
        GROUP BY b.category_id, b.amount, c.name
    """), {"month": month, "user_id": user.id}).fetchall()

    # Build and return a list of summary dictionaries for each category
    return [
        {
            "category_id": row.category_id,
            "category_name": row.name,
            "budget_amount": row.budget_amount,
            "spent": row.spent,
            "remaining": row.budget_amount - row.spent,
            "percentage_used": round((row.spent / row.budget_amount) * 100, 2) if row.budget_amount else 0
        }
        for row in results
    ]
