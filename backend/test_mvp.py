import os
import io
from reportlab.pdfgen import canvas
from fastapi.testclient import TestClient
from main import app
from watermark import apply_watermark

client = TestClient(app)

def create_dummy_pdf(filename):
    c = canvas.Canvas(filename)
    c.drawString(100, 750, "Hello World - Original Content")
    c.save()

def test_watermark():
    print("Testing Watermark...")
    input_pdf = "test_original.pdf"
    output_pdf = "test_watermarked.pdf"
    create_dummy_pdf(input_pdf)
    
    try:
        apply_watermark(input_pdf, output_pdf, "TestUser", "TX-123456")
        if os.path.exists(output_pdf):
            print("✅ Watermark applied successfully. Output file created.")
        else:
            print("❌ Watermark failed. Output file not found.")
    except Exception as e:
        print(f"❌ Watermark failed with error: {e}")
    
    # Cleanup
    if os.path.exists(input_pdf): os.remove(input_pdf)
    if os.path.exists(output_pdf): os.remove(output_pdf)

def test_upload():
    print("\nTesting File Upload...")
    # Create a dummy PDF for upload
    pdf_content = io.BytesIO()
    c = canvas.Canvas(pdf_content)
    c.drawString(100, 100, "Upload Test Content")
    c.save()
    pdf_content.seek(0)
    
    # Use TestClient as context manager to trigger lifespan (create tables & admin)
    with TestClient(app) as client:
        # 1. Create Admin/User
        # The lifespan event creates 'admin', let's try to login
        try:
            response = client.post("/token", data={"username": "admin", "password": "admin"})
            if response.status_code != 200:
                print(f"Login failed: {response.json()}")
                return

            token = response.json()["access_token"]
            headers = {"Authorization": f"Bearer {token}"}
            
            # 2. Upload File
            files = {"file": ("test_upload.pdf", pdf_content, "application/pdf")}
            data = {
                "title": "Test Book",
                "price": 9.99,
                "description": "A test book description"
            }
            
            response = client.post("/books/upload", headers=headers, files=files, data=data)
            
            if response.status_code == 200:
                print("✅ File upload successful.")
                print(f"Response: {response.json()}")
                
                # Verify file exists in uploads
                file_path = response.json()["file_path"]
                if os.path.exists(file_path):
                    print(f"✅ File saved at {file_path}")
                    # Cleanup
                    os.remove(file_path)
                else:
                    print(f"❌ File not found at {file_path}")
            else:
                print(f"❌ Upload failed: {response.status_code} - {response.text}")

        except Exception as e:
            print(f"❌ Upload test failed with error: {e}")

if __name__ == "__main__":
    test_watermark()
    test_upload()
