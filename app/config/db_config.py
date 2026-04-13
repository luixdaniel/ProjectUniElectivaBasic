import psycopg2
#esto es un ejemplo de como conectar a una base de datos postgres usando psycopg2, se recomienda usar variables de entorno para almacenar las credenciales de la base de datos en lugar de hardcodearlas en el código fuente por razones de seguridad.
def get_db_connection():
    return psycopg2.connect(
        host="ep-square-flower-aiq3n3y4-pooler.c-4.us-east-1.aws.neon.tech",
        port="5432",
        user="neondb_owner",
        password="npg_sTr0k6IAumyt",
        dbname="neondb"
    )