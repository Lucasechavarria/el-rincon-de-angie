-- Configuración de Base de Datos para El Rincón de Angie (Supabase PostgreSQL)
-- Ejecutar este script en el SQL Editor de Supabase

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS "user" (
    id SERIAL PRIMARY KEY,
    username VARCHAR UNIQUE NOT NULL,
    hashed_password VARCHAR NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE
);

-- Tabla de Perfiles de Usuario
CREATE TABLE IF NOT EXISTS "userprofile" (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES "user"(id) ON DELETE CASCADE,
    email VARCHAR,
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Categorías
CREATE TABLE IF NOT EXISTS "category" (
    id SERIAL PRIMARY KEY,
    name VARCHAR UNIQUE NOT NULL,
    slug VARCHAR UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Libros
CREATE TABLE IF NOT EXISTS "book" (
    id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    file_path TEXT NOT NULL,
    storage_path TEXT,
    preview_path TEXT,
    price FLOAT DEFAULT 0.0,
    preview_percentage FLOAT DEFAULT 0.1,
    preview_pages INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    author_id INTEGER REFERENCES "user"(id) ON DELETE SET NULL
);

-- Tabla Relacional Libros-Categorías
CREATE TABLE IF NOT EXISTS "bookcategory" (
    id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES "book"(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES "category"(id) ON DELETE CASCADE
);

-- Tabla de Pagos (Actualizada para invitados)
CREATE TABLE IF NOT EXISTS "payment" (
    id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES "book"(id),
    user_id INTEGER REFERENCES "user"(id) ON DELETE SET NULL,
    guest_email VARCHAR,
    amount FLOAT NOT NULL,
    status VARCHAR NOT NULL,
    transaction_id VARCHAR UNIQUE,
    payment_method VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Descargas (Actualizada para invitados)
CREATE TABLE IF NOT EXISTS "download" (
    id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES "book"(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES "user"(id) ON DELETE SET NULL,
    guest_email VARCHAR,
    file_path TEXT,
    delivery_id VARCHAR,
    downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    download_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Eventos de Descarga (Traceabilidad)
CREATE TABLE IF NOT EXISTS "downloadevent" (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES "user"(id) ON DELETE SET NULL,
    guest_email VARCHAR,
    book_id INTEGER REFERENCES "book"(id) ON DELETE CASCADE,
    payment_id INTEGER REFERENCES "payment"(id) ON DELETE SET NULL,
    delivery_id VARCHAR NOT NULL,
    watermark_hash VARCHAR NOT NULL,
    ip_address VARCHAR,
    user_agent TEXT,
    device_fingerprint TEXT,
    downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Progreso de Lectura
CREATE TABLE IF NOT EXISTS "readingprogress" (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
    book_id INTEGER REFERENCES "book"(id) ON DELETE CASCADE,
    current_page INTEGER DEFAULT 1,
    total_pages INTEGER NOT NULL,
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Marcadores
CREATE TABLE IF NOT EXISTS "bookmark" (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
    book_id INTEGER REFERENCES "book"(id) ON DELETE CASCADE,
    page_number INTEGER NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_payment_transaction_id ON "payment"(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_user_id ON "payment"(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_guest_email ON "payment"(guest_email);
CREATE INDEX IF NOT EXISTS idx_book_title ON "book"(title);
CREATE INDEX IF NOT EXISTS idx_downloadevent_delivery_id ON "downloadevent"(delivery_id);
CREATE INDEX IF NOT EXISTS idx_downloadevent_watermark_hash ON "downloadevent"(watermark_hash);

-- Configuración de Búsqueda de Texto Completo (PostgreSQL)
ALTER TABLE "book" ADD COLUMN IF NOT EXISTS search_vector tsvector;
CREATE INDEX IF NOT EXISTS idx_book_search_vector ON "book" USING GIN(search_vector);

CREATE OR REPLACE FUNCTION book_search_trigger() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('spanish', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('spanish', coalesce(NEW.description, '')), 'B');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_book_search_update BEFORE INSERT OR UPDATE
ON "book" FOR EACH ROW EXECUTE FUNCTION book_search_trigger();
-- Tabla de Analytics
CREATE TABLE IF NOT EXISTS "analytics" (
    id SERIAL PRIMARY KEY,
    event_date DATE NOT NULL DEFAULT CURRENT_DATE,
    metric_type VARCHAR NOT NULL, -- 'sale', 'preview', 'registration'
    book_id INTEGER REFERENCES "book"(id) ON DELETE SET NULL,
    value FLOAT NOT NULL,
    data_json TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Suscriptores (Newsletter)
CREATE TABLE IF NOT EXISTS "subscriber" (
    id SERIAL PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    unsubscribe_token VARCHAR UNIQUE NOT NULL
);

-- Tabla de Plantillas de Email
CREATE TABLE IF NOT EXISTS "emailtemplate" (
    id SERIAL PRIMARY KEY,
    name VARCHAR UNIQUE NOT NULL,
    subject VARCHAR NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Logs de Email
CREATE TABLE IF NOT EXISTS "emaillog" (
    id SERIAL PRIMARY KEY,
    recipient VARCHAR NOT NULL,
    template_name VARCHAR NOT NULL,
    status VARCHAR NOT NULL, -- 'sent', 'failed', 'pending'
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    error_message TEXT
);

-- Tabla de Información del Autor
CREATE TABLE IF NOT EXISTS "authorinfo" (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    bio TEXT NOT NULL,
    photo_url TEXT,
    facebook_url TEXT,
    instagram_url TEXT,
    twitter_url TEXT,
    email VARCHAR,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Cronología (Timeline)
CREATE TABLE IF NOT EXISTS "timeline" (
    id SERIAL PRIMARY KEY,
    year INTEGER NOT NULL,
    title VARCHAR NOT NULL,
    description TEXT NOT NULL,
    book_id INTEGER REFERENCES "book"(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices adicionales
CREATE INDEX IF NOT EXISTS idx_subscriber_email ON "subscriber"(email);
CREATE INDEX IF NOT EXISTS idx_analytics_metric_type ON "analytics"(metric_type);
CREATE INDEX IF NOT EXISTS idx_analytics_event_date ON "analytics"(event_date);
CREATE INDEX IF NOT EXISTS idx_emaillog_recipient ON "emaillog"(recipient);

-- Habilitar Row Level Security (RLS)
-- Nota: "user" es una palabra reservada, debe ir entre comillas dobles
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "userprofile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "book" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "download" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "downloadevent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "readingprogress" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "bookmark" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "analytics" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subscriber" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "authorinfo" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "timeline" ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (Permitir lectura pública de libros y categorías)
CREATE POLICY "Permitir lectura pública de libros" ON "book" FOR SELECT USING (true);
CREATE POLICY "Permitir lectura pública de categorías" ON "category" FOR SELECT USING (true);
CREATE POLICY "Permitir lectura pública de información del autor" ON "authorinfo" FOR SELECT USING (true);
CREATE POLICY "Permitir lectura pública de cronología" ON "timeline" FOR SELECT USING (true);
