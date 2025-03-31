require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase();
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images only!');
    }
  }
});

// MySQL connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smartkitchen',
  waitForConnections: true,
  connectionLimit: 10
});

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// API Endpoints
app.post('/api/items', upload.single('image'), async (req, res) => {
  const { name, category, quantity, expiry, threshold } = req.body;
  const imagePath = req.file ? req.file.filename : null;

  try {
    const [result] = await pool.query(
      'INSERT INTO inventory_items (name, category, quantity, expiry, threshold, image_path) VALUES (?, ?, ?, ?, ?, ?)',
      [name, category, quantity, expiry, threshold, imagePath]
    );
    
    // Log to history
    await pool.query(
      'INSERT INTO inventory_history (item_id, action, new_value) VALUES (?, ?, ?)',
      [result.insertId, 'create', JSON.stringify(req.body)]
    );
    
    res.status(201).json({ 
      id: result.insertId,
      imageUrl: imagePath ? `${req.protocol}://${req.get('host')}/uploads/${imagePath}` : null
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/items', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM inventory_items ORDER BY expiry');
    const items = rows.map(item => ({
      ...item,
      imageUrl: item.image_path ? `${req.protocol}://${req.get('host')}/uploads/${item.image_path}` : null
    }));
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/items/stats', async (req, res) => {
  try {
    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM inventory_items');
    const [[{ lowStock }]] = await pool.query(
      'SELECT COUNT(*) as lowStock FROM inventory_items WHERE quantity <= threshold'
    );
    const [[{ expiringSoon }]] = await pool.query(
      `SELECT COUNT(*) as expiringSoon FROM inventory_items 
       WHERE expiry BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)`
    );
    const [[{ expired }]] = await pool.query(
      'SELECT COUNT(*) as expired FROM inventory_items WHERE expiry < CURDATE()'
    );
    
    res.json({ total, lowStock, expiringSoon, expired });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/items/:id', upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const { name, category, quantity, expiry, threshold } = req.body;
  const imagePath = req.file ? req.file.filename : null;

  try {
    // Get current item data
    const [[currentItem]] = await pool.query('SELECT * FROM inventory_items WHERE id = ?', [id]);
    
    // Update item
    await pool.query(
      'UPDATE inventory_items SET name = ?, category = ?, quantity = ?, expiry = ?, threshold = ?, image_path = ? WHERE id = ?',
      [name, category, quantity, expiry, threshold, imagePath || currentItem.image_path, id]
    );
    
    // Log to history
    await pool.query(
      'INSERT INTO inventory_history (item_id, action, old_value, new_value) VALUES (?, ?, ?, ?)',
      [id, 'update', JSON.stringify(currentItem), JSON.stringify(req.body)]
    );
    
    res.json({ 
      success: true,
      imageUrl: imagePath ? `${req.protocol}://${req.get('host')}/uploads/${imagePath}` : currentItem.image_path 
        ? `${req.protocol}://${req.get('host')}/uploads/${currentItem.image_path}` 
        : null
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/items/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    // Get current item data
    const [[currentItem]] = await pool.query('SELECT * FROM inventory_items WHERE id = ?', [id]);
    
    // Delete item
    await pool.query('DELETE FROM inventory_items WHERE id = ?', [id]);
    
    // Delete image file if exists
    if (currentItem.image_path) {
      fs.unlink(`uploads/${currentItem.image_path}`, (err) => {
        if (err) console.error('Error deleting image:', err);
      });
    }
    
    // Log to history
    await pool.query(
      'INSERT INTO inventory_history (item_id, action, old_value) VALUES (?, ?, ?)',
      [id, 'delete', JSON.stringify(currentItem)]
    );
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});