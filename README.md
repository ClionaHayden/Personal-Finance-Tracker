# Personal Finance Tracker

A FastAPI backend with React frontend for tracking income, expenses, budgets, and generating reports — all with user authentication and email alerts.

## Features

- User registration, login, and JWT-based authentication  
- CRUD operations for categories, transactions, budgets  
- Monthly budgeting and overspending alerts via email
- Recurring Transactions and Budgets
- Multi-Currency Support
- Shared Accounts/Groups
- Reports & Visualizations
- Exporting Data in .pdf, .csv and .xlsx (Excel)
- Rate limiting for API requests  
- SQLite database with SQLAlchemy ORM  
- Dockerized for easy deployment  

## Tech Stack

- Backend: FastAPI, SQLAlchemy, Passlib, JWT, SlowAPI  
- Frontend: React (separate folder)  
- Database: SQLite  
- Email: SMTP with Gmail app password  
- Containerization: Docker & Docker Compose  

## Getting Started

### Prerequisites

- Python 3.9+  
- Docker & Docker Compose (optional but recommended)  

### Environment Variables

Create a `.env` file in your project root with the following:

```env
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
TESTING=0
GMAIL_EMAIL=your_email@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password 
```
### Run Locally
- Install dependencies:
    ```
    pip install -r requirements.txt
    ```
- Start the FastAPI server:
    ```
    uvicorn main:app --reload
    ```
- Access API docs at http://localhost:8000/docs

### Run with Docker
- Build and start containers:
   ```
   docker-compose up --build
  ```
- The API will be available at http://localhost:8000

### Project Structure
  - /app — FastAPI backend source code
  - /my-react-app — React frontend source code
  - docker-compose.yml — Docker orchestration file
  - .env — Environment variables

### License
  MIT License
