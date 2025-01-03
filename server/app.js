const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const cors = require('cors'); // Import cors
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const port = 5000;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'palliative_care',
  password: '#jisil1234',
  port: 5432,
});

app.use(cors()); // Use cors middleware
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });


// Seed database with users
async function seedUsers() {
  const users = [
    { username: 'admin1', password: 'password1' },
    { username: 'admin2', password: 'password2' },
    { username: 'admin3', password: 'password3' },
  ];

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await pool.query(
      'INSERT INTO admins (username, password) VALUES ($1, $2) ON CONFLICT (username) DO NOTHING',
      [user.username, hashedPassword]
    );
  }
}

// Seed users if the table is empty
async function initializeDatabase() {
  const result = await pool.query('SELECT COUNT(*) FROM admins');
  const count = parseInt(result.rows[0].count, 10);

  if (count === 0) {
    await seedUsers();
  }
}

initializeDatabase();

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  const userResult = await pool.query('SELECT * FROM admins WHERE username = $1', [username]);

  if (userResult.rows.length === 0) {
    return res.status(401).json({ message: 'Your username or password is incorrect' });
  }

  const user = userResult.rows[0];
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Your username or password is incorrect' });
  }

  const token = jwt.sign({ username: user.username }, 'your_jwt_secret', { expiresIn: '1h' });

  res.json({ token });
});

// patient management add component


app.post('/api/patients', async (req, res) => {
  const {
    first_name,
    initial_treatment_date,
    dob,
    age,
    gender,
    address,
    phone_number,
    doctor,
    caregiver,
    health_status,
    medical_proxy,
    medical_history
  } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check if the patient information already exists (case-insensitive)
    const checkPatientQuery = `
      SELECT * 
      FROM patients 
      WHERE LOWER(TRIM(first_name)) = LOWER(TRIM($1)) 
        AND phone_number = $2 
        AND LOWER(TRIM(address)) = LOWER(TRIM($3)) 
        AND dob = $4 
        AND gender = $5 
        AND age = $6
    `;
    const checkResult = await client.query(checkPatientQuery, [first_name, phone_number, address, dob, gender, age]);

    if (checkResult.rows.length > 0) {
      // Rollback the transaction before returning an error
      await client.query('ROLLBACK');
      return res.status(409).json({
        message: 'A patient with this personal information (name, DOB, gender, age, address, phone number) already exists'
      });
    }

    const insertPatientQuery = `
      INSERT INTO patients (first_name, initial_treatment_date, dob, age, gender, address, phone_number, doctor, caregiver)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id
    `;
    const patientResult = await client.query(insertPatientQuery, [first_name, initial_treatment_date, dob, age, gender, address, phone_number, doctor, caregiver]);
    const patientId = patientResult.rows[0].id;

    if (health_status) {
      const insertHealthStatusQuery = `
        INSERT INTO health_status (patient_id, disease, medication, note, note_date)
        VALUES ($1, $2, $3, $4, $5)
      `;
      await client.query(insertHealthStatusQuery, [patientId, health_status.disease, health_status.medication, health_status.note, health_status.note_date]);
    }

    if (medical_proxy) {
      const insertMedicalProxyQuery = `
        INSERT INTO medical_proxies (patient_id, name, relation, phone_number)
        VALUES ($1, $2, $3, $4)
      `;
      await client.query(insertMedicalProxyQuery, [patientId, medical_proxy.name, medical_proxy.relation, medical_proxy.phone_number]);
    }

    if (medical_history) {
      const insertMedicalHistoryQuery = `
        INSERT INTO medical_history (patient_id, history)
        VALUES ($1, $2)
      `;
      await client.query(insertMedicalHistoryQuery, [patientId, medical_history]);
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Patient added successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding patient:', error);
    res.status(500).json({ message: 'Error adding patient' });
  } finally {
    client.release();
  }
});

