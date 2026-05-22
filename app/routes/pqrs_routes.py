from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from config.security import require_roles
from controllers.pqrs_controller import PqrsController
from models.pqrs_create_model import PqrsCreate
from models.pqrs_estado_update_model import PqrsEstadoUpdate


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


@router.get("/export/powerbi")
async def export_powerbi(user=Depends(require_roles(["admin"]))):
    """Exporta todos los datos necesarios para Power BI en un archivo Excel"""
    excel_file = pqrs_controller.export_to_excel_for_powerbi()
    return StreamingResponse(
        iter([excel_file.getvalue()]),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=pqrs_powerbi.xlsx"}
    )

@router.get("/auditoria/predictiva")
async def alerta_saturacion(user=Depends(require_roles(["admin"]))):
    """Calcula el punto de equilibrio / alerta predictiva usando Falsa Posición"""
    return pqrs_controller.calcular_alerta_saturacion()
