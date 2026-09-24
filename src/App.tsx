import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  createTrip,
  getTrips,
  getCities,
  getCityPlaces,
  getTrip,
  addPlaceToTrip,
  removePlaceFromTrip,
  updateTripPlace,
} from "./api/travelApi";
import type { Trip, TripPlace, TripSummary } from "./api/types";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type City = {
  id: number;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
};

type Place = {
  id: number;
  name: string;
  category: string;
  description: string;
  latitude: number;
  longitude: number;
  bestTimeStart: string | null;
  bestTimeEnd: string | null;
  recommendedDurationMinutes: number | null;
  bestSeason: string | null;
  travelTips: string | null;
};

function MapView({
  selectedCity,
  selectedPlace,
}: {
  selectedCity: City | null;
  selectedPlace: Place | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedPlace) {
      map.flyTo(
        [selectedPlace.latitude, selectedPlace.longitude],
        14,
        { duration: 1 }
      );
      return;
    }

    if (selectedCity) {
      map.flyTo(
        [selectedCity.latitude, selectedCity.longitude],
        12,
        { duration: 1 }
      );
    }
  }, [selectedCity, selectedPlace, map]);

  return null;
}

function App() {
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [citySearch, setCitySearch] = useState("");

  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [search, setSearch] = useState("");

  const [trips, setTrips] = useState<TripSummary[]>([]);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [currentTripId, setCurrentTripId] = useState<number | null>(null);

  const [citiesLoading, setCitiesLoading] = useState(true);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [tripLoading, setTripLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tripError, setTripError] = useState<string | null>(null);

  const [showCreateTrip, setShowCreateTrip] = useState(false);
  const [showTrips, setShowTrips] = useState(false);
  const [newTripName, setNewTripName] = useState("My Trip");
  const [newTripStart, setNewTripStart] = useState("");
  const [newTripEnd, setNewTripEnd] = useState("");

  const [editingTripPlaceId, setEditingTripPlaceId] = useState<number | null>(null);
  const [editDay, setEditDay] = useState(1);
  const [editOrder, setEditOrder] = useState(1);
  const [editTime, setEditTime] = useState("");
  const [editDuration, setEditDuration] = useState(60);
  const [editNotes, setEditNotes] = useState("");

  useEffect(() => {
    getCities()
      .then((data: City[]) => {
        setCities(data);
        const initialCity =
          data.find((city) => city.name.toLowerCase() === "paris") || data[0];

        if (initialCity) {
          setSelectedCity(initialCity);
          setCitySearch(`${initialCity.name}, ${initialCity.country}`);
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to load cities.");
      })
      .finally(() => setCitiesLoading(false));
  }, []);

  useEffect(() => {
    setTripLoading(true);
    setTripError(null);

    getTrips()
      .then((data: TripSummary[]) => {
        setTrips(data);

        if (data.length === 0) {
          setCurrentTripId(null);
          setCurrentTrip(null);
          return;
        }

        setCurrentTripId((current) => current ?? date[0].id);
      })
      .catch((err) => {
        console.error(err);
        setTripError(err instanceof Error ? err.message : "Unable to load trips.");
      })
      .finally(() => setTripLoading(false));
  }, []);

  useEffect(() => {
    if (currentTripId === null) {
      setCurrentTrip(null);
      return;
    }

    setTripLoading(true);
    setTripError(null);

    getTrip(currentTripId)
      .then((data) => setCurrentTrip(data))
      .catch((err) => {
        console.error(err);
        setTripError(err instanceof Error ? err.message : "Unable to load trip.");
      })
      .finally(() => setTripLoading(false));
  }, [currentTripId]);

  useEffect(() => {
    if (!selectedCity) return;

    setPlacesLoading(true);
    setError(null);
    setSelectedPlace(null);
    setSearch("");

    getCityPlaces(selectedCity.id)
      .then((data: Place[]) => setPlaces(data))
      .catch((err) => {
        console.error(err);
        setError("Unable to load places.");
      })
      .finally(() => setPlacesLoading(false));
  }, [selectedCity]);

  const filteredCities = cities.filter((city) =>
    `${city.name} ${city.country}`.toLowerCase().includes(citySearch.toLowerCase())
  );

  const filteredPlaces = places.filter((place) =>
    `${place.name} ${place.category}`.toLowerCase().includes(search.toLowerCase())
  );

  const tripPlacesByDay = useMemo(() => {
    const groups: Record<number, TripPlace[]> = {};

    for (const place of currentTrip?.places ?? []) {
      if (!groups[place.dayNumber]) groups[place.dayNumber] = [];
      groups[place.dayNumber].push(place);
    }

    Object.values(groups).forEach((items) =>
      items.sort((a, b) => a.visitOrder - b.visitOrder)
    );

    return groups;
  }, [currentTrip]);

  const tripDayCount = currentTrip
    ? Math.max(
        1,
        Math.ceil(
          (new Date(currentTrip.endDate).getTime() -
            new Date(currentTrip.startDate).getTime()) /
            86400000
        ) + 1
      )
    : 1;

  const isPlaceInTrip = (placeId: number) =>
    currentTrip?.places.some((item) => item.placeId === placeId) ?? false;

  const tripMatchesSelectedCity =
    currentTrip !== null &&
    selectedCity !== null &&
    currentTrip.destinationCityId === selectedCity.id;

  const selectCity = (city: City) => {
    setSelectedCity(city);
    setCitySearch(`${city.name}, ${city.country}`);
  };

  const refreshTrip = async () => {
    if (currentTripId === null) return;
    const updatedTrip = await getTrip(currentTripId);
    setCurrentTrip(updatedTrip);
    setTrips((items) =>
      items.map((trip) =>
        trip.id === updatedTrip.id
          ? { ...trip, placeCount: updatedTrip.places.length }
          : trip
      )
    );
  };

  const addToTrip = async (place: Place) => {
    if (!currentTrip || currentTripId === null) {
      setTripError("Please select a trip first.");
      return;
    }

    if (!selectedCity || currentTrip.destinationCityId !== selectedCity.id) {
      setTripError(
        `The current trip is for ${currentTrip.city}, not ${selectedCity?.name ?? "this city"}.`
      );
      return;
    }

    if (isPlaceInTrip(place.id)) {
      setTripError("This place is already in the trip.");
      return;
    }

    
    try {
      setSaving(true);

      const visitOrder =
        currentTrip.places.filter((item) => item.dayNumber === 1).length + 1;

      await addPlaceToTrip(currentTripId, {
        place_id: place.id,
        day_number: 1,
        visit_order: visitOrder,
        planned_start_time: "10:00:00",
        planned_duration_minutes:
          place.recommendedDurationMinutes ?? 60,
        notes: "",
      });

      await refreshTrip();
    } catch (err) {
      console.error(err);
      setTripError(err instanceof Error ? err.message : "Failed to add place.");
    } finally {
      setSaving(false);
    }
  };

  const removeFromTrip = async (tripPlaceId: number) => {
    if (currentTripId === null || !currentTrip) return;

    const tripPlace = currentTrip.places.find(
      (item) => item.tripPlaceId === tripPlaceId
    );

    if (!tripPlace) {
      setTripError("Itinerary item was not found.");
      return;
    }

    try {
      setSaving(true);
      await removePlaceFromTrip(currentTripId, tripPlace.placeId);
      await refreshTrip();
    } catch (err) {
      console.error(err);
      setTripError(
        err instanceof Error ? err.message : "Failed to remove place."
      );
    } finally {
      setSaving(false);
    }
  };

  const moveTripPlace = async (place: TripPlace, direction: "up" | "down") => {
    if (currentTripId === null || !currentTrip) return;

    const sameDay = currentTrip.places
      .filter((item) => item.dayNumber === place.dayNumber)
      .sort((a, b) => a.visitOrder - b.visitOrder);

    const index = sameDay.findIndex(
      (item) => item.tripPlaceId === place.tripPlaceId
    );
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (index < 0 || targetIndex < 0 || targetIndex >= sameDay.length) return;

    const target = sameDay[targetIndex];

    try {
      setSaving(true);

      await updateTripPlace(currentTripId, place.tripPlaceId, {
        day_number: place.dayNumber,
        visit_order: target.visitOrder,
        planned_start_time: place.plannedStartTime,
        planned_duration_minutes: place.plannedDurationMinutes,
        notes: place.notes,
      });

      await updateTripPlace(currentTripId, target.tripPlaceId, {
        day_number: target.dayNumber,
        visit_order: place.visitOrder,
        planned_start_time: target.plannedStartTime,
        planned_duration_minutes: target.plannedDurationMinutes,
        notes: target.notes,
      });

      await refreshTrip();
    } catch (err) {
      console.error(err);
      setTripError(
        err instanceof Error ? err.message : "Failed to reorder itinerary."
      );
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (place: TripPlace) => {
    setEditingTripPlaceId(place.tripPlaceId);
    setEditDay(place.dayNumber);
    setEditOrder(place.visitOrder);
    setEditTime(place.plannedStartTime?.slice(0, 5) ?? "");
    setEditDuration(place.plannedDurationMinutes ?? 60);
    setEditNotes(place.notes ?? "");
  };

  const saveEditing = async () => {
    if (!editingTripPlaceId || currentTripId === null) return;

    if (editDay <1 || editDay > tripDayCount) {
      setTripError(`Day must be between 1 and ${tripDayCount}.`);
      return;
    }

    if (editOrder < 1) {
      setTripError("Visit order must be at least 1.");
      return;
    }

    if (editDuration < 1) {
      setTripError("Duration must be at least 1 minute.");
      return;
    }
    
    try {
      setSaving(true);

      await updateTripPlace(currentTripId, editingTripPlaceId, {
        day_number: Math.max(1, editDay),
        visit_order: Math.max(1, editOrder),
        planned_start_time: editTime ? `${editTime}:00` : null,
        planned_duration_minutes: Math.max(1, editDuration),
        notes: editNotes,
      });

      setEditingTripPlaceId(null);
      await refreshTrip();
    } catch (err) {
      console.error(err);
      setTripError(
        err instanceof Error ? err.message : "Failed to update itinerary."
      );
    } finally {
      setSaving(false);
    }
  };

  const openTripPlace = (tripPlace: TripPlace) => {
    const fullPlace = places.find((place) => place.id === tripPlace.placeId);

    if (!fullPlace) {
      setTripError(
        "This place is not available in the currently selected destination."
      );
      return;
    }

    setSelectedPlace(fullPlace);
    setTripError(null);
  };

  const openDirections = (place: Place) => {
    const url =
      `https://www.google.com/maps/dir/?api=1&destination=` +
      `${place.latitude},${place.longitude}`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const submitCreateTrip = async (event: FormEvent) => {
    event.preventDefault();

    if (!selectedCity || !newTripName.trim() || !newTripStart || !newTripEnd) {
      return;
    }

    if (newTripEnd < newTripStart) {
      setTripError("End date cannot be before start date.");
      return;
    }
    

    try {
      setSaving(true);

      const created = await createTrip({
        name: newTripName.trim(),
        destination_city_id: selectedCity.id,
        start_date: newTripStart,
        end_date: newTripEnd,
      });

      setTrips((items) => [...items, created]);
      setCurrentTripId(created.id);
      setShowCreateTrip(false);
      setShowTrips(false);
      setNewTripName("My Trip");
      setNewTripStart("");
      setNewTripEnd("");
    } catch (err) {
      console.error(err);
      setTripError(
        err instanceof Error ? err.message : "Failed to create trip."
      );
    } finally {
      setSaving(false);
    }
  };

  if (citiesLoading) {
    return <div style={{ padding: "40px" }}>Loading destinations...</div>;
  }

  if (error && cities.length === 0) {
    return <div style={{ padding: "40px" }}>{error}</div>;
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">✈</div>
          <div>
            <h1>Travel Planner</h1>
            <span>Explore • Plan • Travel</span>
          </div>
        </div>

        <div className="search-box">
          <span>⌕</span>
          <input
            type="text"
            placeholder="Search places..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="section-title">
          <span>PLACES</span>
          <span>{filteredPlaces.length}</span>
        </div>

        <div className="places-list">
          {placesLoading ? (
            <div className="empty-state">Loading places...</div>
          ) : (
            <>
              {filteredPlaces.map((place) => (
                <button
                  className={`place-card ${
                    selectedPlace?.id === place.id ? "active" : ""
                  }`}
                  key={place.id}
                  onClick={() => setSelectedPlace(place)}
                >
                  <div className="place-icon">📍</div>
                  <div className="place-summary">
                    <strong>{place.name}</strong>
                    <span>{place.category}</span>
                  </div>
                </button>
              ))}

              {filteredPlaces.length === 0 && (
                <div className="empty-state">No places found.</div>
              )}
            </>
          )}
        </div>

        <div className="trip-section">
          <div className="section-title">
            <span>MY TRIP</span>
            <span>{currentTrip?.places.length ?? 0}</span>
          </div>

          {tripLoading && <div className="trip-empty">Loading trip...</div>}

          {tripError && (
            <div className="trip-empty" style={{ color: "#b91c1c" }}>
              {tripError}
            </div>
          )}

          {currentTrip && (
            <>
              <div className="trip-empty">
                <strong>{currentTrip.name}</strong>
                <br />
                {currentTrip.city}, {currentTrip.country}
                <br />
                {currentTrip.startDate} → {currentTrip.endDate}
              </div>

              <button
                className="secondary-button"
                style={{ width: "100%", marginBottom: "8px" }}
                onClick={() => setShowTrips(true)}
              >
                Switch Trip
              </button>

              <button
                className="secondary-button"
                style={{ width: "100%", marginBottom: "12px" }}
                onClick={() => setShowCreateTrip(true)}
              >
                + New Trip
              </button>

              {currentTrip.places.length === 0 ? (
                <div className="trip-empty">
                  Select places and add them to your trip.
                </div>
              ) : (
                <div className="trip-list">
                  {Array.from({ length: tripDayCount }, (_, index) => index + 1).map((day) => {
                    const dayPlaces = tripPlacesByDay[day] ?? [];

                    return (
                      <div key={day} style={{ marginBottom: "16px" }}>
                        <strong
                          style={{
                            display: "block",
                            marginBottom: "6px",
                            fontSize: "13px",
                          }}
                        >
                          Day {day}
                        </strong>

                        {dayPlaces.length === 0 ? (
                          <div
                            style={{
                              padding: "8px 10px",
                              border: "1px dashed #ddd",
                              borderRadius: "8px",
                              color: "#888",
                              fontSize: "12px",
                              marginBottom: "6px",
                            }}
                          >
                            No places planned
                          </div>
                        ) : (
                          dayPlaces.map((place, index) => (
                            <div
                              className="trip-item"
                              key={place.tripPlaceId}
                              style={{
                                cursor: "pointer",
                                alignItems: "flex-start",
                              }}
                              onClick={() => openTripPlace(place)}
                            >
                              <span className="trip-number">
                                {place.visitOrder}
                              </span>

                              <div style={{ flex: 1, minWidth: 0 }}>
                                <strong>{place.name}</strong>
                                <div style={{ fontSize: "12px", color: "#777" }}>
                                  {place.plannedStartTime?.slice(0, 5) ?? "--:--"}{" "}
                                  •{" "}
                                  {place.plannedDurationMinutes
                                    ? `${place.plannedDurationMinutes} min`
                                    : "duration not set"}
                                </div>
                              </div>

                              <button
                                onClick={(event) => {
                                  event.stopPropagation();
                                  moveTripPlace(place, "up");
                                }}
                                disabled={saving || index === 0}
                                title="Move earlier"
                              >
                                ↑
                              </button>

                              <button
                                onClick={(event) => {
                                  event.stopPropagation();
                                  moveTripPlace(place, "down");
                                }}
                                disabled={saving || index === dayPlaces.length - 1}
                                title="Move later"
                              >
                                ↓
                              </button>

                              <button
                                onClick={(event) => {
                                  event.stopPropagation();
                                  startEditing(place);
                                }}
                                disabled={saving}
                                title="Edit itinerary"
                              >
                                ✎
                              </button>

                              <button
                                onClick={(event) => {
                                  event.stopPropagation();
                                  removeFromTrip(place.tripPlaceId);
                                }}
                                disabled={saving}
                                title="Remove from trip"
                              >
                                ×
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {currentTrip.places.length > 0 && (
                <div
                  style={{
                    marginTop: "10px",
                    paddingTop: "10px",
                    borderTop: "1px solid #eee",
                    fontSize: "12px",
                    color: "#666",
                  }}
                >
                  {currentTrip.places.length} place(s) • {tripDayCount} day(s)
                </div>
              )}
            </>
          )}
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <span className="location-label">DESTINATION</span>
            <h2>
              {selectedCity
                ? `${selectedCity.name}, ${selectedCity.country}`
                : "Select destination"}
            </h2>
          </div>

          <div className="top-actions">
            <button onClick={() => setShowTrips(true)}>♡ Saved</button>
            <button onClick={() => setShowTrips(true)}>☰ Menu</button>
          </div>
        </header>

        <div
          style={{
            position: "relative",
            padding: "10px 18px",
            background: "white",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <input
            type="text"
            placeholder="Search destination..."
            value={citySearch}
            onChange={(event) => setCitySearch(event.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "15px",
              boxSizing: "border-box",
              outline: "none",
            }}
          />

          {citySearch &&
            filteredCities.length > 0 &&
            !selectedCity?.name
              .toLowerCase()
              .includes(citySearch.split(",")[0].trim().toLowerCase()) && (
              <div
                style={{
                  position: "absolute",
                  top: "58px",
                  left: "18px",
                  right: "18px",
                  background: "white",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                  zIndex: 1000,
                  overflow: "hidden",
                }}
              >
                {filteredCities.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => selectCity(city)}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "12px 14px",
                      border: "none",
                      background: "white",
                      cursor: "pointer",
                      fontSize: "15px",
                    }}
                  >
                    <strong>{city.name}</strong>
                    <span style={{ marginLeft: "8px", color: "#777" }}>
                      {city.country}
                    </span>
                  </button>
                ))}
              </div>
            )}
        </div>

        <section className="map-area">
          {selectedCity && (
            <MapContainer
              key={selectedCity.id}
              center={[selectedCity.latitude, selectedCity.longitude]}
              zoom={12}
              className="map"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapView
                selectedCity={selectedCity}
                selectedPlace={selectedPlace}
              />

              {places.map((place) => (
                <Marker
                  key={place.id}
                  position={[place.latitude, place.longitude]}
                  eventHandlers={{
                    click: () => setSelectedPlace(place),
                  }}
                >
                  <Popup>
                    <div style={{ minWidth: "160px" }}>
                      <strong>{place.name}</strong>
                      
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#666",
                          marginTop: "4px",
                        }}
                      >
                        {place.category}
                      </div>

                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => {setSelectedPlace(place);}}
                        onKeyDown={(event)=> {
                          if (event.key === "Enter" || event.key === " ")
                          {setSelectedPlace(place);}
                        }}
                        style={{
                          marginTop: "8px",
                          padding: "6px 10px",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          background: "#111827",
                          color: "white",
                          fontSize: "12px",
                          textAlign: "center",
                          userSelection: "none",
                        }}
                      >
                        View details
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}

          <div className="map-search">
            <span>⌕</span>
            <input
              placeholder="Search places..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </section>

        {selectedPlace && (
          <section
             className="place-panel"
             style={{
              maxHeight: "320px",
              overflowY: "auto",
             }}
            >
            <div className="place-panel-header">
              <div>
                <span className="category">{selectedPlace.category}</span>
                <h2>{selectedPlace.name}</h2>
              </div>

              <button
                className="close-button"
                onClick={() => setSelectedPlace(null)}
              >
                ×
              </button>
            </div>

            <p>{selectedPlace.description}</p>

            <div className="travel-info">
              <div>
                <span>BEST TIME</span>
                <strong>
                  ☀{" "}
                  {selectedPlace.bestTimeStart?.slice(0, 5) ?? "--:--"}
                  {" – "}
                  {selectedPlace.bestTimeEnd?.slice(0, 5) ?? "--:--"}
                </strong>
              </div>

              <div>
                <span>BEST SEASON</span>
                <strong>
                  🌤 {selectedPlace.bestSeason ?? "Not specified"}
                </strong>
              </div>

              <div>
                <span>RECOMMENDED DURATION</span>
                <strong>
                  ◷{" "}
                  {selectedPlace.recommendedDurationMinutes
                    ? `${Math.round(
                        selectedPlace.recommendedDurationMinutes / 60
                      )} hours`
                    : "Not specified"}
                </strong>
              </div>
            </div>

            {selectedPlace.travelTips && (
              <div
                style={{
                  marginTop: "10px",
                  padding: "10px 12px",
                  background: "#f8fafc",
                  borderRadius: "8px",
                  fontSize: "13px",
                  color: "#555",
                }}
              >
                <strong>Travel tip</strong>
                <div style={{marginTop: "3px"}}>
                  {selectedPlace.travelTips}
                </div>
              </div>
            )}

            <div className="panel-actions">
              <button
                className="primary-button"
                onClick={() => addToTrip(selectedPlace)}
                disabled={
                  saving ||
                  !currentTrip ||
                  !tripMatchesSelectedCity ||
                  isPlaceInTrip(selectedPlace.id)
                }
              >
                {isPlaceInTrip(selectedPlace.id)
                  ? "✓ Added to Trip"
                  : !currentTrip
                    ? "select a Trip"
                      : !tripMatchesSelectedCity
                      ? `Trip is for ${currentTrip.city}`
                      : saving
                        ? "Saving..."
                        : "+ Add to Trip"}
              </button>

              <button
                className="secondary-button"
                onClick={() => openDirections(selectedPlace)}
              >
                Directions
              </button>
            </div>
          </section>
        )}

        {editingTripPlaceId && currentTrip && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.35)",
              zIndex: 2000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
          >
            <form
              onSubmit={(event) => {
                event.preventDefault();
                saveEditing();
              }}
              style={{
                width: "min(480px, 100%)",
                background: "white",
                borderRadius: "12px",
                padding: "22px",
                boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
              }}
            >
              <h3 style={{ marginTop: 0 }}>Edit itinerary item</h3>

              <label>
                Day
                <input
                  type="number"
                  min="1"
                  value={editDay}
                  onChange={(e) => setEditDay(Number(e.target.value))}
                  style={{ width: "100%", margin: "6px 0 12px", padding: "8px" }}
                />
              </label>

              <label>
                Order
                <input
                  type="number"
                  min="1"
                  value={editOrder}
                  onChange={(e) => setEditOrder(Number(e.target.value))}
                  style={{ width: "100%", margin: "6px 0 12px", padding: "8px" }}
                />
              </label>

              <label>
                Start time
                <input
                  type="time"
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                  style={{ width: "100%", margin: "6px 0 12px", padding: "8px" }}
                />
              </label>

              <label>
                Duration (minutes)
                <input
                  type="number"
                  min="1"
                  value={editDuration}
                  onChange={(e) => setEditDuration(Number(e.target.value))}
                  style={{ width: "100%", margin: "6px 0 12px", padding: "8px" }}
                />
              </label>

              <label>
                Notes
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={3}
                  style={{ width: "100%", margin: "6px 0 12px", padding: "8px" }}
                />
              </label>

              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setEditingTripPlaceId(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-button" disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        )}

        {showTrips && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.35)",
              zIndex: 2000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
          >
            <div
              style={{
                width: "min(520px, 100%)",
                maxHeight: "80vh",
                overflowY: "auto",
                background: "white",
                borderRadius: "12px",
                padding: "22px",
                boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0 }}>My Trips</h3>
                <button
                  type="button"
                  className="close-button"
                  onClick={() => setShowTrips(false)}
                >
                  ×
                </button>
              </div>

              <div style={{ marginTop: "16px" }}>
                {trips.length === 0 ? (
                  <div className="trip-empty">No trips yet.</div>
                ) : (
                  trips.map((trip) => (
                    <button
                      key={trip.id}
                      type="button"
                      onClick={() => {
                        setCurrentTripId(trip.id);
                        setShowTrips(false);
                      }}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        padding: "14px",
                        marginBottom: "8px",
                        border: trip.id === currentTripId ? "2px solid #111827" : "1px solid #ddd",
                        borderRadius: "10px",
                        background: trip.id === currentTripId ? "#f8fafc" : "white",
                        cursor: "pointer",
                      }}
                    >
                      <strong>{trip.name}</strong>
                      <div style={{ fontSize: "13px", color: "#666", marginTop: "4px" }}>
                        {trip.city}, {trip.country}
                      </div>
                      <div style={{ fontSize: "12px", color: "#888", marginTop: "3px" }}>
                        {trip.startDate} → {trip.endDate} • {trip.placeCount} place(s)
                      </div>
                    </button>
                  ))
                )}
              </div>

              <button
                type="button"
                className="primary-button"
                style={{ width: "100%", marginTop: "8px" }}
                onClick={() => {
                  setShowTrips(false);
                  setShowCreateTrip(true);
                }}
              >
                + Create New Trip
              </button>
            </div>
          </div>
        )}

        {showCreateTrip && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.35)",
              zIndex: 2000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
          >
            <form
              onSubmit={submitCreateTrip}
              style={{
                width: "min(480px, 100%)",
                background: "white",
                borderRadius: "12px",
                padding: "22px",
                boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
              }}
            >
              <h3 style={{ marginTop: 0 }}>Create new trip</h3>

              <p style={{ color: "#666", fontSize: "13px" }}>
                Destination:{" "}
                <strong>
                  {selectedCity
                    ? `${selectedCity.name}, ${selectedCity.country}`
                    : "Select a city first"}
                </strong>
              </p>

              <label>
                Trip name
                <input
                  type="text"
                  value={newTripName}
                  onChange={(e) => setNewTripName(e.target.value)}
                  style={{ width: "100%", margin: "6px 0 12px", padding: "8px" }}
                />
              </label>

              <label>
                Start date
                <input
                  type="date"
                  value={newTripStart}
                  onChange={(e) => setNewTripStart(e.target.value)}
                  style={{ width: "100%", margin: "6px 0 12px", padding: "8px" }}
                />
              </label>

              <label>
                End date
                <input
                  type="date"
                  value={newTripEnd}
                  onChange={(e) => setNewTripEnd(e.target.value)}
                  style={{ width: "100%", margin: "6px 0 12px", padding: "8px" }}
                />
              </label>

              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowCreateTrip(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving || !selectedCity}
                >
                  {saving ? "Creating..." : "Create Trip"}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
export default App;

