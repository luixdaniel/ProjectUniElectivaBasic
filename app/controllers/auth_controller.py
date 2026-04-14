import psycopg2
from fastapi import HTTPException

from config.db_config import get_db_connection
from config.security import create_access_token, hash_password, verify_password
from models.auth_model import LoginRequest, RegisterRequest


class AuthController:
    def register(self, data: RegisterRequest):
        conn = None
        cursor = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            cursor.execute("SELECT id FROM usuarios WHERE usuario = %s OR correo = %s", (data.usuario, data.correo))
            if cursor.fetchone():
                raise HTTPException(status_code=400, detail="El usuario o correo ya existe")

            password_hashed = hash_password(data.contrasena)
            cursor.execute(
                """
                INSERT INTO usuarios (nombre, apellido, cedula, edad, usuario, correo, contrasena, rol)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id, nombre, apellido, usuario, correo, rol
                """,
                (
                    data.nombre,
                    data.apellido,
                    data.cedula,
                    data.edad,
                    data.usuario,
                    data.correo,
                    password_hashed,
                    data.rol,
                ),
            )
            user = cursor.fetchone()
            conn.commit()

            token = create_access_token({"sub": str(user[0]), "role": user[5]})
            return {
                "access_token": token,
                "token_type": "bearer",
                "user": {
                    "id": user[0],
                    "nombre": user[1],
                    "apellido": user[2],
                    "usuario": user[3],
                    "correo": user[4],
                    "rol": user[5],
                },
            }
        except psycopg2.Error as err:
            print(err)
            if conn:
                conn.rollback()
            raise HTTPException(status_code=500, detail="Error de base de datos en registro")
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()

    def login(self, data: LoginRequest):
        conn = None
        cursor = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute(
                "SELECT id, nombre, apellido, usuario, correo, contrasena, rol FROM usuarios WHERE correo = %s",
                (data.correo,),
            )
            user = cursor.fetchone()

            if not user or not verify_password(data.contrasena, user[5]):
                raise HTTPException(status_code=401, detail="Credenciales invalidas")

            token = create_access_token({"sub": str(user[0]), "role": user[6]})
            return {
                "access_token": token,
                "token_type": "bearer",
                "user": {
                    "id": user[0],
                    "nombre": user[1],
                    "apellido": user[2],
                    "usuario": user[3],
                    "correo": user[4],
                    "rol": user[6],
                },
            }
        except psycopg2.Error as err:
            print(err)
            raise HTTPException(status_code=500, detail="Error de base de datos en login")
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()
