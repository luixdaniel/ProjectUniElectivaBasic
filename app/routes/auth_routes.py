from fastapi import APIRouter, Depends

from config.security import get_current_user, require_roles
from controllers.auth_controller import AuthController
from models.auth_model import LoginRequest, RegisterRequest, TokenResponse


router = APIRouter(prefix="/auth", tags=["Auth"])

auth_controller = AuthController()


@router.post("/register", response_model=TokenResponse)
async def register(data: RegisterRequest):
    return auth_controller.register(data)


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest):
    return auth_controller.login(data)


@router.get("/me")
async def me(user=Depends(get_current_user)):
    return {"resultado": user}


@router.get("/admin-only")
async def admin_only(user=Depends(require_roles(["admin"]))):
    return {"resultado": f"Acceso permitido para {user['usuario']} con rol {user['rol']}"}
