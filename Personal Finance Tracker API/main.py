from fastapi import FastAPI, Depends, HTTPException, status, Request
from utils.limiter import limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from sqlalchemy.orm import Session
from Routes.auth import router as auth_router
from Routes import category, transaction, reports, user, budget
import models, schemas, database, utils.utils as utils
from fastapi.middleware.cors import CORSMiddleware
from seedDB import seed_categories, seed_users, seed_budget

app = FastAPI()

# Attach rate limiter to app state
app.state.limiter = limiter

# Enable CORS for React frontend running on localhost:5173
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add rate limiting middleware
app.add_middleware(SlowAPIMiddleware)

# Create database tables if they don't exist
models.Base.metadata.create_all(bind=database.engine)

# Register route groups
app.include_router(auth_router)
app.include_router(category.router)
app.include_router(transaction.router)
app.include_router(reports.router)
app.include_router(user.router)
app.include_router(budget.router)

# Seed initial data on startup
@app.on_event("startup")
def on_startup():
    seed_users()
    seed_categories()
    seed_budget()

# Endpoint to create a new user
@app.post("/users/", response_model=schemas.UserOut)
def create_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    # Hash the user password before saving
    hashed_pw = utils.hash_password(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_pw,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Endpoint to create a new category
@app.post("/categories/", response_model=schemas.CategoryOut)
def create_category(category: schemas.CategoryBase, db: Session = Depends(database.get_db)):
    # Check if category already exists
    db_cat = db.query(models.Category).filter(models.Category.name == category.name).first()
    if db_cat:
        raise HTTPException(status_code=400, detail="Category already exists")

    # Create and save new category
    new_cat = models.Category(name=category.name)
    db.add(new_cat)
    db.commit()
    db.refresh(new_cat)
    return new_cat
