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

//admin login

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
app.post('/api/admin-login', async (req, res) => {
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

// Seed database with users
async function seedUsers() {
  const users = [
    { username: 'user1', password: 'password1' },
    { username: 'user2', password: 'password2' },
    { username: 'user3', password: 'password3' },
    { username: 'user4', password: 'password4' },
  ];

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await pool.query(
      'INSERT INTO vcm (username, password_hash) VALUES ($1, $2) ON CONFLICT (username) DO NOTHING',
      [user.username, hashedPassword]
    );
  }
}

// volunteer caregiver and medical professional login

// Seed users if the table is empty
async function initializeDatabase() {
  const result = await pool.query('SELECT COUNT(*) FROM vcm');
  const count = parseInt(result.rows[0].count, 10);

  if (count === 0) {
    await seedUsers();
  }
}

initializeDatabase();

// Login route
app.post("/api/vcm-login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await pool.query(`SELECT * FROM vcm WHERE username = $1`, [
      username,
    ]);
    if (user.rows.length === 0) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.rows[0].password_hash
    );
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    res.json({ message: "Login successful" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});



// patient management

// Add patient route
app.post('/api/patients', async (req, res) => {
  const {
    first_name,
    initial_treatment_date,
    dob,
    age,
    gender,
    address,
    phone_number,
    support_type,
    doctor,
    caregiver,
    place,
    health_status,
    medical_proxy,
    medical_history,
    additional_notes
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
    `;
    const checkResult = await client.query(checkPatientQuery, [first_name, phone_number]);
    
    if (checkResult.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        message: 'A patient with same personal information already exists'
      });
    }

    // Insert into patients table (register_number will be auto-generated by trigger)
    const insertPatientQuery = `
      INSERT INTO patients (
        first_name, initial_treatment_date, dob, age, gender, 
        address, phone_number, support_type, doctor, caregiver, place,
        additional_notes, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP) 
      RETURNING id, register_number
    `;
    
    const patientResult = await client.query(insertPatientQuery, [
      first_name,
      initial_treatment_date || null,
      dob || null,
      age || null,
      gender || null,
      address || null,
      phone_number,
      support_type,
      doctor || null,
      caregiver || null,
      place || null,
      additional_notes || null
    ]);

    const patientId = patientResult.rows[0].id;

    // Insert health status if support type is medical or caregiver
    if ((support_type === 'medical' || support_type === 'caregiver') && health_status) {
      const insertHealthStatusQuery = `
        INSERT INTO health_status (
          patient_id, disease, medication, note, note_date
        )
        VALUES ($1, $2, $3, $4, $5)
      `;
      
      await client.query(insertHealthStatusQuery, [
        patientId,
        health_status.disease || null,
        health_status.medication || null,
        health_status.note || null,
        health_status.note_date || null
      ]);
    }

    // Insert medical proxy if support type is medical or caregiver
    if ((support_type === 'medical' || support_type === 'caregiver') && medical_proxy) {
      const insertMedicalProxyQuery = `
        INSERT INTO medical_proxies (
          patient_id, name, relation, phone_number
        )
        VALUES ($1, $2, $3, $4)
      `;
      
      await client.query(insertMedicalProxyQuery, [
        patientId,
        medical_proxy.name || null,
        medical_proxy.relation || null,
        medical_proxy.phone_number || null
      ]);
    }

    // Insert medical history if support type is medical or caregiver
    if ((support_type === 'medical' || support_type === 'caregiver') && medical_history) {
      const insertMedicalHistoryQuery = `
        INSERT INTO medical_history (patient_id, history)
        VALUES ($1, $2)
      `;
      
      await client.query(insertMedicalHistoryQuery, [
        patientId,
        medical_history
      ]);
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Patient added successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding patient:', error);
    res.status(500).json({ message: 'Failed to add patient. Please try again.' });
  } finally {
    client.release();
  }
});

// Get all patients
app.get('/api/patients', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM patients');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Search patients - Updated to include register_number
app.get('/patients', async (req, res) => {
  const { search, support_type } = req.query;

  try {
    let query = 'SELECT * FROM patients WHERE 1=1';
    const queryParams = [];
    let paramCount = 1;

    if (search) {
      query += ` AND (
        first_name ILIKE $${paramCount} OR 
        register_number ILIKE $${paramCount} OR 
        CAST(phone_number AS TEXT) LIKE $${paramCount}
      )`;
      queryParams.push(`%${search}%`);
      paramCount++;
    }

    if (support_type) {
      query += ` AND support_type = $${paramCount}`;
      queryParams.push(support_type);
      paramCount++;
    }

    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Delete patient
app.delete('/api/patients/:id', async (req, res) => {
  const patientId = parseInt(req.params.id);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

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

    await client.query('COMMIT');
    res.status(200).json({ message: 'Patient deleted successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
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
    await pool.query('UPDATE patients SET viewed_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);

    const patient = await pool.query('SELECT * FROM patients WHERE id = $1', [id]);

    if (patient.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Fetch additional details from other tables
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

// Update personal information endpoint - register_number should not be updated manually
app.put('/api/patients/:id/personal', async (req, res) => {
  const { id } = req.params;
  const {
    original_id,
    first_name,
    dob,
    age,
    gender,
    address,
    phone_number,
    support_type,
    place
  } = req.body;

  try {
    const patientResult = await pool.query('SELECT * FROM patients WHERE id = $1', [id]);
    if (patientResult.rows.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const duplicateCheckQuery = `
      SELECT * 
      FROM patients
      WHERE LOWER(first_name) = LOWER($1)
        AND phone_number = $2
        AND LOWER(address) = LOWER($3)
        AND dob = $4
        AND gender = $5
        AND age = $6
        AND LOWER(place) = LOWER($7)
        AND id != $8
    `;
    const duplicateResult = await pool.query(duplicateCheckQuery, [
      first_name,
      phone_number,
      address,
      dob,
      gender,
      age,
      place,
      id,
    ]);

    if (duplicateResult.rows.length > 0) {
      return res.status(409).json({
        message: 'A patient with this personal information already exists'
      });
    }

    const updateQuery = `
      UPDATE patients SET 
        original_id = COALESCE($1, original_id),
        first_name = COALESCE($2, first_name),
        dob = COALESCE($3, dob),
        age = COALESCE($4, age),
        gender = COALESCE($5, gender),
        address = COALESCE($6, address),
        phone_number = COALESCE($7, phone_number),
        support_type = COALESCE($8, support_type),
        place = COALESCE($9, place)
      WHERE id = $10
      RETURNING *`;

    const result = await pool.query(updateQuery, [
      original_id,
      first_name,
      dob,
      age,
      gender,
      address,
      phone_number,
      support_type,
      place,
      id
    ]);

    res.status(200).json({
      message: 'Personal information updated successfully',
      patient: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating personal information:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// New endpoint for updating additional notes
app.put('/api/patients/:id/notes', async (req, res) => {
  const { id } = req.params;
  const { additional_notes } = req.body;

  try {
    // Check if patient exists
    const patientResult = await pool.query('SELECT * FROM patients WHERE id = $1', [id]);
    if (patientResult.rows.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Check if patient is volunteer or other type
    if (!['volunteer', 'other'].includes(patientResult.rows[0].support_type)) {
      return res.status(400).json({
        message: 'Additional notes can only be updated for volunteer or other support types'
      });
    }

    // Update additional notes
    const updateQuery = `
      UPDATE patients SET 
        additional_notes = COALESCE($1, additional_notes)
      WHERE id = $2
      RETURNING *`;

    const result = await pool.query(updateQuery, [additional_notes, id]);

    res.status(200).json({
      message: 'Additional notes updated successfully',
      patient: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating additional notes:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update medical information
app.put('/api/patients/:id/medical', async (req, res) => {
  const { id } = req.params;
  const { initial_treatment_date, doctor, caregiver, health_status } = req.body;

  try {
    // Check if patient exists
    const patientResult = await pool.query('SELECT * FROM patients WHERE id = $1', [id]);
    if (patientResult.rows.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Update basic medical information
    await pool.query(
      `UPDATE patients SET 
         initial_treatment_date = $1,
         doctor = $2,
         caregiver = $3
       WHERE id = $4`,
      [initial_treatment_date, doctor, caregiver, id]
    );

    if (health_status) {
      const { disease, medication, note, note_date } = health_status;
      const currentDate = new Date().toISOString().split('T')[0];

      // Get existing health status
      const existingHealthStatus = await pool.query(
        'SELECT * FROM health_status WHERE patient_id = $1',
        [id]
      );

      // Prepare the new note if provided
      let updatedNote = existingHealthStatus.rows[0]?.note || '';
      if (note) {
        const noteDate = note_date || currentDate;
        updatedNote = `${noteDate}: ${note}\n${updatedNote}`;
      }

      if (existingHealthStatus.rows.length > 0) {
        // Update existing health status preserving data for non-provided fields
        await pool.query(
          `UPDATE health_status 
           SET disease = COALESCE($1, disease),
               medication = COALESCE($2, medication),
               note = COALESCE($3, note),
               note_date = COALESCE($4, note_date)
           WHERE patient_id = $5`,
          [
            disease || existingHealthStatus.rows[0]?.disease,
            medication || existingHealthStatus.rows[0]?.medication,
            note ? updatedNote : existingHealthStatus.rows[0]?.note,
            note_date || currentDate,
            id
          ]
        );
      } else {
        // Insert new health status if none exists
        await pool.query(
          `INSERT INTO health_status (patient_id, disease, medication, note, note_date)
           VALUES ($1, $2, $3, $4, $5)`,
          [id, disease, medication, note ? updatedNote : '', note_date || currentDate]
        );
      }

      // Update medical history
      const existingHistory = (await pool.query(
        'SELECT history FROM medical_history WHERE patient_id = $1',
        [id]
      )).rows[0]?.history || '';

      const newHistoryEntry =
        `${new Date().toISOString().split('T')[0]}: Updated disease: ${disease || 'N/A'}, Updated medication: ${medication || 'N/A'}\n` +
        existingHistory;

      await pool.query(
        `INSERT INTO medical_history (patient_id, history)
         VALUES ($1, $2)
         ON CONFLICT (patient_id)
         DO UPDATE SET history = EXCLUDED.history`,
        [id, newHistoryEntry]
      );
    }

    res.status(200).json({ message: 'Medical information updated successfully' });
  } catch (error) {
    console.error('Error updating medical information:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update medical proxy
app.put('/api/patients/:id/proxy', async (req, res) => {
  const { id } = req.params;
  const { medical_proxy } = req.body;

  try {
    // Check if patient exists
    const patientResult = await pool.query(
      'SELECT * FROM patients WHERE id = $1',
      [id]
    );
    
    if (patientResult.rows.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    if (medical_proxy) {
      const { name, relation, phone_number } = medical_proxy;

      // Get existing proxy data
      const existingProxy = await pool.query(
        'SELECT * FROM medical_proxies WHERE patient_id = $1',
        [id]
      );

      if (existingProxy.rows.length > 0) {
        // Update existing proxy
        await pool.query(
          `UPDATE medical_proxies 
           SET name = COALESCE($1, name),
               relation = COALESCE($2, relation),
               phone_number = COALESCE($3, phone_number)
           WHERE patient_id = $4`,
          [
            name || existingProxy.rows[0]?.name,
            relation || existingProxy.rows[0]?.relation,
            phone_number || existingProxy.rows[0]?.phone_number,
            id
          ]
        );
      } else {
        // Insert new proxy if none exists
        await pool.query(
          `INSERT INTO medical_proxies (patient_id, name, relation, phone_number)
           VALUES ($1, $2, $3, $4)`,
          [id, name, relation, phone_number]
        );
      }
    }

    res.status(200).json({ message: 'Medical proxy updated successfully' });
  } catch (error) {
    console.error('Error updating medical proxy:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update medical history
app.put('/api/patients/:id/history', async (req, res) => {
  const { id } = req.params;
  const { medical_history } = req.body;

  try {
    // Check if patient exists
    const patientResult = await pool.query('SELECT * FROM patients WHERE id = $1', [id]);
    if (patientResult.rows.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    if (medical_history) {
      const existingHistory = (await pool.query(
        'SELECT history FROM medical_history WHERE patient_id = $1',
        [id]
      )).rows[0]?.history || '';

      const newHistoryEntry = `${new Date().toISOString().split('T')[0]}: ${medical_history}\n` + existingHistory;

      await pool.query(
        `INSERT INTO medical_history (patient_id, history) 
         VALUES ($1, $2) 
         ON CONFLICT (patient_id) 
         DO UPDATE SET history = EXCLUDED.history`,
        [id, newHistoryEntry]
      );
    }

    res.status(200).json({ message: 'Medical history updated successfully' });
  } catch (error) {
    console.error('Error updating medical history:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Volunteer caregiver and medical professional registration part

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
    // Basic validation
    if (!name || !email || !phone_number) {
      return res.status(400).json({
        error: 'Name, email, and phone number are required',
        field: 'basic_fields'
      });
    }

    // Additional validation for medical professionals
    if (userType === 'medical' && !license_number) {
      return res.status(400).json({
        error: 'License number is required for medical professionals',
        field: 'license_number'
      });
    }

    let emailExistsQuery, phoneExistsQuery, licenseExistsQuery;

    // Detailed existence checks
    switch (userType) {
      case 'volunteer':
        emailExistsQuery = await pool.query(
          'SELECT 1 FROM volunteers WHERE email = $1', 
          [email.trim()]
        );
        phoneExistsQuery = await pool.query(
          'SELECT 1 FROM volunteers WHERE phone_number = $1', 
          [phone_number.trim()]
        );
        break;

      case 'caregiver':
        emailExistsQuery = await pool.query(
          'SELECT 1 FROM caregivers WHERE email = $1', 
          [email.trim()]
        );
        phoneExistsQuery = await pool.query(
          'SELECT 1 FROM caregivers WHERE phone_number = $1', 
          [phone_number.trim()]
        );
        break;

      case 'medical':
        emailExistsQuery = await pool.query(
          'SELECT 1 FROM medical_professionals WHERE email = $1', 
          [email.trim()]
        );
        phoneExistsQuery = await pool.query(
          'SELECT 1 FROM medical_professionals WHERE phone_number = $1', 
          [phone_number.trim()]
        );
        licenseExistsQuery = await pool.query(
          'SELECT 1 FROM medical_professionals WHERE license_number = $1', 
          [license_number.trim()]
        );
        break;

      default:
        return res.status(400).json({
          error: 'Invalid user type',
          field: 'user_type'
        });
    }

    // Check for specific conflicts
    if (emailExistsQuery.rows.length > 0) {
      return res.status(409).json({
        error: 'Email already exists',
        field: 'email'
      });
    }

    if (phoneExistsQuery.rows.length > 0) {
      return res.status(409).json({
        error: 'Phone number already exists',
        field: 'phone_number'
      });
    }

    if (userType === 'medical' && licenseExistsQuery.rows.length > 0) {
      return res.status(409).json({
        error: 'License number already exists',
        field: 'license_number'
      });
    }

    // Insert new entry based on user type
    let result;
    switch (userType) {
      case 'volunteer':
        result = await pool.query(
          `INSERT INTO volunteers 
           (name, email, phone_number, address, availability, skills, notes, is_new, last_viewed_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, true, NULL)
           RETURNING *`,
          [
            name.trim(), 
            email.trim(), 
            phone_number.trim(), 
            address, 
            availability, 
            skills, 
            notes
          ]
        );
        break;

      case 'caregiver':
        result = await pool.query(
          `INSERT INTO caregivers 
           (name, email, phone_number, address, availability, experience, certifications, notes, is_new, last_viewed_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, NULL)
           RETURNING *`,
          [
            name.trim(), 
            email.trim(), 
            phone_number.trim(), 
            address, 
            availability, 
            experience, 
            certifications, 
            notes
          ]
        );
        break;

      case 'medical':
        result = await pool.query(
          `INSERT INTO medical_professionals 
           (name, email, phone_number, address, availability, specialization, license_number, experience, notes, is_new, last_viewed_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, NULL)
           RETURNING *`,
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
        break;
    }

    res.status(201).json({
      message: 'Registration successful',
      data: result.rows[0]
    });
  } catch (err) {
    console.error('Error during registration:', err);

    // Handle unique constraint violations
    if (err.code === '23505') {
      return res.status(409).json({
        error: `A ${userType} with this email or unique identifier already exists`,
        field: 'unique_constraint'
      });
    }

    res.status(500).json({
      error: 'Server error',
      field: 'server_error'
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
    support_type,
    health_condition,
    care_details,
    notes
  } = req.body;

  try {
    // Separate checks for unique constraints
    const phoneExistsQuery = await pool.query(
      'SELECT * FROM patients_register WHERE contact_phone_number = $1',
      [contact_phone_number]
    );

    const emailExistsQuery = await pool.query(
      'SELECT * FROM patients_register WHERE TRIM(contact_email) = TRIM($1)',
      [contact_email]
    );

    const fullDetailsExistsQuery = await pool.query(
      `SELECT * FROM patients_register 
       WHERE LOWER(TRIM(patient_name)) = LOWER(TRIM($1)) 
       AND LOWER(TRIM(contact_name)) = LOWER(TRIM($2)) 
       AND TRIM(contact_email) = TRIM($3) 
       AND contact_phone_number = $4`,
      [patient_name, contact_name, contact_email, contact_phone_number]
    );

    // Error handling for specific unique constraints
    if (phoneExistsQuery.rows.length > 0) {
      return res.status(409).json({ 
        message: 'Phone number already exists',
        field: 'contact_phone_number'
      });
    }

    if (emailExistsQuery.rows.length > 0) {
      return res.status(409).json({ 
        message: 'Email already exists',
        field: 'contact_email'
      });
    }

    if (fullDetailsExistsQuery.rows.length > 0) {
      return res.status(409).json({ 
        message: 'Patient with the same details already exists',
        field: 'full_details'
      });
    }

    // Validate required fields based on support_type
    if (support_type === 'medical' && !health_condition) {
      return res.status(400).json({ 
        message: 'Health condition is required for medical support type',
        field: 'health_condition'
      });
    }

    if (support_type === 'caregiver' && !care_details) {
      return res.status(400).json({ 
        message: 'Care details are required for caregiver support type',
        field: 'care_details'
      });
    }

    // Insert new patient with is_new flag
    const result = await pool.query(
      `INSERT INTO patients_register 
       (patient_name, contact_name, contact_email, contact_phone_number, place, address,
        support_type, health_condition, care_details, notes, is_new, last_viewed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, NULL)
       RETURNING *`,
      [patient_name, contact_name, contact_email, contact_phone_number, place, address,
       support_type, health_condition, care_details, notes]
    );

    res.status(201).json({
      message: 'Patient in need registered successfully!',
      patient: result.rows[0]
    });
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
// Select volunteer by id and mark as viewed
app.get('/api/volunteers/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Update the viewed status first
    await pool.query(
      'UPDATE volunteers SET is_new = false, last_viewed_at = NOW() WHERE id = $1',
      [id]
    );
    
    // Then get the updated volunteer data
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

// Delete volunteer by id
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

    // Check for existing volunteer
    const checkQuery = `
      SELECT * 
      FROM volunteers 
      WHERE LOWER(name) = LOWER($1) AND email = $2 AND phone_number = $3
    `;
    const checkResult = await pool.query(checkQuery, [name, email, phone_number]);

    if (checkResult.rows.length > 0) {
      return res.status(409).json({ 
        error: 'A volunteer with this name, email, and phone number already exists' 
      });
    }

    // Insert new volunteer with is_new flag
    const query = `
      INSERT INTO volunteers 
      (name, email, phone_number, address, availability, skills, notes, is_new, last_viewed_at) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, true, NULL) 
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

    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding volunteer:', error);
    if (error.code === '23505') {
      return res.status(409).json({ 
        error: 'A volunteer with this email already exists' 
      });
    }
    res.status(500).json({ 
      error: 'An error occurred while adding the volunteer' 
    });
  }
});

