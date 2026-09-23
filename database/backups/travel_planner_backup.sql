--
-- PostgreSQL database dump
--

\restrict mrHi1MReqZj49z2vit3DeTMfMsbcwkNThaKMaihifZTvjZle4h7P6sQUA4HYGa9

-- Dumped from database version 18.6 (Ubuntu 18.6-0ubuntu0.26.04.1)
-- Dumped by pg_dump version 18.6 (Ubuntu 18.6-0ubuntu0.26.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activities; Type: TABLE; Schema: public; Owner: animesh
--

CREATE TABLE public.activities (
    id bigint NOT NULL,
    place_id bigint,
    name character varying(255) NOT NULL,
    description text,
    duration_minutes integer,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.activities OWNER TO animesh;

--
-- Name: activities_id_seq; Type: SEQUENCE; Schema: public; Owner: animesh
--

CREATE SEQUENCE public.activities_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.activities_id_seq OWNER TO animesh;

--
-- Name: activities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: animesh
--

ALTER SEQUENCE public.activities_id_seq OWNED BY public.activities.id;


--
-- Name: cities; Type: TABLE; Schema: public; Owner: animesh
--

CREATE TABLE public.cities (
    id bigint NOT NULL,
    country_id bigint NOT NULL,
    name character varying(150) NOT NULL,
    location public.geography(Point,4326),
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.cities OWNER TO animesh;

--
-- Name: cities_id_seq; Type: SEQUENCE; Schema: public; Owner: animesh
--

CREATE SEQUENCE public.cities_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cities_id_seq OWNER TO animesh;

--
-- Name: cities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: animesh
--

ALTER SEQUENCE public.cities_id_seq OWNED BY public.cities.id;


--
-- Name: countries; Type: TABLE; Schema: public; Owner: animesh
--

CREATE TABLE public.countries (
    id bigint NOT NULL,
    name character varying(150) NOT NULL,
    iso_code character varying(10),
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.countries OWNER TO animesh;

--
-- Name: countries_id_seq; Type: SEQUENCE; Schema: public; Owner: animesh
--

CREATE SEQUENCE public.countries_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.countries_id_seq OWNER TO animesh;

--
-- Name: countries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: animesh
--

ALTER SEQUENCE public.countries_id_seq OWNED BY public.countries.id;


--
-- Name: events; Type: TABLE; Schema: public; Owner: animesh
--

CREATE TABLE public.events (
    id bigint NOT NULL,
    place_id bigint,
    name character varying(255) NOT NULL,
    description text,
    start_datetime timestamp with time zone,
    end_datetime timestamp with time zone,
    recurrence_rule text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.events OWNER TO animesh;

--
-- Name: events_id_seq; Type: SEQUENCE; Schema: public; Owner: animesh
--

CREATE SEQUENCE public.events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.events_id_seq OWNER TO animesh;

--
-- Name: events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: animesh
--

ALTER SEQUENCE public.events_id_seq OWNED BY public.events.id;


--
-- Name: place_categories; Type: TABLE; Schema: public; Owner: animesh
--

CREATE TABLE public.place_categories (
    id bigint NOT NULL,
    name character varying(100) NOT NULL
);


ALTER TABLE public.place_categories OWNER TO animesh;

--
-- Name: place_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: animesh
--

CREATE SEQUENCE public.place_categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.place_categories_id_seq OWNER TO animesh;

--
-- Name: place_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: animesh
--

ALTER SEQUENCE public.place_categories_id_seq OWNED BY public.place_categories.id;


--
-- Name: places; Type: TABLE; Schema: public; Owner: animesh
--

CREATE TABLE public.places (
    id bigint NOT NULL,
    city_id bigint,
    category_id bigint,
    name character varying(200) NOT NULL,
    description text,
    location public.geography(Point,4326),
    external_id character varying(255),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.places OWNER TO animesh;

--
-- Name: places_id_seq; Type: SEQUENCE; Schema: public; Owner: animesh
--

CREATE SEQUENCE public.places_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.places_id_seq OWNER TO animesh;

--
-- Name: places_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: animesh
--

ALTER SEQUENCE public.places_id_seq OWNED BY public.places.id;


--
-- Name: travel_information; Type: TABLE; Schema: public; Owner: animesh
--

CREATE TABLE public.travel_information (
    id bigint NOT NULL,
    place_id bigint NOT NULL,
    best_time_start time without time zone,
    best_time_end time without time zone,
    recommended_duration_minutes integer,
    best_season character varying(100),
    travel_tips text,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.travel_information OWNER TO animesh;

--
-- Name: travel_information_id_seq; Type: SEQUENCE; Schema: public; Owner: animesh
--

CREATE SEQUENCE public.travel_information_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.travel_information_id_seq OWNER TO animesh;

--
-- Name: travel_information_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: animesh
--

ALTER SEQUENCE public.travel_information_id_seq OWNED BY public.travel_information.id;


--
-- Name: trip_places; Type: TABLE; Schema: public; Owner: animesh
--

CREATE TABLE public.trip_places (
    id bigint NOT NULL,
    trip_id bigint NOT NULL,
    place_id bigint NOT NULL,
    day_number integer,
    visit_order integer,
    planned_start_time time without time zone,
    planned_duration_minutes integer,
    notes text
);


ALTER TABLE public.trip_places OWNER TO animesh;

--
-- Name: trip_places_id_seq; Type: SEQUENCE; Schema: public; Owner: animesh
--

CREATE SEQUENCE public.trip_places_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.trip_places_id_seq OWNER TO animesh;

--
-- Name: trip_places_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: animesh
--

ALTER SEQUENCE public.trip_places_id_seq OWNED BY public.trip_places.id;


--
-- Name: trips; Type: TABLE; Schema: public; Owner: animesh
--

CREATE TABLE public.trips (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    destination_city_id bigint,
    start_date date,
    end_date date,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.trips OWNER TO animesh;

--
-- Name: trips_id_seq; Type: SEQUENCE; Schema: public; Owner: animesh
--

CREATE SEQUENCE public.trips_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.trips_id_seq OWNER TO animesh;

--
-- Name: trips_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: animesh
--

ALTER SEQUENCE public.trips_id_seq OWNED BY public.trips.id;


--
-- Name: activities id; Type: DEFAULT; Schema: public; Owner: animesh
--

ALTER TABLE ONLY public.activities ALTER COLUMN id SET DEFAULT nextval('public.activities_id_seq'::regclass);


--
-- Name: cities id; Type: DEFAULT; Schema: public; Owner: animesh
--

ALTER TABLE ONLY public.cities ALTER COLUMN id SET DEFAULT nextval('public.cities_id_seq'::regclass);


--
-- Name: countries id; Type: DEFAULT; Schema: public; Owner: animesh
--

ALTER TABLE ONLY public.countries ALTER COLUMN id SET DEFAULT nextval('public.countries_id_seq'::regclass);


--
-- Name: events id; Type: DEFAULT; Schema: public; Owner: animesh
--

ALTER TABLE ONLY public.events ALTER COLUMN id SET DEFAULT nextval('public.events_id_seq'::regclass);


--
-- Name: place_categories id; Type: DEFAULT; Schema: public; Owner: animesh
--

ALTER TABLE ONLY public.place_categories ALTER COLUMN id SET DEFAULT nextval('public.place_categories_id_seq'::regclass);


--
-- Name: places id; Type: DEFAULT; Schema: public; Owner: animesh
--

ALTER TABLE ONLY public.places ALTER COLUMN id SET DEFAULT nextval('public.places_id_seq'::regclass);


--
-- Name: travel_information id; Type: DEFAULT; Schema: public; Owner: animesh
--

ALTER TABLE ONLY public.travel_information ALTER COLUMN id SET DEFAULT nextval('public.travel_information_id_seq'::regclass);


--
-- Name: trip_places id; Type: DEFAULT; Schema: public; Owner: animesh
--

ALTER TABLE ONLY public.trip_places ALTER COLUMN id SET DEFAULT nextval('public.trip_places_id_seq'::regclass);


--
-- Name: trips id; Type: DEFAULT; Schema: public; Owner: animesh
--

ALTER TABLE ONLY public.trips ALTER COLUMN id SET DEFAULT nextval('public.trips_id_seq'::regclass);


--
-- Data for Name: activities; Type: TABLE DATA; Schema: public; Owner: animesh
--

COPY public.activities (id, place_id, name, description, duration_minutes, created_at) FROM stdin;
\.


--
-- Data for Name: cities; Type: TABLE DATA; Schema: public; Owner: animesh
--

COPY public.cities (id, country_id, name, location, created_at) FROM stdin;
1	1	Paris	0101000020E6100000A835CD3B4ED1024076E09C11A56D4840	2026-09-23 23:57:50.462367+05:30
\.


--
-- Data for Name: countries; Type: TABLE DATA; Schema: public; Owner: animesh
--

COPY public.countries (id, name, iso_code, created_at) FROM stdin;
1	France	FR	2026-09-23 23:57:50.459665+05:30
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: animesh
--

COPY public.events (id, place_id, name, description, start_datetime, end_datetime, recurrence_rule, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: place_categories; Type: TABLE DATA; Schema: public; Owner: animesh
--

COPY public.place_categories (id, name) FROM stdin;
1	Landmark
2	Museum
3	District
4	Park
5	Restaurant
\.


--
-- Data for Name: places; Type: TABLE DATA; Schema: public; Owner: animesh
--

COPY public.places (id, city_id, category_id, name, description, location, external_id, created_at, updated_at) FROM stdin;
2	1	2	Louvre Museum	A major museum containing a vast collection of art and historical objects.	0101000020E61000006C09F9A067B3024003780B24286E4840	\N	2026-09-23 23:57:50.496542+05:30	2026-09-23 23:57:50.496542+05:30
3	1	1	Arc de Triomphe	Historic monument located at the western end of the Champs-Élysées.	0101000020E61000005C8FC2F5285C0240569FABADD86F4840	\N	2026-09-23 23:57:50.497891+05:30	2026-09-23 23:57:50.497891+05:30
4	1	3	Montmartre	Historic Paris district known for its artistic history and Sacré-Cœur.	0101000020E6100000910F7A36ABBE02407DAEB6627F714840	\N	2026-09-23 23:57:50.499184+05:30	2026-09-23 23:57:50.499184+05:30
1	1	1	Eiffel Tower	One of the most recognizable landmarks in Paris.	0101000020E61000004260E5D0225B024076711B0DE06D4840	\N	2026-09-23 23:57:50.493715+05:30	2026-09-23 23:57:50.493715+05:30
\.


--
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
\.


--
-- Data for Name: travel_information; Type: TABLE DATA; Schema: public; Owner: animesh
--

COPY public.travel_information (id, place_id, best_time_start, best_time_end, recommended_duration_minutes, best_season, travel_tips, description, created_at, updated_at) FROM stdin;
1	1	18:00:00	21:00:00	150	Spring / Summer	Evening visits can provide good views and illumination.	\N	2026-09-23 23:57:50.500456+05:30	2026-09-23 23:57:50.500456+05:30
2	2	09:00:00	12:00:00	240	All year	Allow several hours if you want to explore the major collections.	\N	2026-09-23 23:57:50.502127+05:30	2026-09-23 23:57:50.502127+05:30
3	3	16:00:00	19:00:00	90	Spring / Summer	Late afternoon can be useful for combining the visit with nearby attractions.	\N	2026-09-23 23:57:50.503196+05:30	2026-09-23 23:57:50.503196+05:30
4	4	09:00:00	12:00:00	180	Spring / Autumn	Wear comfortable shoes because the district has steep streets.	\N	2026-09-23 23:57:50.504237+05:30	2026-09-23 23:57:50.504237+05:30
\.


--
-- Data for Name: trip_places; Type: TABLE DATA; Schema: public; Owner: animesh
--

COPY public.trip_places (id, trip_id, place_id, day_number, visit_order, planned_start_time, planned_duration_minutes, notes) FROM stdin;
\.


--
-- Data for Name: trips; Type: TABLE DATA; Schema: public; Owner: animesh
--

COPY public.trips (id, name, destination_city_id, start_date, end_date, created_at, updated_at) FROM stdin;
\.


--
-- Name: activities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: animesh
--

SELECT pg_catalog.setval('public.activities_id_seq', 1, false);


--
-- Name: cities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: animesh
--

SELECT pg_catalog.setval('public.cities_id_seq', 1, true);


--
-- Name: countries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: animesh
--

SELECT pg_catalog.setval('public.countries_id_seq', 1, true);


--
-- Name: events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: animesh
--

SELECT pg_catalog.setval('public.events_id_seq', 1, false);


--
-- Name: place_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: animesh
--

SELECT pg_catalog.setval('public.place_categories_id_seq', 5, true);


--
-- Name: places_id_seq; Type: SEQUENCE SET; Schema: public; Owner: animesh
--

SELECT pg_catalog.setval('public.places_id_seq', 4, true);


--
-- Name: travel_information_id_seq; Type: SEQUENCE SET; Schema: public; Owner: animesh
--

SELECT pg_catalog.setval('public.travel_information_id_seq', 4, true);


--
-- Name: trip_places_id_seq; Type: SEQUENCE SET; Schema: public; Owner: animesh
--

SELECT pg_catalog.setval('public.trip_places_id_seq', 1, false);


--
-- Name: trips_id_seq; Type: SEQUENCE SET; Schema: public; Owner: animesh
--

SELECT pg_catalog.setval('public.trips_id_seq', 1, false);


--
-- Name: activities activities_pkey; Type: CONSTRAINT; Schema: public; Owner: animesh
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_pkey PRIMARY KEY (id);


--
-- Name: cities cities_pkey; Type: CONSTRAINT; Schema: public; Owner: animesh
--

ALTER TABLE ONLY public.cities
    ADD CONSTRAINT cities_pkey PRIMARY KEY (id);


--
-- Name: countries countries_pkey; Type: CONSTRAINT; Schema: public; Owner: animesh
--

ALTER TABLE ONLY public.countries
    ADD CONSTRAINT countries_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: animesh
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: place_categories place_categories_name_key; Type: CONSTRAINT; Schema: public; Owner: animesh
--

ALTER TABLE ONLY public.place_categories
    ADD CONSTRAINT place_categories_name_key UNIQUE (name);


--
-- Name: place_categories place_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: animesh
--

ALTER TABLE ONLY public.place_categories
    ADD CONSTRAINT place_categories_pkey PRIMARY KEY (id);


--
-- Name: places places_pkey; Type: CONSTRAINT; Schema: public; Owner: animesh
--

ALTER TABLE ONLY public.places
    ADD CONSTRAINT places_pkey PRIMARY KEY (id);


--
-- Name: travel_information travel_information_pkey; Type: CONSTRAINT; Schema: public; Owner: animesh
--

ALTER TABLE ONLY public.travel_information
    ADD CONSTRAINT travel_information_pkey PRIMARY KEY (id);


--
-- Name: travel_information travel_information_place_id_key; Type: CONSTRAINT; Schema: public; Owner: animesh
--

ALTER TABLE ONLY public.travel_information
    ADD CONSTRAINT travel_information_place_id_key UNIQUE (place_id);


--
-- Name: trip_places trip_places_pkey; Type: CONSTRAINT; Schema: public; Owner: animesh
--

ALTER TABLE ONLY public.trip_places
    ADD CONSTRAINT trip_places_pkey PRIMARY KEY (id);


--
-- Name: trip_places trip_places_trip_id_place_id_key; Type: CONSTRAINT; Schema: public; Owner: animesh
--

ALTER TABLE ONLY public.trip_places
    ADD CONSTRAINT trip_places_trip_id_place_id_key UNIQUE (trip_id, place_id);


--
-- Name: trips trips_pkey; Type: CONSTRAINT; Schema: public; Owner: animesh
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_pkey PRIMARY KEY (id);


--
-- Name: idx_activities_place; Type: INDEX; Schema: public; Owner: animesh
--

CREATE INDEX idx_activities_place ON public.activities USING btree (place_id);


--
-- Name: idx_cities_country; Type: INDEX; Schema: public; Owner: animesh
--

CREATE INDEX idx_cities_country ON public.cities USING btree (country_id);


--
-- Name: idx_cities_location; Type: INDEX; Schema: public; Owner: animesh
--

CREATE INDEX idx_cities_location ON public.cities USING gist (location);


--
-- Name: idx_events_place; Type: INDEX; Schema: public; Owner: animesh
--

CREATE INDEX idx_events_place ON public.events USING btree (place_id);


--
-- Name: idx_places_category; Type: INDEX; Schema: public; Owner: animesh
--

CREATE INDEX idx_places_category ON public.places USING btree (category_id);


--
-- Name: idx_places_city; Type: INDEX; Schema: public; Owner: animesh
--

CREATE INDEX idx_places_city ON public.places USING btree (city_id);


--
-- Name: idx_places_location; Type: INDEX; Schema: public; Owner: animesh
--

CREATE INDEX idx_places_location ON public.places USING gist (location);


--
-- Name: idx_trip_places_trip; Type: INDEX; Schema: public; Owner: animesh
--

CREATE INDEX idx_trip_places_trip ON public.trip_places USING btree (trip_id);


--
-- Name: activities activities_place_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: animesh
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_place_id_fkey FOREIGN KEY (place_id) REFERENCES public.places(id) ON DELETE CASCADE;


--
-- Name: cities cities_country_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: animesh
--

ALTER TABLE ONLY public.cities
    ADD CONSTRAINT cities_country_id_fkey FOREIGN KEY (country_id) REFERENCES public.countries(id);


--
-- Name: events events_place_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: animesh
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_place_id_fkey FOREIGN KEY (place_id) REFERENCES public.places(id) ON DELETE CASCADE;


--
-- Name: places places_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: animesh
--

ALTER TABLE ONLY public.places
    ADD CONSTRAINT places_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.place_categories(id);


--
-- Name: places places_city_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: animesh
--

ALTER TABLE ONLY public.places
    ADD CONSTRAINT places_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.cities(id);


--
-- Name: travel_information travel_information_place_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: animesh
--

ALTER TABLE ONLY public.travel_information
    ADD CONSTRAINT travel_information_place_id_fkey FOREIGN KEY (place_id) REFERENCES public.places(id) ON DELETE CASCADE;


--
-- Name: trip_places trip_places_place_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: animesh
--

ALTER TABLE ONLY public.trip_places
    ADD CONSTRAINT trip_places_place_id_fkey FOREIGN KEY (place_id) REFERENCES public.places(id) ON DELETE CASCADE;


--
-- Name: trip_places trip_places_trip_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: animesh
--

ALTER TABLE ONLY public.trip_places
    ADD CONSTRAINT trip_places_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.trips(id) ON DELETE CASCADE;


--
-- Name: trips trips_destination_city_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: animesh
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_destination_city_id_fkey FOREIGN KEY (destination_city_id) REFERENCES public.cities(id);


--
-- PostgreSQL database dump complete
--

\unrestrict mrHi1MReqZj49z2vit3DeTMfMsbcwkNThaKMaihifZTvjZle4h7P6sQUA4HYGa9

