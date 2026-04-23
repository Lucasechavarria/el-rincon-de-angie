# El Rincón de Angie - Plataforma de Publicación Literaria

## 📖 Descripción del Proyecto

Plataforma web diseñada para una escritora adolescente que permite publicar y vender sus obras literarias (cuentos, libros, novelas). Los lectores pueden previsualizar un porcentaje configurable de cada obra antes de adquirirla mediante una contribución/donación mínima.

---

## 🎨 Paleta de Colores

### Colores Principales
- **Verde Bosque Oscuro** (`#1B4D3E`) - Color principal, transmite elegancia y seriedad literaria
- **Dorado Antiguo** (`#D4AF37`) - Acentos, detalles premium y elementos destacados
- **Beige Pergamino** (`#F5F5DC`) - Fondos suaves, evoca papel antiguo
- **Amarillo Suave** (`#FFFFF0`) - Fondos alternativos, luminosidad

### Colores Secundarios
- **Gris Carbón** (`#2C3E50`) - Textos secundarios
- **Blanco** (`#FFFFFF`) - Fondos de tarjetas y elementos limpios
- **Verde Bosque Claro** (`#153e32`) - Hover states y variaciones

### Tipografía
- **Fuente Display**: Poppins (títulos y encabezados)
- **Fuente Sans**: Nunito (cuerpo de texto)
- **Fuente Serif**: Utilizada para títulos literarios y elementos elegantes

---

## ✅ Funcionalidades Implementadas

### Backend (FastAPI + Python)

#### 1. **Sistema de Autenticación**
- ✅ Registro de usuarios
- ✅ Login con JWT tokens
- ✅ Protección de rutas con OAuth2
- ✅ Hash de contraseñas con bcrypt
- ✅ Usuario admin por defecto (username: `admin`, password: `admin`)

#### 2. **Gestión de Libros**
- ✅ CRUD completo de libros (Create, Read, Update, Delete)
- ✅ Subida de archivos PDF/EPUB
- ✅ Subida de imágenes de portada
- ✅ Configuración de precio por libro
- ✅ Configuración de porcentaje de previsualización (preview_percentage)
- ✅ Almacenamiento local de archivos en carpeta `uploads/`
- ✅ Integración con Supabase Storage (4 buckets configurados)

#### 3. **Sistema de Pagos (Mercado Pago)**
- ✅ Creación de preferencias de pago
- ✅ Integración con Mercado Pago SDK
- ✅ Webhook para procesar notificaciones de pago
- ✅ Registro de transacciones en base de datos
- ✅ Soporte para moneda ARS (configurable a USD)

#### 4. **Sistema de Marcas de Agua (Watermarking)**
- ✅ Aplicación de marca de agua visible en PDFs
- ✅ Marca de agua diagonal con transparencia
- ✅ Metadatos invisibles para trazabilidad:
  - ID de usuario
  - ID de transacción
  - Fecha de compra
  - Hash de transacción
- ✅ Generación de hash SHA256 del archivo final
- ✅ Texto personalizado: "El Rincón de Angie · Usuario #X · ID: XXXXX"

#### 5. **Sistema de Previsualizaciones**
- ✅ Generación automática de PDFs de previsualización
- ✅ Configuración de número de páginas (default: 5)
- ✅ Marca de agua "PREVIEW" en archivos de muestra
- ✅ Metadatos de preview en archivos generados

#### 6. **Almacenamiento en Supabase**
- ✅ Configuración de 4 buckets:
  - `El Rincón de Angie` - Archivos originales (privado)
  - `previsualización de obras` - Previews (público)
  - `con marca de agua` - Masters con marca de agua (privado)
  - `compras` - Entregas personalizadas (privado)
- ✅ Generación de URLs firmadas para descargas seguras
- ✅ Cálculo de hash SHA256 para trazabilidad
- ✅ Gestión de archivos (upload, delete, list)

#### 7. **Base de Datos**
- ✅ Modelos SQLModel:
  - `User` - Usuarios del sistema
  - `Book` - Libros publicados
  - `Payment` - Registro de pagos
  - `Download` - Registro de descargas
  - `DownloadEvent` - Trazabilidad completa de descargas
- ✅ Soporte para PostgreSQL (Supabase) y SQLite (desarrollo local)
- ✅ Migraciones automáticas al iniciar

### Frontend (React + TypeScript + Tailwind CSS)

