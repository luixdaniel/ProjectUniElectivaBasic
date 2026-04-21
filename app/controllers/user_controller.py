import psycopg2
from fastapi import HTTPException
from config.db_config import get_db_connection
from config.security import hash_password
from models.user_model import User, UserProfileUpdate
from fastapi.encoders import jsonable_encoder

class UserController:

    def _is_reserved_admin(self, rol: str, username: str) -> bool:
        return rol == "admin" or (username or "").lower() == "admin"
        
    def create_user(self, user: User):
        conn = None
        cursor = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            password_hashed = hash_password(user.contrasena)
            cursor.execute(
                "INSERT INTO usuarios (nombre,apellido,cedula,edad,usuario,correo,contrasena,rol) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
                (user.nombre, user.apellido, user.cedula, user.edad, user.usuario, user.correo, password_hashed, user.rol),
            )
            conn.commit()
            return {"resultado": "Usuario creado"}
        except psycopg2.Error as err:
            print(err)
            if conn:
                conn.rollback()
            raise HTTPException(status_code=500, detail="Error de base de datos al crear usuario")
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()
        

    def get_user(self, user_id: int):
        conn = None
        cursor = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute(
                "SELECT id, nombre, apellido, cedula, edad, usuario, correo, contrasena, rol FROM usuarios WHERE id = %s",
                (user_id,),
            )
            result = cursor.fetchone()
            payload = []
            content = {} 
            
            content={
                    'id':int(result[0]),
                    'nombre':result[1],
                    'apellido':result[2],
                    'cedula':result[3],
                    'edad':int(result[4]),
                    'usuario':result[5],
                        'correo':result[6],
                        'contrasena':result[7],
                        'rol':result[8]
            }
            payload.append(content)
            
            json_data = jsonable_encoder(content)            
            if result:
               return  json_data
            else:
                ##Esto interrumpe la ejecución y responde al cliente con un código 404
                ## comunica al cliente de la API qué pasó (error HTTP).
                ##código 404,comportamiento correcto según las reglas HTTP
                raise HTTPException(status_code=404, detail="User not found")  
                
        except psycopg2.Error as err:
            print(err)
            if conn:
                conn.rollback()
            raise HTTPException(status_code=500, detail="Error de base de datos al consultar usuario")
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()
       
    def get_users(self):
        conn = None
        cursor = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT id, nombre, apellido, cedula, edad, usuario, correo, rol FROM usuarios")
            result = cursor.fetchall()
            payload = []
            content = {} 
            for data in result:
                content={
                    'id':data[0],
                    'nombre':data[1],
                    'apellido':data[2],
                    'cedula':data[3],
                    'edad':data[4],
                    'usuario':data[5],
                    'correo':data[6],
                    'rol':data[7]
                }
                payload.append(content)
                content = {}
            json_data = jsonable_encoder(payload)        
            if result:
               return {"resultado": json_data}
            else:
                raise HTTPException(status_code=404, detail="User not found")  
                
        except psycopg2.Error as err:
            print(err)
            if conn:
                conn.rollback()
            raise HTTPException(status_code=500, detail="Error de base de datos al listar usuarios")
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()

    def set_responsable_status(self, user_id: int, activo: bool):
        conn = None
        cursor = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            cursor.execute("SELECT id, rol, usuario FROM usuarios WHERE id = %s", (user_id,))
            row = cursor.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Usuario no encontrado")

            current_role = row[1]
            username = row[2]

            if current_role == "admin" or username == "admin":
                raise HTTPException(status_code=400, detail="No se puede modificar el usuario admin")

            next_role = "responsable" if activo else "usuario"
            cursor.execute("UPDATE usuarios SET rol = %s WHERE id = %s", (next_role, user_id))
            conn.commit()
            return {"resultado": f"Rol actualizado a {next_role}"}
        except psycopg2.Error as err:
            print(err)
            if conn:
                conn.rollback()
            raise HTTPException(status_code=500, detail="Error de base de datos al actualizar rol")
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()

    def get_my_profile(self, current_user: dict):
        conn = None
        cursor = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT id, nombre, apellido, cedula, edad, usuario, correo, rol
                FROM usuarios
                WHERE id = %s
                """,
                (current_user["id"],),
            )
            row = cursor.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Usuario no encontrado")

            payload = {
                "id": row[0],
                "nombre": row[1],
                "apellido": row[2],
                "cedula": row[3],
                "edad": row[4],
                "usuario": row[5],
                "correo": row[6],
                "rol": row[7],
            }
            return {"resultado": jsonable_encoder(payload)}
        except psycopg2.Error as err:
            print(err)
            if conn:
                conn.rollback()
            raise HTTPException(status_code=500, detail="Error de base de datos al consultar perfil")
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()

    def update_my_profile(self, current_user: dict, data: UserProfileUpdate):
        conn = None
        cursor = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            cursor.execute(
                "SELECT id, rol, usuario FROM usuarios WHERE id = %s",
                (current_user["id"],),
            )
            current_row = cursor.fetchone()
            if not current_row:
                raise HTTPException(status_code=404, detail="Usuario no encontrado")

            update_data = data.model_dump(exclude_unset=True)
            if not update_data:
                raise HTTPException(status_code=400, detail="No hay cambios para actualizar")

            if "edad" in update_data and (update_data["edad"] is None or int(update_data["edad"]) <= 0):
                raise HTTPException(status_code=400, detail="La edad debe ser mayor a cero")

            if "contrasena" in update_data:
                raw_password = update_data["contrasena"] or ""
                if len(raw_password) < 6:
                    raise HTTPException(status_code=400, detail="La contraseña debe tener al menos 6 caracteres")
                update_data["contrasena"] = hash_password(raw_password)

            field_map = {
                "nombre": "nombre",
                "apellido": "apellido",
                "edad": "edad",
                "usuario": "usuario",
                "correo": "correo",
                "contrasena": "contrasena",
            }

            set_parts = []
            params = []
            for key, column in field_map.items():
                if key in update_data:
                    set_parts.append(f"{column} = %s")
                    params.append(update_data[key])

            if not set_parts:
                raise HTTPException(status_code=400, detail="No hay campos validos para actualizar")

            params.append(current_user["id"])
            query = f"UPDATE usuarios SET {', '.join(set_parts)} WHERE id = %s"
            cursor.execute(query, tuple(params))

            cursor.execute(
                """
                SELECT id, nombre, apellido, cedula, edad, usuario, correo, rol
                FROM usuarios
                WHERE id = %s
                """,
                (current_user["id"],),
            )
            row = cursor.fetchone()
            conn.commit()

            payload = {
                "id": row[0],
                "nombre": row[1],
                "apellido": row[2],
                "cedula": row[3],
                "edad": row[4],
                "usuario": row[5],
                "correo": row[6],
                "rol": row[7],
            }
            return {"resultado": jsonable_encoder(payload)}
        except psycopg2.Error as err:
            print(err)
            if conn:
                conn.rollback()
            if getattr(err, "pgcode", "") == "23505":
                raise HTTPException(status_code=409, detail="Usuario, correo o cedula ya existe")
            raise HTTPException(status_code=500, detail="Error de base de datos al actualizar perfil")
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()

    def delete_my_account(self, current_user: dict):
        conn = None
        cursor = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            cursor.execute("SELECT id, rol, usuario FROM usuarios WHERE id = %s", (current_user["id"],))
            row = cursor.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Usuario no encontrado")

            if self._is_reserved_admin(row[1], row[2]):
                raise HTTPException(status_code=400, detail="No se puede eliminar la cuenta admin principal")

            target_id = row[0]
            cursor.execute("UPDATE pqrs SET responsable_id = NULL WHERE responsable_id = %s", (target_id,))
            cursor.execute("DELETE FROM pqrs WHERE usuario_id = %s", (target_id,))
            cursor.execute("DELETE FROM usuarios WHERE id = %s", (target_id,))
            conn.commit()

            return {"resultado": "Cuenta eliminada correctamente"}
        except psycopg2.Error as err:
            print(err)
            if conn:
                conn.rollback()
            raise HTTPException(status_code=500, detail="Error de base de datos al eliminar cuenta")
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()

    def delete_user_by_admin(self, user_id: int, current_user: dict):
        conn = None
        cursor = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            cursor.execute("SELECT id, rol, usuario FROM usuarios WHERE id = %s", (user_id,))
            row = cursor.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Usuario no encontrado")

            if row[0] == current_user["id"]:
                raise HTTPException(status_code=400, detail="No puedes eliminar tu propia cuenta desde este modulo")

            if self._is_reserved_admin(row[1], row[2]):
                raise HTTPException(status_code=400, detail="No se puede eliminar la cuenta admin principal")

            target_id = row[0]
            cursor.execute("UPDATE pqrs SET responsable_id = NULL WHERE responsable_id = %s", (target_id,))
            cursor.execute("DELETE FROM pqrs WHERE usuario_id = %s", (target_id,))
            cursor.execute("DELETE FROM usuarios WHERE id = %s", (target_id,))
            conn.commit()

            return {"resultado": "Usuario eliminado correctamente"}
        except psycopg2.Error as err:
            print(err)
            if conn:
                conn.rollback()
            raise HTTPException(status_code=500, detail="Error de base de datos al eliminar usuario")
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()

    def reset_user_password(self, user_id: int, nueva_contrasena: str):
        conn = None
        cursor = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            if len(nueva_contrasena or "") < 6:
                raise HTTPException(status_code=400, detail="La nueva contraseña debe tener al menos 6 caracteres")

            cursor.execute("SELECT id FROM usuarios WHERE id = %s", (user_id,))
            row = cursor.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Usuario no encontrado")

            password_hashed = hash_password(nueva_contrasena)
            cursor.execute("UPDATE usuarios SET contrasena = %s WHERE id = %s", (password_hashed, user_id))
            conn.commit()
            return {"resultado": "Contraseña restablecida correctamente"}
        except psycopg2.Error as err:
            print(err)
            if conn:
                conn.rollback()
            raise HTTPException(status_code=500, detail="Error de base de datos al restablecer contraseña")
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()
    
    
       

##user_controller = UserController()