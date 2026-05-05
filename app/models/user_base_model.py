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