app.get('/api/patients', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM patients');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// patient management search part
app.get('/patients', async (req, res) => {
  const { search } = req.query; // Capture the search query

  try {
    let query = 'SELECT * FROM patients';
    const queryParams = [];

    if (search) {
      query += ' WHERE first_name ILIKE $1';
      queryParams.push(`%${search}%`);
    }

    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// deleting patient
app.delete('/api/patients/:id', async (req, res) => {
  const patientId = parseInt(req.params.id);

  const client = await pool.connect();
  try {
    await client.query('BEGIN'); // Start a transaction

    // Delete from health_status table
    await client.query('DELETE FROM health_status WHERE patient_id = $1', [patientId]);

    // Delete from medical_proxies table
    await client.query('DELETE FROM medical_proxies WHERE patient_id = $1', [patientId]);

    // Delete from medical_history table
    await client.query('DELETE FROM medical_history WHERE patient_id = $1', [patientId]);

    // Delete from patients table
    const result = await client.query('DELETE FROM patients WHERE id = $1 RETURNING *', [patientId]);
    if (result.rowCount === 0) {
      throw new Error('Patient not found');
    }

    await client.query('COMMIT'); // Commit the transaction
    res.status(200).json({ message: 'Patient deleted successfully' });
  } catch (error) {
    await client.query('ROLLBACK'); // Rollback the transaction on error
    console.error('Error deleting patient:', error.message);
    res.status(500).json({ message: `Failed to delete patient: ${error.message}` });
  } finally {
    client.release();
  }
});

// View patient details

app.get('/api/patients/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const patient = await pool.query('SELECT * FROM patients WHERE id = $1', [id]);

    if (patient.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Fetch additional details if needed from other tables
    const healthStatus = await pool.query('SELECT * FROM health_status WHERE patient_id = $1', [id]);
    const medicalProxy = await pool.query('SELECT * FROM medical_proxies WHERE patient_id = $1', [id]);
    const medicalHistory = await pool.query('SELECT * FROM medical_history WHERE patient_id = $1', [id]);

    const patientDetails = {
      ...patient.rows[0],
      healthStatus: healthStatus.rows,
      medicalProxy: medicalProxy.rows[0],
      medicalHistory: medicalHistory.rows[0],
    };

    res.json(patientDetails);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

//Update patient component

app.put('/api/patients/:id', async (req, res) => {
  const { id } = req.params;
  const { first_name, initial_treatment_date, dob, age, gender, address, phone_number, doctor, caregiver, health_status, medical_proxy, medical_history } = req.body;

  try {
     // Check if the patient exists
     const patientResult = await pool.query('SELECT * FROM patients WHERE id = $1', [id]);
     if (patientResult.rows.length === 0) {
       return res.status(404).json({ message: 'Patient not found' });
     }
 
     // Check for duplicate details (excluding the current patient's ID)
     const duplicateCheckQuery = `
       SELECT * 
       FROM patients 
       WHERE LOWER(first_name) = LOWER($1) 
         AND phone_number = $2 
         AND LOWER(address) = LOWER($3) 
         AND dob = $4 
         AND gender = $5 
         AND age = $6 
         AND id != $7
     `;
     const duplicateResult = await pool.query(duplicateCheckQuery, [
       first_name,
       phone_number,
       address,
       dob,
       gender,
       age,
       id,
     ]);
 
     if (duplicateResult.rows.length > 0) {
       return res.status(409).json({
         message:
           'A patient with this personal information (name, DOB, gender, age, address, phone number) already exists',
       });
     }
 
    await pool.query(
      `UPDATE patients SET first_name = $1, initial_treatment_date = $2, dob = $3, age = $4, gender = $5, address = $6, phone_number = $7, doctor = $8, caregiver = $9 WHERE id = $10`,
      [first_name, initial_treatment_date, dob, age, gender, address, phone_number, doctor, caregiver, id]
    );

    if (health_status) {
      const { disease, medication, note, note_date } = health_status;

      const existingHealthStatus = await pool.query('SELECT note FROM health_status WHERE patient_id = $1', [id]);
      const newNote = `${note_date || new Date().toISOString().split('T')[0]}: ${note}\n` + (existingHealthStatus.rows[0]?.note || '');

      await pool.query(
        'UPDATE health_status SET disease = $1, medication = $2, note = $3, note_date = $4 WHERE patient_id = $5',
        [disease, medication, newNote, note_date || new Date().toISOString().split('T')[0], id]
      );

      const existingHistory = (await pool.query('SELECT history FROM medical_history WHERE patient_id = $1', [id])).rows[0]?.history || '';
      const newHistoryEntry = `${new Date().toISOString().split('T')[0]}: Updated disease: ${disease || 'N/A'}, Updated medication: ${medication || 'N/A'}\n` + existingHistory;
      await pool.query(
        'INSERT INTO medical_history (patient_id, history) VALUES ($1, $2) ON CONFLICT (patient_id) DO UPDATE SET history = EXCLUDED.history',
        [id, newHistoryEntry]
      );
    }

    if (medical_proxy) {
      const { name, relation, phone_number } = medical_proxy;
      await pool.query(
        'UPDATE medical_proxies SET name = $1, relation = $2, phone_number = $3 WHERE patient_id = $4',
        [name, relation, phone_number, id]
      );
    }

    if (medical_history) {
      const existingHistory = (await pool.query('SELECT history FROM medical_history WHERE patient_id = $1', [id])).rows[0]?.history || '';
      const newHistoryEntry = `${new Date().toISOString().split('T')[0]}: ${medical_history}\n` + existingHistory;
      await pool.query(
        'INSERT INTO medical_history (patient_id, history) VALUES ($1, $2) ON CONFLICT (patient_id) DO UPDATE SET history = EXCLUDED.history',
        [id, newHistoryEntry]
      );
    }

    res.status(200).json({ message: 'Patient details updated successfully' });
  } catch (error) {
    console.error('Error updating patient details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



app.post('/api/register', async (req, res) => {
  const {
    userType,
    name,
    email,
    phone_number,
    address,
    availability,
    skills,
    experience,
    certifications,
    specialization,
    license_number,
    notes
  } = req.body;

  try {
    if (!name || !email || !phone_number) {
      return res.status(400).json({
        error: 'Name, email, and phone number are required'
      });
    }

    let existingEntry;

    if (userType === 'volunteer') {
      existingEntry = await pool.query(
        'SELECT 1 FROM volunteers WHERE LOWER(name) = LOWER($1) AND email = $2 AND phone_number = $3',
        [name.trim(), email.trim(), phone_number.trim()]
      );
    } else if (userType === 'caregiver') {
      existingEntry = await pool.query(
        'SELECT 1 FROM caregivers WHERE LOWER(name) = LOWER($1) AND email = $2 AND phone_number = $3',
        [name.trim(), email.trim(), phone_number.trim()]
      );
    } else if (userType === 'medical') {
      existingEntry = await pool.query(
        'SELECT 1 FROM medical_professionals WHERE LOWER(name) = LOWER($1) AND email = $2 OR license_number = $3',
        [name.trim(), email.trim(), license_number.trim()]
      );
    }

    if (existingEntry && existingEntry.rows.length > 0) {
      return res.status(409).json({
        error: `A ${userType} with the same details already exists`
      });
    }

    if (userType === 'volunteer') {
      await pool.query(
        'INSERT INTO volunteers (name, email, phone_number, address, availability, skills, notes) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [name.trim(), email.trim(), phone_number.trim(), address, availability, skills, notes]
      );
    } else if (userType === 'caregiver') {
      await pool.query(
        'INSERT INTO caregivers (name, email, phone_number, address, availability, experience, certifications, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [name.trim(), email.trim(), phone_number.trim(), address, availability, experience, certifications, notes]
      );
    } else if (userType === 'medical') {
      await pool.query(
        'INSERT INTO medical_professionals (name, email, phone_number, address, availability, specialization, license_number, experience, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        [
          name.trim(),
          email.trim(),
          phone_number.trim(),
          address,
          availability,
          specialization,
          license_number,
          experience,
          notes
        ]
      );
    }

    res.status(201).json({ message: 'Registration successful' });
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({
      error: 'Server error'
    });
  }
});

// registration Patient


// Endpoint to register a patient in need
app.post('/api/patients-in-need', async (req, res) => {
  const { 
    patient_name, 
    contact_name, 
    contact_email, 
    contact_phone_number, 
    place, 
    address, 
    health_condition, 
    care_details, 
    notes 
  } = req.body;

  try {
    // Check if the patient already exists
    const existingPatient = await pool.query(
      'SELECT * FROM patients_register WHERE LOWER(TRIM(patient_name)) = LOWER(TRIM($1)) AND  LOWER(TRIM(contact_name)) = LOWER(TRIM($2)) AND TRIM(contact_email) = TRIM($3) AND contact_phone_number = $4',
      [patient_name, contact_name, contact_email, contact_phone_number]
    );

    if (existingPatient.rows.length > 0) {
      return res.status(409).json({ message: 'Patient with the same details already exists!' });
    }

    // Insert new patient if no duplicate exists
    await pool.query(
      'INSERT INTO patients_register (patient_name, contact_name, contact_email, contact_phone_number, place, address, health_condition, care_details, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [patient_name, contact_name, contact_email, contact_phone_number, place, address, health_condition, care_details, notes]
    );
    res.status(201).json({ message: 'Patient in need registered successfully!' });
  } catch (error) {
    console.error('Error registering patient:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});




// Get all volunteers
app.get('/api/volunteers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM volunteers');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Route to get all volunteers or filtered by search query
app.get('/api/volunteers', async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM volunteers';
    if (search) {
      query += ` WHERE LOWER(name) LIKE LOWER('%${search}%')`;
    }
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching volunteers:', error);
    res.status(500).send('Server error');
  }
});

// select volunteer by id
app.get('/api/volunteers/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM volunteers WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// delete volunteer by id

app.delete('/api/volunteers/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM volunteers WHERE id = $1', [id]);
    res.status(200).json({ message: 'Volunteer deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Route to add a new volunteer
app.post('/api/volunteers', async (req, res) => {
  try {
    const { 
      name, 
      email, 
      phone_number, 
      address, 
      availability, 
      skills, 
      notes 
    } = req.body;

    // Input validation
    if (!name || !email || !phone_number || !address) {
      return res.status(400).json({ 
        error: 'Name, email, phone number, and address are required' 
      });
    }

    // SQL query to check if the volunteer already exists
    const checkQuery = `
      SELECT * 
      FROM volunteers 
      WHERE LOWER(name) = LOWER($1) AND email = $2 AND phone_number = $3
    `;
    const checkResult = await pool.query(checkQuery, [name, email, phone_number]);

    if (checkResult.rows.length > 0) {
      // Volunteer already exists
      return res.status(409).json({ 
        error: 'A volunteer with this name, email, and phone number already exists' 
      });
    }

    // SQL query to insert new volunteer
    const query = `
      INSERT INTO volunteers 
      (name, email, phone_number, address, availability, skills, notes) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *
    `;
    const values = [
      name, 
      email, 
      phone_number, 
      address, 
      availability || null, 
      skills || null, 
      notes || null
    ];

    // Execute the query
    const result = await pool.query(query, values);

    // Return the newly created volunteer
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding volunteer:', error);

    // Handle unique constraint violations (e.g., duplicate email)
    if (error.code === '23505') {
      return res.status(409).json({ 
        error: 'A volunteer with this email already exists' 
      });
    }

    // Generic error handler
    res.status(500).json({ 
      error: 'An error occurred while adding the volunteer' 
    });
  }
});

// update a volunteer
app.put('/api/volunteers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      email, 
      phone_number, 
      address, 
      availability, 
      skills, 
      notes 
    } = req.body;

    const result = await pool.query(
      `UPDATE volunteers 
       SET 
         name = $1, 
         email = $2, 
         phone_number = $3, 
         address = $4, 
         availability = $5, 
         skills = $6, 
         notes = $7 
       WHERE id = $8 
       RETURNING *`,
      [
        name, 
        email, 
        phone_number, 
        address, 
        availability || null, 
        skills || null, 
        notes || null, 
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating volunteer:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// Endpoint to get all caregivers
app.get('/api/caregivers', async (req, res) => {
  try {
    const caregivers = await pool.query('SELECT * FROM caregivers');
    res.json(caregivers.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Route to get all volunteers or filtered by search query
app.get('/api/caregivers', async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM caregivers';
    if (search) {
      query += ` WHERE LOWER(name) LIKE LOWER('%${search}%')`;
    }
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching caregivers:', error);
    res.status(500).send('Server error');
  }
});



// Endpoint to get a single caregiver by ID
app.get('/api/caregivers/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const caregiver = await pool.query('SELECT * FROM caregivers WHERE id = $1', [id]);
    if (caregiver.rows.length === 0) {
      return res.status(404).json({ error: 'Caregiver not found' });
    }
    res.json(caregiver.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Route to add a new caregiver
app.post('/api/caregivers', async (req, res) => {
  try {
    const { 
      name, 
      email, 
      phone_number, 
      address, 
      availability, 
      experience, 
      certifications, 
      notes 
    } = req.body;

    // Input validation
    if (!name || !email || !phone_number || !address) {
      return res.status(400).json({ 
        error: 'Name, email, phone number, and address are required' 
      });
    }

    // SQL query to check if the caregiver already exists
    const checkQuery = `
      SELECT * 
      FROM caregivers 
      WHERE LOWER(name) = LOWER($1) AND email = $2 AND phone_number = $3
    `;
    const checkResult = await pool.query(checkQuery, [name, email, phone_number]);

    if (checkResult.rows.length > 0) {
      // Caregiver already exists
      return res.status(409).json({ 
        error: 'A caregiver with this name, email, and phone number already exists' 
      });
    }

    // SQL query to insert new caregiver
    const query = `
      INSERT INTO caregivers 
      (name, email, phone_number, address, availability, experience, certifications, notes) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *
    `;
    const values = [
      name, 
      email, 
      phone_number, 
      address, 
      availability || null, 
      experience || null, 
      certifications || null, 
      notes || null
    ];

    // Execute the query
    const result = await pool.query(query, values);

    // Return the newly created caregiver
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding caregiver:', error);

    // Handle unique constraint violations (e.g., duplicate email)
    if (error.code === '23505') {
      return res.status(409).json({ 
        error: 'A caregiver with this email already exists' 
      });
    }

    // Generic error handler
    res.status(500).json({ 
      error: 'An error occurred while adding the caregiver' 
    });
  }
});

// UPDATE caregiver
app.put('/api/caregivers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      email, 
      phone_number, 
      address, 
      availability, 
      experience, 
      certifications, 
      notes 
    } = req.body;

    const query = `
      UPDATE caregivers 
      SET 
        name = $1, 
        email = $2, 
        phone_number = $3, 
        address = $4, 
        availability = $5, 
        experience = $6, 
        certifications = $7, 
        notes = $8 
      WHERE id = $9 
      RETURNING *
    `;

    const values = [
      name, 
      email, 
      phone_number, 
      address, 
      availability, 
      experience, 
      certifications, 
      notes,
      id
    ];

    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Caregiver not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating caregiver:', error);
    res.status(500).json({ error: 'Failed to update caregiver' });
  }
});


// Endpoint to delete a caregiver by ID
app.delete('/api/caregivers/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM caregivers WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Caregiver not found' });
    }
    res.json({ message: 'Caregiver deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});


// Get all patients in need
app.get('/api/patients-in-need', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM patients_register');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// update patient in need
app.put('/api/patients-in-need/:id', async (req, res) => {
  const { id } = req.params;
  const {
    patient_name,
    contact_name,
    contact_email,
    contact_phone_number,
    place,
    address,
    health_condition,
    care_details,
    notes,
  } = req.body;

  try {
    const result = await pool.query(
      `
      UPDATE patients_register
      SET 
        patient_name = $1,
        contact_name = $2,
        contact_email = $3,
        contact_phone_number = $4,
        place = $5,
        address = $6,
        health_condition = $7,
        care_details = $8,
        notes = $9
      WHERE id = $10
      RETURNING *;
      `,
      [
        patient_name,
        contact_name,
        contact_email,
        contact_phone_number,
        place,
        address,
        health_condition,
        care_details,
        notes,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json({
      message: 'Patient details updated successfully',
      patient: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while updating the patient details' });
  }
});


// Route to get all patients in need or filtered by search query
app.get('/api/patients-in-need', async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM patients_register';
    if (search) {
      query += ` WHERE LOWER(patient_name) LIKE LOWER('%${search}%')`;
    }
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).send('Server error');
  }
});

// Get a single patient by ID
app.get('/api/patients-in-need/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM patients_register WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});




// Delete a patient by ID
app.delete('/api/patients-in-need/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM patients_register WHERE id = $1', [id]);
    res.status(204).end();
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});


// medical professional component

// Get all medical professional
app.get('/api/medical-professionals', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM medical_professionals');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Endpoint to delete a medical professional  by ID
app.delete('/api/medical-professionals/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM medical_professionals WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'medical professional not found' });
    }
    res.json({ message: 'medical professional deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a single medical professional by ID
app.get('/api/medical-professionals/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM medical_professionals WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'medical professional not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Route to get all volunteers or filtered by search query
app.get('/api/medical-professionals', async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM medical_professionals';
    if (search) {
      query += ` WHERE LOWER(name) LIKE LOWER('%${search}%')`;
    }
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching medical professionals:', error);
    res.status(500).send('Server error');
  }
});


// Route to add a medical professional
app.post('/api/medical-professionals', async (req, res) => {
  const {
    name,
    email,
    phone_number,
    address,
    availability,
    specialization,
    license_number,
    experience,
    notes,
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO medical_professionals 
        (name, email, phone_number, address, availability, specialization, license_number, experience, notes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [name, email, phone_number, address, availability, specialization, license_number, experience, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding medical professional:', error);
    res.status(500).json({ error: 'Failed to add medical professional.' });
  }
});

// Route to add a medical professional
app.post('/api/medical-professionals', async (req, res) => {
  try {
    const {
      name,
      email,
      phone_number,
      address,
      availability,
      specialization,
      license_number,
      experience,
      notes
    } = req.body;

    // Input validation
    if (!name || !email || !phone_number || !address || !license_number) {
      return res.status(400).json({
        error: 'Name, email, phone number, address, and license number are required'
      });
    }

    // Check if medical professional already exists
    const checkQuery = `
      SELECT * 
      FROM medical_professionals 
      WHERE LOWER(name) = LOWER($1) AND email = $2 AND license_number = $3 AND phone_number = $4
    `;
    const checkResult = await pool.query(checkQuery, [name, email, license_number, phone_number]);

    if (checkResult.rows.length > 0) {
      return res.status(409).json({
        error: 'A medical professional with these credentials already exists'
      });
    }

    // Insert new medical professional
    const query = `
      INSERT INTO medical_professionals
      (name, email, phone_number, address, availability, specialization, 
       license_number, experience, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const values = [
      name,
      email,
      phone_number,
      address,
      availability || null,
      specialization || null,
      license_number,
      experience || null,
      notes || null
    ];

    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error('Error adding medical professional:', error);

    if (error.code === '23505') {
      return res.status(409).json({
        error: 'A medical professional with this license number already exists'
      });
    }

    res.status(500).json({
      error: 'An error occurred while adding the medical professional'
    });
  }
});

// Route to update a medical professional
app.put('/api/medical-professionals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone_number,
      address,
      availability,
      specialization,
      license_number,
      experience,
      notes
    } = req.body;

    // Input validation
    if (!name || !email || !phone_number || !address || !license_number) {
      return res.status(400).json({
        error: 'Name, email, phone number, address, and license number are required'
      });
    }

    const query = `
      UPDATE medical_professionals
      SET 
        name = $1,
        email = $2,
        phone_number = $3,
        address = $4,
        availability = $5,
        specialization = $6,
        license_number = $7,
        experience = $8,
        notes = $9
      WHERE id = $10
      RETURNING *
    `;
    const values = [
      name,
      email,
      phone_number,
      address,
      availability || null,
      specialization || null,
      license_number,
      experience || null,
      notes || null,
      id
    ];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Medical professional not found'
      });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Error updating medical professional:', error);
    
    if (error.code === '23505') {
      return res.status(409).json({
        error: 'A medical professional with this license number already exists'
      });
    }

    res.status(500).json({
      error: 'An error occurred while updating the medical professional'
    });
  }
});


// ToDoList Component

app.get('/api/tasks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new task
app.post('/api/tasks', async (req, res) => {
  const { 
    title, 
    description, 
    category, 
    priority, 
    assignedTo, 
    dueDate, 
    dueTime 
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO tasks 
      (title, description, category, priority, assigned_to, due_date, due_time, status) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *`, 
      [
        title, 
        description, 
        category, 
        priority, 
        assignedTo || null, 
        dueDate || null, 
        dueTime || null,
        'pending'  // Explicitly set status
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a task
app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { 
    title, 
    description, 
    category, 
    priority, 
    assignedTo, 
    dueDate, 
    dueTime,
    status 
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE tasks 
      SET 
        title = COALESCE($1, title), 
        description = COALESCE($2, description), 
        category = COALESCE($3, category), 
        priority = COALESCE($4, priority), 
        assigned_to = COALESCE($5, assigned_to), 
        due_date = COALESCE($6, due_date), 
        due_time = COALESCE($7, due_time),
        status = COALESCE($8, status)
      WHERE id = $9 
      RETURNING *`, 
      [
        title, 
        description, 
        category, 
        priority, 
        assignedTo, 
        dueDate, 
        dueTime, 
        status, 
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a task
app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM tasks WHERE id = $1 RETURNING *", 
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ message: "Task deleted successfully", task: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle task status
app.patch('/api/tasks/:id/status', async (req, res) => {
  const { id } = req.params;
  try {
    console.log(`Attempting to toggle status for task ${id}`);
    
    const result = await pool.query(
      `UPDATE tasks 
       SET status = CASE 
         WHEN status = 'pending' THEN 'completed'
         WHEN status = 'completed' THEN 'pending'
         ELSE 'pending'
       END
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    
    if (result.rows.length === 0) {
      console.error(`No task found with id ${id}`);
      return res.status(404).json({ error: "Task not found" });
    }
    
    console.log('Task status updated:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error toggling task status:', err);
    res.status(500).json({ 
      error: err.message,
      details: err.details || 'Unknown error occurred'
    });
  }
});


// schedule component

// Get all schedules
app.get('/api/schedules', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM schedules');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// Add a new schedule
app.post('/api/schedules', async (req, res) => {
  const { patient_name, member_name, visit_date, visit_time, visit_type, notes } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO schedules (patient_name, member_name, visit_date, visit_time, visit_type, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [patient_name, member_name, visit_date, visit_time, visit_type, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding schedule:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get schedule by ID
app.get('/schedules/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM schedules WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Update schedule by ID
app.put('/api/schedules/:id', async (req, res) => {
  const { id } = req.params;
  const { patient_name, member_name, visit_date, visit_time, visit_type, notes } = req.body;

  let query = 'UPDATE schedules SET ';
  const queryParams = [];
  let paramIndex = 1;

  if (patient_name) {
    query += `patient_name = $${paramIndex++}, `;
    queryParams.push(patient_name);
  }
  if (member_name) {
    query += `member_name = $${paramIndex++}, `;
    queryParams.push(member_name);
  }
  if (visit_date) {
    query += `visit_date = $${paramIndex++}, `;
    queryParams.push(visit_date);
  }
  if (visit_time) {
    query += `visit_time = $${paramIndex++}, `;
    queryParams.push(visit_time);
  }
  if (visit_type) {
    query += `visit_type = $${paramIndex++}, `;
    queryParams.push(visit_type);
  }
  if (notes) {
    query += `notes = $${paramIndex++}, `;
    queryParams.push(notes);
  }

  query = query.slice(0, -2) + ` WHERE id = $${paramIndex} RETURNING *`;
  queryParams.push(id);

  try {
    const result = await pool.query(query, queryParams);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Delete a schedule
app.delete('/api/schedules/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM schedules WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// emergency fund component 

// Route to fetch all emergency_fund
app.get('/api/emergency-fund', async (req, res) => {
  try {
      const result = await pool.query('SELECT * FROM emergency_fund');
      res.status(200).json(result.rows); // Send rows as JSON response
  } catch (error) {
      console.error('Error fetching emergency_fund:', error);
      res.status(500).json({ error: 'Failed to fetch emergency_fund' });
  }
});


// Function to delete existing file
const deleteExistingFile = async (filePath) => {
  if (filePath) {
    try {
      const fullPath = path.join(process.cwd(), filePath);
      await fs.unlink(fullPath); // Promise-based unlink
      console.log(`Successfully deleted file: ${fullPath}`);
    } catch (err) {
      if (err.code === 'ENOENT') {
        console.warn(`File not found, skipping: ${filePath}`);
      } else {
        console.error('Error deleting file:', err);
      }
    }
  }
};


// Route to add/update emergency_fund (only one emergency_fund at a time)
app.post('/api/emergency-fund', upload.fields([
  { name: 'photo', maxCount: 1 }, 
  { name: 'qr_code', maxCount: 1 }
]), async (req, res) => {
  const { name, details, account_number, ifsc_code, upi_id } = req.body;
  const photo_url = req.files['photo'] ? req.files['photo'][0].path : null;
  const qr_code_url = req.files['qr_code'] ? req.files['qr_code'][0].path : null;

  const client = await pool.connect();

  try {
    // Find existing emergency_fund to delete old files
    const existingEmergencyFund = await client.query('SELECT * FROM emergency_fund LIMIT 1');
    
    if (existingEmergencyFund.rows.length > 0) {
      // Delete old photo if new photo is uploaded
      if (photo_url) {
        await deleteExistingFile(existingEmergencyFund.rows[0].photo_url);
      }
      
      // Delete old QR code if new QR code is uploaded
      if (qr_code_url) {
        await deleteExistingFile(existingEmergencyFund.rows[0].qr_code_url);
      }

      // Delete all existing emergency_fund
      await client.query('DELETE FROM emergency_fund');
    }

    // Insert new emergency_fund
    const query = `
      INSERT INTO emergency_fund 
      (photo_url, name, details, account_number, ifsc_code, upi_id, qr_code_url) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *
    `;
    const values = [
      photo_url, 
      name, 
      details, 
      account_number, 
      ifsc_code, 
      upi_id, 
      qr_code_url
    ];

    const result = await client.query(query, values);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while adding the emergency_fund' });
  } finally {
    client.release();
  }
});

// Route to update emergency_fund (similar file deletion logic)
app.put('/api/emergency-fund/:id', upload.fields([
  { name: 'photo', maxCount: 1 }, 
  { name: 'qr_code', maxCount: 1 }
]), async (req, res) => {
  const { id } = req.params;
  const { name, details, account_number, ifsc_code, upi_id, existing_photo, existing_qr_code } = req.body;
  const photo_url = req.files['photo'] ? req.files['photo'][0].path : existing_photo;
  const qr_code_url = req.files['qr_code'] ? req.files['qr_code'][0].path : existing_qr_code;

  try {
    // Find existing emergency_fund to delete old files
    const existingEmergencyFund = await pool.query('SELECT * FROM emergency_fund WHERE id = $1', [id]);
    
    if (existingEmergencyFund.rows.length > 0) {
      // Delete old photo if new photo is uploaded
      if (req.files['photo']) {
        await deleteExistingFile(existingEmergencyFund.rows[0].photo_url);
      }
      
      // Delete old QR code if new QR code is uploaded
      if (req.files['qr_code']) {
        await deleteExistingFile(existingEmergencyFund.rows[0].qr_code_url);
      }
    }

    const query = `
      UPDATE emergency_fund 
      SET 
        photo_url = $2, 
        name = $3, 
        details = $4, 
        account_number = $5, 
        ifsc_code = $6, 
        upi_id = $7, 
        qr_code_url = $8
      WHERE id = $1 
      RETURNING *
    `;
    const values = [
      id, 
      photo_url, 
      name, 
      details, 
      account_number, 
      ifsc_code, 
      upi_id, 
      qr_code_url
    ];

    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while updating the emergency_fund' });
  }
});

// Route to delete emergency_fund
app.delete('/api/emergency-fund/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Find emergency_fund to delete associated files
    const emergencyFund = await pool.query('SELECT * FROM emergency_fund WHERE id = $1', [id]);
    
    if (emergencyFund.rows.length > 0) {
      // Delete photo file
      await deleteExistingFile(emergencyFund.rows[0].photo_url);
      
      // Delete QR code file
      await deleteExistingFile(emergencyFund.rows[0].qr_code_url);
    }

    // Delete emergency_fund from database
    await pool.query('DELETE FROM emergency_fund WHERE id = $1', [id]);
    res.json({ message: 'Emergency fund deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while deleting the emergency fund' });
  }
});

// Get all assignments
app.get('/api/assignments', async (req, res) => {
  try {
    const query = `
      SELECT a.id, a.helper_type, a.assigned_date,
             p.name as patient_name, p.id as patient_id,
             CASE 
               WHEN a.helper_type = 'volunteer' THEN v.name
               ELSE c.name
             END as helper_name,
             a.helper_id
      FROM assignments a
      JOIN patients p ON p.id = a.patient_id
      LEFT JOIN volunteers v ON v.id = a.helper_id AND a.helper_type = 'volunteer'
      LEFT JOIN caregivers c ON c.id = a.helper_id AND a.helper_type = 'caregiver'
      WHERE a.status = 'active'
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new assignment
app.post('/api/assignments', async (req, res) => {
  const { patientId, helperId, helperType } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Check if patient already has this type of helper
    const existingAssignment = await client.query(
      'SELECT id FROM assignments WHERE patient_id = $1 AND helper_type = $2 AND status = $3',
      [patientId, helperType, 'active']
    );

    if (existingAssignment.rows.length > 0) {
      throw new Error(`Patient already has an active ${helperType}`);
    }

    // Create new assignment
    const query = `
      INSERT INTO assignments (patient_id, helper_id, helper_type)
      VALUES ($1, $2, $3)
      RETURNING id, assigned_date
    `;
    const { rows } = await client.query(query, [patientId, helperId, helperType]);
    
    await client.query('COMMIT');
    res.status(201).json(rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: error.message });
  } finally {
    client.release();
  }
});

// Remove assignment
app.delete('/api/assignments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      'UPDATE assignments SET status = $1 WHERE id = $2',
      ['inactive', id]
    );
    res.json({ message: 'Assignment removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