#### 1. **Páginas Implementadas**
- ✅ **HomePage** - Landing page con hero section y features
- ✅ **BooksPage** - Catálogo de libros con grid responsive
- ✅ **AuthorPage** - Página sobre la autora (placeholder)
- ✅ **LoginPage** - Formulario de autenticación
- ✅ **AdminPage** - Panel de administración (protegido)
- ✅ **PaymentSuccess** - Confirmación de pago exitoso
- ✅ **PaymentFailure** - Página de error de pago
- ✅ **PaymentPending** - Página de pago pendiente

#### 2. **Componentes**
- ✅ **Layout** - Estructura principal con navegación
- ✅ **BookReader** - Lector de PDFs con previsualización
- ✅ **ProtectedRoute** - HOC para rutas protegidas
- ✅ Componentes de autenticación
- ✅ Componentes de administración

#### 3. **Características de UI/UX**
- ✅ Diseño responsive (mobile-first)
- ✅ Animaciones con Framer Motion
- ✅ Transiciones suaves entre páginas
- ✅ Efectos hover en tarjetas de libros
- ✅ Loading states con spinners
- ✅ Iconos con Lucide React
- ✅ Elementos decorativos flotantes
- ✅ Gradientes y sombras elegantes

#### 4. **Integración con Backend**
- ✅ Axios para peticiones HTTP
- ✅ Fetch de libros desde API
- ✅ Visualización de portadas
- ✅ Navegación a lector de libros
- ✅ CORS configurado para localhost:3000

---

## ❌ Funcionalidades Pendientes

### Backend

#### 1. **Sistema de Usuarios**
- ❌ Perfil de usuario editable
- ❌ Recuperación de contraseña
- ❌ Verificación de email
- ❌ Roles de usuario (autor, lector, admin)
- ❌ Historial de compras del usuario

#### 2. **Gestión de Libros**
- ❌ Categorías/géneros literarios
- ❌ Sistema de etiquetas (tags)
- ❌ Búsqueda y filtros avanzados
- ❌ Ordenamiento (por fecha, precio, popularidad)
- ❌ Libros destacados/recomendados
- ❌ Sistema de calificaciones y reseñas

#### 3. **Sistema de Pagos**
- ❌ Múltiples métodos de pago
- ❌ Cupones de descuento
- ❌ Precios dinámicos (ofertas temporales)
- ❌ Donaciones sin compra
- ❌ Historial de transacciones para el usuario
- ❌ Reembolsos

#### 4. **Descargas y Entregas**
- ❌ Límite de descargas por compra
- ❌ Expiración de enlaces de descarga
- ❌ Notificación por email al completar compra
- ❌ Biblioteca personal del usuario
- ❌ Descarga desde panel de usuario

#### 5. **Panel de Administración**
- ❌ Dashboard con estadísticas
- ❌ Gráficos de ventas
- ❌ Gestión de usuarios
- ❌ Reportes de ingresos
- ❌ Analytics de lecturas/previews

#### 6. **Seguridad y Configuración**
- ❌ Variables de entorno para SECRET_KEY
- ❌ Rate limiting en endpoints
- ❌ Validación de archivos subidos (tamaño, tipo)
- ❌ Sanitización de inputs
- ❌ Logs de auditoría

### Frontend

#### 1. **Página de Autora**
- ❌ Biografía completa
- ❌ Foto de perfil
- ❌ Redes sociales
- ❌ Cronología de obras
- ❌ Sección de contacto

#### 2. **Lector de Libros**
- ❌ Controles de navegación mejorados
- ❌ Zoom y ajuste de página
- ❌ Modo nocturno
- ❌ Marcadores/favoritos
- ❌ Notas y resaltados
- ❌ Progreso de lectura guardado

#### 3. **Experiencia de Compra**
- ❌ Carrito de compras (múltiples libros)
- ❌ Wishlist/lista de deseos
- ❌ Vista previa mejorada antes de comprar
- ❌ Modal de confirmación de compra
- ❌ Proceso de checkout paso a paso

#### 4. **Perfil de Usuario**
- ❌ Página de perfil personal
- ❌ Biblioteca de libros comprados
- ❌ Historial de compras
- ❌ Configuración de cuenta
- ❌ Preferencias de lectura

#### 5. **Búsqueda y Navegación**
- ❌ Barra de búsqueda funcional
- ❌ Filtros por categoría, precio, fecha
- ❌ Paginación de resultados
- ❌ Breadcrumbs de navegación
- ❌ Menú móvil hamburguesa

