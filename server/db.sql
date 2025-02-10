--
-- PostgreSQL database dump
--

-- Dumped from database version 15.4
-- Dumped by pg_dump version 16.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: helper_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.helper_type AS ENUM (
    'volunteer',
    'caregiver',
    'medical_professional'
);


ALTER TYPE public.helper_type OWNER TO postgres;

--
-- Name: create_notification_on_insert(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_notification_on_insert() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Update existing notification if exists, otherwise insert new one
    IF TG_ARGV[0] = 'patient' THEN
        INSERT INTO notifications (entity_type, entity_id, entity_name, message)
        VALUES (
            TG_ARGV[0],
            NEW.id,
            NEW.patient_name,
            'New patient ' || NEW.patient_name || ' registered requiring ' || NEW.support_type || ' support'
        )
        ON CONFLICT (entity_type, entity_id) 
        DO UPDATE SET 
            message = EXCLUDED.message,
            created_at = CURRENT_TIMESTAMP,
            is_read = false;
    ELSIF TG_ARGV[0] = 'volunteer' THEN
        INSERT INTO notifications (entity_type, entity_id, entity_name, message)
        VALUES (
            TG_ARGV[0],
            NEW.id,
            NEW.name,
            'New volunteer ' || NEW.name || ' registered with skills: ' || COALESCE(NEW.skills, 'Not specified')
        )
        ON CONFLICT (entity_type, entity_id) 
        DO UPDATE SET 
            message = EXCLUDED.message,
            created_at = CURRENT_TIMESTAMP,
            is_read = false;
    ELSIF TG_ARGV[0] = 'medical_professional' THEN
        INSERT INTO notifications (entity_type, entity_id, entity_name, message)
        VALUES (
            TG_ARGV[0],
            NEW.id,
            NEW.name,
            'New medical professional ' || NEW.name || ' registered. Specialization: ' || COALESCE(NEW.specialization, 'Not specified')
        )
        ON CONFLICT (entity_type, entity_id) 
        DO UPDATE SET 
            message = EXCLUDED.message,
            created_at = CURRENT_TIMESTAMP,
            is_read = false;
    ELSIF TG_ARGV[0] = 'caregiver' THEN
        INSERT INTO notifications (entity_type, entity_id, entity_name, message)
        VALUES (
            TG_ARGV[0],
            NEW.id,
            NEW.name,
            'New caregiver ' || NEW.name || ' registered with experience: ' || COALESCE(NEW.experience, 'Not specified')
        )
        ON CONFLICT (entity_type, entity_id) 
        DO UPDATE SET 
            message = EXCLUDED.message,
            created_at = CURRENT_TIMESTAMP,
            is_read = false;
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.create_notification_on_insert() OWNER TO postgres;

--
-- Name: delete_helper_assignments(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.delete_helper_assignments() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    DELETE FROM assignments 
    WHERE helper_id = OLD.id AND helper_type = TG_ARGV[0]::helper_type;
    RETURN OLD;
END;
$$;


ALTER FUNCTION public.delete_helper_assignments() OWNER TO postgres;

--
-- Name: generate_register_number(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_register_number() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    current_year int;
    last_register varchar(10);
    current_number int;
BEGIN
    -- Get the current year
    current_year := EXTRACT(YEAR FROM CURRENT_DATE);
    
    -- Get the last register number for the current year
    SELECT register_number 
    INTO last_register
    FROM public.patients
    WHERE register_number LIKE '%/' || current_year
    ORDER BY register_number DESC
    LIMIT 1;
    
    IF last_register IS NULL THEN
        -- First patient of the year
        current_number := 1;
    ELSE
        -- Extract the number before the slash and increment it
        current_number := CAST(SPLIT_PART(last_register, '/', 1) AS INTEGER) + 1;
    END IF;
    
    -- Format the new register number
    NEW.register_number := LPAD(current_number::text, 2, '0') || '/' || current_year;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.generate_register_number() OWNER TO postgres;

--
-- Name: set_created_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_created_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.created_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.set_created_at() OWNER TO postgres;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admins; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admins (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    password character varying(255) NOT NULL
);


ALTER TABLE public.admins OWNER TO postgres;

--
-- Name: admins_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.admins_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admins_id_seq OWNER TO postgres;

--
-- Name: admins_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.admins_id_seq OWNED BY public.admins.id;


--
-- Name: assignments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assignments (
    id integer NOT NULL,
    patient_id integer,
    helper_id integer NOT NULL,
    helper_type public.helper_type NOT NULL,
    assigned_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(20) DEFAULT 'active'::character varying
);


ALTER TABLE public.assignments OWNER TO postgres;

--
-- Name: assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.assignments_id_seq OWNER TO postgres;

--
-- Name: assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.assignments_id_seq OWNED BY public.assignments.id;


--
-- Name: caregivers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.caregivers (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    phone_number character varying(50) NOT NULL,
    address text NOT NULL,
    availability text,
    experience text,
    certifications text,
    notes text,
    is_new boolean DEFAULT true,
    last_viewed_at timestamp with time zone
);


ALTER TABLE public.caregivers OWNER TO postgres;

--
-- Name: caregivers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.caregivers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.caregivers_id_seq OWNER TO postgres;

--
-- Name: caregivers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.caregivers_id_seq OWNED BY public.caregivers.id;


--
-- Name: emergency_fund; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.emergency_fund (
    id integer NOT NULL,
    photo_url text,
    name character varying(100) NOT NULL,
    details text,
    account_number character varying(20),
    ifsc_code character varying(11),
    upi_id character varying(50),
    qr_code_url text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.emergency_fund OWNER TO postgres;

--
-- Name: emergency_fund_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.emergency_fund_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.emergency_fund_id_seq OWNER TO postgres;

--
-- Name: emergency_fund_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.emergency_fund_id_seq OWNED BY public.emergency_fund.id;


--
-- Name: equipment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.equipment (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    type character varying(50) NOT NULL,
    quantity integer DEFAULT 0 NOT NULL,
    status character varying(20) DEFAULT 'Available'::character varying,
    condition character varying(50),
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    image_url character varying(255),
    CONSTRAINT equipment_status_check CHECK (((status)::text = ANY ((ARRAY['Available'::character varying, 'In Use'::character varying, 'Under Maintenance'::character varying, 'Out of Service'::character varying])::text[])))
);


ALTER TABLE public.equipment OWNER TO postgres;

--
-- Name: equipment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.equipment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.equipment_id_seq OWNER TO postgres;

--
-- Name: equipment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.equipment_id_seq OWNED BY public.equipment.id;


--
-- Name: health_status; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.health_status (
    id integer NOT NULL,
    patient_id integer,
    disease character varying(255),
    medication text,
    note text,
    note_date date
);


ALTER TABLE public.health_status OWNER TO postgres;

--
-- Name: health_status_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.health_status_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.health_status_id_seq OWNER TO postgres;

--
-- Name: health_status_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.health_status_id_seq OWNED BY public.health_status.id;


--
-- Name: medical_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medical_history (
    id integer NOT NULL,
    patient_id integer,
    history text
);


ALTER TABLE public.medical_history OWNER TO postgres;

--
-- Name: medical_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.medical_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.medical_history_id_seq OWNER TO postgres;

--
-- Name: medical_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.medical_history_id_seq OWNED BY public.medical_history.id;


--
-- Name: medical_professionals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medical_professionals (
    id integer NOT NULL,
    name character varying(30) NOT NULL,
    email character varying(100),
    phone_number character varying(10) NOT NULL,
    address text NOT NULL,
    availability text,
    specialization character varying(100),
    license_number character varying(50),
    experience text,
    notes text,
    is_new boolean DEFAULT true,
    last_viewed_at timestamp with time zone
);


ALTER TABLE public.medical_professionals OWNER TO postgres;

--
-- Name: medical_professionals_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.medical_professionals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.medical_professionals_id_seq OWNER TO postgres;

--
-- Name: medical_professionals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.medical_professionals_id_seq OWNED BY public.medical_professionals.id;


--
-- Name: medical_proxies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medical_proxies (
    id integer NOT NULL,
    patient_id integer,
    name character varying(30),
    relation character varying(10),
    phone_number numeric(10,0)
);


ALTER TABLE public.medical_proxies OWNER TO postgres;

--
-- Name: medical_proxies_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.medical_proxies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.medical_proxies_id_seq OWNER TO postgres;

--
-- Name: medical_proxies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.medical_proxies_id_seq OWNED BY public.medical_proxies.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    entity_type character varying(50) NOT NULL,
    entity_id integer NOT NULL,
    entity_name character varying(255) NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: patient_number_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.patient_number_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.patient_number_seq OWNER TO postgres;

--
-- Name: patient_statistics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patient_statistics (
    id integer NOT NULL,
    date date NOT NULL,
    total_patients_cumulative bigint,
    total_patients_current_month bigint,
    home_care_patients bigint,
    dropout_patients bigint,
    physiotherapy_patients bigint,
    psychiatric_patients bigint,
    psychiatric_dropout_patients bigint,
    psychiatric_transfer_out bigint,
    transfer_out_patients bigint,
    care_comprises bigint,
    active_psychiatric_patients bigint,
    cancer_patients bigint,
    peripheral_vascular_disease bigint,
    chronic_kidney_disease bigint,
    cerebrovascular_accident bigint,
    paraplegia_patients bigint,
    other_patients bigint,
    total_deaths_cumulative bigint,
    patients_above_80 bigint,
    patients_below_18 bigint
);


ALTER TABLE public.patient_statistics OWNER TO postgres;

--
-- Name: patient_statistics_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.patient_statistics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.patient_statistics_id_seq OWNER TO postgres;

--
-- Name: patient_statistics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.patient_statistics_id_seq OWNED BY public.patient_statistics.id;


--
-- Name: patients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patients (
    id integer NOT NULL,
    first_name character varying(30),
    initial_treatment_date date,
    dob date,
    age integer,
    gender character varying(8),
    address text,
    phone_number numeric(10,0),
    doctor character varying(30),
    caregiver character varying(30),
    support_type character varying(50),
    original_id integer,
    place character varying(500) DEFAULT 'Not Specified'::character varying,
    additional_notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    viewed_at timestamp without time zone,
    register_number character varying(10)
);


ALTER TABLE public.patients OWNER TO postgres;

--
-- Name: patients_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.patients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.patients_id_seq OWNER TO postgres;

--
-- Name: patients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.patients_id_seq OWNED BY public.patients.id;


--
-- Name: patients_register; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patients_register (
    id integer NOT NULL,
    patient_name character varying(255) NOT NULL,
    contact_name character varying(255),
    contact_email character varying(255),
    contact_phone_number character varying(50) NOT NULL,
    place character varying(20) NOT NULL,
    address text NOT NULL,
    health_condition text,
    care_details text,
    notes text,
    support_type character varying(20) DEFAULT 'others'::character varying NOT NULL,
    is_new boolean DEFAULT true,
    last_viewed_at timestamp with time zone
);


ALTER TABLE public.patients_register OWNER TO postgres;

--
-- Name: patients_register_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.patients_register_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.patients_register_id_seq OWNER TO postgres;

--
-- Name: patients_register_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.patients_register_id_seq OWNED BY public.patients_register.id;


--
-- Name: schedules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.schedules (
    id integer NOT NULL,
    patient_name character varying(255) NOT NULL,
    member_name character varying(255) NOT NULL,
    visit_date date NOT NULL,
    visit_time time without time zone NOT NULL,
    visit_type character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    notes text
);


ALTER TABLE public.schedules OWNER TO postgres;

--
-- Name: schedules_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.schedules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.schedules_id_seq OWNER TO postgres;

--
-- Name: schedules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.schedules_id_seq OWNED BY public.schedules.id;


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tasks (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    category character varying(50) NOT NULL,
    priority character varying(20) NOT NULL,
    assigned_to character varying(100),
    due_date date,
    due_time time without time zone,
    status character varying(20) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    assigned_member character varying(255),
    CONSTRAINT tasks_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'completed'::character varying])::text[])))
);


