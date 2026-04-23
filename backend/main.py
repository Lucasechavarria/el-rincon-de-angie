from typing import List, Optional
from pydantic import BaseModel
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form, Request
from fastapi.responses import StreamingResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Field, Session, SQLModel, create_engine, select, func
from contextlib import asynccontextmanager
import shutil
import uuid
import os
from datetime import datetime, timedelta

from models import User, Book, Payment, Download, DownloadEvent, Category, BookCategory, UserProfile, ReadingProgress, Bookmark, AuthorInfo, Timeline, Analytics, Subscriber, EmailLog
from schemas import (
    Token, UserCreate, UserResponse, BookCreate, BookResponse, BookUpdate, 
    CategoryResponse, UserProfileUpdate, UserProfileResponse, PasswordChange, TransactionResponse
)
from auth import authenticate_user, get_password_hash, verify_password, create_access_token, get_current_active_user, get_current_active_user_optional, ACCESS_TOKEN_EXPIRE_MINUTES
from crud import create_user, get_user_by_username, create_book, get_books, get_book_by_id, update_book, delete_book, create_analytics_event, get_reading_progress, update_reading_progress, get_bookmarks, create_bookmark, delete_bookmark
from email_service import send_welcome_email, APP_URL
from watermark import apply_watermark, generate_preview
from storage import (
    upload_original, upload_preview, upload_delivery, 
    create_signed_url, BUCKET_DELIVERIES
)

from database import engine, get_session
from fastapi.staticfiles import StaticFiles
from fastapi import Header
import httpx
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.middleware import SlowAPIMiddleware
from slowapi.errors import RateLimitExceeded
import mercadopago
from payments import create_preference

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Creating tables...")
    SQLModel.metadata.create_all(engine)
    print("Tables created.")

    # Create a default admin user if not exists
    with Session(engine) as session:
        if not get_user_by_username(session, "admin"):
            print("Creating default admin user...")
            admin_user = UserCreate(username="admin", password="admin", email="admin@example.com") # TODO: Use environment variables for default password
            create_user(session, admin_user)
            print("Default admin user created.")
    yield


app = FastAPI(lifespan=lifespan)



# Configurar Rate Limiting (Usar memoria si no hay Redis)
REDIS_URL = os.getenv("REDIS_URL", "memory://")
limiter = Limiter(key_func=get_remote_address, storage_uri=REDIS_URL, default_limits=["100/minute"])

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads directory to serve static files (covers, etc.)
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# --- Authentication Endpoints ---



async def verify_turnstile(token: str) -> bool:
    if not token:
        return False
    # Use environment variable or default to test secret key for always pass
    secret_key = os.getenv("TURNSTILE_SECRET_KEY", "1x0000000000000000000000000000000AA")
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            data={
                "secret": secret_key,
                "response": token
            }
        )
        result = response.json()
        return result.get("success", False)

@app.post("/token", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    x_turnstile_token: Optional[str] = Header(None),
    session: Session = Depends(get_session)
):
    print(f"[LOGIN] Attempting login for user: {form_data.username}")
    
    # Verify Turnstile CAPTCHA
    is_valid_captcha = await verify_turnstile(x_turnstile_token)
    if not is_valid_captcha:
        print(f"[LOGIN] Turnstile verification failed for user: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid security challenge. Please try again."
        )

    user = authenticate_user(session, form_data.username, form_data.password)
    if not user:
        print(f"[LOGIN] Authentication failed for user: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    print(f"[LOGIN] Authentication successful for user: {form_data.username}")
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    print(f"[LOGIN] Token created for user: {form_data.username}")
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "is_admin": user.is_admin
    }

