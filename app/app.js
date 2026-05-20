const express = require('express');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
app.use(express.json());

const connection = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.APP_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

const initDatabase = () => {
    connection.query('SELECT 1', (err) => {
        if (err) {
            console.log('Database belum ready, retry 3 detik lagi...', err.message);
            setTimeout(initDatabase, 3000);
            return;
        }

        console.log('Database connected');

        connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL
            )
        `);
    });
};

initDatabase();

app.get('/', (req, res) => {
    res.send('Backend API Running');
});

app.get('/users', async (req, res) => {
    try {
        const result = await connection.promise().query('SELECT * FROM users');
        res.json(result[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/users', async (req, res) => {
    const { name } = req.body;

    try {
        await connection.promise().query(
            'INSERT INTO users (name) VALUES (?)',
            [name]
        );

        res.status(201).json({
            message: 'User berhasil ditambahkan'
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
        await connection.promise().query(
            'UPDATE users SET name = ? WHERE id = ?',
            [name, id]
        );

        res.json({
            message: 'User berhasil diupdate'
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/users/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await connection.promise().query(
            'DELETE FROM users WHERE id = ?',
            [id]
        );

        res.status(204).send();

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.APP_PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});