ALTER TABLE public.tasks OWNER TO postgres;

--
-- Name: tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tasks_id_seq OWNER TO postgres;

--
-- Name: tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tasks_id_seq OWNED BY public.tasks.id;


--
-- Name: vcm; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vcm (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    password_hash character varying(255) NOT NULL
);


ALTER TABLE public.vcm OWNER TO postgres;

--
-- Name: vcm_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vcm_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vcm_id_seq OWNER TO postgres;

--
-- Name: vcm_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vcm_id_seq OWNED BY public.vcm.id;


--
-- Name: volunteers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.volunteers (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    phone_number character varying(50) NOT NULL,
    address text NOT NULL,
    availability text,
    skills text,
    notes text,
    is_new boolean DEFAULT true,
    last_viewed_at timestamp with time zone
);


ALTER TABLE public.volunteers OWNER TO postgres;

--
-- Name: volunteers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.volunteers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.volunteers_id_seq OWNER TO postgres;

--
-- Name: volunteers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.volunteers_id_seq OWNED BY public.volunteers.id;


--
-- Name: admins id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins ALTER COLUMN id SET DEFAULT nextval('public.admins_id_seq'::regclass);


--
-- Name: assignments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignments ALTER COLUMN id SET DEFAULT nextval('public.assignments_id_seq'::regclass);


