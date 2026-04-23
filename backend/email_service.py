"""
Email service for sending notifications and newsletters.
Uses Resend API for email delivery.
"""

import os
from typing import Optional, List
from datetime import datetime
import resend
from dotenv import load_dotenv

load_dotenv()

# Configure Resend
resend.api_key = os.getenv("RESEND_API_KEY", "")

# Email configuration
EMAIL_FROM = os.getenv("EMAIL_FROM", "noreply@yourdomain.com")
EMAIL_FROM_NAME = os.getenv("EMAIL_FROM_NAME", "El Rincón de Angie")
APP_NAME = os.getenv("APP_NAME", "El Rincón de Angie")
APP_URL = os.getenv("APP_URL", "http://localhost:3000")


class EmailService:
    """Service for sending emails using Resend API"""

    @staticmethod
    def send_email(
        to: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None
    ) -> dict:
        """
        Send an email using Resend API.
        
        Args:
            to: Recipient email address
            subject: Email subject
            html_content: HTML content of the email
            text_content: Plain text content (optional)
            
        Returns:
            dict: Response from Resend API
        """
        try:
            params = {
                "from": f"{EMAIL_FROM_NAME} <{EMAIL_FROM}>",
                "to": [to],
                "subject": subject,
                "html": html_content,
            }
            
            if text_content:
                params["text"] = text_content
            
            response = resend.Emails.send(params)
            return {"status": "sent", "response": response}
        except Exception as e:
            print(f"[EMAIL ERROR] Failed to send email to {to}: {str(e)}")
            return {"status": "failed", "error": str(e)}

    @staticmethod
    def send_welcome_email(email: str, username: str) -> dict:
        """Send welcome email to new user"""
        subject = f"¡Bienvenido a {APP_NAME}!"
        
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1B4D3E;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #1B4D3E; border-bottom: 3px solid #D4AF37; padding-bottom: 10px;">
                        ¡Bienvenido a {APP_NAME}!
                    </h1>
                    <p>Hola <strong>{username}</strong>,</p>
                    <p>Gracias por unirte a nuestra comunidad de lectores. Estamos emocionados de tenerte con nosotros.</p>
                    <p>En {APP_NAME} encontrarás historias cautivadoras que tocarán tu corazón.</p>
                    <div style="margin: 30px 0;">
                        <a href="{APP_URL}/libros" 
                           style="background-color: #1B4D3E; color: #F5F5DC; padding: 12px 30px; 
                                  text-decoration: none; border-radius: 5px; display: inline-block;">
                            Explorar Catálogo
                        </a>
                    </div>
                    <p>¡Feliz lectura!</p>
                    <p style="color: #D4AF37; font-style: italic;">El equipo de {APP_NAME}</p>
                </div>
            </body>
        </html>
        """
        
        text_content = f"""
        ¡Bienvenido a {APP_NAME}!
        
        Hola {username},
        
        Gracias por unirte a nuestra comunidad de lectores. Estamos emocionados de tenerte con nosotros.
        
        En {APP_NAME} encontrarás historias cautivadoras que tocarán tu corazón.
        
        Visita nuestro catálogo: {APP_URL}/libros
        
        ¡Feliz lectura!
        El equipo de {APP_NAME}
        """
        
        return EmailService.send_email(email, subject, html_content, text_content)

    @staticmethod
    def send_purchase_confirmation(
        email: str,
        username: str,
        book_title: str,
        download_url: str,
        amount: float
    ) -> dict:
        """Send purchase confirmation email with download link"""
        subject = f"Confirmación de compra: {book_title}"
        
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1B4D3E;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #1B4D3E; border-bottom: 3px solid #D4AF37; padding-bottom: 10px;">
                        ¡Gracias por tu compra!
                    </h1>
                    <p>Hola <strong>{username}</strong>,</p>
                    <p>Tu compra de <strong>"{book_title}"</strong> ha sido confirmada.</p>
                    <div style="background-color: #F5F5DC; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>Libro:</strong> {book_title}</p>
                        <p style="margin: 5px 0;"><strong>Monto:</strong> ${amount:.2f}</p>
                    </div>
                    <p>Puedes descargar tu libro haciendo clic en el siguiente enlace:</p>
                    <div style="margin: 30px 0;">
                        <a href="{download_url}" 
                           style="background-color: #D4AF37; color: #1B4D3E; padding: 12px 30px; 
                                  text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                            Descargar Libro
                        </a>
                    </div>
                    <p style="font-size: 12px; color: #666;">
                        Este enlace estará disponible por 60 segundos. También puedes acceder a tu libro 
                        desde tu biblioteca en cualquier momento.
                    </p>
                    <p>¡Disfruta tu lectura!</p>
                    <p style="color: #D4AF37; font-style: italic;">El equipo de {APP_NAME}</p>
                </div>
            </body>
        </html>
        """
        
        text_content = f"""
        ¡Gracias por tu compra!
        
        Hola {username},
        
        Tu compra de "{book_title}" ha sido confirmada.
        
        Libro: {book_title}
        Monto: ${amount:.2f}
        
        Descarga tu libro aquí: {download_url}
        
        Este enlace estará disponible por 60 segundos. También puedes acceder a tu libro desde tu biblioteca en cualquier momento.
        
        ¡Disfruta tu lectura!
        El equipo de {APP_NAME}
        """
        
        return EmailService.send_email(email, subject, html_content, text_content)

    @staticmethod
    def send_new_book_notification(
        subscribers: List[str],
        book_title: str,
        book_description: str,
        book_url: str,
        cover_image_url: Optional[str] = None
    ) -> dict:
        """Send notification to subscribers about new book"""
        subject = f"Nueva publicación: {book_title}"
        
        cover_html = ""
        if cover_image_url:
            cover_html = f'<img src="{cover_image_url}" alt="{book_title}" style="max-width: 100%; border-radius: 5px; margin: 20px 0;">'
        
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1B4D3E;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #1B4D3E; border-bottom: 3px solid #D4AF37; padding-bottom: 10px;">
                        ¡Nueva Historia Disponible!
                    </h1>
                    <h2 style="color: #D4AF37;">{book_title}</h2>
                    {cover_html}
                    <p>{book_description}</p>
                    <div style="margin: 30px 0;">
                        <a href="{book_url}" 
                           style="background-color: #1B4D3E; color: #F5F5DC; padding: 12px 30px; 
                                  text-decoration: none; border-radius: 5px; display: inline-block;">
                            Leer Muestra Gratis
                        </a>
                    </div>
                    <p style="color: #D4AF37; font-style: italic;">El equipo de {APP_NAME}</p>
                    <hr style="border: none; border-top: 1px solid #D4AF37; margin: 30px 0;">
                    <p style="font-size: 12px; color: #666; text-align: center;">
                        Recibiste este email porque estás suscrito a nuestro newsletter.
                        <a href="{APP_URL}/unsubscribe" style="color: #1B4D3E;">Cancelar suscripción</a>
                    </p>
                </div>
            </body>
        </html>
        """
        
        text_content = f"""
        ¡Nueva Historia Disponible!
        
        {book_title}
        
        {book_description}
        
        Leer muestra gratis: {book_url}
        
        El equipo de {APP_NAME}
        
        ---
        Recibiste este email porque estás suscrito a nuestro newsletter.
        Cancelar suscripción: {APP_URL}/unsubscribe
        """
        
        # Send to all subscribers
        results = []
        for subscriber_email in subscribers:
            result = EmailService.send_email(subscriber_email, subject, html_content, text_content)
            results.append({"email": subscriber_email, "result": result})
        
        return {"status": "batch_sent", "results": results}

    @staticmethod
    def send_newsletter(
        subscribers: List[str],
        subject: str,
        content: str
    ) -> dict:
        """Send custom newsletter to subscribers"""
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1B4D3E;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #1B4D3E; border-bottom: 3px solid #D4AF37; padding-bottom: 10px;">
                        {APP_NAME}
                    </h1>
                    <div style="margin: 30px 0;">
                        {content}
                    </div>
                    <p style="color: #D4AF37; font-style: italic;">El equipo de {APP_NAME}</p>
                    <hr style="border: none; border-top: 1px solid #D4AF37; margin: 30px 0;">
                    <p style="font-size: 12px; color: #666; text-align: center;">
                        Recibiste este email porque estás suscrito a nuestro newsletter.
                        <a href="{APP_URL}/unsubscribe" style="color: #1B4D3E;">Cancelar suscripción</a>
                    </p>
                </div>
            </body>
        </html>
        """
        
        # Send to all subscribers
        results = []
        for subscriber_email in subscribers:
            result = EmailService.send_email(subscriber_email, subject, html_content)
            results.append({"email": subscriber_email, "result": result})
        
        return {"status": "batch_sent", "results": results}

    @staticmethod
    def send_contact_message(
        name: str,
        email: str,
        message: str
    ) -> dict:
        """Send contact form message to admin"""
        admin_email = os.getenv("ADMIN_EMAIL", EMAIL_FROM)
        subject = f"Nuevo mensaje de contacto de {name}"
        
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1B4D3E;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #1B4D3E; border-bottom: 3px solid #D4AF37; padding-bottom: 10px;">
                        Nuevo Mensaje de Contacto
                    </h1>
                    <div style="background-color: #F5F5DC; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>Nombre:</strong> {name}</p>
                        <p style="margin: 5px 0;"><strong>Email:</strong> {email}</p>
                    </div>
                    <div style="margin: 20px 0;">
                        <p><strong>Mensaje:</strong></p>
                        <p style="background-color: white; padding: 15px; border-left: 3px solid #D4AF37;">
                            {message}
                        </p>
                    </div>
                    <p style="font-size: 12px; color: #666;">
                        Enviado desde {APP_NAME} el {datetime.now().strftime("%d/%m/%Y %H:%M")}
                    </p>
                </div>
            </body>
        </html>
        """
        
        text_content = f"""
        Nuevo Mensaje de Contacto
        
        Nombre: {name}
        Email: {email}
        
        Mensaje:
        {message}
        
        Enviado desde {APP_NAME} el {datetime.now().strftime("%d/%m/%Y %H:%M")}
        """
        
        return EmailService.send_email(admin_email, subject, html_content, text_content)


# Convenience functions
def send_welcome_email(email: str, username: str) -> dict:
    """Send welcome email to new user"""
    return EmailService.send_welcome_email(email, username)


def send_purchase_confirmation(
    email: str,
    username: str,
    book_title: str,
    download_url: str,
    amount: float
) -> dict:
    """Send purchase confirmation email"""
    return EmailService.send_purchase_confirmation(
        email, username, book_title, download_url, amount
    )


def send_new_book_notification(
    subscribers: List[str],
    book_title: str,
    book_description: str,
    book_url: str,
    cover_image_url: Optional[str] = None
) -> dict:
    """Send new book notification to subscribers"""
    return EmailService.send_new_book_notification(
        subscribers, book_title, book_description, book_url, cover_image_url
    )


def send_newsletter(subscribers: List[str], subject: str, content: str) -> dict:
    """Send custom newsletter"""
    return EmailService.send_newsletter(subscribers, subject, content)


def send_contact_message(name: str, email: str, message: str) -> dict:
    """Send contact form message"""
    return EmailService.send_contact_message(name, email, message)
