const express = require('express');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();

app.use(express.json());

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.query(`
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255)
    )
`, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('Table users ready');
    }
});

app.get('/users', (req, res) => {
    db.query('SELECT * FROM users', (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }

        res.json(result);
    });
});

app.post('/users', (req, res) => {
    const { name } = req.body;

    db.query(
        'INSERT INTO users (name) VALUES (?)',
        [name],
        (err, result) => {
            if (err) {
                return res.status(500).json(err);
            }

            res.json({
                message: 'User ditambahkan'
            });
        }
    );
});

app.put('/users/:id', (req, res) => {
    const { name } = req.body;

    db.query(
        'UPDATE users SET name=? WHERE id=?',
        [name, req.params.id],
        (err, result) => {
            if (err) {
                return res.status(500).json(err);
            }

            res.json({
                message: 'User diupdate'
            });
        }
    );
});

app.delete('/users/:id', (req, res) => {
    db.query(
        'DELETE FROM users WHERE id=?',
        [req.params.id],
        (err, result) => {
            if (err) {
                return res.status(500).json(err);
            }

            res.json({
                message: 'User dihapus'
            });
        }
    );
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});