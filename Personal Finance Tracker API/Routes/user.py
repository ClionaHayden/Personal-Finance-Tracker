from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from utils.auth_utils import get_current_user
import schemas, models

router = APIRouter(prefix="/users", tags=["Users"])

@router.put("/me", response_model=schemas.UserOut)
def update_user_profile(
    updates: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Check if the user wants to update their email
    if updates.email:
        # Verify if the new email is already taken by another user
        email_exists = db.query(models.User)\
                         .filter(models.User.email == updates.email,
                                 models.User.id != current_user.id)\
                         .first()
        if email_exists:
            # Raise error if email is already in use by someone else
            raise HTTPException(status_code=400, detail="Email already in use")

        # Update current user's email
        current_user.email = updates.email

    # Update username if provided
    if updates.username:
        current_user.username = updates.username

    # Commit changes to the database
    db.commit()
    # Refresh the instance with new data from DB
    db.refresh(current_user)
    
    # Return the updated user profile
    return current_user
