from pydantic import BaseModel
from typing import Literal


class PqrsCreate(BaseModel):
    usuario_id: int
    tipo: Literal["P", "Q", "R", "S"]
    categoria_id: int
    dependencia_id: int
    descripcion: str
    prioridad: Literal["baja", "media", "alta"] = "media"


class PqrsEstadoUpdate(BaseModel):
    estado: Literal["radicada", "en_revision", "en_gestion", "respondida", "cerrada", "rechazada"]
    usuario_accion: str
    comentario: str | None = None
