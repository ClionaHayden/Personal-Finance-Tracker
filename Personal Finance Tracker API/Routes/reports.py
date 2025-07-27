from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date
from typing import Optional
from database import get_db
from Routes.auth import get_current_user
from models import Transaction, Category

router = APIRouter(prefix="/transactions/reports", tags=["Reports"])

# Endpoint: Summary of total income and expenses within optional date range
@router.get("/summary")
def income_expense_summary(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    start_date: Optional[date] = Query(None),  # Optional filter start date
    end_date: Optional[date] = Query(None)     # Optional filter end date
):
    # Base query: sum of amounts grouped by transaction type for current user
    query = db.query(
        Transaction.type,
        func.sum(Transaction.amount).label("total")
    ).filter(Transaction.owner_id == current_user.id)

    # Apply date filters if provided
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)

    # Execute grouping by type (income or expense)
    totals = query.group_by(Transaction.type).all()

    # Initialize summary with zero values
    summary = {"income": 0, "expense": 0}
    # Fill in the totals from the query result
    for t_type, total in totals:
        summary[t_type] = total
    # Calculate net = income - expense
    summary["net"] = summary["income"] - summary["expense"]

    return summary

# Endpoint: Monthly breakdown of income and expenses within optional date range
@router.get("/monthly")
def monthly_summary(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None)
):
    # SQLite date format for year-month, labeled as 'month'
    month_col = func.strftime('%Y-%m', Transaction.date).label("month")
    
    # Query sums grouped by month and transaction type
    query = db.query(
        month_col,
        Transaction.type,
        func.sum(Transaction.amount).label("total")
    ).filter(Transaction.owner_id == current_user.id)

    # Apply optional date filters
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)

    # Group by month and type, order by month ascending
    results = query.group_by(month_col, Transaction.type).order_by(month_col).all()

    summary = {}
    # Organize results into dictionary keyed by month
    for month, t_type, total in results:
        if month not in summary:
            summary[month] = {"income": 0, "expense": 0}
        summary[month][t_type] = total

    # Calculate net per month
    for month in summary:
        summary[month]["net"] = summary[month]["income"] - summary[month]["expense"]

    return summary

# Endpoint: Breakdown of transactions by category, optionally filtered by type and date, with optional limit on number of categories returned
@router.get("/by-category")
def category_breakdown(
    type: str = Query(None, pattern="^(income|expense)$"),  # Optional filter: income or expense only
    limit: int = Query(None, ge=1),                        # Optional limit on number of categories
    start_date: str = Query(None),                         # Optional start date filter (string expected)
    session: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Join transactions with categories to group by category name
    query = session.query(
        Category.name.label("category"),
        func.sum(Transaction.amount).label("total")
    ).join(Category, Transaction.category_id == Category.id) \
     .filter(Transaction.owner_id == current_user.id)

    # Filter by transaction type if provided (income or expense)
    if type:
        query = query.filter(Transaction.type == type)
    # Filter by start date if provided
    if start_date:
        query = query.filter(Transaction.date >= start_date)

    # Group by category name and order descending by total amount spent/earned
    query = query.group_by(Category.name).order_by(func.sum(Transaction.amount).desc())

    # Apply limit if specified
    if limit:
        query = query.limit(limit)

    results = query.all()

    # Format results for easy consumption by client apps
    items = [{"category": r.category, "total": r.total} for r in results]
    labels = [item["category"] for item in items]
    totals = [item["total"] for item in items]

    return {
        "labels": labels,
        "totals": totals,
        "items": items,
    }
