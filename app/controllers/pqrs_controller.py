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

    def _resolve_dependencia_default(self, cursor):
        cursor.execute("SELECT id FROM dependencias ORDER BY id ASC LIMIT 1")
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=400, detail="No hay dependencias configuradas")
        return row[0]

    def _resolve_responsable(self, cursor):
        cursor.execute(
            """
            SELECT u.id
            FROM usuarios u
            LEFT JOIN pqrs p ON p.responsable_id = u.id
            WHERE u.rol IN ('responsable', 'admin')
            GROUP BY u.id, u.rol
            ORDER BY
                COUNT(CASE WHEN p.estado NOT IN ('cerrada', 'rechazada') THEN 1 END) ASC,
                CASE WHEN u.rol = 'responsable' THEN 0 ELSE 1 END,
                u.id ASC
            LIMIT 1
            """
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=400, detail="No hay responsables disponibles")
        return row[0]

    def _can_access_pqrs(self, user: dict, usuario_id: int, responsable_id: int | None):
        if user["rol"] == "admin":
            return True
        if user["rol"] == "usuario":
            return user["id"] == usuario_id
        return user["id"] == responsable_id

    def _map_pqrs_row(self, row):
        return {
            "id": row[0],
            "numero_radicado": row[1],
            "tipo": row[2],
            "estado": row[3],
            "prioridad": row[4],
            "descripcion": row[5],
            "respuesta": row[6],
            "fecha_creacion": row[7],
            "fecha_actualizacion": row[8],
            "usuario": {
                "id": row[9],
                "nombre": row[10],
                "apellido": row[11],
                "correo": row[12],
            },
            "categoria": {
                "id": row[13],
                "nombre": row[14],
            },
            "dependencia": {
                "id": row[15],
                "nombre": row[16],
            },
            "responsable": {
                "id": row[17],
                "nombre": row[18],
                "apellido": row[19],
            }
            if row[17]
            else None,
        }

    def create_pqrs(self, data: PqrsCreate, user: dict):
        conn = None
        cursor = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            cursor.execute("SELECT id FROM categorias WHERE id = %s", (data.categoria_id,))
            if not cursor.fetchone():
                raise HTTPException(status_code=404, detail="Categoria no encontrada")

            numero_radicado = self._generar_radicado()
            dependencia_id = self._resolve_dependencia_default(cursor)
            responsable_id = self._resolve_responsable(cursor)
            cursor.execute(
                """
                INSERT INTO pqrs (
                    numero_radicado, usuario_id, tipo, categoria_id, dependencia_id, descripcion, prioridad, estado, responsable_id
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, 'radicada', %s)
                RETURNING id, numero_radicado, estado, fecha_creacion
                """,
                (
                    numero_radicado,
                    user["id"],
                    data.tipo,
                    data.categoria_id,
                    dependencia_id,
                    data.descripcion,
                    data.prioridad,
                    responsable_id,
                ),
            )
            result = cursor.fetchone()

            cursor.execute(
                """
                INSERT INTO pqrs_historial (pqrs_id, estado_anterior, estado_nuevo, usuario_accion, comentario)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (result[0], None, "radicada", user["usuario"], "PQRS creada"),
            )

            conn.commit()
            return {
                "resultado": {
                    "id": result[0],
                    "numero_radicado": result[1],
                    "estado": result[2],
                    "fecha_creacion": result[3],
                    "responsable_id": responsable_id,
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

    def get_catalogo(self):
        conn = None
        cursor = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT id, nombre FROM categorias ORDER BY nombre ASC")
            categorias = [{"id": row[0], "nombre": row[1]} for row in cursor.fetchall()]
            return {"resultado": {"categorias": categorias}}
        except psycopg2.Error as err:
            print(err)
            if conn:
                conn.rollback()
            raise HTTPException(status_code=500, detail="Error de base de datos al consultar catalogo")
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()

    def get_mis_pqrs(self, user: dict):
        conn = None
        cursor = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            cursor.execute(
                """
                SELECT
                    p.id,
                    p.numero_radicado,
                    p.tipo,
                    p.estado,
                    p.prioridad,
                    p.descripcion,
                    p.respuesta,
                    p.fecha_creacion,
                    p.fecha_actualizacion,
                    u.id,
                    u.nombre,
                    u.apellido,
                    u.correo,
                    c.id,
                    c.nombre,
                    d.id,
                    d.nombre,
                    r.id,
                    r.nombre,
                    r.apellido
                FROM pqrs p
                JOIN usuarios u ON u.id = p.usuario_id
                JOIN categorias c ON c.id = p.categoria_id
                JOIN dependencias d ON d.id = p.dependencia_id
                LEFT JOIN usuarios r ON r.id = p.responsable_id
                WHERE p.usuario_id = %s
                ORDER BY p.fecha_creacion DESC
                """,
                (user["id"],),
            )

            rows = cursor.fetchall()
            payload = [self._map_pqrs_row(row) for row in rows]
            return {"resultado": jsonable_encoder(payload)}
        except psycopg2.Error as err:
            print(err)
            if conn:
                conn.rollback()
            raise HTTPException(status_code=500, detail="Error de base de datos al listar mis PQRS")
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()

    def get_asignadas(self, user: dict):
        conn = None
        cursor = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            if user["rol"] == "admin":
                cursor.execute(
                    """
                    SELECT
                        p.id,
                        p.numero_radicado,
                        p.tipo,
                        p.estado,
                        p.prioridad,
                        p.descripcion,
                        p.respuesta,
                        p.fecha_creacion,
                        p.fecha_actualizacion,
                        u.id,
                        u.nombre,
                        u.apellido,
                        u.correo,
                        c.id,
                        c.nombre,
                        d.id,
                        d.nombre,
                        r.id,
                        r.nombre,
                        r.apellido
                    FROM pqrs p
                    JOIN usuarios u ON u.id = p.usuario_id
                    JOIN categorias c ON c.id = p.categoria_id
                    JOIN dependencias d ON d.id = p.dependencia_id
                    LEFT JOIN usuarios r ON r.id = p.responsable_id
                    ORDER BY p.fecha_actualizacion DESC
                    """
                )
            else:
                cursor.execute(
                    """
                    SELECT
                        p.id,
                        p.numero_radicado,
                        p.tipo,
                        p.estado,
                        p.prioridad,
                        p.descripcion,
                        p.respuesta,
                        p.fecha_creacion,
                        p.fecha_actualizacion,
                        u.id,
                        u.nombre,
                        u.apellido,
                        u.correo,
                        c.id,
                        c.nombre,
                        d.id,
                        d.nombre,
                        r.id,
                        r.nombre,
                        r.apellido
                    FROM pqrs p
                    JOIN usuarios u ON u.id = p.usuario_id
                    JOIN categorias c ON c.id = p.categoria_id
                    JOIN dependencias d ON d.id = p.dependencia_id
                    LEFT JOIN usuarios r ON r.id = p.responsable_id
                    WHERE p.responsable_id = %s
                    ORDER BY p.fecha_actualizacion DESC
                    """,
                    (user["id"],),
                )

            rows = cursor.fetchall()
            payload = [self._map_pqrs_row(row) for row in rows]
            return {"resultado": jsonable_encoder(payload)}
        except psycopg2.Error as err:
            print(err)
            if conn:
                conn.rollback()
            raise HTTPException(status_code=500, detail="Error de base de datos al listar bandeja asignada")
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()

    def get_pqrs_detail(self, pqrs_id: int, user: dict):
        conn = None
        cursor = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            cursor.execute(
                """
                SELECT
                    p.id,
                    p.numero_radicado,
                    p.tipo,
                    p.estado,
                    p.prioridad,
                    p.descripcion,
                    p.respuesta,
                    p.fecha_creacion,
                    p.fecha_actualizacion,
                    u.id,
                    u.nombre,
                    u.apellido,
                    u.correo,
                    c.id,
                    c.nombre,
                    d.id,
                    d.nombre,
                    r.id,
                    r.nombre,
                    r.apellido
                FROM pqrs p
                JOIN usuarios u ON u.id = p.usuario_id
                JOIN categorias c ON c.id = p.categoria_id
                JOIN dependencias d ON d.id = p.dependencia_id
                LEFT JOIN usuarios r ON r.id = p.responsable_id
                WHERE p.id = %s
                """,
                (pqrs_id,),
            )

            row = cursor.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="PQRS no encontrada")

            if not self._can_access_pqrs(user, row[9], row[17]):
                raise HTTPException(status_code=403, detail="No tienes permisos para ver esta PQRS")

            return {"resultado": jsonable_encoder(self._map_pqrs_row(row))}
        except psycopg2.Error as err:
            print(err)
            if conn:
                conn.rollback()
            raise HTTPException(status_code=500, detail="Error de base de datos al consultar detalle PQRS")
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()

    def get_pqrs_historial(self, pqrs_id: int, user: dict):
        conn = None
        cursor = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            cursor.execute("SELECT usuario_id, responsable_id FROM pqrs WHERE id = %s", (pqrs_id,))
            ownership = cursor.fetchone()
            if not ownership:
                raise HTTPException(status_code=404, detail="PQRS no encontrada")

            if not self._can_access_pqrs(user, ownership[0], ownership[1]):
                raise HTTPException(status_code=403, detail="No tienes permisos para ver esta PQRS")

            cursor.execute(
                """
                SELECT id, estado_anterior, estado_nuevo, usuario_accion, comentario, fecha_evento
                FROM pqrs_historial
                WHERE pqrs_id = %s
                ORDER BY fecha_evento ASC
                """,
                (pqrs_id,),
            )

            rows = cursor.fetchall()
            payload = [
                {
                    "id": row[0],
                    "estado_anterior": row[1],
                    "estado_nuevo": row[2],
                    "usuario_accion": row[3],
                    "comentario": row[4],
                    "fecha_evento": row[5],
                }
                for row in rows
            ]
            return {"resultado": jsonable_encoder(payload)}
        except psycopg2.Error as err:
            print(err)
            if conn:
                conn.rollback()
            raise HTTPException(status_code=500, detail="Error de base de datos al listar historial")
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()

    def update_estado(self, pqrs_id: int, data: PqrsEstadoUpdate, user: dict):
        conn = None
        cursor = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            cursor.execute(
                "SELECT usuario_id, responsable_id, estado, respuesta FROM pqrs WHERE id = %s",
                (pqrs_id,),
            )
            row = cursor.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="PQRS no encontrada")

            if user["rol"] != "admin" and row[1] != user["id"]:
                raise HTTPException(status_code=403, detail="No tienes permisos para actualizar esta PQRS")

            estado_anterior = row[2]
            respuesta_actual = row[3]
            respuesta_nueva = data.respuesta if data.respuesta is not None else respuesta_actual
            cursor.execute(
                """
                UPDATE pqrs
                SET estado = %s, respuesta = %s, fecha_actualizacion = NOW()
                WHERE id = %s
                """,
                (data.estado, respuesta_nueva, pqrs_id),
            )

            cursor.execute(
                """
                INSERT INTO pqrs_historial (pqrs_id, estado_anterior, estado_nuevo, usuario_accion, comentario)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (pqrs_id, estado_anterior, data.estado, user["usuario"], data.comentario or "Cambio de estado"),
            )

            conn.commit()
            return {"resultado": "Estado y respuesta actualizados"}
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

    def delete_pqrs(self, pqrs_id: int, user: dict):
        conn = None
        cursor = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            cursor.execute(
                "SELECT usuario_id, estado FROM pqrs WHERE id = %s",
                (pqrs_id,),
            )
            row = cursor.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="PQRS no encontrada")

            usuario_id, estado = row
            if user["rol"] == "usuario":
                if user["id"] != usuario_id:
                    raise HTTPException(status_code=403, detail="No tienes permisos para eliminar esta PQRS")
                if estado not in ("radicada", "en_revision"):
                    raise HTTPException(
                        status_code=400,
                        detail="Solo puedes eliminar PQRS en estado radicada o en_revision",
                    )
            elif user["rol"] != "admin":
                raise HTTPException(status_code=403, detail="No tienes permisos para eliminar esta PQRS")

            cursor.execute("DELETE FROM pqrs WHERE id = %s", (pqrs_id,))
            conn.commit()
            return {"resultado": "PQRS eliminada correctamente"}
        except psycopg2.Error as err:
            print(err)
            if conn:
                conn.rollback()
            raise HTTPException(status_code=500, detail="Error de base de datos al eliminar PQRS")
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()
