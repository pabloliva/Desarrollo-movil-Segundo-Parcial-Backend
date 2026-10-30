const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Configuración por Socket de Linux (Evita bloqueos de puertos y contraseñas locales)
const dbConfig = {
    socketPath: '/var/run/mysqld/mysqld.sock',
    user: 'root',
    database: 'app_notas'
};

// 1. MÉTODO: Login (POST /api/login)
app.post('/api/login', async (req, res) => {
    const { usuario, contrasena } = req.body;
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(
            'SELECT Id_Usuario FROM Usuario WHERE Usuario = ? AND Contraseña = ?',
            [usuario, contrasena]
        );
        await connection.end();

        if (rows.length > 0) {
            res.json({ login: true, id_usuario: rows[0].Id_Usuario });
        } else {
            res.status(401).json({ login: false, mensaje: "Credenciales inválidas" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. MÉTODO: Crear Registro (POST /api/notas)
app.post('/api/notas', async (req, res) => {
    const { id_usuario, titulo, contenido, fecha_creacion } = req.body;
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(
            'INSERT INTO Notas (Id_Usuario, Tititulo, Contenido, Fecha_creacion) VALUES (?, ?, ?, ?)',
            [id_usuario, titulo, contenido, fecha_creacion]
        );
        await connection.end();

        res.status(201).json({ mensaje: "Nota creada exitosamente", id_nota: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. MÉTODO: Consulta de Notas por Usuario (GET /api/notas/:id_usuario)
app.get('/api/notas/:id_usuario', async (req, res) => {
    const { id_usuario } = req.params;
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(
            'SELECT * FROM Notas WHERE Id_Usuario = ?',
            [id_usuario]
        );
        await connection.end();

        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor API corriendo de forma nativa en el puerto ${PORT}`);
});

