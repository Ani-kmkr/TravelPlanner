from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import psycopg

app = FastAPI(title="Travel Planner API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE_URL = "dbname=travel_planner user=animesh"


def get_connection():
    return psycopg.connect(DATABASE_URL)


@app.get("/")
def root():
    return {
        "message": "Travel Planner API is running"
    }


@app.get("/health")
def health():
    try:
        with get_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()

        return {
            "status": "healthy",
            "database": "connected"
        }

    except Exception as error:
        return {
            "status": "error",
            "database": "disconnected",
            "message": str(error)
        }


@app.get("/places")
def get_places():

    query = """
        SELECT
            p.id,
            p.name,
            pc.name AS category,
            p.description,
            ST_Y(p.location::geometry) AS latitude,
            ST_X(p.location::geometry) AS longitude,
            ti.best_time_start,
            ti.best_time_end,
            ti.recommended_duration_minutes,
            ti.best_season,
            ti.travel_tips

        FROM places p

        LEFT JOIN place_categories pc
            ON p.category_id = pc.id

        LEFT JOIN travel_information ti
            ON p.id = ti.place_id

        ORDER BY p.id;
    """

    with get_connection() as connection:

        with connection.cursor() as cursor:

            cursor.execute(query)

            rows = cursor.fetchall()

            places = []

            for row in rows:

                places.append({
                    "id": row[0],
                    "name": row[1],
                    "category": row[2],
                    "description": row[3],
                    "latitude": float(row[4]),
                    "longitude": float(row[5]),
                    "bestTimeStart": str(row[6]) if row[6] else None,
                    "bestTimeEnd": str(row[7]) if row[7] else None,
                    "recommendedDurationMinutes": row[8],
                    "bestSeason": row[9],
                    "travelTips": row[10],
                })

            return places