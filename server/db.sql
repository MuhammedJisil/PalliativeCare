--database
CREATE DATABASE palliative_care;


--admins table
CREATE TABLE admins (
    id SERIAL PRIMARY KEY, 
    username VARCHAR(50), 
    password VARCHAR(255)
);

CREATE TABLE vcm (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255)
);



-- Patients table
CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    original_id INTEGER REFERENCES patients_register(id),
    first_name VARCHAR(100),
    initial_treatment_date DATE,
    dob DATE,
    age INT,
    gender VARCHAR(10),
    address TEXT,
    phone_number VARCHAR(15),
    support_type VARCHAR(50),
    doctor VARCHAR(100),
    caregiver VARCHAR(100)
);

-- Health status table
CREATE TABLE health_status (
    id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(id),
    disease VARCHAR(255),
    medication TEXT,
    note TEXT,
    note_date DATE
);

-- Medical proxy table
CREATE TABLE medical_proxies (
    id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(id),
    name VARCHAR(100),
    relation VARCHAR(100),
    phone_number VARCHAR(15)
);

-- Medical history table
CREATE TABLE medical_history (
    id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(id),
    history TEXT
);

SELECT patient_id, COUNT(*)
FROM medical_history
GROUP BY patient_id
HAVING COUNT(*) > 1;

WITH cte AS (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY patient_id ORDER BY id) AS rn
    FROM medical_history
)
DELETE FROM medical_history
WHERE id IN (SELECT id FROM cte WHERE rn > 1);


CREATE UNIQUE INDEX unique_patient_id ON medical_history(patient_id);

-- Create Volunteers Table
CREATE TABLE volunteers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    availability TEXT,
    skills TEXT,
    notes TEXT
);


-- Medical professional table
CREATE TABLE  medical_professionals (
  id SERIAL PRIMARY KEY,
  name VARCHAR(30) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone_number VARCHAR(10) NOT NULL,
  address TEXT NOT NULL,
  availability TEXT,
  specialization VARCHAR(100) ,
  license_number VARCHAR(50) UNIQUE ,
  experience TEXT ,
  notes TEXT
);

-- Create Caregivers Table
CREATE TABLE caregivers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    availability TEXT,
    experience TEXT,
    certifications TEXT,
    notes TEXT
);

CREATE TABLE patients_register (
    id SERIAL PRIMARY KEY,
    patient_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone_number VARCHAR(50) NOT NULL,
    place VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    support_type VARCHAR(20) NOT NULL DEFAULT 'others',
    health_condition TEXT,
    care_details TEXT,
    notes TEXT
);

-- Todo list table
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  priority VARCHAR(20) NOT NULL,
  assigned_to VARCHAR(100),
  assigned_member VARCHAR(255)
  due_date DATE,
  due_time TIME,
   status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--schedule table
