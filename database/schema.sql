-- ============================================
-- TRAVEL PLANNER DATABASE
-- Initial Schema
-- ============================================

-- ============================================
-- COUNTRIES
-- ============================================

CREATE TABLE countries (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    iso_code VARCHAR(10),
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================
-- CITIES
-- ============================================

CREATE TABLE cities (
    id BIGSERIAL PRIMARY KEY,
    country_id BIGINT NOT NULL REFERENCES countries(id),
    name VARCHAR(150) NOT NULL,

    location GEOGRAPHY(POINT, 4326),

    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================
-- PLACE CATEGORIES
-- ============================================

CREATE TABLE place_categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);


-- ============================================
-- PLACES
-- ============================================

CREATE TABLE places (
    id BIGSERIAL PRIMARY KEY,

    city_id BIGINT REFERENCES cities(id),
    category_id BIGINT REFERENCES place_categories(id),

    name VARCHAR(200) NOT NULL,

    description TEXT,

    location GEOGRAPHY(POINT, 4326),

    external_id VARCHAR(255),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================
-- TRAVEL INFORMATION
-- ============================================

CREATE TABLE travel_information (
    id BIGSERIAL PRIMARY KEY,

    place_id BIGINT NOT NULL UNIQUE REFERENCES places(id)
        ON DELETE CASCADE,

    best_time_start TIME,
    best_time_end TIME,

    recommended_duration_minutes INTEGER,

    best_season VARCHAR(100),

    travel_tips TEXT,

    description TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================
-- EVENTS
-- ============================================

CREATE TABLE events (
    id BIGSERIAL PRIMARY KEY,

    place_id BIGINT REFERENCES places(id)
        ON DELETE CASCADE,

    name VARCHAR(255) NOT NULL,

    description TEXT,

    start_datetime TIMESTAMPTZ,
    end_datetime TIMESTAMPTZ,

    recurrence_rule TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================
-- ACTIVITIES
-- ============================================

CREATE TABLE activities (
    id BIGSERIAL PRIMARY KEY,

    place_id BIGINT REFERENCES places(id)
        ON DELETE CASCADE,

    name VARCHAR(255) NOT NULL,

    description TEXT,

    duration_minutes INTEGER,

    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================
-- TRIPS
-- ============================================

CREATE TABLE trips (
    id BIGSERIAL PRIMARY KEY,

    name VARCHAR(255) NOT NULL,

    destination_city_id BIGINT REFERENCES cities(id),

    start_date DATE,
    end_date DATE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================
-- TRIP PLACES
-- ============================================

CREATE TABLE trip_places (
    id BIGSERIAL PRIMARY KEY,

    trip_id BIGINT NOT NULL REFERENCES trips(id)
        ON DELETE CASCADE,

    place_id BIGINT NOT NULL REFERENCES places(id)
        ON DELETE CASCADE,

    day_number INTEGER,

    visit_order INTEGER,

    planned_start_time TIME,

    planned_duration_minutes INTEGER,

    notes TEXT,

    UNIQUE(trip_id, place_id)
);


-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_cities_country
ON cities(country_id);

CREATE INDEX idx_places_city
ON places(city_id);

CREATE INDEX idx_places_category
ON places(category_id);

CREATE INDEX idx_events_place
ON events(place_id);

CREATE INDEX idx_activities_place
ON activities(place_id);

CREATE INDEX idx_trip_places_trip
ON trip_places(trip_id);

CREATE INDEX idx_places_location
ON places
USING GIST(location);

CREATE INDEX idx_cities_location
ON cities
USING GIST(location);