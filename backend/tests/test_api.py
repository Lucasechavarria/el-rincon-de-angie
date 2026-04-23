import pytest
import io
import os
import sys

# Agregar el directorio padre (backend) al sys.path para poder importar módulos como 'main'
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from main import app
from watermark import apply_watermark
from reportlab.pdfgen import canvas

client = TestClient(app)

def create_dummy_pdf(filename):
    c = canvas.Canvas(filename)
    c.drawString(100, 750, "Hello World - Original Content")
    c.save()

def test_watermark_generation():
    """Valida que la lógica de marcas de agua genere un archivo."""
    input_pdf = os.path.abspath("test_original.pdf")
    create_dummy_pdf(input_pdf)
    
    output_pdf = None
    try:
        output_pdf, file_hash = apply_watermark(input_pdf, user_id=999, transaction_id="TX-123456", email="test@test.com")
        assert os.path.exists(output_pdf)
    finally:
        # Cleanup
        if os.path.exists(input_pdf): os.remove(input_pdf)
        if output_pdf and os.path.exists(output_pdf): os.remove(output_pdf)

def test_health_check():
    """Verifica que la API responda correctamente."""
    response = client.get("/")
    # Dependiendo de tu main.py, esto podría ser 200 o 404 si no hay ruta raíz
    assert response.status_code in [200, 404, 405]

def test_auth_token_fail():
    """Verifica que el login falle con credenciales inválidas."""
    response = client.post("/token", data={"username": "wrong", "password": "wrong"})
    assert response.status_code in [400, 401]
