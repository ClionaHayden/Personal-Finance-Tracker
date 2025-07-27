from database import SessionLocal
from models import User, Category, CategoryType, Budget
from passlib.context import CryptContext
from datetime import datetime

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def seed_users():
    # Seed a default test user if no users exist
    db = SessionLocal()
    try:
        count = db.query(User).count()
        if count == 0:
            hashed_password = pwd_context.hash("test")
            default_user = User(
                username="test",
                email="test@test.com",
                hashed_password=hashed_password
            )
            db.add(default_user)
            db.commit()
            print("Seeded test user.")
        else:
            print("Users already exist, skipping seeding.")
    finally:
        db.close()

def seed_categories():
    # Seed default categories for the test user if none exist
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == "test").first()
        if not user:
            print("No test user found, skipping category seeding.")
            return

        count = db.query(Category).count()
        if count == 0:
            default_categories = [
                Category(name="Food", type=CategoryType.EXPENSE, user_id=user.id),
                Category(name="Transportation", type=CategoryType.EXPENSE, user_id=user.id),
                Category(name="Utilities", type=CategoryType.EXPENSE, user_id=user.id),
                Category(name="Entertainment", type=CategoryType.EXPENSE, user_id=user.id),
                Category(name="Salary", type=CategoryType.INCOME, user_id=user.id),
                Category(name="Miscellaneous", type=CategoryType.EXPENSE, user_id=user.id),
            ]
            db.add_all(default_categories)
            db.commit()
            print("Seeded default categories.")
        else:
            print("Categories already exist, skipping seeding.")
    finally:
        db.close()

def seed_budget():
    # Seed a default budget if none exists
    db = SessionLocal()
    try:
        count = db.query(Budget).count()
        if count == 0:
            # Use valid user_id and category_id from your DB (assuming 1 here)
            user_id = 1
            category_id = 1
        
            # Define budget amount and the month for the budget
            budget_amount = 500.0
            budget_month = datetime(2025, 7, 1)
        
            # Create and add the Budget entry
            budget = Budget(
                user_id=user_id,
                category_id=category_id,
                amount=budget_amount,
                month=budget_month
            )
        
            db.add(budget)
            db.commit()
            print("Budget seeded successfully!")
        else:
            print("Budget already exist, skipping seeding.")
    except Exception as e:
        print("Failed to seed budget:", e)
    finally:
        db.close()
