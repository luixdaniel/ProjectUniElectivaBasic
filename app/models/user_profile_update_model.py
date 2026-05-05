from pydantic import BaseModel, EmailStr

class UserProfileUpdate(BaseModel):
    nombre: str | None = None
    apellido: str | None = None
    edad: int | None = None
    usuario: str | None = None
    correo: EmailStr | None = None
    contrasena: str | None = None
