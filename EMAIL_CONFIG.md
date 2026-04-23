# Configuración de Email - Resend

## Información de la Cuenta

**Servicio**: Resend (https://resend.com)  
**Email**: elrincondeangie8@gmail.com  
**API Key**: `re_cZo6PKW4_5f6V99r7WsL3A2BzAz5QcgDn`

## Configuración en .env

```bash
RESEND_API_KEY=re_cZo6PKW4_5f6V99r7WsL3A2BzAz5QcgDn
EMAIL_FROM=elrincondeangie8@gmail.com
EMAIL_FROM_NAME=El Rincón de Angie
ADMIN_EMAIL=elrincondeangie8@gmail.com
```

## Límites del Plan Gratuito

- **Emails por día**: 100
- **Emails por mes**: 3,000
- **Dominios verificados**: 1

## Emails Implementados

### 1. Email de Bienvenida
**Trigger**: Registro de nuevo usuario  
**Template**: `send_welcome_email()`  
**Contenido**: Saludo personalizado + link al catálogo

### 2. Confirmación de Compra
**Trigger**: Pago completado (webhook)  
**Template**: `send_purchase_confirmation()`  
**Contenido**: Detalles de compra + link de descarga temporal

### 3. Newsletter
**Trigger**: Admin envía desde panel  
**Template**: `send_newsletter()`  
**Contenido**: Personalizable con HTML

### 4. Notificación de Nuevo Libro
**Trigger**: Admin sube nuevo libro (pendiente implementar)  
**Template**: `send_new_book_notification()`  
**Contenido**: Info del libro + link para comprar

### 5. Mensaje de Contacto
**Trigger**: Formulario de contacto en AuthorPage  
**Template**: `send_contact_message()`  
**Contenido**: Mensaje del usuario al admin

## Testing de Emails

### Desarrollo Local
```bash
# Enviar email de prueba
curl -X POST http://localhost:8000/newsletter/subscribe \
  -F "email=test@example.com"
```

### Verificar en Resend Dashboard
1. Ir a https://resend.com/emails
2. Ver logs de emails enviados
3. Verificar estado (sent/delivered/failed)

## Producción

### Dominio Personalizado (Recomendado)
Para mejor deliverability, configurar dominio personalizado:

1. Ir a https://resend.com/domains
2. Agregar dominio (ej: elrincondeangie.com)
3. Configurar registros DNS:
   - SPF
   - DKIM
   - DMARC
4. Verificar dominio
5. Actualizar `EMAIL_FROM` a `noreply@elrincondeangie.com`

### Monitoreo
- Revisar dashboard de Resend regularmente
- Monitorear tasa de entrega
- Revisar bounces y complaints
- Actualizar a plan pago si se exceden límites

## Troubleshooting

### Email no llega
1. Verificar API key en .env
2. Revisar logs del backend
3. Verificar tabla `EmailLog` en base de datos
4. Revisar dashboard de Resend
5. Verificar carpeta de spam

### Error de autenticación
- Verificar que API key sea correcta
- Verificar que email FROM esté verificado en Resend

### Rate limit excedido
- Upgrade a plan pago
- Implementar cola de emails
- Batch processing para newsletters

## Mejoras Futuras

1. **Double opt-in**: Confirmar email antes de activar suscripción
2. **Segmentación**: Enviar newsletters a grupos específicos
3. **Templates personalizables**: Editor visual para newsletters
4. **Analytics**: Track de aperturas y clicks
5. **A/B Testing**: Probar diferentes asuntos y contenidos
6. **Automatización**: Emails programados y drip campaigns
