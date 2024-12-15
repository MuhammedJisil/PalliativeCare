--database
CREATE DATABASE palliative_care;


--admins table
CREATE TABLE admins (
    id SERIAL PRIMARY KEY, 
    username VARCHAR(50), 
    password VARCHAR(255)
);

--insertion of values into admins table


-- Patients table
CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100),
    initial_treatment_date DATE,
    dob DATE,
    age INT,
    gender VARCHAR(10),
    address TEXT,
    phone_number VARCHAR(15),
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

-- Create Patients in need  Table
CREATE TABLE patients_register (
    id SERIAL PRIMARY KEY,
    patient_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone_number VARCHAR(50) NOT NULL,
    place VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    health_condition TEXT NOT NULL,
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