// Update a volunteer
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

// New endpoint to explicitly mark a volunteer as viewed
app.put('/api/volunteers/:id/view', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'UPDATE volunteers SET is_new = false, last_viewed_at = NOW() WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error marking volunteer as viewed:', error);
    res.status(500).json({ message: 'Server error' });
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

// Route to get all caregiver or filtered by search query
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
// Get a single caregiver by ID and mark as viewed
app.get('/api/caregivers/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Update the viewed status
    await pool.query(
      'UPDATE caregivers SET is_new = false, last_viewed_at = NOW() WHERE id = $1',
      [id]
    );
    
    // Get the updated caregiver data
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

// Add a new caregiver
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

    // Check if caregiver exists
    const checkQuery = `
      SELECT * 
      FROM caregivers 
      WHERE LOWER(name) = LOWER($1) AND email = $2 AND phone_number = $3
    `;
    const checkResult = await pool.query(checkQuery, [name, email, phone_number]);

    if (checkResult.rows.length > 0) {
      return res.status(409).json({ 
        error: 'A caregiver with this name, email, and phone number already exists' 
      });
    }

    // Insert new caregiver with is_new flag
    const query = `
      INSERT INTO caregivers 
      (name, email, phone_number, address, availability, experience, certifications, notes, is_new, last_viewed_at) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, NULL) 
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

    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding caregiver:', error);
    if (error.code === '23505') {
      return res.status(409).json({ 
        error: 'A caregiver with this email already exists' 
      });
    }
    res.status(500).json({ 
      error: 'An error occurred while adding the caregiver' 
    });
  }
});

// Update caregiver
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

// Delete caregiver
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

// New endpoint to explicitly mark a caregiver as viewed
app.put('/api/caregivers/:id/view', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'UPDATE caregivers SET is_new = false, last_viewed_at = NOW() WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Caregiver not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error marking caregiver as viewed:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Endpoint to get all patients in need
app.get('/api/patients-in-need', async (req, res) => {
  try {
    const caregivers = await pool.query('SELECT * FROM patients_register');
    res.json(caregivers.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
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

// Add a patient to the patients table
app.post('/api/patients-to-add', async (req, res) => {
  const {
    original_id,
    first_name,
    phone_number,
    address,
    support_type,
    place,
    additional_notes
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO patients (
        original_id,
        first_name,
        phone_number,
        address,
        support_type,
        initial_treatment_date,
        place,
        additional_notes
      ) VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, $6, $7)
      RETURNING *`,
      [
        original_id,
        first_name,
        phone_number,
        address,
        support_type,
        place || 'Not Specified',
        additional_notes || null
      ]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/patients/remove/:id', async (req, res) => {
  const patientId = parseInt(req.params.id);
  
  if (isNaN(patientId)) {
    return res.status(400).json({
      message: 'Invalid patient ID format',
      received: req.params.id
    });
  }
  
  try {
    // First verify the patient exists
    const checkResult = await pool.query(
      'SELECT id FROM patients WHERE original_id = $1',
      [patientId]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Patient not found in active patients',
        queried_id: patientId
      });
    }
    
    // Delete the patient
    const deleteResult = await pool.query(
      'DELETE FROM patients WHERE original_id = $1 RETURNING *',
      [patientId]
    );
    
    res.json({
      success: true,
      message: 'Patient successfully removed from active patients',
      removed_id: patientId
    });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({
      success: false,
      message: 'Database error while removing patient',
      error: err.message
    });
  }
});


