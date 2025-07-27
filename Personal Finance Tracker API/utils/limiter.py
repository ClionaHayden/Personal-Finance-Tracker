import os
from slowapi import Limiter
from slowapi.util import get_remote_address

# Check if app is in testing mode via environment variable
TESTING = os.getenv("TESTING", "0") == "1"

# Create Limiter instance using client IP address as key
limiter = Limiter(key_func=get_remote_address)

# Dummy limiter decorator that does nothing (used for testing)
def dummy_limit(*args, **kwargs):
    def decorator(func):
        return func
    return decorator

# Store original limiter.limit method
limiter_limit_original = limiter.limit

if TESTING:
    # Replace limiter.limit with dummy_limit during testing to disable rate limiting
    print(f"Limiter limit is dummy_limit? {limiter.limit == dummy_limit}")
    limiter_limit_original = limiter.limit  # Keep original method for possible restoration
    limiter.limit = dummy_limit
else:
    # In non-testing, use original limiter.limit method
    print(f"Limiter limit is dummy_limit? {limiter.limit == dummy_limit}")
    limiter_limit_original = limiter.limit  # Store original method
