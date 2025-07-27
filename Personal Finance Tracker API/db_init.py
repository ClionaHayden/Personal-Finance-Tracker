from database import engine, Base
import models  

print("Creating database tables...")
Base.metadata.drop_all(bind=engine)  # Optional: drop all tables
models.Base.metadata.create_all(bind=engine)
print("Done.")
