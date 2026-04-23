"""
Supabase Storage Module
Handles all file operations with Supabase Storage buckets.
"""
import os
import hashlib
from typing import Optional, Literal
from datetime import datetime, timedelta
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("[WARNING] Supabase credentials not configured. Storage operations will fail.")
    supabase: Optional[Client] = None
else:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Bucket names - Updated to match your Supabase buckets
BUCKET_ORIGINALS = "El Rincón de Angie"  # Para archivos originales
BUCKET_PREVIEWS = "previsualización de obras"  # Público - para previews
BUCKET_WATERMARK_MASTER = "con marca de agua"  # Privado - para masters
BUCKET_DELIVERIES = "compras"  # Privado - para entregas personalizadas


def upload_to_supabase(bucket: str, file_bytes: bytes, path: str, content_type: str = "application/pdf") -> str:
    """Base helper to upload files to Supabase Storage"""
    if not supabase:
        raise RuntimeError("Supabase not configured")
    try:
        supabase.storage.from_(bucket).upload(
            path=path,
            file=file_bytes,
            file_options={"content-type": content_type, "upsert": "true"}
        )
        print(f"[STORAGE] Uploaded to {bucket}: {path}")
        return path
    except Exception as e:
        print(f"[STORAGE] Error uploading to {bucket}/{path}: {e}")
        raise

def upload_original(file_bytes: bytes, book_id: int, filename: str, category_slug: str = "uncategorized") -> str:
    """Upload original book file organized by category"""
    path = f"genres/{category_slug}/books/{book_id}/original/{filename}"
    return upload_to_supabase(BUCKET_ORIGINALS, file_bytes, path)

def upload_preview(file_bytes: bytes, book_id: int, filename: str, category_slug: str = "uncategorized") -> str:
    """Upload preview book file organized by category"""
    path = f"genres/{category_slug}/books/{book_id}/preview/{filename}"
    return upload_to_supabase(BUCKET_PREVIEWS, file_bytes, path)


def upload_watermark_master(file_bytes: bytes, book_id: int) -> str:
    """
    Upload watermark master (base template) to private bucket.
    
    Args:
        file_bytes: Watermarked PDF content
        book_id: Book ID
    
    Returns:
        Storage path
    """
    if not supabase:
        raise RuntimeError("Supabase not configured")
    
    path = f"books/{book_id}/watermark_master.pdf"
    
    try:
        supabase.storage.from_(BUCKET_WATERMARK_MASTER).upload(
            path=path,
            file=file_bytes,
            file_options={"content-type": "application/pdf"}
        )
        print(f"[STORAGE] Uploaded watermark master: {path}")
        return path
    except Exception as e:
        print(f"[STORAGE] Error uploading watermark master: {e}")
        raise


def upload_delivery(file_bytes: bytes, user_id: Optional[int], transaction_id: str, book_id: int, guest_email: Optional[str] = None) -> tuple[str, str]:
    """
    Upload personalized delivery to private 'deliveries' bucket.
    
    Args:
        file_bytes: Personalized watermarked PDF
        user_id: Buyer's user ID (None for guests)
        transaction_id: Mercado Pago transaction ID
        book_id: Book ID
        guest_email: Guest's email (required if user_id is None)
    
    Returns:
        Tuple of (storage_path, sha256_hash)
    """
    if not supabase:
        raise RuntimeError("Supabase not configured")
    
    # Calculate SHA256 hash for traceability
    file_hash = hashlib.sha256(file_bytes).hexdigest()
    
    # Path: users/{user_id}/deliveries/{transaction_id}.pdf or guests/{email}/deliveries/...
    if user_id:
        path = f"users/{user_id}/deliveries/{transaction_id}.pdf"
    else:
        # Sanitize guest email for path
        safe_email = guest_email.replace("@", "_at_").replace(".", "_")
        path = f"guests/{safe_email}/deliveries/{transaction_id}.pdf"
    
    try:
        supabase.storage.from_(BUCKET_DELIVERIES).upload(
            path=path,
            file=file_bytes,
            file_options={
                "content-type": "application/pdf",
                "x-upsert": "true"  # Allow overwrite if exists
            }
        )
        print(f"[STORAGE] Uploaded delivery: {path} (hash: {file_hash[:16]}...)")
        return path, file_hash
    except Exception as e:
        print(f"[STORAGE] Error uploading delivery: {e}")
        raise


def create_signed_url(
    bucket_key: Literal["originals", "previews", "watermark_master", "deliveries"],
    path: str,
    expires_in: int = 600
) -> str:
    """
    Create a signed URL for secure file download.
    Maps logical bucket keys to actual Supabase bucket names.
    """
    if not supabase:
        raise RuntimeError("Supabase not configured")
    
    # Mapping logical keys to real bucket names
    bucket_map = {
        "originals": BUCKET_ORIGINALS,
        "previews": BUCKET_PREVIEWS,
        "watermark_master": BUCKET_WATERMARK_MASTER,
        "deliveries": BUCKET_DELIVERIES
    }
    
    bucket_name = bucket_map.get(bucket_key)
    if not bucket_name:
        raise ValueError(f"Invalid bucket key: {bucket_key}")
    
    try:
        response = supabase.storage.from_(bucket_name).create_signed_url(
            path=path,
            expires_in=expires_in
        )
        
        # supabase-py return format check
        if isinstance(response, dict) and "signedURL" in response:
            return response["signedURL"]
        elif isinstance(response, str):
            return response
        
        return str(response)
    except Exception as e:
        print(f"[STORAGE] Error creating signed URL: {e}")
        raise


def get_public_url(bucket: str, path: str) -> str:
    """
    Get public URL for files in public buckets (e.g., previews).
    
    Args:
        bucket: Bucket name
        path: File path
    
    Returns:
        Public URL
    """
    if not supabase:
        raise RuntimeError("Supabase not configured")
    
    try:
        response = supabase.storage.from_(bucket).get_public_url(path)
        print(f"[STORAGE] Got public URL for {path}")
        return response
    except Exception as e:
        print(f"[STORAGE] Error getting public URL: {e}")
        raise


def delete_file(bucket: str, path: str) -> bool:
    """
    Delete a file from storage.
    
    Args:
        bucket: Bucket name
        path: File path
    
    Returns:
        True if successful
    """
    if not supabase:
        raise RuntimeError("Supabase not configured")
    
    try:
        supabase.storage.from_(bucket).remove([path])
        print(f"[STORAGE] Deleted file: {bucket}/{path}")
        return True
    except Exception as e:
        print(f"[STORAGE] Error deleting file: {e}")
        return False


def list_files(bucket: str, path: str = "") -> list:
    """
    List files in a bucket path.
    
    Args:
        bucket: Bucket name
        path: Directory path (optional)
    
    Returns:
        List of file objects
    """
    if not supabase:
        raise RuntimeError("Supabase not configured")
    
    try:
        files = supabase.storage.from_(bucket).list(path)
        return files
    except Exception as e:
        print(f"[STORAGE] Error listing files: {e}")
        return []
