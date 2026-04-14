from pydantic import BaseModel, EmailStr
from typing import Literal


class RegisterRequest(BaseModel):
    nombre: str
    apellido: str
    cedula: str
    edad: int
    usuario: str
    correo: EmailStr
    contrasena: str
    rol: Literal["usuario", "responsable", "admin"] = "usuario"


class LoginRequest(BaseModel):
    correo: EmailStr
    contrasena: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict
