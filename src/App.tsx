import { useEffect, useState } from "react";
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

// Fix Leaflet marker icons when using Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

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



function MapView({ selectedPlace }: { selectedPlace: Place | null }) {
  const map = useMap();

  if (selectedPlace) {
    map.flyTo(
      [selectedPlace.latitude, selectedPlace.longitude],
      14,
      { duration: 1 }
    );
  }

  return null;
}

function App() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [trip, setTrip] = useState<Place[]>([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/places")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load places");
        }

        return response.json();
      })
      .then((data: Place[]) => {
        setPlaces(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setError("Unable to load places.");
        setLoading(false);
      });
  }, []);

  const filteredPlaces = places.filter((place) =>
    `${place.name} ${place.category}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const addToTrip = (place: Place) => {
    if (!trip.some((item) => item.id === place.id)) {
      setTrip([...trip, place]);
    }
  };

  const removeFromTrip = (id: number) => {
    setTrip(trip.filter((place) => place.id !== id));
  };


  if (loading) {
    return <div style={{ padding: "40px" }}>Loading places...</div>;
  }

  if (error) {
    return <div style={{ padding: "40px" }}>{error}</div>;
  }

  return (
    <div className="app">
      {/* SIDEBAR */}
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
        </div>

        <div className="trip-section">
          <div className="section-title">
            <span>MY TRIP</span>
            <span>{trip.length}</span>
          </div>

          {trip.length === 0 ? (
            <div className="trip-empty">
              Select places and add them to your trip.
            </div>
          ) : (
            <div className="trip-list">
              {trip.map((place, index) => (
                <div className="trip-item" key={place.id}>
                  <span className="trip-number">{index + 1}</span>

                  <span>{place.name}</span>

                  <button onClick={() => removeFromTrip(place.id)}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main">
        {/* HEADER */}
        <header className="topbar">
          <div>
            <span className="location-label">DESTINATION</span>
            <h2>Paris, France</h2>
          </div>

          <div className="top-actions">
            <button>♡ Saved</button>
            <button>☰ Menu</button>
          </div>
        </header>

        {/* MAP */}
        <section className="map-area">
          <MapContainer
            center={[48.8566, 2.3522]}
            zoom={12}
            className="map"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapView selectedPlace={selectedPlace} />

            {places.map((place) => (
              <Marker
                key={place.id}
                position={[place.latitude, place.longitude]}
                eventHandlers={{
                  click: () => setSelectedPlace(place),
                }}
              >
                <Popup>
                  <strong>{place.name}</strong>
                  <br />
                  {place.category}
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* MAP SEARCH */}
          <div className="map-search">
            <span>⌕</span>

            <input
              placeholder="Search destination or place"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </section>

        {/* PLACE INFORMATION */}
        {selectedPlace && (
          <section className="place-panel">
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
                  ☀ {selectedPlace.bestTimeStart?.slice(0, 5)} –{" "}
                  {selectedPlace.bestTimeEnd?.slice(0, 5)}</strong>
              </div>

              <div>
                <span>RECOMMENDED DURATION</span>
                <strong>  ◷{" "}{selectedPlace.recommendedDurationMinutes? `${Math.round(selectedPlace.recommendedDurationMinutes / 60)} hours`: "Not specified"}</strong>
              </div>
            </div>

            <div className="panel-actions">
              <button
                className="primary-button"
                onClick={() => addToTrip(selectedPlace)}
              >
                + Add to Trip
              </button>

              <button className="secondary-button">
                Directions
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;