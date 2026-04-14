from fastapi import APIRouter, Depends
from config.security import require_roles
from controllers.user_controller import *
from models.user_model import User

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