from pydantic import BaseModel

class UserPasswordReset(BaseModel):
    nueva_contrasena: str
