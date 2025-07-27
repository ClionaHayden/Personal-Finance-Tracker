import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Base
from models import User, Category, Transaction

# Use SQLite file DB for tests (or in-memory if you prefer)
TEST_DB_PATH = "test.db"
SQLALCHEMY_DATABASE_URL = f"sqlite:///{TEST_DB_PATH}" 

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db(): 
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create tables once before any tests run
def init_db():
    engine.dispose()

    if os.path.exists(TEST_DB_PATH):
        try:
            os.remove(TEST_DB_PATH)
        except PermissionError:
            print("Waiting for DB file to close...")

    Base.metadata.create_all(bind=engine)
