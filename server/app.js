const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const cors = require('cors'); // Import cors

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
    const patientResult = await pool.query('SELECT * FROM patients WHERE id = $1', [id]);
    if (patientResult.rows.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
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

//Registration component(volunteer and caregiver) 

app.post('/api/register', async (req, res) => {
  const { userType, name, email, phone_number, address, availability, skills, experience, certifications, notes } = req.body;

  try {
    if (userType === 'volunteer') {
      await pool.query(
        'INSERT INTO volunteers (name, email, phone_number, address, availability, skills, notes) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [name, email, phone_number, address, availability, skills, notes]
      );
    } else if (userType === 'caregiver') {
      await pool.query(
        'INSERT INTO caregivers (name, email, phone_number, address, availability, experience, certifications, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [name, email, phone_number, address, availability, experience, certifications, notes]
      );
    }
    res.status(201).json({ message: 'Registration successful' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
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


// ToDoList Component

// Get all todos
app.get('/api/todos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM todos ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
  }
});

// Add a new todo
app.post('/api/todos', async (req, res) => {
  try {
    const { description } = req.body;
    const result = await pool.query(
      'INSERT INTO todos (description) VALUES ($1) RETURNING *',
      [description]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

// Delete a todo
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM todos WHERE id = $1', [id]);
    res.json({ message: 'Todo deleted successfully' });
  } catch (err) {
    console.error(err.message);
  }
});



app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