CREATE TABLE schedules (
    id SERIAL PRIMARY KEY,
    patient_name VARCHAR(255) NOT NULL, -- Patient's name
    member_name VARCHAR(255) NOT NULL,  -- Member's name (doctor/volunteer)
    visit_date DATE NOT NULL,
    visit_time TIME NOT NULL,
    visit_type VARCHAR(255) NOT NULL, -- Example: 'Doctor', 'Volunteer', etc.
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- emergency fund table
CREATE TABLE emergency_fund (
    id SERIAL PRIMARY KEY,
    photo_url TEXT,
    name VARCHAR(100) NOT NULL,
    details TEXT,
    account_number VARCHAR(20),
    ifsc_code VARCHAR(11),
    upi_id VARCHAR(50),
    qr_code_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- patient assignment table
CREATE TYPE helper_type AS ENUM ('volunteer', 'caregiver', 'medical_professional');

CREATE TABLE assignments (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id),
    helper_id INTEGER NOT NULL,
    helper_type helper_type NOT NULL,
    assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active',
    UNIQUE(patient_id, helper_type)
);

-- equipment table
CREATE TABLE equipment (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) CHECK (status IN ('Available', 'In Use', 'Under Maintenance', 'Out of Service')) DEFAULT 'Available',
    condition VARCHAR(50),
	image_url VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_equipment_updated_at
    BEFORE UPDATE ON equipment
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- table changes 

-- patient table 

ALTER TABLE patients
ALTER COLUMN first_name TYPE VARCHAR(30),
ALTER COLUMN doctor TYPE VARCHAR(30),
ALTER COLUMN caregiver TYPE VARCHAR(30),
ALTER COLUMN gender TYPE VARCHAR(8);

ALTER TABLE patients
ALTER COLUMN phone_number TYPE NUMERIC(10, 0) USING phone_number::NUMERIC;


-- medical proxy table 

ALTER TABLE medical_proxies
ALTER COLUMN name TYPE VARCHAR(30),
ALTER COLUMN relation TYPE VARCHAR(10),
ALTER COLUMN phone_number TYPE NUMERIC(10, 0) 
USING phone_number::NUMERIC(10, 0);


ALTER TABLE assignments
DROP CONSTRAINT IF EXISTS assignments_patient_id_fkey;


ALTER TABLE assignments
ADD CONSTRAINT assignments_patient_id_fkey
FOREIGN KEY (patient_id)
REFERENCES patients(id)
ON DELETE CASCADE;

ALTER TABLE patients
DROP CONSTRAINT patients_original_id_fkey,
ADD CONSTRAINT patients_original_id_fkey
FOREIGN KEY (original_id) REFERENCES patients_register(id) ON DELETE SET NULL;


ALTER TABLE health_status
DROP CONSTRAINT health_status_patient_id_fkey,
ADD CONSTRAINT health_status_patient_id_fkey
FOREIGN KEY (patient_id)
REFERENCES patients(id)
ON DELETE CASCADE;

ALTER TABLE medical_history
DROP CONSTRAINT medical_history_patient_id_fkey,
ADD CONSTRAINT medical_history_patient_id_fkey
FOREIGN KEY (patient_id)
REFERENCES patients(id)
ON DELETE CASCADE;

ALTER TABLE medical_proxies
DROP CONSTRAINT medical_proxies_patient_id_fkey;

ALTER TABLE medical_proxies
ADD CONSTRAINT medical_proxies_patient_id_fkey
FOREIGN KEY (patient_id)
REFERENCES patients(id)
ON DELETE CASCADE;


-- Create notifications table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL, -- 'volunteer', 'medical_professional', 'caregiver', 'patient'
    entity_id INTEGER NOT NULL,
    entity_name VARCHAR(255) NOT NULL, -- Store the name for better notification messages
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION create_notification_on_insert()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_ARGV[0] = 'patient' THEN
        INSERT INTO notifications (entity_type, entity_id, entity_name, message)
        VALUES (
            TG_ARGV[0],
            NEW.id,
            NEW.patient_name,
            'New patient ' || NEW.patient_name || ' registered requiring ' || NEW.support_type || ' support'
        );
    ELSIF TG_ARGV[0] = 'volunteer' THEN
        INSERT INTO notifications (entity_type, entity_id, entity_name, message)
        VALUES (
            TG_ARGV[0],
            NEW.id,
            NEW.name,
            'New volunteer ' || NEW.name || ' registered with skills: ' || COALESCE(NEW.skills, 'Not specified')
        );
    ELSIF TG_ARGV[0] = 'medical_professional' THEN
        INSERT INTO notifications (entity_type, entity_id, entity_name, message)
        VALUES (
            TG_ARGV[0],
            NEW.id,
            NEW.name,
            'New medical professional ' || NEW.name || ' registered. Specialization: ' || COALESCE(NEW.specialization, 'Not specified')
        );
    ELSIF TG_ARGV[0] = 'caregiver' THEN
        INSERT INTO notifications (entity_type, entity_id, entity_name, message)
        VALUES (
            TG_ARGV[0],
            NEW.id,
            NEW.name,
            'New caregiver ' || NEW.name || ' registered with experience: ' || COALESCE(NEW.experience, 'Not specified')
        );
    END IF;

    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers
DROP TRIGGER IF EXISTS notify_new_volunteer ON volunteers;
DROP TRIGGER IF EXISTS notify_new_medical_professional ON medical_professionals;
DROP TRIGGER IF EXISTS notify_new_caregiver ON caregivers;
DROP TRIGGER IF EXISTS notify_new_patient ON patients_register;

-- Recreate triggers
CREATE TRIGGER notify_new_volunteer
    AFTER INSERT ON volunteers
    FOR EACH ROW
    EXECUTE FUNCTION create_notification_on_insert('volunteer');

CREATE TRIGGER notify_new_medical_professional
    AFTER INSERT ON medical_professionals
    FOR EACH ROW
    EXECUTE FUNCTION create_notification_on_insert('medical_professional');

CREATE TRIGGER notify_new_caregiver
    AFTER INSERT ON caregivers
    FOR EACH ROW
    EXECUTE FUNCTION create_notification_on_insert('caregiver');

CREATE TRIGGER notify_new_patient
    AFTER INSERT ON patients_register
    FOR EACH ROW
    EXECUTE FUNCTION create_notification_on_insert('patient');

    -- Then modify the table to prevent future duplicates
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS unique_recent_notification;
ALTER TABLE notifications ADD CONSTRAINT unique_notification_entry 
UNIQUE (entity_type, entity_id);

-- Update the trigger function to handle duplicates
CREATE OR REPLACE FUNCTION create_notification_on_insert()
RETURNS TRIGGER AS $$
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
$$ language 'plpgsql';












    -- Table: public.admins

-- DROP TABLE IF EXISTS public.admins;

CREATE TABLE IF NOT EXISTS public.admins
(
    id integer NOT NULL DEFAULT nextval('admins_id_seq'::regclass),
    username character varying(50) COLLATE pg_catalog."default" NOT NULL,
    password character varying(255) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT admins_pkey PRIMARY KEY (id),
    CONSTRAINT admins_username_key UNIQUE (username)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.admins
    OWNER to postgres;



    -- Table: public.assignments

-- DROP TABLE IF EXISTS public.assignments;

CREATE TABLE IF NOT EXISTS public.assignments
(
    id integer NOT NULL DEFAULT nextval('assignments_id_seq'::regclass),
    patient_id integer,
    helper_id integer NOT NULL,
    helper_type helper_type NOT NULL,
    assigned_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(20) COLLATE pg_catalog."default" DEFAULT 'active'::character varying,
    CONSTRAINT assignments_pkey PRIMARY KEY (id),
    CONSTRAINT assignments_patient_id_helper_type_key UNIQUE (patient_id, helper_type),
    CONSTRAINT assignments_patient_id_fkey FOREIGN KEY (patient_id)
        REFERENCES public.patients (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.assignments
    OWNER to postgres;





    -- Table: public.caregivers

-- DROP TABLE IF EXISTS public.caregivers;

CREATE TABLE IF NOT EXISTS public.caregivers
(
    id integer NOT NULL DEFAULT nextval('caregivers_id_seq'::regclass),
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    email character varying(255) COLLATE pg_catalog."default" NOT NULL,
    phone_number character varying(50) COLLATE pg_catalog."default" NOT NULL,
    address text COLLATE pg_catalog."default" NOT NULL,
    availability text COLLATE pg_catalog."default",
    experience text COLLATE pg_catalog."default",
    certifications text COLLATE pg_catalog."default",
    notes text COLLATE pg_catalog."default",
    is_new boolean DEFAULT true,
    last_viewed_at timestamp with time zone,
    CONSTRAINT caregivers_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.caregivers
    OWNER to postgres;

-- Trigger: notify_caregiver

-- DROP TRIGGER IF EXISTS notify_caregiver ON public.caregivers;

CREATE OR REPLACE TRIGGER notify_caregiver
    AFTER INSERT
    ON public.caregivers
    FOR EACH ROW
    EXECUTE FUNCTION public.create_notification_on_insert('caregiver');

-- Trigger: notify_new_caregiver

-- DROP TRIGGER IF EXISTS notify_new_caregiver ON public.caregivers;

CREATE OR REPLACE TRIGGER notify_new_caregiver
    AFTER INSERT
    ON public.caregivers
    FOR EACH ROW
    EXECUTE FUNCTION public.create_notification_on_insert('caregiver');




-- Table: public.emergency_fund

-- DROP TABLE IF EXISTS public.emergency_fund;

CREATE TABLE IF NOT EXISTS public.emergency_fund
(
    id integer NOT NULL DEFAULT nextval('emergency_fund_id_seq'::regclass),
    photo_url text COLLATE pg_catalog."default",
    name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    details text COLLATE pg_catalog."default",
    account_number character varying(20) COLLATE pg_catalog."default",
    ifsc_code character varying(11) COLLATE pg_catalog."default",
    upi_id character varying(50) COLLATE pg_catalog."default",
    qr_code_url text COLLATE pg_catalog."default",
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT emergency_fund_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.emergency_fund
    OWNER to postgres;



    -- Table: public.equipment

-- DROP TABLE IF EXISTS public.equipment;

CREATE TABLE IF NOT EXISTS public.equipment
(
    id integer NOT NULL DEFAULT nextval('equipment_id_seq'::regclass),
    name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    type character varying(50) COLLATE pg_catalog."default" NOT NULL,
    quantity integer NOT NULL DEFAULT 0,
    status character varying(20) COLLATE pg_catalog."default" DEFAULT 'Available'::character varying,
    condition character varying(50) COLLATE pg_catalog."default",
    notes text COLLATE pg_catalog."default",
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    image_url character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT equipment_pkey PRIMARY KEY (id),
    CONSTRAINT equipment_status_check CHECK (status::text = ANY (ARRAY['Available'::character varying, 'In Use'::character varying, 'Under Maintenance'::character varying, 'Out of Service'::character varying]::text[]))
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.equipment
    OWNER to postgres;

-- Trigger: update_equipment_updated_at

-- DROP TRIGGER IF EXISTS update_equipment_updated_at ON public.equipment;

CREATE OR REPLACE TRIGGER update_equipment_updated_at
    BEFORE UPDATE 
    ON public.equipment
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();





    -- Table: public.health_status

-- DROP TABLE IF EXISTS public.health_status;

CREATE TABLE IF NOT EXISTS public.health_status
(
    id integer NOT NULL DEFAULT nextval('health_status_id_seq'::regclass),
    patient_id integer,
    disease character varying(255) COLLATE pg_catalog."default",
    medication text COLLATE pg_catalog."default",
    note text COLLATE pg_catalog."default",
    note_date date,
    CONSTRAINT health_status_pkey PRIMARY KEY (id),
    CONSTRAINT unique_patient_health_status UNIQUE (patient_id),
    CONSTRAINT health_status_patient_id_fkey FOREIGN KEY (patient_id)
        REFERENCES public.patients (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.health_status
    OWNER to postgres;





    -- Table: public.medical_history

-- DROP TABLE IF EXISTS public.medical_history;

CREATE TABLE IF NOT EXISTS public.medical_history
(
    id integer NOT NULL DEFAULT nextval('medical_history_id_seq'::regclass),
    patient_id integer,
    history text COLLATE pg_catalog."default",
    CONSTRAINT medical_history_pkey PRIMARY KEY (id),
    CONSTRAINT medical_history_patient_id_fkey FOREIGN KEY (patient_id)
        REFERENCES public.patients (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.medical_history
    OWNER to postgres;
-- Index: unique_patient_id

-- DROP INDEX IF EXISTS public.unique_patient_id;

CREATE UNIQUE INDEX IF NOT EXISTS unique_patient_id
    ON public.medical_history USING btree
    (patient_id ASC NULLS LAST)
    TABLESPACE pg_default;





    -- Table: public.medical_professionals

-- DROP TABLE IF EXISTS public.medical_professionals;

CREATE TABLE IF NOT EXISTS public.medical_professionals
(
    id integer NOT NULL DEFAULT nextval('medical_professionals_id_seq'::regclass),
    name character varying(30) COLLATE pg_catalog."default" NOT NULL,
    email character varying(100) COLLATE pg_catalog."default",
    phone_number character varying(10) COLLATE pg_catalog."default" NOT NULL,
    address text COLLATE pg_catalog."default" NOT NULL,
    availability text COLLATE pg_catalog."default",
    specialization character varying(100) COLLATE pg_catalog."default",
    license_number character varying(50) COLLATE pg_catalog."default",
    experience text COLLATE pg_catalog."default",
    notes text COLLATE pg_catalog."default",
    is_new boolean DEFAULT true,
    last_viewed_at timestamp with time zone,
    CONSTRAINT medical_professionals_pkey PRIMARY KEY (id),
    CONSTRAINT medical_professionals_license_number_key UNIQUE (license_number)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.medical_professionals
    OWNER to postgres;

-- Trigger: notify_medical_professional

-- DROP TRIGGER IF EXISTS notify_medical_professional ON public.medical_professionals;

CREATE OR REPLACE TRIGGER notify_medical_professional
    AFTER INSERT
    ON public.medical_professionals
    FOR EACH ROW
    EXECUTE FUNCTION public.create_notification_on_insert('medical_professional');

-- Trigger: notify_new_medical_professional

-- DROP TRIGGER IF EXISTS notify_new_medical_professional ON public.medical_professionals;

CREATE OR REPLACE TRIGGER notify_new_medical_professional
    AFTER INSERT
    ON public.medical_professionals
    FOR EACH ROW
    EXECUTE FUNCTION public.create_notification_on_insert('medical_professional');






    -- Table: public.medical_proxies

-- DROP TABLE IF EXISTS public.medical_proxies;

CREATE TABLE IF NOT EXISTS public.medical_proxies
(
    id integer NOT NULL DEFAULT nextval('medical_proxies_id_seq'::regclass),
    patient_id integer,
    name character varying(30) COLLATE pg_catalog."default",
    relation character varying(10) COLLATE pg_catalog."default",
    phone_number numeric(10,0),
    CONSTRAINT medical_proxies_pkey PRIMARY KEY (id),
    CONSTRAINT unique_patient_proxy UNIQUE (patient_id),
    CONSTRAINT medical_proxies_patient_id_fkey FOREIGN KEY (patient_id)
        REFERENCES public.patients (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.medical_proxies
    OWNER to postgres;





    -- Table: public.notifications

-- DROP TABLE IF EXISTS public.notifications;

CREATE TABLE IF NOT EXISTS public.notifications
(
    id integer NOT NULL DEFAULT nextval('notifications_id_seq'::regclass),
    entity_type character varying(50) COLLATE pg_catalog."default" NOT NULL,
    entity_id integer NOT NULL,
    entity_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    message text COLLATE pg_catalog."default" NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT notifications_pkey PRIMARY KEY (id),
    CONSTRAINT unique_notification_entry UNIQUE (entity_type, entity_id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.notifications
    OWNER to postgres;

-- Trigger: update_notifications_updated_at

-- DROP TRIGGER IF EXISTS update_notifications_updated_at ON public.notifications;

CREATE OR REPLACE TRIGGER update_notifications_updated_at
    BEFORE UPDATE 
    ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();





-- Table: public.patients

-- DROP TABLE IF EXISTS public.patients;

CREATE TABLE IF NOT EXISTS public.patients
(
    id integer NOT NULL DEFAULT nextval('patients_id_seq'::regclass),
    first_name character varying(30) COLLATE pg_catalog."default",
    initial_treatment_date date,
    dob date,
    age integer,
    gender character varying(8) COLLATE pg_catalog."default",
    address text COLLATE pg_catalog."default",
    phone_number numeric(10,0),
    doctor character varying(30) COLLATE pg_catalog."default",
    caregiver character varying(30) COLLATE pg_catalog."default",
    support_type character varying(50) COLLATE pg_catalog."default",
    original_id integer,
    place character varying(100) COLLATE pg_catalog."default" DEFAULT 'Not Specified'::character varying,
    additional_notes text COLLATE pg_catalog."default",
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    viewed_at timestamp without time zone,
    CONSTRAINT patients_pkey PRIMARY KEY (id),
    CONSTRAINT patients_original_id_fkey FOREIGN KEY (original_id)
        REFERENCES public.patients_register (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE SET NULL
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.patients
    OWNER to postgres;

-- Trigger: patients_created_at_trigger

-- DROP TRIGGER IF EXISTS patients_created_at_trigger ON public.patients;

CREATE OR REPLACE TRIGGER patients_created_at_trigger
    BEFORE INSERT
    ON public.patients
    FOR EACH ROW
    EXECUTE FUNCTION public.set_created_at();





    -- Table: public.patients_register

-- DROP TABLE IF EXISTS public.patients_register;

CREATE TABLE IF NOT EXISTS public.patients_register
(
    id integer NOT NULL DEFAULT nextval('patients_register_id_seq'::regclass),
    patient_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    contact_name character varying(255) COLLATE pg_catalog."default",
    contact_email character varying(255) COLLATE pg_catalog."default",
    contact_phone_number character varying(50) COLLATE pg_catalog."default" NOT NULL,
    place character varying(20) COLLATE pg_catalog."default" NOT NULL,
    address text COLLATE pg_catalog."default" NOT NULL,
    health_condition text COLLATE pg_catalog."default",
    care_details text COLLATE pg_catalog."default",
    notes text COLLATE pg_catalog."default",
    support_type character varying(20) COLLATE pg_catalog."default" NOT NULL DEFAULT 'others'::character varying,
    is_new boolean DEFAULT true,
    last_viewed_at timestamp with time zone,
    CONSTRAINT patients_register_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.patients_register
    OWNER to postgres;

-- Trigger: notify_new_patient

-- DROP TRIGGER IF EXISTS notify_new_patient ON public.patients_register;

CREATE OR REPLACE TRIGGER notify_new_patient
    AFTER INSERT
    ON public.patients_register
    FOR EACH ROW
    EXECUTE FUNCTION public.create_notification_on_insert('patient');

-- Trigger: notify_patient

-- DROP TRIGGER IF EXISTS notify_patient ON public.patients_register;

CREATE OR REPLACE TRIGGER notify_patient
    AFTER INSERT
    ON public.patients_register
    FOR EACH ROW
    EXECUTE FUNCTION public.create_notification_on_insert('patient');





    -- Table: public.schedules

-- DROP TABLE IF EXISTS public.schedules;

CREATE TABLE IF NOT EXISTS public.schedules
(
    id integer NOT NULL DEFAULT nextval('schedules_id_seq'::regclass),
    patient_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    member_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    visit_date date NOT NULL,
    visit_time time without time zone NOT NULL,
    visit_type character varying(255) COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    notes text COLLATE pg_catalog."default",
    CONSTRAINT schedules_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.schedules
    OWNER to postgres;




    -- Table: public.tasks

-- DROP TABLE IF EXISTS public.tasks;

CREATE TABLE IF NOT EXISTS public.tasks
(
    id integer NOT NULL DEFAULT nextval('tasks_id_seq'::regclass),
    title character varying(255) COLLATE pg_catalog."default" NOT NULL,
    description text COLLATE pg_catalog."default",
    category character varying(50) COLLATE pg_catalog."default" NOT NULL,
    priority character varying(20) COLLATE pg_catalog."default" NOT NULL,
    assigned_to character varying(100) COLLATE pg_catalog."default",
    due_date date,
    due_time time without time zone,
    status character varying(20) COLLATE pg_catalog."default" DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    assigned_member character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT tasks_pkey PRIMARY KEY (id),
    CONSTRAINT tasks_status_check CHECK (status::text = ANY (ARRAY['pending'::character varying, 'completed'::character varying]::text[]))
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.tasks
    OWNER to postgres;






    -- Table: public.vcm

-- DROP TABLE IF EXISTS public.vcm;

CREATE TABLE IF NOT EXISTS public.vcm
(
    id integer NOT NULL DEFAULT nextval('vcm_id_seq'::regclass),
    username character varying(50) COLLATE pg_catalog."default" NOT NULL,
    password_hash character varying(255) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT vcm_pkey PRIMARY KEY (id),
    CONSTRAINT vcm_username_key UNIQUE (username)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.vcm
    OWNER to postgres;







    -- Table: public.volunteers

-- DROP TABLE IF EXISTS public.volunteers;

CREATE TABLE IF NOT EXISTS public.volunteers
(
    id integer NOT NULL DEFAULT nextval('volunteers_id_seq'::regclass),
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    email character varying(255) COLLATE pg_catalog."default" NOT NULL,
    phone_number character varying(50) COLLATE pg_catalog."default" NOT NULL,
    address text COLLATE pg_catalog."default" NOT NULL,
    availability text COLLATE pg_catalog."default",
    skills text COLLATE pg_catalog."default",
    notes text COLLATE pg_catalog."default",
    is_new boolean DEFAULT true,
    last_viewed_at timestamp with time zone,
    CONSTRAINT volunteers_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.volunteers
    OWNER to postgres;

-- Trigger: notify_new_volunteer

-- DROP TRIGGER IF EXISTS notify_new_volunteer ON public.volunteers;

CREATE OR REPLACE TRIGGER notify_new_volunteer
    AFTER INSERT
    ON public.volunteers
    FOR EACH ROW
    EXECUTE FUNCTION public.create_notification_on_insert('volunteer');

-- Trigger: notify_volunteer

-- DROP TRIGGER IF EXISTS notify_volunteer ON public.volunteers;

CREATE OR REPLACE TRIGGER notify_volunteer
    AFTER INSERT
    ON public.volunteers
    FOR EACH ROW
    EXECUTE FUNCTION public.create_notification_on_insert('volunteer');