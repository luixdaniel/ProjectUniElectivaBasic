from fastapi import APIRouter, Depends
from config.security import require_roles
from controllers.user_controller import *
from models.user_model import User, UserPasswordReset, UserRoleToggle

router = APIRouter()

nuevo_usuario = UserController()


@router.post("/create_user")
async def create_user(user: User, current_user=Depends(require_roles(["admin"]))):
    rpta = nuevo_usuario.create_user(user)
    return rpta


@router.get("/get_user/{user_id}",response_model=User)
async def get_user(user_id: int, current_user=Depends(require_roles(["admin", "responsable"]))):
    rpta = nuevo_usuario.get_user(user_id)
    return rpta

@router.get("/get_users/")
async def get_users(current_user=Depends(require_roles(["admin"]))):
    rpta = nuevo_usuario.get_users()
    return rpta


@router.patch("/users/{user_id}/responsable-status")
async def set_responsable_status(user_id: int, data: UserRoleToggle, current_user=Depends(require_roles(["admin"]))):
    return nuevo_usuario.set_responsable_status(user_id, data.activo)


@router.patch("/users/{user_id}/reset-password")
async def reset_user_password(user_id: int, data: UserPasswordReset, current_user=Depends(require_roles(["admin"]))):
    return nuevo_usuario.reset_user_password(user_id, data.nueva_contrasena)