// Update patient in need
app.put('/api/patients-in-need/:id', async (req, res) => {
  const { id } = req.params;
  const {
    patient_name,
    contact_name,
    contact_email,
    contact_phone_number,
    place,
    address,
    support_type,
    health_condition,
    care_details,
    notes,
  } = req.body;

  try {
    // Validate required fields based on support_type
    if (support_type === 'medical' && !health_condition) {
      return res.status(400).json({ message: 'Health condition is required for medical support type' });
    }

    if (support_type === 'caregiver' && !care_details) {
      return res.status(400).json({ message: 'Care details are required for caregiver support type' });
    }

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
        support_type = $7,
        health_condition = $8,
        care_details = $9,
        notes = $10
      WHERE id = $11
      RETURNING *;
      `,
      [
        patient_name,
        contact_name,
        contact_email,
        contact_phone_number,
        place,
        address,
        support_type,
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



// Get a single patient by ID and mark as viewed
app.get('/api/patients-in-need/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Update the viewed status first
    await pool.query(
      'UPDATE patients_register SET is_new = false, last_viewed_at = NOW() WHERE id = $1',
      [id]
    );
    
    // Then get the updated patient data
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

// New endpoint to explicitly mark a patient as viewed
app.put('/api/patients-in-need/:id/view', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'UPDATE patients_register SET is_new = false, last_viewed_at = NOW() WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error marking patient as viewed:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



// Delete a patient from only patients_register table
app.delete('/api/patients-register/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    await pool.query('DELETE FROM patients_register WHERE id = $1', [id]);
    res.json({ message: 'Patient deleted from register successfully' });
  } catch (err) {
    console.error(err);
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

// Get all medical professionals
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

// Get a single medical professional by ID and mark as viewed
app.get('/api/medical-professionals/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Update the viewed status first
    await pool.query(
      'UPDATE medical_professionals SET is_new = false, last_viewed_at = NOW() WHERE id = $1',
      [id]
    );
    
    // Then get the updated medical professional data
    const result = await pool.query('SELECT * FROM medical_professionals WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Medical professional not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete medical professional by ID
app.delete('/api/medical-professionals/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM medical_professionals WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Medical professional not found' });
    }
    res.json({ message: 'Medical professional deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Route to add a new medical professional
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

    // Insert new medical professional with is_new flag
    const query = `
      INSERT INTO medical_professionals
      (name, email, phone_number, address, availability, specialization, 
       license_number, experience, notes, is_new, last_viewed_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, NULL)
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

// New endpoint to explicitly mark a medical professional as viewed
app.put('/api/medical-professionals/:id/view', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'UPDATE medical_professionals SET is_new = false, last_viewed_at = NOW() WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Medical professional not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error marking medical professional as viewed:', error);
    res.status(500).json({ message: 'Server error' });
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

// create task route
app.post('/api/tasks', async (req, res) => {
  const {
    title,
    description,
    category,
    priority,
    assignedTo,
    assignedMember,
    dueDate,
    dueTime
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO tasks
        (title, description, category, priority, assigned_to, assigned_member, due_date, due_time, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *`,
      [
        title,
        description,
        category,
        priority,
        assignedTo || null,
        assignedMember || null,
        dueDate || null,
        dueTime || null,
        'pending'
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//  update task route
app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    category,
    priority,
    assignedTo,
    assignedMember,
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
          assigned_member = COALESCE($6, assigned_member),
          due_date = COALESCE($7, due_date),
          due_time = COALESCE($8, due_time),
          status = COALESCE($9, status)
        WHERE id = $10
        RETURNING *`,
      [
        title,
        description,
        category,
        priority,
        assignedTo,
        assignedMember,
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



// patient assignment component

const isValidHelperTypeForSupport = (supportType, helperType) => {
  switch (helperType) {
    case 'volunteer':
      return ['volunteer', 'other'].includes(supportType);
    case 'caregiver':
    case 'medical_professional':
      return ['caregiver', 'medical'].includes(supportType);
    default:
      return false;
  }
};

// Get all assignments with related information

app.get('/api/assignments', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.id,
        a.patient_id,
        a.helper_id,
        a.helper_type,
        a.assigned_date,
        a.status,
        p.first_name as patient_name,
        p.support_type as patient_support_type,
        CASE
          WHEN a.helper_type = 'volunteer' THEN (SELECT name FROM volunteers WHERE id = a.helper_id)
          WHEN a.helper_type = 'caregiver' THEN (SELECT name FROM caregivers WHERE id = a.helper_id)
          WHEN a.helper_type = 'medical_professional' THEN (SELECT name FROM medical_professionals WHERE id = a.helper_id)
        END as helper_name
      FROM assignments a
      JOIN patients p ON a.patient_id = p.id
      ORDER BY a.assigned_date DESC
    `);

    const formattedAssignments = result.rows.map(row => ({
      _id: row.id,
      patient: { 
        _id: row.patient_id, 
        name: row.patient_name,
        support_type: row.patient_support_type
      },
      helper: { _id: row.helper_id, name: row.helper_name },
      helperType: row.helper_type,
      assigned_date: row.assigned_date,
      status: row.status
    }));

    res.json(formattedAssignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new assignment
app.post('/api/assignments', async (req, res) => {
  const { patientId, helperId, helperType } = req.body;

  try {
    // First, get the patient's support type
    const patientResult = await pool.query(
      'SELECT support_type FROM patients WHERE id = $1',
      [patientId]
    );

    if (patientResult.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const patientSupportType = patientResult.rows[0].support_type;

    // Validate helper type against support type
    if (!isValidHelperTypeForSupport(patientSupportType, helperType)) {
      return res.status(400).json({
        error: `Invalid assignment: ${helperType} cannot be assigned to a patient with ${patientSupportType} support type`
      });
    }

    // If validation passes, create the assignment
    const result = await pool.query(
      `INSERT INTO assignments (patient_id, helper_id, helper_type)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [patientId, helperId, helperType]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating assignment:', error);
    
    if (error.code === '23505') {
      res.status(400).json({ error: 'Assignment already exists for this patient and helper type' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Delete assignment
app.delete('/api/assignments/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    await pool.query('DELETE FROM assignments WHERE id = $1', [id]);
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// Dashboard data endpoints
app.get('/api/dashboard/:type', async (req, res) => {
  const { type } = req.params;
  const client = await pool.connect();
  
  try {
    let dashboardData;
    
    switch (type) {
      case 'volunteer':
        const [vTeam, vPatients, vTasks, vSchedules] = await Promise.all([
          client.query('SELECT COUNT(*) FROM volunteers'),
          client.query(`SELECT COUNT(*) FROM assignments 
                       WHERE helper_type = 'volunteer' AND status = 'active'`),
          client.query(`SELECT COUNT(*) FROM tasks 
                       WHERE LOWER(assigned_to) = 'volunteer' AND status = 'pending'`),
          client.query(`SELECT COUNT(*) FROM schedules 
                       WHERE LOWER(visit_type) = 'volunteer' AND visit_date >= CURRENT_DATE`)
        ]);
        
        dashboardData = {
          teamMembers: parseInt(vTeam.rows[0].count),
          assignedPatients: parseInt(vPatients.rows[0].count),
          pendingTasks: parseInt(vTasks.rows[0].count),
          scheduledTasks: parseInt(vSchedules.rows[0].count)
        };
        break;

      case 'caregiver':
        const [cTeam, cPatients, cTasks, cSchedules] = await Promise.all([
          client.query('SELECT COUNT(*) FROM caregivers'),
          client.query(`SELECT COUNT(*) FROM assignments 
                       WHERE helper_type = 'caregiver' AND status = 'active'`),
          client.query(`SELECT COUNT(*) FROM tasks 
                       WHERE LOWER(assigned_to) = 'caregiver' AND status = 'pending'`),
          client.query(`SELECT COUNT(*) FROM schedules 
                       WHERE LOWER(visit_type) = 'caregiver' AND visit_date >= CURRENT_DATE`)
        ]);
        
        dashboardData = {
          teamMembers: parseInt(cTeam.rows[0].count),
          assignedPatients: parseInt(cPatients.rows[0].count),
          pendingTasks: parseInt(cTasks.rows[0].count),
          scheduledTasks: parseInt(cSchedules.rows[0].count)
        };
        break;

      case 'medical':
        const [mTeam, mPatients, mTasks, mSchedules] = await Promise.all([
          client.query('SELECT COUNT(*) FROM medical_professionals'),
          client.query(`SELECT COUNT(*) FROM assignments 
                       WHERE helper_type = 'medical_professional' AND status = 'active'`),
          client.query(`SELECT COUNT(*) FROM tasks 
                       WHERE LOWER(assigned_to) = 'medical professional' 
                       AND status = 'pending'`),
          client.query(`SELECT COUNT(*) FROM schedules 
                       WHERE LOWER(visit_type) = 'medical professional' 
                       AND visit_date >= CURRENT_DATE`)
        ]);
        
        dashboardData = {
          teamMembers: parseInt(mTeam.rows[0].count),
          assignedPatients: parseInt(mPatients.rows[0].count),
          pendingTasks: parseInt(mTasks.rows[0].count),
          scheduledTasks: parseInt(mSchedules.rows[0].count)
        };
        break;

      default:
        return res.status(400).json({ message: 'Invalid dashboard type' });
    }

    res.json(dashboardData);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.release();
  }
});

// Team members endpoint
app.get('/api/team/:type', async (req, res) => {
  const { type } = req.params;
  const client = await pool.connect();
  
  try {
    let query;
    switch (type) {
      case 'volunteer':
        query = 'SELECT id, name, email, phone_number, address, availability, skills as specialization, notes FROM volunteers';
        break;
      case 'caregiver':
        query = 'SELECT id, name, email, phone_number, address, availability, experience as specialization, notes FROM caregivers';
        break;
      case 'medical':
        query = 'SELECT id, name, email, phone_number, address, availability, specialization, notes FROM medical_professionals';
        break;
      default:
        return res.status(400).json({ message: 'Invalid team type' });
    }

    const result = await client.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.release();
  }
});



// Tasks endpoint
app.get('/api/tasks/:type', async (req, res) => {
  const { type } = req.params;
  const client = await pool.connect();
  
  try {
    let assignedToCondition;
    switch (type) {
      case 'volunteer':
        assignedToCondition = "LOWER(assigned_to) = 'volunteer'";
        break;
      case 'caregiver':
        assignedToCondition = "LOWER(assigned_to) = 'caregiver'";
        break;
      case 'medical':
        assignedToCondition = "LOWER(assigned_to) = 'medical professional'";
        break;
      default:
        return res.status(400).json({ message: 'Invalid type' });
    }
    
    
    const query = `
      SELECT * FROM tasks 
      WHERE ${assignedToCondition}
      ORDER BY due_date ASC, priority DESC
    `;
    
    const result = await client.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.release();
  }
});

// Schedules endpoint
app.get('/api/schedules/:type', async (req, res) => {
  const { type } = req.params;
  const client = await pool.connect();
  
  try {
    let visitTypeCondition;
    switch (type) {
      case 'volunteer':
        visitTypeCondition = "LOWER(visit_type) = 'volunteer'";
        break;
      case 'caregiver':
        visitTypeCondition = "LOWER(visit_type) = 'caregiver'";
        break;
      case 'medical':
        visitTypeCondition = "LOWER(visit_type) = 'medical professional'";
        break;
      default:
        return res.status(400).json({ message: 'Invalid type' });
    }

    const query = `
      SELECT * FROM schedules 
      WHERE ${visitTypeCondition} AND visit_date >= CURRENT_DATE
      ORDER BY visit_date ASC, visit_time ASC
    `;
    
    const result = await client.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.release();
  }
});



// assignment section

app.get('/api/assignments/:type', async (req, res) => {
  const { type } = req.params;
  let helperType;

  switch (type) {
    case 'medical':
      helperType = 'medical_professional';
      break;
    case 'volunteer':
      helperType = 'volunteer';
      break;
    case 'caregiver':
      helperType = 'caregiver';
      break;
    default:
      return res.status(400).json({ message: 'Invalid helper type' });
  }

  const client = await pool.connect();
  try {
    const query = `
      SELECT 
        a.*,
        p.first_name as patient_name
      FROM assignments a
      JOIN patients p ON a.patient_id = p.id
      WHERE helper_type = $1 AND a.status = 'active'
      ORDER BY assigned_date DESC
    `;

    const result = await client.query(query, [helperType]);
    res.json(result.rows);
  } catch (error) {
    console.error('Database query failed:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.release();
  }
});

app.get('/api/patients/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    // First get patient basic info
    const patientResult = await client.query(
      'SELECT * FROM patients WHERE id = $1',
      [req.params.id]
    );

    if (patientResult.rows.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const patient = patientResult.rows[0];

    // Get medical history
    const historyResult = await client.query(
      'SELECT history FROM medical_history WHERE patient_id = $1',
      [req.params.id]
    );

    // Get health status
    const statusResult = await client.query(
      'SELECT disease, medication, note, note_date FROM health_status WHERE patient_id = $1',
      [req.params.id]
    );

    // Combine all data
    const response = {
      ...patient,
      medical_history: historyResult.rows[0]?.history || '',
      health_status: statusResult.rows || []  // Send as array even if empty
    };

    console.log('Sending patient data:', response);  // Debug log
    res.json(response);

  } catch (error) {
    console.error('Error fetching patient details:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.release();
  }
});



/// Helper types endpoint
app.get('/api/helpers/:helper_type/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    const { helper_type, id } = req.params;
    const validTypes = ['volunteers', 'caregivers', 'medical_professionals'];
    
    if (!validTypes.includes(helper_type)) {
      return res.status(400).json({ error: 'Invalid helper type' });
    }
    
    const result = await client.query(
      `SELECT * FROM ${helper_type} WHERE id = $1`,
      [id]
    );
    res.json(result.rows[0] || null);
  } catch (error) {
    console.error('Helper type query error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});


// Update medical history
app.put('/api/medical-history/:patient_id', async (req, res) => {
  const client = await pool.connect();
  try {
    const { history } = req.body;
    const patientId = req.params.patient_id;

    // Get existing history for the patient
    const existingHistoryResult = await client.query(
      'SELECT history FROM medical_history WHERE patient_id = $1',
      [patientId]
    );
    const existingHistory = existingHistoryResult.rows[0]?.history || '';

    // Format new history entry
    const newHistoryEntry = `${new Date().toISOString().split('T')[0]}: ${history}\n` + existingHistory;

    // Insert new history or update if a record already exists
    await client.query(
      `INSERT INTO medical_history (patient_id, history) 
       VALUES ($1, $2) 
       ON CONFLICT (patient_id) 
       DO UPDATE SET history = EXCLUDED.history`,
      [patientId, newHistoryEntry]
    );

    res.json({ message: 'Medical history updated successfully.' });
  } catch (error) {
    console.error('Error updating medical history:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.release();
  }
});


// Update health status
app.put('/api/health-status/:patient_id', async (req, res) => {
  const client = await pool.connect();
  try {
    const id = req.params.patient_id;
    const health_status = req.body;

    if (health_status) {
      const { disease, medication, note, note_date } = health_status;
      const currentDate = new Date().toISOString().split('T')[0];

      // Get existing health status
      const existingHealthStatus = await client.query(
        'SELECT * FROM health_status WHERE patient_id = $1',
        [id]
      );

      // Prepare the new note if provided
      let updatedNote = existingHealthStatus.rows[0]?.note || '';
      if (note) {
        const noteDate = note_date || currentDate;
        updatedNote = `${noteDate}: ${note}\n${updatedNote}`;
      }

      if (existingHealthStatus.rows.length > 0) {
        // Update existing health status preserving data for non-provided fields
        await client.query(
          `UPDATE health_status 
            SET disease = COALESCE($1, disease),
                medication = COALESCE($2, medication),
                note = COALESCE($3, note),
                note_date = COALESCE($4, note_date)
            WHERE patient_id = $5`,
          [
            disease || existingHealthStatus.rows[0]?.disease,
            medication || existingHealthStatus.rows[0]?.medication,
            note ? updatedNote : existingHealthStatus.rows[0]?.note,
            note_date || currentDate,
            id
          ]
        );
      } else {
        // Insert new health status if none exists
        await client.query(
          `INSERT INTO health_status (patient_id, disease, medication, note, note_date)
            VALUES ($1, $2, $3, $4, $5)`,
          [id, disease, medication, note ? updatedNote : '', note_date || currentDate]
        );
      }

      // Update medical history
      const existingHistory = (await client.query(
        'SELECT history FROM medical_history WHERE patient_id = $1',
        [id]
      )).rows[0]?.history || '';

      const newHistoryEntry =
        `${currentDate}: Updated disease: ${disease || 'N/A'}, Updated medication: ${medication || 'N/A'}\n` +
        existingHistory;

      await client.query(
        `INSERT INTO medical_history (patient_id, history)
          VALUES ($1, $2)
          ON CONFLICT (patient_id)
          DO UPDATE SET history = EXCLUDED.history`,
        [id, newHistoryEntry]
      );

      // Return updated health status
      const updatedHealthStatus = await client.query(
        'SELECT * FROM health_status WHERE patient_id = $1',
        [id]
      );
      res.json(updatedHealthStatus.rows[0]);
    } else {
      res.status(400).json({ message: 'No health status data provided' });
    }
  } catch (error) {
    console.error('Error updating health status:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.release();
  }
});


// Equipment component


// Get all equipment
app.get('/api/equipment', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM equipment ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching equipment' });
  }
});

// Changed equipment route to be more specific
app.get('/api/inventory/equipment/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    
    const equipmentId = parseInt(id);
    if (isNaN(equipmentId)) {
      return res.status(400).json({ error: 'Invalid equipment ID format' });
    }
    
    const result = await client.query(
      'SELECT * FROM equipment WHERE id = $1',
      [equipmentId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Equipment query error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});



// Add new equipment with image upload
app.post('/api/equipment', upload.single('image'), async (req, res) => {
  const { name, type, quantity, status, condition, notes } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const result = await pool.query(
      'INSERT INTO equipment (name, type, quantity, status, condition, notes, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [name, type, quantity, status, condition, notes, image_url]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error adding equipment' });
  }
});

// Update equipment with optional image upload
app.put('/api/equipment/:id', upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const { name, type, quantity, status, condition, notes } = req.body;
  const client = await pool.connect();

  try {
    // Find existing equipment to delete old image
    const existingEquipment = await client.query('SELECT image_url FROM equipment WHERE id = $1', [id]);

    let image_url = null;
    if (req.file) {
      // Delete old image if it exists
      if (existingEquipment.rows[0]?.image_url) {
        await deleteExistingFile(existingEquipment.rows[0].image_url);
      }
      image_url = `/uploads/${req.file.filename}`;
    }

    let updateQuery = `
      UPDATE equipment 
      SET name = $1, 
          type = $2, 
          quantity = $3, 
          status = $4, 
          condition = $5, 
          notes = $6,
          image_url = COALESCE($7, image_url),
          updated_at = CURRENT_TIMESTAMP 
      WHERE id = $8 
      RETURNING *
    `;

    const values = [
      name,
      type,
      quantity,
      status,
      condition,
      notes,
      image_url,
      id
    ];

    const result = await client.query(updateQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating equipment' });
  } finally {
    client.release();
  }
});


// Delete equipment
app.delete('/api/equipment/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    // Get the image_url before deleting the record
    const equipment = await pool.query('SELECT image_url FROM equipment WHERE id = $1', [id]);
    
    // Delete the record from the database
    const result = await pool.query('DELETE FROM equipment WHERE id = $1', [id]);
    
    // If there was an image, delete the file
    if (equipment.rows[0]?.image_url) {
      const filename = equipment.rows[0].image_url.split('/').pop();
      const filePath = path.join('uploads', filename);
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    
    res.json({ message: 'Equipment deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting equipment' });
  }
});


// equipment display
app.get('/api/equipment/available', async (req, res) => {
  try {
    const query = `
      SELECT id, name, type, quantity, status, condition, image_url, notes
      FROM equipment
      WHERE status = 'Available' AND quantity > 0
      ORDER BY name ASC
    `;
    
    const result = await pool.query(query);
    
    // Add a small delay to prevent potential race conditions on the frontend
    setTimeout(() => {
      res.json(result.rows);
    }, 300);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});




// Get all active patients
app.get('/api/active-patients', async (req, res) => {
  try {
    const result = await pool.query('SELECT original_id FROM patients');
    console.log('Active patients query result:', result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching active patients:', err);
    res.status(500).json({ error: 'Server error' });
  }
});





// Modified notifications/counts endpoint
app.get('/api/notifications/counts', async (req, res) => {
  try {
    const query = `
      SELECT 
        entity_type,
        COUNT(*) as count
      FROM notifications
      WHERE is_read = false
      GROUP BY entity_type
    `;
    
    const result = await pool.query(query);
    
    // Initialize default counts
    const counts = {
      volunteer: 0,
      medical_professional: 0,
      caregiver: 0,
      patient: 0
    };
    
    // Update with actual counts
    result.rows.forEach(row => {
      if (counts.hasOwnProperty(row.entity_type)) {
        counts[row.entity_type] = parseInt(row.count);
      }
    });
    
    console.log('Sending notification counts:', counts); // Debug log
    res.json(counts);
  } catch (error) {
    console.error('Error fetching notification counts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Modified recent notifications endpoint
app.get('/api/notifications/recent', async (req, res) => {
  try {
    const query = `
      SELECT 
        id,
        entity_type,
        entity_id,
        entity_name,
        message,
        is_read,
        created_at
      FROM notifications
      ORDER BY created_at DESC
      LIMIT 20
    `;
    
    const result = await pool.query(query);
    console.log('Sending recent notifications:', result.rows); // Debug log
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching recent notifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark specific notification as read
app.post('/api/notifications/:id/mark-read', async (req, res) => {
  const { id } = req.params;
  
  try {
    await pool.query(
      'UPDATE notifications SET is_read = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );
    
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark all notifications of a type as read
app.post('/api/notifications/mark-read', async (req, res) => {
  const { entity_type } = req.body;
  
  try {
    await pool.query(
      'UPDATE notifications SET is_read = true, updated_at = CURRENT_TIMESTAMP WHERE entity_type = $1 AND is_read = false',
      [entity_type]
    );
    
    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add delete endpoint
app.delete('/api/notifications/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    // First check if notification exists and get its read status
    const checkResult = await pool.query(
      'SELECT is_read FROM notifications WHERE id = $1',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    // Delete the notification
    await pool.query('DELETE FROM notifications WHERE id = $1', [id]);
    
    res.json({ 
      message: 'Notification deleted successfully',
      was_read: checkResult.rows[0].is_read
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