#### 6. **Optimizaciones**
- ❌ SEO (meta tags, sitemap)
- ❌ PWA (Progressive Web App)
- ❌ Lazy loading de imágenes
- ❌ Caché de datos
- ❌ Optimización de bundle size
- ❌ Accesibilidad (ARIA labels, keyboard navigation)

#### 7. **Comunicación**
- ❌ Newsletter/suscripción
- ❌ Notificaciones de nuevas obras
- ❌ Sistema de comentarios
- ❌ Compartir en redes sociales
- ❌ Blog de la autora

---

## 🏗️ Arquitectura Técnica

### Stack Tecnológico

**Backend:**
- FastAPI (Python 3.x)
- SQLModel (ORM)
- PostgreSQL (Supabase) / SQLite (desarrollo)
- Supabase Storage
- Mercado Pago SDK
- PyPDF2 + ReportLab (watermarking)
- JWT + Passlib (autenticación)

**Frontend:**
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion (animaciones)
- React Router v6
- Axios
- React PDF
- Lucide React (iconos)

### Estructura de Directorios

```
proyecto/
├── backend/
│   ├── main.py              # Punto de entrada, rutas API
│   ├── models.py            # Modelos de base de datos
│   ├── schemas.py           # Schemas Pydantic
│   ├── auth.py              # Autenticación JWT
│   ├── crud.py              # Operaciones CRUD
│   ├── payments.py          # Integración Mercado Pago
│   ├── watermark.py         # Sistema de marcas de agua
│   ├── storage.py           # Integración Supabase Storage
│   ├── database.py          # Configuración DB
│   ├── requirements.txt     # Dependencias Python
│   ├── .env                 # Variables de entorno
│   └── uploads/             # Archivos subidos (local)
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   │   ├── auth/
│   │   │   ├── admin/
│   │   │   ├── layout/
│   │   │   └── BookReader.tsx
│   │   ├── pages/           # Páginas de la aplicación
│   │   ├── utils/           # Utilidades y helpers
│   │   ├── App.tsx          # Componente principal
│   │   └── index.tsx        # Punto de entrada
│   ├── public/
│   ├── package.json
│   └── tailwind.config.js   # Configuración Tailwind
│
└── database.db              # SQLite (desarrollo)
```

---

## 🚀 Instalación y Configuración

### Requisitos Previos
- Python 3.8+
- Node.js 16+
- npm o yarn
- Cuenta de Mercado Pago (para pagos)
- Cuenta de Supabase (para storage)

### Backend

1. **Instalar dependencias:**
```bash
cd backend
pip install -r requirements.txt
```

2. **Configurar variables de entorno (.env):**
```env
DATABASE_URL=postgresql://user:password@host:port/database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
MP_ACCESS_TOKEN=your-mercadopago-access-token
FRONTEND_URL=http://localhost:3000
WEBHOOK_URL=https://your-domain.com/payments/webhook
SECRET_KEY=your-secret-key-here
```

3. **Ejecutar servidor:**
```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### Frontend

1. **Instalar dependencias:**
```bash
cd frontend
npm install
```

2. **Ejecutar aplicación:**
```bash
npm start
```

La aplicación estará disponible en `http://localhost:3000`

---

## 📊 Modelos de Datos

### User
- `id`: Integer (PK)
- `username`: String (unique)
- `hashed_password`: String

### Book
- `id`: Integer (PK)
- `title`: String
- `description`: String (optional)
- `cover_image_url`: String (optional)
- `file_path`: String
- `storage_path`: String (optional)
- `preview_path`: String (optional)
- `price`: Float
- `preview_percentage`: Float (default: 0.1)
- `preview_pages`: Integer (default: 5)
- `created_at`: DateTime
- `author_id`: Integer (FK → User)

### Payment
- `id`: Integer (PK)
- `book_id`: Integer (FK → Book)
- `user_id`: Integer (FK → User)
- `amount`: Float
- `status`: String
- `transaction_id`: String (unique)
- `payment_method`: String (optional)
- `created_at`: DateTime
- `payment_date`: DateTime

### Download
- `id`: Integer (PK)
- `book_id`: Integer (FK → Book)
- `user_id`: Integer (FK → User)
- `file_path`: String (optional)
- `delivery_id`: String (optional)
- `downloaded_at`: DateTime
- `download_date`: DateTime

### DownloadEvent
- `id`: Integer (PK)
- `user_id`: Integer (FK → User)
- `book_id`: Integer (FK → Book)
- `payment_id`: Integer (FK → Payment)
- `delivery_id`: String
- `watermark_hash`: String
- `ip_address`: String (optional)
- `user_agent`: String (optional)
- `device_fingerprint`: String (optional)
- `downloaded_at`: DateTime

