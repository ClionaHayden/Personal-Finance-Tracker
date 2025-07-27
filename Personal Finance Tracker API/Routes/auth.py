import os
import uuid
import models, database, utils.utils as utils
from fastapi import APIRouter, HTTPException, Depends, status, Body, Request
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr, constr
from utils.limiter import limiter 
from sqlalchemy.orm import Session
from models import User, RefreshToken
from database import get_db
from jose import JWTError, jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv
from schemas import UserCreate, UserOut, Token, UserLogin, TokenRefreshRequest, TokenRefreshResponse
import smtplib
from email.message import EmailMessage
from utils.auth_utils import hash_password, verify_password, create_access_token, create_refresh_token, send_email
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")  # Password hashing context
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")       # OAuth2 scheme for token retrieval

# Load environment variables from .env file
load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", 7))

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SENDER_EMAIL = os.getenv("GMAIL_EMAIL") 
SENDER_PASSWORD = os.getenv("GMAIL_APP_PASSWORD") 

# Initialize FastAPI router with prefix /auth and tag "Authentication"
router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

# Request body schema for password reset request (email only)
class PasswordResetRequest(BaseModel):
    email: EmailStr

# Request body schema for confirming password reset (token + new password)
class PasswordResetConfirm(BaseModel):
    token: str
    new_password: constr(min_length=8)  # Password must be at least 8 characters

@router.post("/register", response_model=UserOut)
@limiter.limit("10/minute")  # Rate limiting: max 10 requests per minute
def register(user: UserCreate, request: Request, db: Session = Depends(get_db)):
    # Check if email already exists in DB
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash the user's password before storing
    hashed_pw = hash_password(user.password)
    new_user = User(email=user.email, hashed_password=hashed_pw, username=user.username)

    # Add and commit new user to DB
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

@router.post("/login", response_model=Token)
@limiter.limit("5/minute")  # Rate limiting: max 5 requests per minute
def login(user: UserLogin, request: Request, db: Session = Depends(get_db)):
    # Fetch user by email
    db_user = db.query(User).filter(User.email == user.email).first()
    
    # Verify password or raise 401 Unauthorized if invalid
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Create JWT access and refresh tokens
    access_token = create_access_token(data={"sub": db_user.email})
    refresh_token = create_refresh_token(data={"sub": db_user.email})
    
    # Save refresh token in DB for token revocation and rotation
    db_token = RefreshToken(token=refresh_token, user_id=db_user.id)
    db.add(db_token)
    db.commit()

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.get("/me", response_model=UserOut)
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # Exception to raise if token validation fails
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Decode JWT access token and extract email (sub claim)
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # Query user by email from DB
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    
    return user

@router.post("/refresh", response_model=Token)
@limiter.limit("2/minute")  # Rate limiting: max 2 refresh calls per minute
def refresh_token(request: Request, db: Session = Depends(get_db), refresh_token: str = Body(..., embed=True)):
    # Exception to raise if refresh token is invalid or revoked
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid refresh token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Decode refresh token JWT
    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if not email:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # Verify user exists
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception

    # Verify refresh token exists in DB (token revocation / rotation check)
    db_token = db.query(RefreshToken).filter_by(token=refresh_token, user_id=user.id).first()
    if not db_token:
        raise credentials_exception

    # Delete old refresh token from DB (rotation)
    db.delete(db_token)
    db.commit()

    # Issue new tokens
    access_token = create_access_token(data={"sub": user.email})
    new_refresh_token = create_refresh_token(data={"sub": user.email})

    # Save new refresh token
    db_token = RefreshToken(token=new_refresh_token, user_id=user.id)
    db.add(db_token)
    db.commit()

    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }

@router.post("/password-reset/request")
def password_reset_request(data: PasswordResetRequest, db: Session = Depends(get_db)):
    # Query user by email
    user = db.query(models.User).filter(models.User.email == data.email).first()
    
    # Always return success response to prevent user enumeration attacks
    if not user:
        return {"msg": "If the email is registered, a reset link will be sent."}

    # Create a short-lived JWT token for password reset with expiry
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    reset_token = jwt.encode({"sub": user.email, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)

    # Construct reset link with token as query parameter
    reset_link = f"http://localhost:5173/reset-password?token={reset_token}"

    # Email content
    subject = "Password Reset Request"
    body = f"Click the link below to reset your password:\n\n{reset_link}\n\nIf you didn't request this, ignore this email."

    # Send password reset email
    send_email(user.email, subject, body)
    
    return {"reset_token": reset_token, "msg": "Password reset token generated. Implement email sending."}

@router.post("/password-reset/confirm")
def password_reset_confirm(data: PasswordResetConfirm, db: Session = Depends(get_db)):
    # Validate password reset token
    try:
        payload = jwt.decode(data.token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=400, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    # Get user by email
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update password with hashed new password
    user.hashed_password = hash_password(data.new_password)
    db.commit()
    db.refresh(user)

    return {"msg": "Password has been reset successfully"}

@router.get("/test-send-email")
def test_send_email():
    # Sends a test email to the sender email address configured in environment variables
    to_email = SENDER_EMAIL 
    subject = "Test Email from FastAPI"
    body = "This is a test email sent from your FastAPI app."

    from utils.auth_utils import send_email
    send_email(to_email, subject, body)

    return {"message": "Test email sent"}
