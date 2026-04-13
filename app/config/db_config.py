import psycopg2
import os
from dotenv import load_dotenv


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(BASE_DIR, ".env"))
load_dotenv()


def get_db_connection():
    database_url = os.getenv("DATABASE_URL")

    if database_url:
        return psycopg2.connect(database_url)

    host = os.getenv("DB_HOST")
    port = os.getenv("DB_PORT", "5432")
    user = os.getenv("DB_USER")
    password = os.getenv("DB_PASSWORD")
    dbname = os.getenv("DB_NAME")

    if not all([host, user, password, dbname]):
        raise RuntimeError(
            "Faltan variables de entorno de BD. Usa DATABASE_URL o configura DB_HOST, DB_PORT, DB_USER, DB_PASSWORD y DB_NAME."
        )

    return psycopg2.connect(
        host=host,
        port=port,
        user=user,
        password=password,
        dbname=dbname,
        sslmode=os.getenv("DB_SSLMODE", "require")
    )