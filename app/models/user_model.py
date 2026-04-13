from pydantic import BaseModel

class User(BaseModel):
    id: int = None
    nombre: str
    apellido: str
    cedula: str
    edad: int
    usuario: str
    contrasena: str