--
-- Name: caregivers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.caregivers ALTER COLUMN id SET DEFAULT nextval('public.caregivers_id_seq'::regclass);


--
-- Name: emergency_fund id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.emergency_fund ALTER COLUMN id SET DEFAULT nextval('public.emergency_fund_id_seq'::regclass);


--
-- Name: equipment id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment ALTER COLUMN id SET DEFAULT nextval('public.equipment_id_seq'::regclass);


--
-- Name: health_status id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.health_status ALTER COLUMN id SET DEFAULT nextval('public.health_status_id_seq'::regclass);


--
-- Name: medical_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_history ALTER COLUMN id SET DEFAULT nextval('public.medical_history_id_seq'::regclass);


--
-- Name: medical_professionals id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_professionals ALTER COLUMN id SET DEFAULT nextval('public.medical_professionals_id_seq'::regclass);


--
-- Name: medical_proxies id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_proxies ALTER COLUMN id SET DEFAULT nextval('public.medical_proxies_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: patient_statistics id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_statistics ALTER COLUMN id SET DEFAULT nextval('public.patient_statistics_id_seq'::regclass);


--
-- Name: patients id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients ALTER COLUMN id SET DEFAULT nextval('public.patients_id_seq'::regclass);


--
-- Name: patients_register id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients_register ALTER COLUMN id SET DEFAULT nextval('public.patients_register_id_seq'::regclass);


--
-- Name: schedules id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedules ALTER COLUMN id SET DEFAULT nextval('public.schedules_id_seq'::regclass);


--
-- Name: tasks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks ALTER COLUMN id SET DEFAULT nextval('public.tasks_id_seq'::regclass);


--
-- Name: vcm id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vcm ALTER COLUMN id SET DEFAULT nextval('public.vcm_id_seq'::regclass);


--
-- Name: volunteers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.volunteers ALTER COLUMN id SET DEFAULT nextval('public.volunteers_id_seq'::regclass);


--
-- Data for Name: admins; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admins (id, username, password) FROM stdin;
\.


--
-- Data for Name: assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assignments (id, patient_id, helper_id, helper_type, assigned_date, status) FROM stdin;
\.


--
-- Data for Name: caregivers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.caregivers (id, name, email, phone_number, address, availability, experience, certifications, notes, is_new, last_viewed_at) FROM stdin;
\.


--
-- Data for Name: emergency_fund; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.emergency_fund (id, photo_url, name, details, account_number, ifsc_code, upi_id, qr_code_url, created_at) FROM stdin;
\.


--
-- Data for Name: equipment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.equipment (id, name, type, quantity, status, condition, notes, created_at, updated_at, image_url) FROM stdin;
\.


--
-- Data for Name: health_status; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.health_status (id, patient_id, disease, medication, note, note_date) FROM stdin;
\.


--
-- Data for Name: medical_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.medical_history (id, patient_id, history) FROM stdin;
\.


--
-- Data for Name: medical_professionals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.medical_professionals (id, name, email, phone_number, address, availability, specialization, license_number, experience, notes, is_new, last_viewed_at) FROM stdin;
\.


--
-- Data for Name: medical_proxies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.medical_proxies (id, patient_id, name, relation, phone_number) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, entity_type, entity_id, entity_name, message, is_read, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: patient_statistics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.patient_statistics (id, date, total_patients_cumulative, total_patients_current_month, home_care_patients, dropout_patients, physiotherapy_patients, psychiatric_patients, psychiatric_dropout_patients, psychiatric_transfer_out, transfer_out_patients, care_comprises, active_psychiatric_patients, cancer_patients, peripheral_vascular_disease, chronic_kidney_disease, cerebrovascular_accident, paraplegia_patients, other_patients, total_deaths_cumulative, patients_above_80, patients_below_18) FROM stdin;
1	2026-03-01	23334	12334	34	3	55	6	7	888	9	101	1	2	3	44	555	6	7	8	99	10
\.


--
-- Data for Name: patients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.patients (id, first_name, initial_treatment_date, dob, age, gender, address, phone_number, doctor, caregiver, support_type, original_id, place, additional_notes, created_at, viewed_at, register_number) FROM stdin;
\.


--
-- Data for Name: patients_register; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.patients_register (id, patient_name, contact_name, contact_email, contact_phone_number, place, address, health_condition, care_details, notes, support_type, is_new, last_viewed_at) FROM stdin;
\.


--
-- Data for Name: schedules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.schedules (id, patient_name, member_name, visit_date, visit_time, visit_type, created_at, notes) FROM stdin;
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tasks (id, title, description, category, priority, assigned_to, due_date, due_time, status, created_at, assigned_member) FROM stdin;
\.


--
-- Data for Name: vcm; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vcm (id, username, password_hash) FROM stdin;
\.


--
-- Data for Name: volunteers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.volunteers (id, name, email, phone_number, address, availability, skills, notes, is_new, last_viewed_at) FROM stdin;
\.


--
-- Name: admins_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admins_id_seq', 3, true);


--
-- Name: assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.assignments_id_seq', 89, true);


--
-- Name: caregivers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.caregivers_id_seq', 51, true);


--
-- Name: emergency_fund_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.emergency_fund_id_seq', 27, true);


--
-- Name: equipment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.equipment_id_seq', 33, true);


--
-- Name: health_status_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.health_status_id_seq', 97, true);


--
-- Name: medical_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.medical_history_id_seq', 282, true);


--
-- Name: medical_professionals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.medical_professionals_id_seq', 31, true);


--
-- Name: medical_proxies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.medical_proxies_id_seq', 86, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 145, true);


--
-- Name: patient_number_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.patient_number_seq', 1, false);


--
-- Name: patient_statistics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.patient_statistics_id_seq', 1, false);


--
-- Name: patients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.patients_id_seq', 181, true);


--
-- Name: patients_register_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.patients_register_id_seq', 63, true);


--
-- Name: schedules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.schedules_id_seq', 58, true);


--
-- Name: tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tasks_id_seq', 99, true);


--
-- Name: vcm_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vcm_id_seq', 6, true);


--
-- Name: volunteers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.volunteers_id_seq', 78, true);


--
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (id);


--
-- Name: admins admins_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_username_key UNIQUE (username);


--
-- Name: assignments assignments_patient_id_helper_type_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_patient_id_helper_type_key UNIQUE (patient_id, helper_type);


--
-- Name: assignments assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_pkey PRIMARY KEY (id);


--
-- Name: caregivers caregivers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.caregivers
    ADD CONSTRAINT caregivers_pkey PRIMARY KEY (id);


--
-- Name: emergency_fund emergency_fund_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.emergency_fund
    ADD CONSTRAINT emergency_fund_pkey PRIMARY KEY (id);


--
-- Name: equipment equipment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_pkey PRIMARY KEY (id);


--
-- Name: health_status health_status_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.health_status
    ADD CONSTRAINT health_status_pkey PRIMARY KEY (id);


--
-- Name: medical_history medical_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_history
    ADD CONSTRAINT medical_history_pkey PRIMARY KEY (id);


--
-- Name: medical_professionals medical_professionals_license_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_professionals
    ADD CONSTRAINT medical_professionals_license_number_key UNIQUE (license_number);


--
-- Name: medical_professionals medical_professionals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_professionals
    ADD CONSTRAINT medical_professionals_pkey PRIMARY KEY (id);


--
-- Name: medical_proxies medical_proxies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_proxies
    ADD CONSTRAINT medical_proxies_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: patient_statistics patient_statistics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_statistics
    ADD CONSTRAINT patient_statistics_pkey PRIMARY KEY (id);


--
-- Name: patients patients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (id);


--
-- Name: patients_register patients_register_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients_register
    ADD CONSTRAINT patients_register_pkey PRIMARY KEY (id);


--
-- Name: schedules schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedules
    ADD CONSTRAINT schedules_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: notifications unique_notification_entry; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT unique_notification_entry UNIQUE (entity_type, entity_id);


--
-- Name: health_status unique_patient_health_status; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.health_status
    ADD CONSTRAINT unique_patient_health_status UNIQUE (patient_id);


--
-- Name: medical_proxies unique_patient_proxy; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_proxies
    ADD CONSTRAINT unique_patient_proxy UNIQUE (patient_id);


--
-- Name: vcm vcm_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vcm
    ADD CONSTRAINT vcm_pkey PRIMARY KEY (id);


--
-- Name: vcm vcm_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vcm
    ADD CONSTRAINT vcm_username_key UNIQUE (username);


--
-- Name: volunteers volunteers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.volunteers
    ADD CONSTRAINT volunteers_pkey PRIMARY KEY (id);


--
-- Name: unique_patient_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_patient_id ON public.medical_history USING btree (patient_id);


--
-- Name: caregivers delete_caregiver_assignments; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER delete_caregiver_assignments AFTER DELETE ON public.caregivers FOR EACH ROW EXECUTE FUNCTION public.delete_helper_assignments('caregiver');


--
-- Name: medical_professionals delete_medical_professional_assignments; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER delete_medical_professional_assignments AFTER DELETE ON public.medical_professionals FOR EACH ROW EXECUTE FUNCTION public.delete_helper_assignments('medical_professional');


--
-- Name: volunteers delete_volunteer_assignments; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER delete_volunteer_assignments AFTER DELETE ON public.volunteers FOR EACH ROW EXECUTE FUNCTION public.delete_helper_assignments('volunteer');


--
-- Name: caregivers notify_caregiver; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER notify_caregiver AFTER INSERT ON public.caregivers FOR EACH ROW EXECUTE FUNCTION public.create_notification_on_insert('caregiver');


--
-- Name: medical_professionals notify_medical_professional; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER notify_medical_professional AFTER INSERT ON public.medical_professionals FOR EACH ROW EXECUTE FUNCTION public.create_notification_on_insert('medical_professional');


--
-- Name: caregivers notify_new_caregiver; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER notify_new_caregiver AFTER INSERT ON public.caregivers FOR EACH ROW EXECUTE FUNCTION public.create_notification_on_insert('caregiver');


--
-- Name: medical_professionals notify_new_medical_professional; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER notify_new_medical_professional AFTER INSERT ON public.medical_professionals FOR EACH ROW EXECUTE FUNCTION public.create_notification_on_insert('medical_professional');


--
-- Name: patients_register notify_new_patient; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER notify_new_patient AFTER INSERT ON public.patients_register FOR EACH ROW EXECUTE FUNCTION public.create_notification_on_insert('patient');


--
-- Name: volunteers notify_new_volunteer; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER notify_new_volunteer AFTER INSERT ON public.volunteers FOR EACH ROW EXECUTE FUNCTION public.create_notification_on_insert('volunteer');


--
-- Name: patients_register notify_patient; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER notify_patient AFTER INSERT ON public.patients_register FOR EACH ROW EXECUTE FUNCTION public.create_notification_on_insert('patient');


--
-- Name: volunteers notify_volunteer; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER notify_volunteer AFTER INSERT ON public.volunteers FOR EACH ROW EXECUTE FUNCTION public.create_notification_on_insert('volunteer');


--
-- Name: patients patients_created_at_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER patients_created_at_trigger BEFORE INSERT ON public.patients FOR EACH ROW EXECUTE FUNCTION public.set_created_at();


--
-- Name: patients set_register_number; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_register_number BEFORE INSERT ON public.patients FOR EACH ROW EXECUTE FUNCTION public.generate_register_number();


--
-- Name: equipment update_equipment_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON public.equipment FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: notifications update_notifications_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: assignments assignments_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;


--
-- Name: health_status health_status_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.health_status
    ADD CONSTRAINT health_status_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;


--
-- Name: medical_history medical_history_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_history
    ADD CONSTRAINT medical_history_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;


--
-- Name: medical_proxies medical_proxies_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_proxies
    ADD CONSTRAINT medical_proxies_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;


--
-- Name: patients patients_original_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_original_id_fkey FOREIGN KEY (original_id) REFERENCES public.patients_register(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

