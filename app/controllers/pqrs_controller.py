import psycopg2
from datetime import datetime
from uuid import uuid4
from fastapi import HTTPException
from fastapi.encoders import jsonable_encoder

from config.db_config import get_db_connection
from models.pqrs_model import PqrsCreate, PqrsEstadoUpdate


class PqrsController:

    def _generar_radicado(self):
        return f"PQRS-{datetime.now().strftime('%Y%m%d%H%M%S')}-{uuid4().hex[:6].upper()}"

    def create_pqrs(self, data: PqrsCreate):
        conn = None
        cursor = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            numero_radicado = self._generar_radicado()
            cursor.execute(
                """
                INSERT INTO pqrs (
                    numero_radicado, usuario_id, tipo, categoria_id, dependencia_id, descripcion, prioridad, estado
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, 'radicada')
                RETURNING id, numero_radicado, estado, fecha_creacion
                """,
                (
                    numero_radicado,
                    data.usuario_id,
                    data.tipo,
                    data.categoria_id,
                    data.dependencia_id,
                    data.descripcion,
                    data.prioridad,
                ),
            )
            result = cursor.fetchone()

            cursor.execute(
                """
                INSERT INTO pqrs_historial (pqrs_id, estado_anterior, estado_nuevo, usuario_accion, comentario)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (result[0], None, "radicada", "sistema", "PQRS radicada"),
            )

            conn.commit()
            return {
                "resultado": {
                    "id": result[0],
                    "numero_radicado": result[1],
                    "estado": result[2],
                    "fecha_creacion": result[3],
                }
            }
        except psycopg2.Error as err:
            print(err)
            if conn:
                conn.rollback()
            raise HTTPException(status_code=500, detail="Error de base de datos al crear PQRS")
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()

    def get_pqrs(self, estado: str | None = None):
        conn = None
        cursor = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            query = """
                SELECT
                    p.id,
                    p.numero_radicado,
                    p.tipo,
                    p.estado,
                    p.prioridad,
                    p.descripcion,
                    p.fecha_creacion,
                    u.id,
                    u.nombre,
                    u.apellido,
                    c.nombre,
                    d.nombre
                FROM pqrs p
                JOIN usuarios u ON u.id = p.usuario_id
                JOIN categorias c ON c.id = p.categoria_id
                JOIN dependencias d ON d.id = p.dependencia_id
            """
            params = []

            if estado:
                query += " WHERE p.estado = %s"
                params.append(estado)

            query += " ORDER BY p.fecha_creacion DESC"
            cursor.execute(query, tuple(params))
            rows = cursor.fetchall()

            payload = []
            for row in rows:
                payload.append(
                    {
                        "id": row[0],
                        "numero_radicado": row[1],
                        "tipo": row[2],
                        "estado": row[3],
                        "prioridad": row[4],
                        "descripcion": row[5],
                        "fecha_creacion": row[6],
                        "usuario": {
                            "id": row[7],
                            "nombre": row[8],
                            "apellido": row[9],
                        },
                        "categoria": row[10],
                        "dependencia": row[11],
                    }
                )

            return {"resultado": jsonable_encoder(payload)}
        except psycopg2.Error as err:
            print(err)
            if conn:
                conn.rollback()
            raise HTTPException(status_code=500, detail="Error de base de datos al listar PQRS")
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()

    def get_pqrs_by_user(self, usuario_id: int):
        return self.get_pqrs_usuario(usuario_id)

    def get_pqrs_usuario(self, usuario_id: int):
        conn = None
        cursor = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT id, numero_radicado, tipo, estado, prioridad, descripcion, fecha_creacion
                FROM pqrs
                WHERE usuario_id = %s
                ORDER BY fecha_creacion DESC
                """,
                (usuario_id,),
            )
            rows = cursor.fetchall()
            payload = []
            for row in rows:
                payload.append(
                    {
                        "id": row[0],
                        "numero_radicado": row[1],
                        "tipo": row[2],
                        "estado": row[3],
                        "prioridad": row[4],
                        "descripcion": row[5],
                        "fecha_creacion": row[6],
                    }
                )
            return {"resultado": jsonable_encoder(payload)}
        except psycopg2.Error as err:
            print(err)
            if conn:
                conn.rollback()
            raise HTTPException(status_code=500, detail="Error de base de datos al listar PQRS por usuario")
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()

    def update_estado(self, pqrs_id: int, data: PqrsEstadoUpdate):
        conn = None
        cursor = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            cursor.execute("SELECT estado FROM pqrs WHERE id = %s", (pqrs_id,))
            row = cursor.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="PQRS no encontrada")

            estado_anterior = row[0]
            cursor.execute(
                """
                UPDATE pqrs
                SET estado = %s, fecha_actualizacion = NOW()
                WHERE id = %s
                """,
                (data.estado, pqrs_id),
            )

            cursor.execute(
                """
                INSERT INTO pqrs_historial (pqrs_id, estado_anterior, estado_nuevo, usuario_accion, comentario)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (pqrs_id, estado_anterior, data.estado, data.usuario_accion, data.comentario),
            )

            conn.commit()
            return {"resultado": "Estado actualizado"}
        except psycopg2.Error as err:
            print(err)
            if conn:
                conn.rollback()
            raise HTTPException(status_code=500, detail="Error de base de datos al actualizar estado")
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()
