-- Crear base de datos
CREATE DATABASE prueba;


-- Crear tabla
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(20) NOT NULL,
    apellido VARCHAR(20) NOT NULL,
    cedula VARCHAR(20) NOT NULL,
    edad INTEGER NOT NULL,
    usuario VARCHAR(20) NOT NULL,
    contrasena VARCHAR(20) NOT NULL
);

-- Insertar registro
INSERT INTO usuarios (nombre, apellido, cedula, edad, usuario, contrasena)
VALUES ('pedro', 'perez', '10102020', 30, 'pperez', '12345');