# utils/alerts.py
from utils.auth_utils import send_email

def send_overspending_alert(user, category, spent, limit):
    """
    Sends an email alert to the user when they overspend their budget for a category.

    Parameters:
    - user: User object (should have username and email)
    - category: Name of the budget category (string)
    - spent: Amount spent so far (float)
    - limit: Budget object (should have an 'amount' attribute)
    """

    subject = f"!!!! Overspending Alert for {category}"  # Email subject line

    body = (
        f"Hi {user.username},\n\n"
        f"You've spent ${spent:.2f} in your '{category}' budget, "
        f"which exceeds your limit of ${limit.amount:.2f}.\n\n"
        f"Consider adjusting your spending habits or updating your budget.\n\n"
        f"Personal Finance Tracker"
    )  # Email body content with formatting for currency

    # Send the email using a reusable utility function
    send_email(to_email=user.email, subject=subject, body=body)
