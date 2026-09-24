from datetime import date, time
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psycopg


# =========================================================
# APP
# =========================================================

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


# =========================================================
# DATABASE
# =========================================================

DATABASE_URL = "dbname=travel_planner user=animesh"


def get_connection():
    return psycopg.connect(DATABASE_URL)


# =========================================================
# MODELS
# =========================================================

class TripCreate(BaseModel):
    name: str
    destination_city_id: int
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class TripPlaceCreate(BaseModel):
    place_id: int
    day_number: int = 1
    visit_order: Optional[int] = None
    planned_start_time: Optional[time] = None
    planned_duration_minutes: Optional[int] = None
    notes: Optional[str] = None


class TripPlaceUpdate(BaseModel):
    day_number: Optional[int] = None
    visit_order: Optional[int] = None
    planned_start_time: Optional[time] = None
    planned_duration_minutes: Optional[int] = None
    notes: Optional[str] = None


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():
    return {
        "message": "Travel Planner API is running"
    }


# =========================================================
# HEALTH
# =========================================================

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


# =========================================================
# CITIES
# =========================================================

@app.get("/cities")
def get_cities():

    query = """
        SELECT
            c.id,
            c.name,
            co.name AS country,
            ST_Y(c.location::geometry) AS latitude,
            ST_X(c.location::geometry) AS longitude

        FROM cities c

        JOIN countries co
            ON c.country_id = co.id

        ORDER BY c.name;
    """

    with get_connection() as connection:

        with connection.cursor() as cursor:

            cursor.execute(query)

            rows = cursor.fetchall()

            cities = []

            for row in rows:

                cities.append({
                    "id": row[0],
                    "name": row[1],
                    "country": row[2],
                    "latitude": float(row[3]),
                    "longitude": float(row[4]),
                })

            return cities


# =========================================================
# PLACES FOR A CITY
# =========================================================

