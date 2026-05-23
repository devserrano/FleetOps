

const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
const pool = require('./src/config/db');


app.use(cors());
app.use(express.json());

pool.connect()
    .then(() => {
        console.log('Base de datos PostgreSQL conectada');
    })
    .catch((err) => {
        console.log('Error de conexión:', err);
    });

app.get('/api/vehiculos', async (req, res) => {

    try {

        const resultado = await pool.query(
            'SELECT * FROM vehiculos ORDER BY id ASC'
        );

        res.json(resultado.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: 'Error del servidor'
        });

    }

});

app.post('/api/vehiculos', async (req, res) => {

    try {

        const { unidad, tipo, estado, operador } = req.body;

        const resultado = await pool.query(
            `
            INSERT INTO vehiculos (unidad, tipo, estado, operador)
            VALUES ($1, $2, $3, $4)
            RETURNING *
            `,
            [unidad, tipo, estado, operador]
        );

        res.json(resultado.rows[0]);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: 'Error al agregar vehículo'
        });

    }

});

app.put('/api/vehiculos/:id', async (req, res) => {

    try {

        const { id } = req.params;

        const { estado } = req.body;

        const resultado = await pool.query(

            `

            UPDATE vehiculos

            SET estado = $1

            WHERE id = $2

            RETURNING *

            `,

            [estado, id]

        );

        res.json(resultado.rows[0]);

    } catch (error) {

        console.error(error);

        res.status(500).json({

            mensaje: 'Error al actualizar estado'

        });

    }

});

app.delete('/api/vehiculos/:id', async (req, res) => {

    try {

        const { id } = req.params;

        await pool.query(
            'DELETE FROM vehiculos WHERE id = $1',
            [id]
        );

        res.json({
            mensaje: 'Vehículo eliminado correctamente'
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: 'Error al eliminar vehículo'
        });

    }

});

app.get("/api", (req, res) => { 

    res.send("App corriendo correctamente en el servidor");
});


app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});



