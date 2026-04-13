-- Ejecutar este script en Supabase SQL Editor
-- (en Supabase no se crea base de datos con CREATE DATABASE desde este contexto)

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(20) NOT NULL,
    apellido VARCHAR(20) NOT NULL,
    cedula VARCHAR(20) NOT NULL,
    edad INTEGER NOT NULL,
    usuario VARCHAR(20) NOT NULL,
    contrasena VARCHAR(20) NOT NULL
);

-- Registro de prueba opcional
INSERT INTO usuarios (nombre, apellido, cedula, edad, usuario, contrasena)
SELECT 'pedro', 'perez', '10102020', 30, 'pperez', '12345'
WHERE NOT EXISTS (
    SELECT 1 FROM usuarios WHERE usuario = 'pperez'
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
    tipo CHAR(1) NOT NULL CHECK (tipo IN ('P', 'Q', 'R', 'S')),
    categoria_id INTEGER NOT NULL REFERENCES categorias(id),
    dependencia_id INTEGER NOT NULL REFERENCES dependencias(id),
    descripcion TEXT NOT NULL,
    prioridad VARCHAR(10) NOT NULL DEFAULT 'media' CHECK (prioridad IN ('baja', 'media', 'alta')),
    estado VARCHAR(20) NOT NULL DEFAULT 'radicada' CHECK (estado IN ('radicada', 'en_revision', 'en_gestion', 'respondida', 'cerrada', 'rechazada')),
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT NOW()
);

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