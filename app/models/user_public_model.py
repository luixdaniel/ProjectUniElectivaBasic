from pydantic import BaseModel, EmailStr

class UserPublic(BaseModel):
    id: int
    nombre: str
    apellido: str
    cedula: str
    edad: int
    usuario: str
    correo: EmailStr
    rol: str
