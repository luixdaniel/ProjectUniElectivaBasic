import os
import psycopg2
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
load_dotenv()


def get_conn():
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        return psycopg2.connect(database_url)

    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT", "5432"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        dbname=os.getenv("DB_NAME"),
        sslmode=os.getenv("DB_SSLMODE", "require"),
    )


conn = get_conn()
cur = conn.cursor()

cur.execute("SELECT rol, COUNT(*) FROM usuarios GROUP BY rol ORDER BY rol")
print("ANTES", cur.fetchall())

cur.execute(
    """
    INSERT INTO usuarios (nombre, apellido, cedula, edad, usuario, correo, contrasena, rol)
    SELECT 'admin', 'principal', '90000001', 35, 'admin', 'admin@pqrsapp.com', 'Admin123*', 'admin'
    WHERE NOT EXISTS (
        SELECT 1 FROM usuarios WHERE usuario = 'admin' OR correo = 'admin@pqrsapp.com' OR correo = 'admin@pqrs.local'
    )
    """
)

cur.execute("UPDATE usuarios SET correo = 'admin@pqrsapp.com' WHERE usuario = 'admin' AND correo = 'admin@pqrs.local'")

cur.execute("UPDATE usuarios SET rol = 'usuario' WHERE usuario != 'admin' AND correo != 'admin@pqrs.local'")
cur.execute("UPDATE usuarios SET rol = 'usuario' WHERE correo = 'admin@pqrs.local'")
cur.execute("UPDATE usuarios SET rol = 'admin' WHERE usuario = 'admin' OR correo = 'admin@pqrsapp.com'")
conn.commit()

cur.execute("SELECT rol, COUNT(*) FROM usuarios GROUP BY rol ORDER BY rol")
print("DESPUES", cur.fetchall())

cur.close()
conn.close()
