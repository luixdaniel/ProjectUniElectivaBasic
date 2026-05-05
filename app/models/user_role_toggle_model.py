from pydantic import BaseModel

class UserRoleToggle(BaseModel):
    activo: bool
