"""
Script de prueba para el sistema de emails
Prueba la suscripción al newsletter y verifica la configuración de Resend
"""

import requests
import os
from dotenv import load_dotenv

load_dotenv()

API_URL = "http://localhost:8000"
TEST_EMAIL = "elrincondeangie8@gmail.com"

def test_newsletter_subscription():
    """Prueba la suscripción al newsletter"""
    print("🧪 Probando suscripción al newsletter...")
    
    try:
        response = requests.post(
            f"{API_URL}/newsletter/subscribe",
            data={"email": TEST_EMAIL}
        )
        
        if response.status_code == 200:
            print(f"✅ Suscripción exitosa: {response.json()}")
            return True
        else:
            print(f"❌ Error en suscripción: {response.status_code}")
            print(f"   Respuesta: {response.text}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Error: No se puede conectar al servidor")
        print("   Asegúrate de que el backend esté corriendo en http://localhost:8000")
        return False
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
        return False

def check_resend_config():
    """Verifica la configuración de Resend"""
    print("\n🔍 Verificando configuración de Resend...")
    
    api_key = os.getenv("RESEND_API_KEY")
    email_from = os.getenv("EMAIL_FROM")
    
    if not api_key:
        print("❌ RESEND_API_KEY no está configurado en .env")
        return False
    
    if not email_from:
        print("❌ EMAIL_FROM no está configurado en .env")
        return False
    
    print(f"✅ RESEND_API_KEY: {api_key[:10]}...")
    print(f"✅ EMAIL_FROM: {email_from}")
    
    return True

def main():
    print("=" * 60)
    print("  PRUEBA DEL SISTEMA DE EMAILS - EL RINCÓN DE ANGIE")
    print("=" * 60)
    
    # Verificar configuración
    if not check_resend_config():
        print("\n⚠️  Configuración incompleta. Revisa tu archivo .env")
        return
    
    # Probar suscripción
    print()
    if test_newsletter_subscription():
        print("\n✅ Sistema de emails funcionando correctamente!")
        print("\n📧 Próximos pasos:")
        print("   1. Verifica tu email en elrincondeangie8@gmail.com")
        print("   2. Revisa el dashboard de Resend: https://resend.com/emails")
        print("   3. Verifica la tabla EmailLog en la base de datos")
    else:
        print("\n❌ Hay problemas con el sistema de emails")
        print("\n🔧 Troubleshooting:")
        print("   1. Verifica que el backend esté corriendo")
        print("   2. Revisa los logs del backend para errores")
        print("   3. Verifica la API key de Resend")

if __name__ == "__main__":
    main()