---

## 🔐 Seguridad Implementada

1. **Autenticación:**
   - JWT tokens con expiración (30 minutos)
   - Contraseñas hasheadas con bcrypt
   - OAuth2 password flow

2. **Autorización:**
   - Rutas protegidas con dependencias
   - Verificación de propiedad de recursos
   - Usuario debe ser autor para editar/eliminar libros

3. **Trazabilidad:**
   - Marca de agua visible e invisible en PDFs
   - Hash SHA256 de archivos entregados
   - Registro de eventos de descarga
   - Metadatos de transacción en PDFs

4. **Storage:**
   - Buckets privados para archivos sensibles
   - URLs firmadas con expiración
   - Separación de archivos originales y entregas

---

## 🎯 Flujo de Compra

1. Usuario navega el catálogo de libros
2. Selecciona un libro y ve la previsualización
3. Decide comprar y hace clic en "Comprar"
4. Se crea una preferencia de Mercado Pago
5. Usuario es redirigido a Mercado Pago
6. Completa el pago
7. Mercado Pago envía webhook al backend
8. Backend verifica el pago
9. Se genera PDF con marca de agua personalizada
10. Se registra la compra y descarga
11. Usuario puede descargar su libro

---

## 📋 Spec de Mejoras en Desarrollo

Existe un spec completo para implementar las siguientes funcionalidades:

**📂 Ubicación**: `.kiro/specs/platform-enhancements/`

### Funcionalidades Planificadas

1. **Perfil de Usuario Completo**
   - Biblioteca personal de libros comprados
   - Historial de transacciones
   - Edición de perfil y cambio de contraseña

2. **Sistema de Categorías y Búsqueda**
   - Búsqueda avanzada con autocomplete
   - Filtros por categoría y precio
   - Ordenamiento de resultados

3. **Página de Autora Completa**
   - Biografía detallada con foto
   - Enlaces a redes sociales
   - Cronología de publicaciones
   - Formulario de contacto

4. **Lector de Libros Mejorado**
   - Controles de zoom
   - Modo nocturno
   - Sistema de marcadores
   - Guardado de progreso de lectura

5. **Panel de Administración con Estadísticas**
   - Dashboard con métricas clave
   - Gráficos de ventas y usuarios
   - Ranking de libros populares
   - Exportación de datos a CSV

6. **Newsletter y Notificaciones**
   - Sistema de suscripción
   - Emails automáticos de confirmación
   - Notificaciones de nuevas publicaciones
   - Panel de gestión para admin

7. **Optimizaciones SEO y PWA**
   - Meta tags y Open Graph
   - Sitemap dinámico
   - Progressive Web App
   - Modo offline
   - Instalación como app nativa

8. **Integración del Logo Oficial**
   - Favicon personalizado
   - Logo en navegación
   - Iconos PWA en múltiples tamaños
   - Branding consistente

### Estado del Spec

- ✅ Requirements: Completo (8 requisitos principales)
- ✅ Design: Completo (arquitectura, componentes, modelos)
- ✅ Tasks: Completo (100+ tareas organizadas)
- 🔄 Implementation: Listo para comenzar

**Duración estimada**: 8 semanas

Para comenzar la implementación, abre el archivo `.kiro/specs/platform-enhancements/tasks.md` y haz clic en "Start task" en la primera tarea.

---

## 📝 Notas de Desarrollo

### Configuración Actual
- Usuario admin por defecto: `admin` / `admin` (cambiar en producción)
- SECRET_KEY hardcodeado (mover a .env)
- CORS configurado para localhost:3000
- Base de datos SQLite por defecto (cambiar a PostgreSQL en producción)
- Logo disponible en: `frontend/public/El rincon de Angie3.png`

### Próximos Pasos
1. Implementar spec de mejoras de plataforma
2. Configurar servicio de email (SendGrid/Resend)
3. Generar variantes del logo para PWA
4. Configurar Redis para caché (opcional)
5. Implementar tests comprehensivos
6. Configurar CI/CD
7. Documentación de API con Swagger/OpenAPI
8. Monitoreo y alertas

---

## 📄 Licencia

Proyecto privado - Todos los derechos reservados

---

## 👥 Contacto

Para consultas sobre el proyecto, contactar al equipo de desarrollo.

---

**Última actualización:** Diciembre 2024