@app.get("/cities/{city_id}/places")
def get_city_places(city_id: int):

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

        WHERE p.city_id = %s

        ORDER BY p.id;
    """

    with get_connection() as connection:

        with connection.cursor() as cursor:

            cursor.execute(query, (city_id,))

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


# =========================================================
# ALL PLACES
# =========================================================

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


# =========================================================
# CREATE TRIP
# =========================================================

@app.post("/trips")
def create_trip(trip: TripCreate):

    query = """
        INSERT INTO trips
            (
                name,
                destination_city_id,
                start_date,
                end_date
            )

        VALUES
            (%s, %s, %s, %s)

        RETURNING
            id,
            name,
            destination_city_id,
            start_date,
            end_date,
            created_at,
            updated_at;
    """

    with get_connection() as connection:

        with connection.cursor() as cursor:

            # Check that the city exists
            cursor.execute(
                """
                SELECT
                    c.id,
                    c.name,
                    co.name
                FROM cities c
                JOIN countries co
                    ON c.country_id = co.id
                WHERE c.id = %s;
                """,
                (trip.destination_city_id,)
            )

            city = cursor.fetchone()

            if not city:
                raise HTTPException(
                    status_code=404,
                    detail="Destination city not found"
                )

            cursor.execute(
                query,
                (
                    trip.name,
                    trip.destination_city_id,
                    trip.start_date,
                    trip.end_date,
                )
            )

            row = cursor.fetchone()

        connection.commit()

    return {
        "id": row[0],
        "name": row[1],
        "destinationCityId": row[2],
        "startDate": row[3],
        "endDate": row[4],
        "createdAt": row[5],
        "updatedAt": row[6],
    }

# =========================================================
# GET ALL TRIPS
# =========================================================

@app.get("/trips")
def get_trips():

    query = """
        SELECT
            t.id,
            t.name,
            t.destination_city_id,
            c.name AS city,
            co.name AS country,
            t.start_date,
            t.end_date,
            COUNT(tp.id) AS place_count

        FROM trips t

        JOIN cities c
            ON t.destination_city_id = c.id

        JOIN countries co
            ON c.country_id = co.id

        LEFT JOIN trip_places tp
            ON t.id = tp.trip_id

        GROUP BY
            t.id,
            t.name,
            t.destination_city_id,
            c.name,
            co.name,
            t.start_date,
            t.end_date

        ORDER BY
            t.updated_at DESC,
            t.id DESC;
    """

    with get_connection() as connection:

        with connection.cursor() as cursor:

            cursor.execute(query)

            rows = cursor.fetchall()

    trips = []

    for row in rows:

        trips.append({
            "id": row[0],
            "name": row[1],
            "destinationCityId": row[2],
            "city": row[3],
            "country": row[4],
            "startDate": row[5],
            "endDate": row[6],
            "placeCount": row[7],
        })

    return trips

# =========================================================
# GET TRIP
# =========================================================

@app.get("/trips/{trip_id}")
def get_trip(trip_id: int):

    trip_query = """
        SELECT
            t.id,
            t.name,
            t.destination_city_id,
            c.name AS city,
            co.name AS country,
            t.start_date,
            t.end_date,
            t.created_at,
            t.updated_at

        FROM trips t

        JOIN cities c
            ON t.destination_city_id = c.id

        JOIN countries co
            ON c.country_id = co.id

        WHERE t.id = %s;
    """

    places_query = """
        SELECT
            tp.id,
            tp.place_id,
            p.name,
            pc.name AS category,
            tp.day_number,
            tp.visit_order,
            tp.planned_start_time,
            tp.planned_duration_minutes,
            tp.notes

        FROM trip_places tp

        JOIN places p
            ON tp.place_id = p.id

        LEFT JOIN place_categories pc
            ON p.category_id = pc.id

        WHERE tp.trip_id = %s

        ORDER BY
            tp.day_number,
            tp.visit_order,
            tp.id;
    """

    with get_connection() as connection:

        with connection.cursor() as cursor:

            cursor.execute(trip_query, (trip_id,))
            trip = cursor.fetchone()

            if not trip:
                raise HTTPException(
                    status_code=404,
                    detail="Trip not found"
                )

            cursor.execute(places_query, (trip_id,))
            rows = cursor.fetchall()

    places = []

    for row in rows:

        places.append({
            "tripPlaceId": row[0],
            "placeId": row[1],
            "name": row[2],
            "category": row[3],
            "dayNumber": row[4],
            "visitOrder": row[5],
            "plannedStartTime": (
                str(row[6]) if row[6] else None
            ),
            "plannedDurationMinutes": row[7],
            "notes": row[8],
        })

    return {
        "id": trip[0],
        "name": trip[1],
        "destinationCityId": trip[2],
        "city": trip[3],
        "country": trip[4],
        "startDate": trip[5],
        "endDate": trip[6],
        "createdAt": trip[7],
        "updatedAt": trip[8],
        "places": places,
    }


# =========================================================
# ADD PLACE TO TRIP
# =========================================================

@app.post("/trips/{trip_id}/places")
def add_place_to_trip(
    trip_id: int,
    trip_place: TripPlaceCreate
):

    with get_connection() as connection:

        with connection.cursor() as cursor:

            # -------------------------------------------------
            # Check trip
            # -------------------------------------------------

            cursor.execute(
                """
                SELECT destination_city_id
                FROM trips
                WHERE id = %s;
                """,
                (trip_id,)
            )

            trip = cursor.fetchone()

            if not trip:
                raise HTTPException(
                    status_code=404,
                    detail="Trip not found"
                )

            destination_city_id = trip[0]

            # -------------------------------------------------
            # Check place
            # -------------------------------------------------

            cursor.execute(
                """
                SELECT
                    id,
                    city_id,
                    name
                FROM places
                WHERE id = %s;
                """,
                (trip_place.place_id,)
            )

            place = cursor.fetchone()

            if not place:
                raise HTTPException(
                    status_code=404,
                    detail="Place not found"
                )

            # -------------------------------------------------
            # Make sure place belongs to trip city
            # -------------------------------------------------

            if place[1] != destination_city_id:

                raise HTTPException(
                    status_code=400,
                    detail="Place does not belong to the trip destination city"
                )

            # -------------------------------------------------
            # Prevent duplicate
            # -------------------------------------------------

            cursor.execute(
                """
                SELECT id
                FROM trip_places
                WHERE trip_id = %s
                  AND place_id = %s;
                """,
                (
                    trip_id,
                    trip_place.place_id,
                )
            )

            existing = cursor.fetchone()

            if existing:

                raise HTTPException(
                    status_code=409,
                    detail="Place is already in this trip"
                )

            # -------------------------------------------------
            # Determine visit order
            # -------------------------------------------------

            visit_order = trip_place.visit_order

            if visit_order is None:

                cursor.execute(
                    """
                    SELECT COALESCE(MAX(visit_order), 0) + 1
                    FROM trip_places
                    WHERE trip_id = %s
                      AND day_number = %s;
                    """,
                    (
                        trip_id,
                        trip_place.day_number,
                    )
                )

                visit_order = cursor.fetchone()[0]

            # -------------------------------------------------
            # Insert
            # -------------------------------------------------

            cursor.execute(
                """
                INSERT INTO trip_places
                    (
                        trip_id,
                        place_id,
                        day_number,
                        visit_order,
                        planned_start_time,
                        planned_duration_minutes,
                        notes
                    )

                VALUES
                    (%s, %s, %s, %s, %s, %s, %s)

                RETURNING
                    id;
                """,
                (
                    trip_id,
                    trip_place.place_id,
                    trip_place.day_number,
                    visit_order,
                    trip_place.planned_start_time,
                    trip_place.planned_duration_minutes,
                    trip_place.notes,
                )
            )

            trip_place_id = cursor.fetchone()[0]

        connection.commit()

    return {
        "message": "Place added to trip",
        "tripPlaceId": trip_place_id,
        "placeId": trip_place.place_id,
        "dayNumber": trip_place.day_number,
        "visitOrder": visit_order,
    }


# =========================================================
# UPDATE TRIP PLACE
# =========================================================

@app.patch("/trips/{trip_id}/places/{trip_place_id}")
def update_trip_place(
    trip_id: int,
    trip_place_id: int,
    update: TripPlaceUpdate
):

    fields = []
    values = []

    if update.day_number is not None:
        fields.append("day_number = %s")
        values.append(update.day_number)

    if update.visit_order is not None:
        fields.append("visit_order = %s")
        values.append(update.visit_order)

    if update.planned_start_time is not None:
        fields.append("planned_start_time = %s")
        values.append(update.planned_start_time)

    if update.planned_duration_minutes is not None:
        fields.append("planned_duration_minutes = %s")
        values.append(update.planned_duration_minutes)

    if update.notes is not None:
        fields.append("notes = %s")
        values.append(update.notes)

    if not fields:
        raise HTTPException(
            status_code=400,
            detail="No fields supplied for update"
        )

    values.extend([
        trip_place_id,
        trip_id,
    ])

    query = f"""
        UPDATE trip_places
        SET
            {", ".join(fields)}
        WHERE id = %s
          AND trip_id = %s
        RETURNING
            id,
            trip_id,
            place_id,
            day_number,
            visit_order,
            planned_start_time,
            planned_duration_minutes,
            notes;
    """

    with get_connection() as connection:

        with connection.cursor() as cursor:

            cursor.execute(query, values)

            row = cursor.fetchone()

            if not row:
                raise HTTPException(
                    status_code=404,
                    detail="Trip place not found"
                )

        connection.commit()

    return {
        "tripPlaceId": row[0],
        "tripId": row[1],
        "placeId": row[2],
        "dayNumber": row[3],
        "visitOrder": row[4],
        "plannedStartTime": (
            str(row[5]) if row[5] else None
        ),
        "plannedDurationMinutes": row[6],
        "notes": row[7],
    }


# =========================================================
# REMOVE PLACE FROM TRIP
# =========================================================

@app.delete("/trips/{trip_id}/places/{place_id}")
def remove_place_from_trip(
    trip_id: int,
    place_id: int
):

    query = """
        DELETE FROM trip_places
        WHERE trip_id = %s
          AND place_id = %s
        RETURNING id;
    """

    with get_connection() as connection:

        with connection.cursor() as cursor:

            cursor.execute(
                query,
                (
                    trip_id,
                    place_id,
                )
            )

            row = cursor.fetchone()

            if not row:
                raise HTTPException(
                    status_code=404,
                    detail="Place is not in this trip"
                )

        connection.commit()

    return {
        "message": "Place removed from trip",
        "tripPlaceId": row[0],
    }


# =========================================================
# DELETE TRIP
# =========================================================

@app.delete("/trips/{trip_id}")
def delete_trip(trip_id: int):

    query = """
        DELETE FROM trips
        WHERE id = %s
        RETURNING id;
    """

    with get_connection() as connection:

        with connection.cursor() as cursor:

            cursor.execute(query, (trip_id,))

            row = cursor.fetchone()

            if not row:
                raise HTTPException(
                    status_code=404,
                    detail="Trip not found"
                )

        connection.commit()

    return {
        "message": "Trip deleted",
        "tripId": row[0],
    }