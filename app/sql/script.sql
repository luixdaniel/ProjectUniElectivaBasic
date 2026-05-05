-- Ejecutar este script en Supabase SQL Editor
-- (en Supabase no se crea base de datos con CREATE DATABASE desde este contexto)

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(20) NOT NULL,
    apellido VARCHAR(20) NOT NULL,
    cedula VARCHAR(20) NOT NULL,
    edad INTEGER NOT NULL,
    usuario VARCHAR(20) NOT NULL,
    correo VARCHAR(120) NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'usuario'
);

ALTER TABLE usuarios
ADD COLUMN IF NOT EXISTS rol VARCHAR(20) NOT NULL DEFAULT 'usuario';

ALTER TABLE usuarios
ADD COLUMN IF NOT EXISTS correo VARCHAR(120);

ALTER TABLE usuarios
ALTER COLUMN contrasena TYPE VARCHAR(255);

UPDATE usuarios
SET correo = usuario || '@correo.local'
WHERE correo IS NULL;

ALTER TABLE usuarios
ALTER COLUMN correo SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_usuarios_usuario ON usuarios(usuario);
CREATE UNIQUE INDEX IF NOT EXISTS ux_usuarios_correo ON usuarios(correo);
CREATE UNIQUE INDEX IF NOT EXISTS ux_usuarios_cedula ON usuarios(cedula);

-- Registro de prueba opcional
INSERT INTO usuarios (nombre, apellido, cedula, edad, usuario, correo, contrasena, rol)
SELECT 'pedro', 'perez', '10102020', 30, 'pperez', 'pperez@correo.local', '12345', 'admin'
WHERE NOT EXISTS (
    SELECT 1 FROM usuarios WHERE usuario = 'pperez'
);

INSERT INTO usuarios (nombre, apellido, cedula, edad, usuario, correo, contrasena, rol)
SELECT 'admin', 'principal', '90000001', 35, 'admin', 'admin@pqrsapp.com', 'Admin123*', 'admin'
WHERE NOT EXISTS (
    SELECT 1 FROM usuarios WHERE usuario = 'admin' OR correo = 'admin@pqrsapp.com'
);

CREATE TABLE IF NOT EXISTS dependencias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL UNIQUE,
    descripcion VARCHAR(200)
);

CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL UNIQUE,
    descripcion VARCHAR(200)
);

CREATE TABLE IF NOT EXISTS pqrs (
    id SERIAL PRIMARY KEY,
    numero_radicado VARCHAR(40) NOT NULL UNIQUE,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    tipo VARCHAR(15) NOT NULL CHECK (tipo IN ('peticion', 'queja', 'reclamo', 'sugerencia', 'felicitacion')),
    categoria_id INTEGER NOT NULL REFERENCES categorias(id),
    dependencia_id INTEGER NOT NULL REFERENCES dependencias(id),
    descripcion TEXT NOT NULL,
    prioridad VARCHAR(10) NOT NULL DEFAULT 'media' CHECK (prioridad IN ('baja', 'media', 'alta')),
    estado VARCHAR(20) NOT NULL DEFAULT 'radicada' CHECK (estado IN ('radicada', 'en_revision', 'en_gestion', 'respondida', 'cerrada', 'rechazada')),
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE pqrs
ADD COLUMN IF NOT EXISTS responsable_id INTEGER REFERENCES usuarios(id);

ALTER TABLE pqrs
ADD COLUMN IF NOT EXISTS respuesta TEXT;

CREATE INDEX IF NOT EXISTS ix_pqrs_responsable_id ON pqrs(responsable_id);

CREATE TABLE IF NOT EXISTS pqrs_historial (
    id SERIAL PRIMARY KEY,
    pqrs_id INTEGER NOT NULL REFERENCES pqrs(id) ON DELETE CASCADE,
    estado_anterior VARCHAR(20),
    estado_nuevo VARCHAR(20) NOT NULL,
    usuario_accion VARCHAR(80) NOT NULL,
    comentario TEXT,
    fecha_evento TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO dependencias (nombre, descripcion)
SELECT 'Bienestar', 'Atencion bienestar estudiantil'
WHERE NOT EXISTS (SELECT 1 FROM dependencias WHERE nombre = 'Bienestar');

INSERT INTO dependencias (nombre, descripcion)
SELECT 'Registro', 'Atencion de procesos academicos y registro'
WHERE NOT EXISTS (SELECT 1 FROM dependencias WHERE nombre = 'Registro');

INSERT INTO categorias (nombre, descripcion)
SELECT 'Matricula', 'Temas asociados al proceso de matricula'
WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE nombre = 'Matricula');

INSERT INTO categorias (nombre, descripcion)
SELECT 'Plataforma', 'Incidencias sobre sistemas y plataformas'
WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE nombre = 'Plataforma');