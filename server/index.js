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

// ============ CUSTOMER BOOKING ============

// Get business details by ID (for public booking page)
app.get('/api/public/business/:businessId', async (req, res) => {
  const { businessId } = req.params;
  
  try {
    const business = await getQuery(
      'SELECT id, business_name FROM businesses WHERE id = ?',
      [businessId]
    );
    
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }
    
    // Get services for this business
    const services = await allQuery(
      'SELECT id, name, duration_minutes, price FROM services WHERE business_id = ?',
      [businessId]
    );
    
    // Get staff for this business
    const staff = await allQuery(
      'SELECT id, name, role FROM staff WHERE business_id = ?',
      [businessId]
    );
    
    res.json({
      business: business,
      services: services,
      staff: staff
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new appointment (public booking)
app.post('/api/public/appointments', async (req, res) => {
  const { businessId, serviceId, staffId, customerName, customerPhone, date, time } = req.body;
  
  if (!businessId || !serviceId || !customerName || !date || !time) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  try {
    // Check if slot is already booked
    const existingAppointment = await getQuery(
      'SELECT id FROM appointments WHERE business_id = ? AND staff_id = ? AND date = ? AND time = ? AND status != "cancelled"',
      [businessId, staffId || null, date, time]
    );
    
    if (existingAppointment) {
      return res.status(409).json({ error: 'This time slot is already booked. Please choose another time.' });
    }
    
    const result = await runQuery(
      `INSERT INTO appointments (business_id, service_id, staff_id, customer_name, customer_phone, date, time, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed')`,
      [businessId, serviceId, staffId || null, customerName, customerPhone || null, date, time]
    );
    
    res.status(201).json({ 
      message: 'Appointment booked successfully!',
      appointmentId: result.lastID,
      bookingDetails: { customerName, date, time }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get available time slots for a business (simplified for MVP)
app.get('/api/public/available-slots/:businessId', async (req, res) => {
  const { businessId } = req.params;
  const { date } = req.query;
  
  if (!date) {
    return res.status(400).json({ error: 'Date is required' });
  }
  
  try {
    // Get all booked times for this date
    const bookedAppointments = await allQuery(
      'SELECT time FROM appointments WHERE business_id = ? AND date = ? AND status != "cancelled"',
      [businessId, date]
    );
    
    const bookedTimes = bookedAppointments.map(a => a.time);
    
    // Generate available time slots (9 AM to 6 PM, hourly)
    const allTimeSlots = [];
    for (let hour = 9; hour <= 17; hour++) {
      const timeSlot = `${hour.toString().padStart(2, '0')}:00:00`;
      if (!bookedTimes.includes(timeSlot)) {
        allTimeSlots.push(timeSlot.substring(0, 5)); // Format as "HH:MM"
      }
    }
    
    res.json({ availableSlots: allTimeSlots });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});