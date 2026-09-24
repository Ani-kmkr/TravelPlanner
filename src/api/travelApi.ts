import type { Trip, TripSummary } from "./types";

const API_BASE_URL = "http://127.0.0.1:8000";

async function parseError(response: Response, fallback: string) {
  const error = await response.json().catch(() => null);
  return error?.detail || fallback;
}

export async function getCities() {
  const response = await fetch(`${API_BASE_URL}/cities`);
  if (!response.ok) throw new Error(await parseError(response, "Failed to load cities"));
  return response.json();
}

export async function getCityPlaces(cityId: number) {
  const response = await fetch(`${API_BASE_URL}/cities/${cityId}/places`);
  if (!response.ok) throw new Error(await parseError(response, "Failed to load city places"));
  return response.json();
}

export async function getPlaces() {
  const response = await fetch(`${API_BASE_URL}/places`);
  if (!response.ok) throw new Error(await parseError(response, "Failed to load places"));
  return response.json();
}

export async function getTrips(): Promise<TripSummary[]> {
  const response = await fetch(`${API_BASE_URL}/trips`);
  if (!response.ok) {
    throw new Error(await parseError(response, "Failed to load trips"));
  }
  return response.json() as Promise<TripSummary[]>;
}

export async function getTrip(tripId: number): Promise<Trip> {
  const response = await fetch(`${API_BASE_URL}/trips/${tripId}`);
  if (!response.ok) throw new Error(await parseError(response, "Failed to load trip"));
  return response.json() as Promise<Trip>;
}

export async function createTrip(trip: {
  name: string;
  destination_city_id: number;
  start_date: string;
  end_date: string;
}) {
  const response = await fetch(`${API_BASE_URL}/trips`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(trip),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, "Failed to create trip"));
  }

  return response.json();
}

export async function addPlaceToTrip(
  tripId: number,
  place: {
    place_id: number;
    day_number: number;
    visit_order: number;
    planned_start_time: string;
    planned_duration_minutes: number;
    notes: string;
  }
) {
  const response = await fetch(`${API_BASE_URL}/trips/${tripId}/places`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(place),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, "Failed to add place to trip"));
  }

  return response.json();
}

export async function updateTripPlace(
  tripId: number,
  tripPlaceId: number,
  update: {
    day_number: number;
    visit_order: number;
    planned_start_time: string | null;
    planned_duration_minutes: number | null;
    notes: string | null;
  }
) {
  const response = await fetch(
    `${API_BASE_URL}/trips/${tripId}/places/${tripPlaceId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        day_number: update.day_number,
        visit_order: update.visit_order,
        planned_start_time: update.planned_start_time,
        planned_duration_minutes: update.planned_duration_minutes,
        notes: update.notes,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(await parseError(response, "Failed to update trip place"));
  }

  return response.json();
}

export async function removePlaceFromTrip(
  tripId: number,
  tripPlaceId: number
) {
  const response = await fetch(
    `${API_BASE_URL}/trips/${tripId}/places/${tripPlaceId}`,
    { method: "DELETE" }
  );

  if (!response.ok) {
    throw new Error(await parseError(response, "Failed to remove place from trip"));
  }

  return response.json().catch(() => ({}));
}
