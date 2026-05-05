from pydantic import BaseModel
from typing import Literal

class PqrsCreate(BaseModel):
    tipo: Literal["peticion", "queja", "reclamo", "sugerencia", "felicitacion"]
    categoria_id: int
    descripcion: str
    prioridad: Literal["baja", "media", "alta"] = "media"
