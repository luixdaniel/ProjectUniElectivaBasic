from fastapi import APIRouter, Depends

from config.security import require_roles
from controllers.pqrs_controller import PqrsController
from models.pqrs_model import PqrsCreate, PqrsEstadoUpdate


router = APIRouter(prefix="/pqrs", tags=["PQRS"])

pqrs_controller = PqrsController()


@router.post("/")
async def create_pqrs(data: PqrsCreate, user=Depends(require_roles(["usuario", "responsable", "admin"]))):
    return pqrs_controller.create_pqrs(data, user)


@router.get("/catalogo")
async def get_catalogo(user=Depends(require_roles(["usuario", "responsable", "admin"]))):
    return pqrs_controller.get_catalogo()


@router.get("/mis")
async def get_mis_pqrs(user=Depends(require_roles(["usuario", "responsable", "admin"]))):
    return pqrs_controller.get_mis_pqrs(user)


@router.get("/asignadas")
async def get_asignadas(user=Depends(require_roles(["responsable", "admin"]))):
    return pqrs_controller.get_asignadas(user)


@router.get("/{pqrs_id}")
async def get_pqrs_detail(pqrs_id: int, user=Depends(require_roles(["usuario", "responsable", "admin"]))):
    return pqrs_controller.get_pqrs_detail(pqrs_id, user)


@router.get("/{pqrs_id}/historial")
async def get_pqrs_historial(pqrs_id: int, user=Depends(require_roles(["usuario", "responsable", "admin"]))):
    return pqrs_controller.get_pqrs_historial(pqrs_id, user)


@router.patch("/{pqrs_id}/estado")
async def update_estado(pqrs_id: int, data: PqrsEstadoUpdate, user=Depends(require_roles(["responsable", "admin"]))):
    return pqrs_controller.update_estado(pqrs_id, data, user)


@router.delete("/{pqrs_id}")
async def delete_pqrs(pqrs_id: int, user=Depends(require_roles(["usuario", "admin"]))):
    return pqrs_controller.delete_pqrs(pqrs_id, user)
