const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { db, runQuery, getQuery, allQuery, createTables } = require('./db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize database tables
createTables();

// Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await getQuery('SELECT datetime("now") as now');
    res.json({ message: 'Database connected', time: result.now });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register a new business
app.post('/api/register', async (req, res) => {
  const { businessName, email, password, phone } = req.body;
  
  if (!businessName || !email || !password) {
    return res.status(400).json({ error: 'Business name, email, and password are required' });
  }
  
  try {
    const result = await runQuery(
      'INSERT INTO businesses (business_name, email, password, phone) VALUES (?, ?, ?, ?)',
      [businessName, email, password, phone]
    );
    res.status(201).json({ message: 'Business registered successfully', businessId: result.lastID });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  try {
    const business = await getQuery(
      'SELECT id, business_name FROM businesses WHERE email = ? AND password = ?',
      [email, password]
    );
    
    if (!business) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    res.json({ 
      message: 'Login successful', 
      businessId: business.id,
      businessName: business.business_name
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ SERVICE MANAGEMENT ============

// Get all services for a business
app.get('/api/services/:businessId', async (req, res) => {
  const { businessId } = req.params;
  
  try {
    const services = await allQuery(
      'SELECT * FROM services WHERE business_id = ? ORDER BY created_at DESC',
      [businessId]
    );
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new service
app.post('/api/services', async (req, res) => {
  const { businessId, name, duration_minutes, price } = req.body;
  
  if (!businessId || !name || !duration_minutes) {
    return res.status(400).json({ error: 'Business ID, name, and duration are required' });
  }
  
  try {
    const result = await runQuery(
      'INSERT INTO services (business_id, name, duration_minutes, price) VALUES (?, ?, ?, ?)',
      [businessId, name, duration_minutes, price || null]
    );
    res.status(201).json({ message: 'Service added', serviceId: result.lastID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a service
app.put('/api/services/:serviceId', async (req, res) => {
  const { serviceId } = req.params;
  const { name, duration_minutes, price } = req.body;
  
  try {
    await runQuery(
      'UPDATE services SET name = ?, duration_minutes = ?, price = ? WHERE id = ?',
      [name, duration_minutes, price || null, serviceId]
    );
    res.json({ message: 'Service updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a service
app.delete('/api/services/:serviceId', async (req, res) => {
  const { serviceId } = req.params;
  
  try {
    await runQuery('DELETE FROM services WHERE id = ?', [serviceId]);
    res.json({ message: 'Service deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.send('QueueMate API is running with SQLite');
});

// ============ STAFF MANAGEMENT ============

// Get all staff for a business
app.get('/api/staff/:businessId', async (req, res) => {
  const { businessId } = req.params;
  
  try {
    const staff = await allQuery(
      'SELECT * FROM staff WHERE business_id = ? ORDER BY created_at DESC',
      [businessId]
    );
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new staff member
app.post('/api/staff', async (req, res) => {
  const { businessId, name, role } = req.body;
  
  if (!businessId || !name) {
    return res.status(400).json({ error: 'Business ID and name are required' });
  }
  
  try {
    const result = await runQuery(
      'INSERT INTO staff (business_id, name, role) VALUES (?, ?, ?)',
      [businessId, name, role || null]
    );
    res.status(201).json({ message: 'Staff added', staffId: result.lastID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a staff member
app.put('/api/staff/:staffId', async (req, res) => {
  const { staffId } = req.params;
  const { name, role } = req.body;
  
  try {
    await runQuery(
      'UPDATE staff SET name = ?, role = ? WHERE id = ?',
      [name, role || null, staffId]
    );
    res.json({ message: 'Staff updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a staff member
app.delete('/api/staff/:staffId', async (req, res) => {
  const { staffId } = req.params;
  
  try {
    await runQuery('DELETE FROM staff WHERE id = ?', [staffId]);
    res.json({ message: 'Staff deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});