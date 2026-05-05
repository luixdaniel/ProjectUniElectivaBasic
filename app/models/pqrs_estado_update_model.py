from pydantic import BaseModel
from typing import Literal

class PqrsEstadoUpdate(BaseModel):
    estado: Literal["radicada", "en_revision", "en_gestion", "respondida", "cerrada", "rechazada"]
    respuesta: str | None = None
    comentario: str | None = None
