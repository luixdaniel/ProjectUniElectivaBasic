import re
from pydantic import BaseModel, EmailStr, field_validator
from typing import Literal


NAME_REGEX = re.compile(r"^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$")
DOC_CC_TI_REGEX = re.compile(r"^[0-9]{6,12}$")


class RegisterRequest(BaseModel):
    nombre: str
    apellido: str
    tipo_documento: Literal["CC", "TI"]
    cedula: str
    edad: int
    usuario: str
    correo: EmailStr
    contrasena: str
    rol: Literal["usuario", "responsable", "admin"] = "usuario"

    @field_validator("nombre", "apellido")
    @classmethod
    def validate_names(cls, value: str):
        cleaned = value.strip()
        if not cleaned or not NAME_REGEX.fullmatch(cleaned):
            raise ValueError("solo puede contener letras y espacios")
        return cleaned

    @field_validator("edad")
    @classmethod
    def validate_age(cls, value: int):
        if value <= 0 or value > 100:
            raise ValueError("debe ser mayor a 0 y menor o igual a 100")
        return value

    @field_validator("usuario")
    @classmethod
    def validate_username(cls, value: str):
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("es obligatorio")
        return cleaned

    @field_validator("cedula")
    @classmethod
    def validate_cc_ti_document(cls, value: str):
        normalized = re.sub(r"[\s.-]", "", value.upper())
        if not DOC_CC_TI_REGEX.fullmatch(normalized):
            raise ValueError("para CC/TI debe tener entre 6 y 12 digitos")
        return normalized

    @field_validator("correo")
    @classmethod
    def normalize_email(cls, value: EmailStr):
        return value.strip().lower()


class LoginRequest(BaseModel):
    correo: EmailStr
    contrasena: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict
