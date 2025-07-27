from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session
from models import Category
from schemas import CategoryCreate, CategoryOut, CategoryUpdate
from database import get_db
from Routes.auth import get_current_user

router = APIRouter(prefix="/categories", tags=["Categories"])

# Create a new category for the authenticated user
@router.post("/", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
def create_category(
    category: CategoryCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Check if a category with the same name already exists for this user
    existing = db.query(Category).filter(
        Category.name == category.name,
        Category.user_id == current_user.id
    ).first()

    if existing:
        # Return 400 error if category name already taken
        raise HTTPException(status_code=400, detail="Category already exists")

    # Create and save new category linked to the current user
    new_category = Category(
        name=category.name,
        type=category.type,
        user_id=current_user.id
    )
    db.add(new_category)
    db.commit()
    db.refresh(new_category)  # Refresh to get new ID and other DB-generated fields
    return new_category

# List all categories for the authenticated user
@router.get("/", response_model=List[CategoryOut])
def list_categories(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Query and return all categories owned by the current user
    return db.query(Category).filter(Category.user_id == current_user.id).all()

# Update an existing category by ID for the authenticated user
@router.put("/{category_id}", response_model=CategoryOut)
def update_category(
    category_id: int,
    category: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Find the category owned by user
    db_category = db.query(Category).filter(
        Category.id == category_id,
        Category.user_id == current_user.id
    ).first()

    if not db_category:
        # Return 404 if not found or not owned by user
        raise HTTPException(status_code=404, detail="Category not found")

    # Update category fields
    db_category.name = category.name
    # Add other fields if needed, e.g. type: db_category.type = category.type

    db.commit()
    db.refresh(db_category)  # Refresh with updated data
    return db_category

# Delete a category by ID for the authenticated user
@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Find category owned by user
    db_category = db.query(Category).filter(
        Category.id == category_id,
        Category.user_id == current_user.id
    ).first()

    if not db_category:
        # Return 404 if category doesn't exist or user doesn't own it
        raise HTTPException(status_code=404, detail="Category not found")

    db.delete(db_category)
    db.commit()
    # No content returned for successful deletion
    return
