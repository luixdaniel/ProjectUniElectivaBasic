from fastapi import APIRouter, Depends
from config.security import get_current_user, require_roles
from controllers.user_controller import *
from models.user_model import User, UserPasswordReset, UserProfileUpdate, UserRoleToggle

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


@router.delete("/admin/users/{user_id}")
async def delete_user_by_admin(user_id: int, current_user=Depends(require_roles(["admin"]))):
    return nuevo_usuario.delete_user_by_admin(user_id, current_user)


@router.get("/users/me")
async def get_my_profile(current_user=Depends(get_current_user)):
    return nuevo_usuario.get_my_profile(current_user)


@router.patch("/users/me")
async def update_my_profile(data: UserProfileUpdate, current_user=Depends(get_current_user)):
    return nuevo_usuario.update_my_profile(current_user, data)


@router.delete("/users/me")
async def delete_my_account(current_user=Depends(get_current_user)):
    return nuevo_usuario.delete_my_account(current_user)