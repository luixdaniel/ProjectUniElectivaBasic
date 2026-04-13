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