-- ============================================
-- TRAVEL PLANNER DEMO DATA
-- ============================================

-- COUNTRY

INSERT INTO countries (name, iso_code)
VALUES ('France', 'FR')
ON CONFLICT DO NOTHING;


-- CITY

INSERT INTO cities (country_id, name, location)
SELECT
    id,
    'Paris',
    ST_SetSRID(
        ST_MakePoint(2.3522, 48.8566),
        4326
    )::geography
FROM countries
WHERE iso_code = 'FR'
ON CONFLICT DO NOTHING;


-- CATEGORIES

INSERT INTO place_categories (name)
VALUES
    ('Landmark'),
    ('Museum'),
    ('District'),
    ('Park'),
    ('Restaurant')
ON CONFLICT DO NOTHING;


-- PLACES

INSERT INTO places (
    city_id,
    category_id,
    name,
    description,
    location
)

SELECT
    c.id,
    pc.id,
    'Eiffel Tower',
    'One of the most recognizable landmarks in Paris.',
    ST_SetSRID(
        ST_MakePoint(2.2945, 48.8584),
        4326
    )::geography

FROM cities c
JOIN place_categories pc
    ON pc.name = 'Landmark'

WHERE c.name = 'Paris';


INSERT INTO places (
    city_id,
    category_id,
    name,
    description,
    location
)

SELECT
    c.id,
    pc.id,
    'Louvre Museum',
    'A major museum containing a vast collection of art and historical objects.',
    ST_SetSRID(
        ST_MakePoint(2.3376, 48.8606),
        4326
    )::geography

FROM cities c
JOIN place_categories pc
    ON pc.name = 'Museum'

WHERE c.name = 'Paris';


INSERT INTO places (
    city_id,
    category_id,
    name,
    description,
    location
)

SELECT
    c.id,
    pc.id,
    'Arc de Triomphe',
    'Historic monument located at the western end of the Champs-Élysées.',
    ST_SetSRID(
        ST_MakePoint(2.2950, 48.8738),
        4326
    )::geography

FROM cities c
JOIN place_categories pc
    ON pc.name = 'Landmark'

WHERE c.name = 'Paris';


INSERT INTO places (
    city_id,
    category_id,
    name,
    description,
    location
)

SELECT
    c.id,
    pc.id,
    'Montmartre',
    'Historic Paris district known for its artistic history and Sacré-Cœur.',
    ST_SetSRID(
        ST_MakePoint(2.3431, 48.8867),
        4326
    )::geography

FROM cities c
JOIN place_categories pc
    ON pc.name = 'District'

WHERE c.name = 'Paris';


-- ============================================
-- TRAVEL INFORMATION
-- ============================================

INSERT INTO travel_information (
    place_id,
    best_time_start,
    best_time_end,
    recommended_duration_minutes,
    best_season,
    travel_tips
)

SELECT
    id,
    '18:00',
    '21:00',
    150,
    'Spring / Summer',
    'Evening visits can provide good views and illumination.'
FROM places
WHERE name = 'Eiffel Tower';


INSERT INTO travel_information (
    place_id,
    best_time_start,
    best_time_end,
    recommended_duration_minutes,
    best_season,
    travel_tips
)

SELECT
    id,
    '09:00',
    '12:00',
    240,
    'All year',
    'Allow several hours if you want to explore the major collections.'
FROM places
WHERE name = 'Louvre Museum';


INSERT INTO travel_information (
    place_id,
    best_time_start,
    best_time_end,
    recommended_duration_minutes,
    best_season,
    travel_tips
)

SELECT
    id,
    '16:00',
    '19:00',
    90,
    'Spring / Summer',
    'Late afternoon can be useful for combining the visit with nearby attractions.'
FROM places
WHERE name = 'Arc de Triomphe';


INSERT INTO travel_information (
    place_id,
    best_time_start,
    best_time_end,
    recommended_duration_minutes,
    best_season,
    travel_tips
)

SELECT
    id,
    '09:00',
    '12:00',
    180,
    'Spring / Autumn',
    'Wear comfortable shoes because the district has steep streets.'
FROM places
WHERE name = 'Montmartre';