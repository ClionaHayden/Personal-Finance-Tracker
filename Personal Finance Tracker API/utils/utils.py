from passlib.context import CryptContext

# Initialize password context with bcrypt hashing scheme
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    # Hash a plain text password and return the hashed version
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    # Verify a plain password against its hashed version
    return pwd_context.verify(plain_password, hashed_password)
