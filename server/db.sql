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