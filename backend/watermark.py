"""
PDF Watermarking Module
Handles watermark application with visible and invisible marks, plus preview generation.
"""
from PyPDF2 import PdfWriter, PdfReader
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import hashlib
from datetime import datetime
import os
from typing import Optional


def create_watermark(text: str, alpha: float = 0.15) -> PdfReader:
    """
    Create a watermark overlay PDF with diagonal text.
    
    Args:
        text: Text to display in the watermark
        alpha: Transparency level (0.0 to 1.0)
    
    Returns:
        PdfReader object containing the watermark
    """
    packet = BytesIO()
    can = canvas.Canvas(packet, pagesize=letter)
    
    # Set font and color with transparency
    can.setFont("Helvetica-Bold", 40)
    can.setFillColorRGB(0.5, 0.5, 0.5, alpha=alpha)
    
    # Rotate and position the watermark diagonally
    can.saveState()
    can.translate(300, 400)
    can.rotate(45)
    can.drawCentredString(0, 0, text)
    can.restoreState()
    
    can.save()
    packet.seek(0)
    
    return PdfReader(packet)


def apply_watermark(file_path: str, user_id: Optional[int], transaction_id: str, email: Optional[str] = None) -> tuple[str, str]:
    """
    Apply dynamic watermark to a PDF file with visible and invisible marks.
    Supports both local paths and Supabase Storage paths.
    """
    temp_download = None
    try:
        # Check if file_path is a Supabase path (doesn't start with / or C:\\)
        is_supabase = not (file_path.startswith('/') or (len(file_path) > 1 and file_path[1] == ':'))
        
        if is_supabase:
            from storage import supabase, BUCKET_ORIGINALS
            import tempfile
            print(f"[WATERMARK] Downloading original from Supabase: {file_path}")
            
            # Download file to a temporary location
            fd, temp_download = tempfile.mkstemp(suffix=".pdf")
            os.close(fd)
            
            with open(temp_download, "wb") as f:
                res = supabase.storage.from_(BUCKET_ORIGINALS).download(file_path)
                f.write(res)
            
            input_path = temp_download
        else:
            input_path = file_path

        # Read the input PDF
        reader = PdfReader(input_path)
        writer = PdfWriter()
        
        # Create watermark text
        buyer_info = f"Usuario #{user_id}" if user_id else f"Invitado ({email})"
        watermark_text = f"El Rincón de Angie · {buyer_info} · ID: {transaction_id}"
        watermark_overlay = create_watermark(watermark_text)
        
        # Apply watermark to each page
        for page in reader.pages:
            page.merge_page(watermark_overlay.pages[0])
            writer.add_page(page)
        
        # Add invisible metadata for traceability
        transaction_hash = hashlib.sha256(
            f"{user_id}:{transaction_id}:{datetime.utcnow().isoformat()}".encode()
        ).hexdigest()
        
        writer.add_metadata({
            "/WatermarkID": str(transaction_id),
            "/BuyerUserID": str(user_id) if user_id else "Guest",
            "/BuyerEmail": str(email) if email else "N/A",
            "/PurchaseDate": datetime.utcnow().isoformat(),
            "/TransactionHash": transaction_hash[:32],  # First 32 chars
            "/Platform": "El Rincón de Angie",
            "/WatermarkVersion": "2.0"
        })
        
        # Generate output path
        # If input was temp, output should go to the app's standard UPLOAD_DIR
        output_dir = "uploads" if is_supabase else os.path.dirname(file_path)
        os.makedirs(output_dir, exist_ok=True)
        
        filename = os.path.basename(file_path)
        name, ext = os.path.splitext(filename)
        output_path = os.path.join(output_dir, f"{name}_watermarked_{transaction_id}{ext}")
        
        # Write the output PDF
        with open(output_path, 'wb') as output_file:
            writer.write(output_file)
        
        # Calculate SHA256 hash of the final file
        with open(output_path, 'rb') as f:
            file_hash = hashlib.sha256(f.read()).hexdigest()
        
        print(f"[WATERMARK] Created: {output_path}")
        return output_path, file_hash
        
    except Exception as e:
        print(f"[WATERMARK] Error applying watermark: {e}")
        raise
    finally:
        # Cleanup temp download if it was created
        if temp_download and os.path.exists(temp_download):
            try:
                os.remove(temp_download)
                print(f"[WATERMARK] Cleaned up temporary download: {temp_download}")
            except:
                pass


def generate_preview(file_path: str, pages: int = 5) -> bytes:
    """
    Generate a preview PDF with only the first N pages.
    
    Args:
        file_path: Path to the original PDF file
        pages: Number of pages to include in preview (default: 5)
    
    Returns:
        Preview PDF as bytes
    """
    try:
        reader = PdfReader(file_path)
        writer = PdfWriter()
        
        total_pages = len(reader.pages)
        preview_pages = min(pages, total_pages)
        
        print(f"[PREVIEW] Generating preview: {preview_pages}/{total_pages} pages")
        
        # Add first N pages
        for i in range(preview_pages):
            writer.add_page(reader.pages[i])
        
        # Add "PREVIEW" watermark
        preview_text = "PREVIEW · El Rincón de Angie"
        preview_overlay = create_watermark(preview_text, alpha=0.08)
        
        # Apply preview watermark to all pages
        for page in writer.pages:
            page.merge_page(preview_overlay.pages[0])
        
        # Add metadata
        writer.add_metadata({
            "/Title": f"Preview - {preview_pages} pages",
            "/Subject": "Preview version",
            "/Creator": "El Rincón de Angie"
        })
        
        # Write to bytes
        output = BytesIO()
        writer.write(output)
        output.seek(0)
        
        print(f"[PREVIEW] Generated successfully")
        return output.getvalue()
        
    except Exception as e:
        print(f"[PREVIEW] Error: {str(e)}")
        raise