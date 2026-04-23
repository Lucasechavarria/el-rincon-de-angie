import mercadopago
import os
from models import Book, User

# Initialize SDK
# TODO: Replace with actual access token from environment variables
ACCESS_TOKEN = os.getenv("MP_ACCESS_TOKEN", "TEST-00000000-0000-0000-0000-000000000000") 
sdk = mercadopago.SDK(ACCESS_TOKEN)

def create_preference(book: Book, email: str, user_id: int = None):
    """
    Creates a Mercado Pago preference for purchasing a book.
    Supports both registered users and guest checkout via email.
    """
    # Get base URL from environment or use localhost for development
    base_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    preference_data = {
        "items": [
            {
                "id": str(book.id),
                "title": book.title,
                "quantity": 1,
                "currency_id": "ARS",
                "unit_price": book.price
            }
        ],
        "payer": {
            "email": email.lower().strip()
        },
        "back_urls": {
            "success": f"{base_url}/success",
            "failure": f"{base_url}/failure",
            "pending": f"{base_url}/pending"
        },
        "auto_return": "approved",
        "external_reference": str(user_id) if user_id else f"guest_{email.lower().strip()}",
        "metadata": {
            "book_id": book.id,
            "user_id": user_id,
            "guest_email": email.lower().strip() if not user_id else None
        },
        "notification_url": os.getenv("WEBHOOK_URL")
    }

    preference_response = sdk.preference().create(preference_data)
    return preference_response["response"]
