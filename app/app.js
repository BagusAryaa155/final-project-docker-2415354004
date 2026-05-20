require('dotenv').config();

const express = require('express');
const mysql = require('mysql2');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

let db;

// Fungsi koneksi database dengan retry
function connectDatabase() {
  db = mysql.createConnection(dbConfig);

  db.connect((err) => {
    if (err) {
      console.log('Waiting for MySQL...');
      setTimeout(connectDatabase, 3000);
    } else {
      console.log('Connected to MySQL Database');

      const createTable = `
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100),
          email VARCHAR(100)
        )
      `;

      db.query(createTable, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log('Users table ready');
        }
      });
    }
  });
}

connectDatabase();

// Root Endpoint
app.get('/', (req, res) => {
  res.send('Docker Final Project Running');
});

// GET Users
app.get('/users', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) {
      return res.status(500).json(err);
    }

    res.json(results);
  });
});

// POST User
app.post('/users', (req, res) => {
  const { name, email } = req.body;

  const sql = 'INSERT INTO users (name, email) VALUES (?, ?)';

  db.query(sql, [name, email], (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }

    res.json({
      message: 'User added',
      id: result.insertId,
    });
  });
});

// PUT User
app.put('/users/:id', (req, res) => {
  const id = req.params.id;
  const { name, email } = req.body;

  const sql = 'UPDATE users SET name = ?, email = ? WHERE id = ?';

  db.query(sql, [name, email, id], (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }

    res.json({
      message: 'User updated',
    });
  });
});

// DELETE User
app.delete('/users/:id', (req, res) => {
  const id = req.params.id;

  const sql = 'DELETE FROM users WHERE id = ?';

  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }

    res.json({
      message: 'User deleted',
    });
  });
});

// Run Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});