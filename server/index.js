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

app.get('/', (req, res) => {
  res.send('QueueMate API is running with SQLite');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});