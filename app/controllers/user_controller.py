import psycopg2
from fastapi import HTTPException
from config.db_config import get_db_connection
from models.user_model import User
from fastapi.encoders import jsonable_encoder

class UserController:
        
    def create_user(self, user: User):
        conn = None
        cursor = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("INSERT INTO usuarios (nombre,apellido,cedula,edad,usuario,contrasena) VALUES (%s, %s, %s, %s, %s ,%s)", (user.nombre, user.apellido, user.cedula, user.edad, user.usuario, user.contrasena))
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
            cursor.execute("SELECT * FROM usuarios WHERE id = %s", (user_id,))
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
                    'contrasena':result[6]
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
            cursor.execute("SELECT * FROM usuarios")
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
                    'contrasena':data[6]
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
    
    
       

##user_controller = UserController()