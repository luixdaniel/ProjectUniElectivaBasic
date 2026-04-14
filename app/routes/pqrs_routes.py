from fastapi import APIRouter, Depends, Query

from config.security import require_roles
from controllers.pqrs_controller import PqrsController
from models.pqrs_model import PqrsCreate, PqrsEstadoUpdate


router = APIRouter(prefix="/pqrs", tags=["PQRS"])

pqrs_controller = PqrsController()


@router.post("/")
async def create_pqrs(data: PqrsCreate, user=Depends(require_roles(["usuario", "responsable", "admin"]))):
    return pqrs_controller.create_pqrs(data)


@router.get("/")
async def get_pqrs(estado: str | None = Query(default=None), user=Depends(require_roles(["responsable", "admin"]))):
    return pqrs_controller.get_pqrs(estado)


@router.get("/usuario/{usuario_id}")
async def get_pqrs_by_user(usuario_id: int, user=Depends(require_roles(["usuario", "responsable", "admin"]))):
    return pqrs_controller.get_pqrs_by_user(usuario_id)


@router.patch("/{pqrs_id}/estado")
async def update_estado(pqrs_id: int, data: PqrsEstadoUpdate, user=Depends(require_roles(["responsable", "admin"]))):
    return pqrs_controller.update_estado(pqrs_id, data)
