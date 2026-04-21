from pydantic import BaseModel, EmailStr

class User(BaseModel):
    id: int = None
    nombre: str
    apellido: str
    cedula: str
    edad: int
    usuario: str
    correo: EmailStr
    contrasena: str
    rol: str = "usuario"


class UserRoleToggle(BaseModel):
    activo: bool


class UserPasswordReset(BaseModel):
    nueva_contrasena: str


class UserPublic(BaseModel):
    id: int
    nombre: str
    apellido: str
    cedula: str
    edad: int
    usuario: str
    correo: EmailStr
    rol: str


class UserProfileUpdate(BaseModel):
    nombre: str | None = None
    apellido: str | None = None
    edad: int | None = None
    usuario: str | None = None
    correo: EmailStr | None = None
    contrasena: str | None = None