@app.post("/users/", response_model=UserResponse)
async def create_user_endpoint(
    user: UserCreate, 
    x_turnstile_token: Optional[str] = Header(None),
    session: Session = Depends(get_session)
):
    # Verify Turnstile CAPTCHA
    is_valid_captcha = await verify_turnstile(x_turnstile_token)
    if not is_valid_captcha:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid security challenge. Please try again."
        )

    user.email = user.email.lower().strip()
    db_user = get_user_by_username(session, user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    new_user = create_user(session, user)
    
    # Track registration event
    try:
        create_analytics_event(session, metric_type="registration", value=1.0)
    except Exception as e:
        print(f"Error tracking registration: {e}")
    
    # Send welcome email
    try:
        profile = session.exec(
            select(UserProfile).where(UserProfile.user_id == new_user.id)
        ).first()
        if profile and profile.email:
            send_welcome_email(profile.email, new_user.username)
    except Exception as e:
        print(f"Error sending welcome email: {e}")
        
    # Link guest purchases
    try:
        # Look for payments and downloads made with this email (case-insensitive)
        guest_payments = session.exec(
            select(Payment).where(
                func.lower(Payment.guest_email) == user.email.lower(), 
                Payment.user_id == None
            )
        ).all()
        
        for payment in guest_payments:
            payment.user_id = new_user.id
            # Preserve guest_email for audit/history
            session.add(payment)
            
        guest_downloads = session.exec(
            select(Download).where(
                func.lower(Download.guest_email) == user.email.lower(), 
                Download.user_id == None
            )
        ).all()
        
        for download in guest_downloads:
            download.user_id = new_user.id
            session.add(download)
            
        session.commit()
        if guest_payments:
            print(f"[LINKING] Linked {len(guest_payments)} payments to new user {new_user.username}")
    except Exception as e:
        print(f"Error linking guest purchases: {e}")
        
    return new_user

# --- Book Endpoints ---
@app.post("/books/upload", response_model=BookResponse)
async def upload_book(
    title: str = Form(...),
    price: float = Form(...),
    category_id: int = Form(...),
    description: Optional[str] = Form(None),
    preview_percentage: float = Form(10.0),
    cover_image: Optional[UploadFile] = File(None),
    content_file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Upload a new book and organize files by genre in Storage"""
    # 1. Verify category exists
    category = session.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    
    # 2. Save content file locally first (needed for preview generation later)
    file_extension = os.path.splitext(content_file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    temp_path = os.path.join(UPLOAD_DIR, unique_filename)

    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(content_file.file, buffer)

    # 3. Create Book entry to get the ID
    book_create = BookCreate(
        title=title,
        price=price,
        description=description,
        preview_percentage=preview_percentage,
        file_path=temp_path # Temp local path
    )
    book = create_book(session, book_create, current_user.id)
    
    # Link category
    from models import BookCategory
    session.add(BookCategory(book_id=book.id, category_id=category_id))
    session.commit()

    # 4. Upload to Supabase Storage with genre organization
    content_file.file.seek(0)
    original_path = upload_original(
        content_file.file.read(), 
        book.id, 
        content_file.filename,
        category_slug=category.slug
    )
    
    # 5. Handle cover image
    cover_image_url = None
    if cover_image:
        cover_extension = os.path.splitext(cover_image.filename)[1]
        cover_filename = f"cover_{book.id}{cover_extension}"
        cover_image_bytes = await cover_image.read()
        # Cover can go in the same genre folder
        cover_image_url = f"{SUPABASE_URL}/storage/v1/object/public/previsualizaci%C3%B3n%20de%20obras/genres/{category.slug}/books/{book.id}/{cover_filename}"
        # We need a helper to upload cover or just use upload_to_supabase
        from storage import upload_to_supabase, BUCKET_PREVIEWS
        upload_to_supabase(BUCKET_PREVIEWS, cover_image_bytes, f"genres/{category.slug}/books/{book.id}/{cover_filename}", content_type=cover_image.content_type)

    # Update book with final storage path and cover URL
    book.file_path = original_path
    book.cover_image_url = cover_image_url
    session.add(book)
    session.commit()
    session.refresh(book)

    # 6. Cleanup local temp file
    if os.path.exists(temp_path):
        os.remove(temp_path)
    
    return book



@app.get("/books/{book_id}", response_model=dict)
async def read_book(
    book_id: int, 
    current_user: Optional[User] = Depends(get_current_active_user_optional),
    session: Session = Depends(get_session)
):
    book = get_book_by_id(session, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    # Check if purchased
    is_purchased = False
    download_url = None
    
    if current_user:
        payment = session.exec(
            select(Payment)
            .where(Payment.book_id == book_id)
            .where(Payment.user_id == current_user.id)
            .where(Payment.status == "completed")
        ).first()
        is_purchased = payment is not None
        
        if is_purchased:
            # Check for download record
            download = session.exec(
                select(Download)
                .where(Download.user_id == current_user.id)
                .where(Download.book_id == book_id)
            ).first()
            
            if download and download.file_path:
                try:
                    from storage import create_signed_url
                    download_url = create_signed_url("deliveries", download.file_path, expires_in=3600)
                except:
                    pass
    
    # If not purchased, use preview
    if not download_url:
        # Construct public preview URL
        from storage import get_public_url, BUCKET_PREVIEWS
        # Preview files are usually genres/{slug}/books/{id}/preview.pdf
        # Assuming the original path structure was preserved or construction is known
        # For now, if book has a preview_path field use it, or fallback
        preview_path = f"previews/{book_id}.pdf" # Fallback pattern
        try:
            download_url = get_public_url(BUCKET_PREVIEWS, preview_path)
        except:
            pass

    return {
        **book.dict(),
        "is_purchased": is_purchased,
        "reader_url": download_url
    }
        
    # 3. Generate watermarked version if needed
    # (Simplified for now: assume we use the user's email for the watermark)
    from watermark import generate_watermarked_pdf
    from storage import upload_to_supabase, create_signed_url
    
    # Get user profile for email
    profile = session.exec(select(UserProfile).where(UserProfile.user_id == current_user.id)).first()
    user_email = profile.email if profile else current_user.username
    
    try:
        # Generate the watermarked file locally
        # In a real scenario, we might want to cache this in storage
        watermarked_path = generate_watermarked_pdf(book.file_path, user_email)
        
        # Upload to a temporary/private bucket for downloads
        file_name = f"downloads/{current_user.id}/{book_id}_{os.path.basename(watermarked_path)}"
        upload_to_supabase(watermarked_path, file_name)
        
        # Create signed URL (valid for 1 hour)
        download_url = create_signed_url(file_name, expires_in=3600)
        
        # Log download event
        download_record = Download(
            user_id=current_user.id,
            book_id=book_id,
            payment_id=payment.id,
            status="completed"
        )
        session.add(download_record)
        session.commit()
        
        return {"download_url": download_url}
        
    except Exception as e:
        print(f"Error in download process: {e}")
        raise HTTPException(status_code=500, detail="Error al generar el archivo de descarga.")

# Endpoints for listing and details (already unified above)

@app.post("/books/{book_id}/preview")
async def track_preview(
    book_id: int,
    session: Session = Depends(get_session)
):
    """Track book preview view"""
    book = get_book_by_id(session, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
        
    # Track preview event
    create_analytics_event(session, metric_type="preview", value=1.0, book_id=book_id)
    
    return {"message": "Preview tracked", "preview_url": book.preview_path}

@app.put("/books/{book_id}", response_model=BookResponse)
async def update_book_endpoint(book_id: int, book: BookUpdate, current_user: User = Depends(get_current_active_user), session: Session = Depends(get_session)):
    db_book = get_book_by_id(session, book_id)
    if not db_book:
        raise HTTPException(status_code=404, detail="Book not found")
    if db_book.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this book")
    return update_book(session, book_id, book)

@app.delete("/books/{book_id}")
async def delete_book_endpoint(book_id: int, current_user: User = Depends(get_current_active_user), session: Session = Depends(get_session)):
    db_book = get_book_by_id(session, book_id)
    if not db_book:
        raise HTTPException(status_code=404, detail="Book not found")
    if db_book.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this book")
    delete_book(session, book_id)
    return {"message": "Book deleted successfully"}


# Initialize SDK for webhook verification
sdk = mercadopago.SDK(os.getenv("MP_ACCESS_TOKEN", "TEST-00000000-0000-0000-0000-000000000000"))

# --- Payment Endpoints ---

class CheckoutRequest(BaseModel):
    guest_email: Optional[str] = None

@app.post("/payments/checkout/{book_id}")
async def create_checkout(
    book_id: int, 
    request: CheckoutRequest = None,
    current_user: Optional[User] = Depends(get_current_active_user_optional), 
    session: Session = Depends(get_session)
):
    book = get_book_by_id(session, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    # If not logged in, we MUST have a guest_email
    email = None
    user_id = None
    
    if current_user:
        email = current_user.username if "@" in current_user.username else f"{current_user.username}@example.com"
        user_id = current_user.id
    elif request and request.guest_email:
        email = request.guest_email.lower().strip()
        user_id = None
    else:
        raise HTTPException(status_code=400, detail="Debe iniciar sesión o proporcionar un email de invitado")

    preference = create_preference(book, email, user_id)
    return {"init_point": preference["init_point"], "preference_id": preference["id"]}

@app.post("/payments/webhook")
async def payment_webhook(request: Request, session: Session = Depends(get_session)):
    """
    Webhook endpoint to receive Mercado Pago notifications.
    Processes payment confirmations and triggers watermark generation.
    """
    try:
        payload = await request.json()
        print(f"[WEBHOOK] Received payload: {payload}")
        
        # Mercado Pago sends different notification types
        # We're interested in "payment" type
        if payload.get("type") != "payment":
            print(f"[WEBHOOK] Ignoring notification type: {payload.get('type')}")
            return {"status": "ignored"}
        
        # Extract payment ID from the notification
        payment_id = payload.get("data", {}).get("id")
        if not payment_id:
            print("[WEBHOOK] No payment ID in payload")
            return {"status": "error", "message": "No payment ID"}
        
        # Query Mercado Pago API to get full payment details
        payment_info = sdk.payment().get(payment_id)
        payment_data = payment_info["response"]
        
        print(f"[WEBHOOK] Payment status: {payment_data.get('status')}")
        
        # Only process approved payments
        if payment_data.get("status") != "approved":
            print(f"[WEBHOOK] Payment not approved, status: {payment_data.get('status')}")
            return {"status": "pending"}
        
        # Extract metadata
        external_reference = payment_data.get("external_reference")
        metadata = payment_data.get("metadata", {})
        book_id = metadata.get("book_id")
        user_id_raw = metadata.get("user_id") or external_reference
        guest_email = metadata.get("guest_email")
        if guest_email:
            guest_email = guest_email.lower().strip()
        
        # Clean up user_id if it's a "guest_..." string or None
        user_id = None
        if user_id_raw and str(user_id_raw).isdigit():
            user_id = int(user_id_raw)
        
        if not book_id or (not user_id and not guest_email):
            print(f"[WEBHOOK] Missing book_id, user_id or guest_email in metadata")
            return {"status": "error", "message": "Missing metadata"}
        
        # Check if payment already processed
        existing_payment = session.exec(
            select(Payment).where(Payment.transaction_id == str(payment_id))
        ).first()
        
        # Check if delivery was already done
        existing_download = session.exec(
            select(Download).where(
                (Download.user_id == user_id) if user_id else (Download.guest_email == guest_email),
                Download.book_id == int(book_id)
            )
        ).first()

        if existing_payment and existing_download:
            print(f"[WEBHOOK] Payment {payment_id} already processed and delivered")
            return {"status": "already_processed"}
        
        # Get book and user
        book = get_book_by_id(session, int(book_id))
        user = session.get(User, user_id) if user_id else None
        
        if not book:
            print(f"[WEBHOOK] Book not found")
            return {"status": "error", "message": "Book not found"}
        
        # Get profile email if user exists
        recipient_email = guest_email
        recipient_name = "Invitado"
        profile = None
        
        if user:
            profile = session.exec(
                select(UserProfile).where(UserProfile.user_id == user.id)
            ).first()
            if profile and profile.email:
                recipient_email = profile.email
            recipient_name = user.username

        # 1. Payment Recording (only if not already exists)
        if not existing_payment:
            new_payment = Payment(
                user_id=user.id if user else None,
                guest_email=guest_email if not user else None,
                book_id=book.id,
                amount=payment_data.get("transaction_amount"),
                status="completed",
                transaction_id=str(payment_id),
                payment_method=payment_data.get("payment_method_id"),
                created_at=datetime.utcnow()
            )
            session.add(new_payment)
            session.commit()
            session.refresh(new_payment)
            print(f"[WEBHOOK] Payment record created: {new_payment.id}")

            # Track sale event
            try:
                create_analytics_event(
                    session, 
                    metric_type="sale", 
                    value=float(new_payment.amount), 
                    book_id=new_payment.book_id,
                    data_json=f'{{"payment_id": {new_payment.id}, "user_id": {new_payment.user_id}}}'
                )
            except Exception as e:
                print(f"Error tracking sale: {e}")
        else:
            new_payment = existing_payment
            print(f"[WEBHOOK] Using existing payment record: {new_payment.id}")

        # 2. Digital Fulfillment (if download doesn't exist yet)
        if not existing_download:
            try:
                original_file = book.file_path
                watermarked_file, file_hash = apply_watermark(
                    original_file,
                    user_id=user.id if user else None,
                    transaction_id=str(payment_id),
                    email=recipient_email
                )
                
                # Create download record (temporary, will update with real path)
                download = Download(
                    user_id=user.id if user else None,
                    guest_email=guest_email if not user else None,
                    book_id=book.id,
                    file_path=watermarked_file, # Local path initially
                    downloaded_at=datetime.utcnow()
                )
                session.add(download)
                session.commit()
                
                print(f"[WEBHOOK] Watermarked file created locally: {watermarked_file}")

                # 3. Upload to Supabase Storage
                try:
                    with open(watermarked_file, "rb") as f:
                        file_bytes = f.read()
                    
                    storage_path, file_hash = upload_delivery(
                        file_bytes, 
                        user_id=user.id if user else None,
                        transaction_id=str(payment_id),
                        book_id=book.id,
                        guest_email=guest_email
                    )
                    
                    # Update download record with permanent storage path
                    download.file_path = storage_path
                    session.add(download)
                    session.commit()
                    
                    print(f"[WEBHOOK] Watermarked file uploaded to Supabase: {storage_path}")
                    
                    # Cleanup local file
                    if os.path.exists(watermarked_file):
                        os.remove(watermarked_file)
                        print(f"[WEBHOOK] Local file cleaned up: {watermarked_file}")

                except Exception as upload_err:
                    print(f"[WEBHOOK] Error uploading to storage: {upload_err}")
                    # If upload fails, the local file is still there and Download record points to it.
                    # This is better than nothing, but signed URLs won't work.
                    storage_path = watermarked_file # Fallback
                
                # Send purchase confirmation email
                if recipient_email:
                    try:
                        from email_service import send_purchase_confirmation
                        
                        # Generate temporary signed URL for download (1 hour)
                        # Now using the permanent storage_path
                        download_url = create_signed_url(
                            "deliveries",
                            storage_path,
                            expires_in=3600
                        )
                        
                        send_purchase_confirmation(
                            email=recipient_email,
                            username=recipient_name,
                            book_title=book.title,
                            download_url=download_url,
                            amount=new_payment.amount
                        )
                        
                        # Log email
                        email_log = EmailLog(
                            recipient=recipient_email,
                            template_name="purchase_confirmation",
                            status="sent"
                        )
                        session.add(email_log)
                        session.commit()
                        
                        print(f"[WEBHOOK] Purchase confirmation email sent to {recipient_email}")
                    except Exception as e:
                        print(f"[WEBHOOK] Error sending purchase confirmation email: {str(e)}")
            except Exception as e:
                print(f"[WEBHOOK] Error during fulfillment: {str(e)}")
                # We return success here because payment was recorded. 
                # Retries might happen or manual intervention.
        
        return {
            "status": "success",
            "payment_id": payment_id,
            "book_id": book_id,
            "user_id": user_id
        }
        
    except Exception as e:
        print(f"[WEBHOOK] Error processing webhook: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": str(e)}

# --- User Profile Endpoints ---

@app.get("/users/me/profile", response_model=dict)
async def get_user_profile(
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Get current user's profile"""
    profile = session.exec(
        select(UserProfile).where(UserProfile.user_id == current_user.id)
    ).first()
    
    if not profile:
        # Create default profile if doesn't exist
        profile = UserProfile(user_id=current_user.id)
        session.add(profile)
        session.commit()
        session.refresh(profile)
    
    return {
        "id": profile.id,
        "user_id": profile.user_id,
        "username": current_user.username,
        "email": profile.email,
        "bio": profile.bio,
        "avatar_url": profile.avatar_url,
        "is_admin": current_user.is_admin,
        "created_at": profile.created_at,
        "updated_at": profile.updated_at
    }


@app.put("/users/me/profile", response_model=dict)
async def update_user_profile(
    email: Optional[str] = Form(None),
    bio: Optional[str] = Form(None),
    avatar_url: Optional[str] = Form(None),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Update current user's profile"""
    profile = session.exec(
        select(UserProfile).where(UserProfile.user_id == current_user.id)
    ).first()
    
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        session.add(profile)
    
    if email is not None:
        profile.email = email
    if bio is not None:
        profile.bio = bio
    if avatar_url is not None:
        profile.avatar_url = avatar_url
    
    profile.updated_at = datetime.utcnow()
    
    session.add(profile)
    session.commit()
    session.refresh(profile)
    
    return {
        "id": profile.id,
        "user_id": profile.user_id,
        "username": current_user.username,
        "email": profile.email,
        "bio": profile.bio,
        "avatar_url": profile.avatar_url,
        "is_admin": current_user.is_admin,
        "created_at": profile.created_at,
        "updated_at": profile.updated_at
    }


@app.post("/users/me/change-password")
async def change_password(
    current_password: str = Form(...),
    new_password: str = Form(...),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Change user password"""
    # Verify current password
    if not verify_password(current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect"
        )
    
    # Update password
    current_user.hashed_password = get_password_hash(new_password)
    session.add(current_user)
    session.commit()
    
    return {"message": "Password changed successfully"}


@app.get("/users/me/library")
async def get_user_library(
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Get user's purchased books with purchase date"""
    # Join Payment with Book to get purchase details
    statement = (
        select(Book, Payment.created_at)
        .join(Payment, Payment.book_id == Book.id)
        .where(Payment.user_id == current_user.id)
        .where(Payment.status == "completed")
        .order_by(Payment.created_at.desc())
    )
    results = session.exec(statement).all()
    
    # Avoid duplicates (if a user bought the same book multiple times)
    unique_books = {}
    for book, purchase_date in results:
        if book.id not in unique_books:
            unique_books[book.id] = {
                "id": book.id,
                "title": book.title,
                "cover_image_url": book.cover_image_url,
                "purchase_date": purchase_date
            }
    
    return list(unique_books.values())


@app.get("/users/me/transactions", response_model=List[dict])
async def get_user_transactions(
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Get user's payment history"""
    payments = session.exec(
        select(Payment)
        .where(Payment.user_id == current_user.id)
        .order_by(Payment.created_at.desc())
    ).all()
    
    transactions = []
    for payment in payments:
        book = session.get(Book, payment.book_id)
        transactions.append({
            "id": payment.id,
            "book_id": payment.book_id,
            "book_title": book.title if book else "Unknown",
            "amount": payment.amount,
            "status": payment.status,
            "payment_method": payment.payment_method,
            "transaction_id": payment.transaction_id,
            "created_at": payment.created_at
        })
    
    return transactions


# Download logic is now integrated into the /books/{book_id} detail endpoint





# --- Reading Progress Endpoints ---

@app.post("/books/{book_id}/progress")
async def save_reading_progress(
    book_id: int,
    current_page: int = Form(...),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Save reading progress for a book"""
    book = session.get(Book, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    progress = update_reading_progress(session, current_user.id, book_id, current_page)
    
    return {
        "book_id": book_id,
        "current_page": progress.current_page,
        "last_read": progress.last_read
    }

@app.get("/books/{book_id}/progress")
async def get_reading_progress_endpoint(
    book_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Get reading progress for a book"""
    progress = get_reading_progress(session, current_user.id, book_id)
    
    if not progress:
        return {
            "book_id": book_id,
            "current_page": 1,
            "last_read": None
        }
    
    return {
        "book_id": book_id,
        "current_page": progress.current_page,
        "last_read": progress.last_read
    }

# --- Bookmark Endpoints ---

@app.get("/bookmarks/{book_id}")
async def get_bookmarks_endpoint(
    book_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Get all bookmarks for a book"""
    bookmarks = get_bookmarks(session, current_user.id, book_id)
    
    return [
        {
            "id": bookmark.id,
            "page_number": bookmark.page_number,
            "note": bookmark.note,
            "created_at": bookmark.created_at
        }
        for bookmark in bookmarks
    ]

@app.post("/bookmarks")
async def create_bookmark_endpoint(
    book_id: int = Form(...),
    page_number: int = Form(...),
    note: str = Form(None),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Create a new bookmark"""
    book = session.get(Book, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    bookmark = create_bookmark(session, current_user.id, book_id, page_number, note)
    
    return {
        "id": bookmark.id,
        "book_id": book_id,
        "page_number": bookmark.page_number,
        "note": bookmark.note,
        "created_at": bookmark.created_at
    }

@app.delete("/bookmarks/{bookmark_id}")
async def delete_bookmark_endpoint(
    bookmark_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Delete a bookmark"""
    success = delete_bookmark(session, bookmark_id, current_user.id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    
    return {"message": "Bookmark deleted successfully"}

# --- Category Endpoints ---

@app.get("/categories", response_model=List[CategoryResponse])
async def get_categories_endpoint(session: Session = Depends(get_session)):
    """Get all available book categories"""
    return session.exec(select(Category)).all()

# --- Search and Filter Endpoints ---

@app.get("/books/search", response_model=List[BookResponse])
async def search_books(
    q: Optional[str] = None,
    category: Optional[int] = None,
    sort: Optional[str] = "created_at",
    order: Optional[str] = "desc",
    offset: int = 0,
    limit: int = 100,
    session: Session = Depends(get_session)
):
    """
    Search and filter books
    
    Parameters:
    - q: Search query (searches in title and description)
    - category: Filter by category ID
    - sort: Sort field (title, price, created_at)
    - order: Sort order (asc, desc)
    - offset: Pagination offset
    - limit: Pagination limit
    """
    query = select(Book)
    
    # Apply search filter
    if q:
        if engine.dialect.name == "postgresql":
            # Advanced PostgreSQL Full-Text Search
            search_query = func.plainto_tsquery('spanish', q)
            title_vector = func.to_tsvector('spanish', Book.title)
            desc_vector = func.to_tsvector('spanish', Book.description)
            query = query.where(
                (title_vector.op('@@')(search_query)) |
                (desc_vector.op('@@')(search_query))
            )
        else:
            # Fallback for SQLite (Development)
            search_term = f"%{q}%"
            query = query.where(
                (Book.title.ilike(search_term)) | 
                (Book.description.ilike(search_term))
            )
    
    # Apply category filter
    if category:
        query = query.join(BookCategory).where(BookCategory.category_id == category)
    
    # Apply sorting
    if sort == "title":
        query = query.order_by(Book.title.desc() if order == "desc" else Book.title.asc())
    elif sort == "price":
        query = query.order_by(Book.price.desc() if order == "desc" else Book.price.asc())
    else:  # default to created_at
        query = query.order_by(Book.created_at.desc() if order == "desc" else Book.created_at.asc())
    
    # Apply pagination
    query = query.offset(offset).limit(limit)
    
    books = session.exec(query).all()
    return books


@app.get("/categories/{slug}/books", response_model=List[BookResponse])
async def get_books_by_category(
    slug: str,
    offset: int = 0,
    limit: int = 100,
    session: Session = Depends(get_session)
):
    """Get all books in a specific category by slug"""
    category = session.exec(select(Category).where(Category.slug == slug)).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    books = session.exec(
        select(Book)
        .join(BookCategory)
        .where(BookCategory.category_id == category.id)
        .offset(offset)
        .limit(limit)
    ).all()
    
    return books


# --- Admin Dashboard and Analytics Endpoints ---

@app.get("/admin/dashboard/stats")
async def get_dashboard_stats(
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Get dashboard statistics (admin only)"""
    from datetime import date, timedelta
    from sqlalchemy import func
    
    today = date.today()
    month_start = date(today.year, today.month, 1)
    
    # Total users
    total_users = session.exec(select(func.count(User.id))).one()
    
    # Total books
    total_books = session.exec(select(func.count(Book.id))).one()
    
    # Total sales this month
    monthly_sales = session.exec(
        select(func.count(Payment.id))
        .where(Payment.status == "completed")
        .where(Payment.created_at >= month_start)
    ).one()
    
    # Total revenue
    total_revenue = session.exec(
        select(func.sum(Payment.amount))
        .where(Payment.status == "completed")
    ).one() or 0
    
    # Monthly revenue
    monthly_revenue = session.exec(
        select(func.sum(Payment.amount))
        .where(Payment.status == "completed")
        .where(Payment.created_at >= month_start)
    ).one() or 0
    
    return {
        "total_users": total_users,
        "total_books": total_books,
        "monthly_sales": monthly_sales,
        "total_revenue": float(total_revenue),
        "monthly_revenue": float(monthly_revenue)
    }


@app.get("/admin/analytics/sales")
async def get_sales_analytics(
    period: str = "month",
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Get sales analytics by period (admin only)"""
    from datetime import date, timedelta
    from sqlalchemy import func, extract
    
    today = date.today()
    
    if period == "day":
        # Last 7 days
        start_date = today - timedelta(days=7)
        payments = session.exec(
            select(
                func.date(Payment.created_at).label('date'),
                func.count(Payment.id).label('count'),
                func.sum(Payment.amount).label('revenue')
            )
            .where(Payment.status == "completed")
            .where(Payment.created_at >= start_date)
            .group_by(func.date(Payment.created_at))
        ).all()
    elif period == "week":
        # Last 12 weeks
        start_date = today - timedelta(weeks=12)
        payments = session.exec(
            select(
                func.strftime('%Y-W%W', Payment.created_at).label('week'),
                func.count(Payment.id).label('count'),
                func.sum(Payment.amount).label('revenue')
            )
            .where(Payment.status == "completed")
            .where(Payment.created_at >= start_date)
            .group_by(func.strftime('%Y-W%W', Payment.created_at))
        ).all()
    else:  # month
        # Last 12 months
        start_date = today - timedelta(days=365)
        payments = session.exec(
            select(
                func.strftime('%Y-%m', Payment.created_at).label('month'),
                func.count(Payment.id).label('count'),
                func.sum(Payment.amount).label('revenue')
            )
            .where(Payment.status == "completed")
            .where(Payment.created_at >= start_date)
            .group_by(func.strftime('%Y-%m', Payment.created_at))
        ).all()
    
    return [
        {
            "period": str(p[0]),
            "sales": p[1],
            "revenue": float(p[2] or 0)
        }
        for p in payments
    ]


@app.get("/admin/analytics/books/popular")
async def get_popular_books(
    limit: int = 10,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Get most popular books (admin only)"""
    from sqlalchemy import func
    
    popular = session.exec(
        select(
            Book.id,
            Book.title,
            Book.cover_image_url,
            Book.price,
            func.count(Payment.id).label('sales_count'),
            func.sum(Payment.amount).label('total_revenue')
        )
        .join(Payment, Payment.book_id == Book.id)
        .where(Payment.status == "completed")
        .group_by(Book.id)
        .order_by(func.count(Payment.id).desc())
        .limit(limit)
    ).all()
    
    return [
        {
            "id": p[0],
            "title": p[1],
            "cover_image_url": p[2],
            "price": p[3],
            "sales_count": p[4],
            "total_revenue": float(p[5] or 0)
        }
        for p in popular
    ]


@app.get("/admin/analytics/users/growth")
async def get_user_growth(
    period: str = "month",
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Get user registration growth by period (admin only)"""
    from datetime import date, timedelta
    from sqlalchemy import func
    
    today = date.today()
    
    if period == "day":
        # Last 7 days
        start_date = today - timedelta(days=7)
        users = session.exec(
            select(
                func.date(UserProfile.created_at).label('date'),
                func.count(UserProfile.id).label('count')
            )
            .where(UserProfile.created_at >= start_date)
            .group_by(func.date(UserProfile.created_at))
        ).all()
    elif period == "week":
        # Last 12 weeks
        start_date = today - timedelta(weeks=12)
        users = session.exec(
            select(
                func.strftime('%Y-W%W', UserProfile.created_at).label('week'),
                func.count(UserProfile.id).label('count')
            )
            .where(UserProfile.created_at >= start_date)
            .group_by(func.strftime('%Y-W%W', UserProfile.created_at))
        ).all()
    else:  # month
        # Last 12 months
        start_date = today - timedelta(days=365)
        users = session.exec(
            select(
                func.strftime('%Y-%m', UserProfile.created_at).label('month'),
                func.count(UserProfile.id).label('count')
            )
            .where(UserProfile.created_at >= start_date)
            .group_by(func.strftime('%Y-%m', UserProfile.created_at))
        ).all()
    
    return [
        {
            "period": str(u[0]),
            "registrations": u[1]
        }
        for u in users
    ]


@app.get("/admin/analytics/revenue")
async def get_revenue_analytics(
    period: str = "month",
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Get revenue analytics by period (admin only)"""
    from datetime import date, timedelta
    from sqlalchemy import func
    
    today = date.today()
    
    if period == "day":
        start_date = today - timedelta(days=7)
    elif period == "week":
        start_date = today - timedelta(weeks=12)
    else:  # month
        start_date = today - timedelta(days=365)
    
    # Total revenue
    total_revenue = session.exec(
        select(func.sum(Payment.amount))
        .where(Payment.status == "completed")
    ).one() or 0
    
    # Revenue for selected period
    period_revenue = session.exec(
        select(func.sum(Payment.amount))
        .where(Payment.status == "completed")
        .where(Payment.created_at >= start_date)
    ).one() or 0
    
    # Average transaction
    avg_transaction = session.exec(
        select(func.avg(Payment.amount))
        .where(Payment.status == "completed")
    ).one() or 0
    
    return {
        "total_revenue": float(total_revenue),
        "period_revenue": float(period_revenue),
        "average_transaction": float(avg_transaction),
        "period": period
    }


@app.post("/admin/analytics/export")
async def export_analytics(
    data_type: str = "sales", # sales, users, books
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Export analytics data to CSV"""
    import pandas as pd
    from io import StringIO
    
    if data_type == "sales":
        query = select(Payment).where(Payment.status == "completed")
        data = session.exec(query).all()
        df = pd.DataFrame([d.dict() for d in data])
        
    elif data_type == "users":
        query = select(User)
        data = session.exec(query).all()
        # Be careful not to export hashed passwords
        users_data = []
        for user in data:
            u_dict = user.dict()
            u_dict.pop("hashed_password", None)
            users_data.append(u_dict)
        df = pd.DataFrame(users_data)
        
    elif data_type == "books":
        query = select(Book)
        data = session.exec(query).all()
        df = pd.DataFrame([d.dict() for d in data])
        
    else:
        raise HTTPException(status_code=400, detail="Invalid data type")
    
    stream = StringIO()
    df.to_csv(stream, index=False)
    response = StreamingResponse(iter([stream.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = f"attachment; filename={data_type}_export.csv"
    return response


@app.get("/admin/users")
async def get_all_users(
    offset: int = 0,
    limit: int = 50,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Get all users (admin only)"""
    query = select(User)
    
    # Apply search filter
    if search:
        search_term = f"%{search}%"
        query = query.where(User.username.ilike(search_term))
    
    users = session.exec(
        query.offset(offset).limit(limit)
    ).all()
    
    result = []
    for user in users:
        profile = session.exec(
            select(UserProfile).where(UserProfile.user_id == user.id)
        ).first()
        
        purchases = session.exec(
            select(func.count(Payment.id))
            .where(Payment.user_id == user.id)
            .where(Payment.status == "completed")
        ).one()
        
        result.append({
            "id": user.id,
            "username": user.username,
            "email": profile.email if profile else None,
            "purchases": purchases,
            "created_at": profile.created_at if profile else None,
            "is_active": getattr(user, 'is_active', True)
        })
    
    return result


@app.put("/admin/users/{user_id}/status")
async def update_user_status(
    user_id: int,
    is_active: bool = Form(...),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Enable or disable a user (admin only)"""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update is_active field if it exists
    if hasattr(user, 'is_active'):
        user.is_active = is_active
        session.add(user)
        session.commit()
        session.refresh(user)
    
    return {
        "id": user.id,
        "username": user.username,
        "is_active": getattr(user, 'is_active', True)
    }


# --- Author Info Endpoints ---

@app.get("/author/info")
async def get_author_info(session: Session = Depends(get_session)):
    """Get author information"""
    author = session.exec(select(AuthorInfo)).first()
    
    if not author:
        # Return default if not exists
        return {
            "id": 0,
            "name": "Angie",
            "bio": "Escritora apasionada por contar historias que tocan el corazón.",
            "photo_url": None,
            "email": "elrincondeangie8@gmail.com",
            "updated_at": datetime.utcnow()
        }
    
    return {
        "id": author.id,
        "name": author.name,
        "bio": author.bio,
        "photo_url": author.photo_url,
        "email": author.email,
        "updated_at": author.updated_at
    }


@app.put("/author/info")
async def update_author_info(
    name: str = Form(...),
    bio: str = Form(...),
    photo_url: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Update author information (admin only)"""
    author = session.exec(select(AuthorInfo)).first()
    
    if not author:
        author = AuthorInfo(name=name, bio=bio, photo_url=photo_url, email=email)
    else:
        author.name = name
        author.bio = bio
        author.photo_url = photo_url
        author.email = email
        author.updated_at = datetime.utcnow()
    
    session.add(author)
    session.commit()
    session.refresh(author)
    
    return {
        "id": author.id,
        "name": author.name,
        "bio": author.bio,
        "photo_url": author.photo_url,
        "email": author.email,
        "updated_at": author.updated_at
    }


@app.get("/author/timeline")
async def get_author_timeline(session: Session = Depends(get_session)):
    """Get publication timeline"""
    timeline_items = session.exec(
        select(Timeline).order_by(Timeline.year.desc())
    ).all()
    
    result = []
    for item in timeline_items:
        book = None
        if item.book_id:
            book = session.get(Book, item.book_id)
        
        result.append({
            "id": item.id,
            "year": item.year,
            "title": item.title,
            "description": item.description,
            "book_id": item.book_id,
            "book_title": book.title if book else None,
            "created_at": item.created_at
        })
    
    return result


@app.post("/author/contact")
async def send_contact_message(
    name: str = Form(...),
    email: str = Form(...),
    message: str = Form(...),
    session: Session = Depends(get_session)
):
    """Send contact message to author"""
    # Import email service
    from email_service import send_contact_message
    
    result = send_contact_message(name, email, message)
    
    if result.get("status") == "sent":
        return {"message": "Mensaje enviado exitosamente"}
    else:
        raise HTTPException(status_code=500, detail="Error al enviar el mensaje")


# --- Category Endpoints ---

@app.get("/categories", response_model=List[dict])
async def get_categories(session: Session = Depends(get_session)):
    """Get all categories"""
    print("[CATEGORIES] Fetching all categories...")
    categories = session.exec(select(Category)).all()
    print(f"[CATEGORIES] Found {len(categories)} categories")
    result = [
        {
            "id": cat.id,
            "name": cat.name,
            "slug": cat.slug,
            "description": cat.description,
            "icon": cat.icon,
            "created_at": cat.created_at
        }
        for cat in categories
    ]
    print(f"[CATEGORIES] Returning {len(result)} categories")
    return result


@app.post("/categories", response_model=dict)
async def create_category(
    name: str = Form(...),
    slug: str = Form(...),
    description: Optional[str] = Form(None),
    icon: Optional[str] = Form(None),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Create a new category (admin only)"""
    # Check if category with same name or slug already exists
    existing = session.exec(
        select(Category).where(
            (Category.name == name) | (Category.slug == slug)
        )
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Category with this name or slug already exists"
        )
    
    category = Category(
        name=name,
        slug=slug,
        description=description,
        icon=icon
    )
    session.add(category)
    session.commit()
    session.refresh(category)
    
    return {
        "id": category.id,
        "name": category.name,
        "slug": category.slug,
        "description": category.description,
        "icon": category.icon,
        "created_at": category.created_at
    }


@app.put("/categories/{category_id}", response_model=dict)
async def update_category(
    category_id: int,
    name: Optional[str] = Form(None),
    slug: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    icon: Optional[str] = Form(None),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Update a category (admin only)"""
    category = session.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    if name is not None:
        category.name = name
    if slug is not None:
        category.slug = slug
    if description is not None:
        category.description = description
    if icon is not None:
        category.icon = icon
    
    session.add(category)
    session.commit()
    session.refresh(category)
    
    return {
        "id": category.id,
        "name": category.name,
        "slug": category.slug,
        "description": category.description,
        "icon": category.icon,
        "created_at": category.created_at
    }


@app.delete("/categories/{category_id}")
async def delete_category(
    category_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Delete a category (admin only)"""
    category = session.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    session.delete(category)
    session.commit()
    
    return {"message": "Category deleted successfully"}





# --- Newsletter Endpoints ---

@app.post("/newsletter/subscribe")
async def subscribe_to_newsletter(
    email: str = Form(...),
    session: Session = Depends(get_session)
):
    """Subscribe to newsletter"""
    import re
    email = email.lower().strip()
    
    # Validate email format
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, email):
        raise HTTPException(status_code=400, detail="Invalid email format")
    
    # Check if already subscribed
    existing = session.exec(
        select(Subscriber).where(Subscriber.email == email)
    ).first()
    
    if existing:
        if existing.is_active:
            return {"message": "Ya estás suscrito a nuestro newsletter"}
        else:
            # Reactivate subscription
            existing.is_active = True
            session.add(existing)
            session.commit()
            return {"message": "Suscripción reactivada exitosamente"}
    
    # Create new subscriber
    subscriber = Subscriber(email=email)
    session.add(subscriber)
    session.commit()
    session.refresh(subscriber)
    
    return {"message": "¡Gracias por suscribirte a nuestro newsletter!"}


@app.post("/newsletter/unsubscribe/{token}")
async def unsubscribe_from_newsletter(
    token: str,
    session: Session = Depends(get_session)
):
    """Unsubscribe from newsletter using token"""
    subscriber = session.exec(
        select(Subscriber).where(Subscriber.unsubscribe_token == token)
    ).first()
    
    if not subscriber:
        raise HTTPException(status_code=404, detail="Token de cancelación inválido")
    
    subscriber.is_active = False
    session.add(subscriber)
    session.commit()
    
    return {"message": "Te has dado de baja del newsletter exitosamente"}


@app.get("/admin/subscribers")
async def get_subscribers(
    offset: int = 0,
    limit: int = 100,
    active_only: bool = True,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Get all newsletter subscribers (admin only)"""
    query = select(Subscriber)
    
    if active_only:
        query = query.where(Subscriber.is_active == True)
    
    subscribers = session.exec(
        query.offset(offset).limit(limit).order_by(Subscriber.subscribed_at.desc())
    ).all()
    
    return [
        {
            "id": s.id,
            "email": s.email,
            "is_active": s.is_active,
            "subscribed_at": s.subscribed_at,
            "unsubscribe_token": s.unsubscribe_token
        }
        for s in subscribers
    ]


@app.post("/admin/newsletter/send")
async def send_newsletter_to_subscribers(
    subject: str = Form(...),
    content: str = Form(...),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Send newsletter to all active subscribers (admin only)"""
    from email_service import send_newsletter
    
    # Get all active subscribers
    subscribers = session.exec(
        select(Subscriber).where(Subscriber.is_active == True)
    ).all()
    
    if not subscribers:
        return {"message": "No hay suscriptores activos", "sent": 0}
    
    subscriber_emails = [s.email for s in subscribers]
    
    # Send newsletter
    result = send_newsletter(subscriber_emails, subject, content)
    
    # Log emails
    for email_result in result.get("results", []):
        email_log = EmailLog(
            recipient=email_result["email"],
            template_name="newsletter",
            status="sent" if email_result["result"]["status"] == "sent" else "failed",
            error_message=email_result["result"].get("error")
        )
        session.add(email_log)
    
    session.commit()
    
    return {
        "message": f"Newsletter enviado a {len(subscriber_emails)} suscriptores",
        "sent": len(subscriber_emails)
    }


@app.get("/admin/email-logs")
async def get_email_logs(
    offset: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Get email logs (admin only)"""
    logs = session.exec(
        select(EmailLog)
        .offset(offset)
        .limit(limit)
        .order_by(EmailLog.sent_at.desc())
    ).all()
    
    return [
        {
            "id": log.id,
            "recipient": log.recipient,
            "template_name": log.template_name,
            "status": log.status,
            "sent_at": log.sent_at,
            "error_message": log.error_message
        }
        for log in logs
    ]


# ===== READING PROGRESS AND BOOKMARK ENDPOINTS =====

@app.post("/books/{book_id}/progress")
async def save_reading_progress(
    book_id: int,
    current_page: int = Form(...),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Save reading progress for a book"""
    book = session.get(Book, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    progress = update_reading_progress(session, current_user.id, book_id, current_page)
    
    return {
        "book_id": book_id,
        "current_page": progress.current_page,
        "last_read": progress.last_read
    }

@app.get("/books/{book_id}/progress")
async def get_reading_progress_endpoint(
    book_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Get reading progress for a book"""
    progress = get_reading_progress(session, current_user.id, book_id)
    
    if not progress:
        return {
            "book_id": book_id,
            "current_page": 1,
            "last_read": None
        }
    
    return {
        "book_id": book_id,
        "current_page": progress.current_page,
        "last_read": progress.last_read
    }

@app.get("/bookmarks/{book_id}")
async def get_bookmarks_endpoint(
    book_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Get all bookmarks for a book"""
    bookmarks = get_bookmarks(session, current_user.id, book_id)
    
    return [
        {
            "id": bookmark.id,
            "page_number": bookmark.page_number,
            "note": bookmark.note,
            "created_at": bookmark.created_at
        }
        for bookmark in bookmarks
    ]

@app.post("/bookmarks")
async def create_bookmark_endpoint(
    book_id: int = Form(...),
    page_number: int = Form(...),
    note: str = Form(None),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Create a new bookmark"""
    book = session.get(Book, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    bookmark = create_bookmark(session, current_user.id, book_id, page_number, note)
    
    return {
        "id": bookmark.id,
        "book_id": book_id,
        "page_number": bookmark.page_number,
        "note": bookmark.note,
        "created_at": bookmark.created_at
    }

@app.delete("/bookmarks/{bookmark_id}")
async def delete_bookmark_endpoint(
    bookmark_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Delete a bookmark"""
    success = delete_bookmark(session, bookmark_id, current_user.id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    
    return {"message": "Bookmark deleted successfully"}


# --- SEO Endpoints ---

@app.get("/sitemap.xml", response_class=StreamingResponse)
async def get_sitemap(session: Session = Depends(get_session)):
    """Generate dynamic sitemap.xml for SEO"""
    from sitemap import generate_sitemap
    
    # Get all books
    books = session.exec(select(Book)).all()
    
    # Generate XML
    xml_content = generate_sitemap(books)
    
    # Return as XML response
    from io import BytesIO
    return StreamingResponse(
        BytesIO(xml_content.encode('utf-8')),
        media_type="application/xml",
        headers={"Content-Disposition": "inline; filename=sitemap.xml"}
    )



# --- Author Page Endpoints ---

@app.get("/author/info")
async def get_author_info(session: Session = Depends(get_session)):
    """Get information about the author"""
    author = session.exec(select(AuthorInfo)).first()
    if not author:
        # Return default info if not set
        return {
            "id": 0,
            "name": "Angie",
            "bio": "Autora apasionada por las historias que tocan el corazón. Desde muy joven, Angie encontró en las letras un refugio y una forma de expresar las emociones más profundas del alma humana.\n\nSus obras exploran la complejidad de las relaciones, el crecimiento personal y la magia que se esconde en lo cotidiano. Cada libro es una invitación a sentir, a soñar y a encontrarse a uno mismo entre líneas.",
            "photo_url": None,
            "email": "contacto@elrincondeangie.com"
        }
    return author

@app.get("/author/timeline")
async def get_author_timeline(session: Session = Depends(get_session)):
    """Get author's publication timeline"""
    timeline = session.exec(select(Timeline).order_by(Timeline.year.desc())).all()
    if not timeline:
        # Return empty list or default timeline
        return []
    
    # Enrich with book titles if available
    results = []
    for item in timeline:
        book_title = None
        if item.book_id:
            book = session.get(Book, item.book_id)
            if book:
                book_title = book.title
        
        results.append({
            "id": item.id,
            "year": item.year,
            "title": item.title,
            "description": item.description,
            "book_id": item.book_id,
            "book_title": book_title
        })
    return results


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)