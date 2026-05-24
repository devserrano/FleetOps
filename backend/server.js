
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

        const { operador, estado } = req.body;

        const resultado = await pool.query(

            `

            UPDATE vehiculos

            SET operador = $1,
            estado = $2

            WHERE id = $3

            RETURNING *

            `,

            [operador, estado, id]

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




app.post('/api/inspecciones', async (req, res) => {

    try {

        const {
            vehiculo_id,
            frenos,
            llantas,
            luces,
            cadena,
            resultado,
            observaciones
        } = req.body;

        const resultadoQuery = await pool.query(
            `
            INSERT INTO inspecciones
            (
                vehiculo_id,
                frenos,
                llantas,
                luces,
                cadena,
                resultado,
                observaciones
            )

            VALUES ($1, $2, $3, $4, $5, $6, $7)

            RETURNING *
            `,
            [
                vehiculo_id,
                frenos,
                llantas,
                luces,
                cadena,
                resultado,
                observaciones
            ]
        );

        res.json(resultadoQuery.rows[0]);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: 'Error al guardar inspección'
        });

    }

});

app.get('/api/inspecciones', async (req, res) => {

    try {

       const resultado = await pool.query(

    `

    SELECT 

        inspecciones.id,

        inspecciones.vehiculo_id,

        vehiculos.unidad,

        inspecciones.fecha,

        inspecciones.frenos,

        inspecciones.llantas,

        inspecciones.luces,

        inspecciones.cadena,

        inspecciones.resultado,

        inspecciones.observaciones

    FROM inspecciones

    JOIN vehiculos

    ON inspecciones.vehiculo_id = vehiculos.id

    ORDER BY inspecciones.id DESC

    `

);

        res.json(resultado.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: 'Error al obtener inspecciones'
        });

    }

});


app.put('/api/inspecciones/:id', async (req, res) => {

    try {

        const { id } = req.params;

        const {
            vehiculo_id,
            frenos,
            llantas,
            luces,
            cadena,
            resultado,
            observaciones
        } = req.body;

        const resultadoQuery = await pool.query(
            `
            UPDATE inspecciones
            SET vehiculo_id = $1,
                frenos = $2,
                llantas = $3,
                luces = $4,
                cadena = $5,
                resultado = $6,
                observaciones = $7
            WHERE id = $8
            RETURNING *
            `,
            [
                vehiculo_id,
                frenos,
                llantas,
                luces,
                cadena,
                resultado,
                observaciones,
                id
            ]
        );

        res.json(resultadoQuery.rows[0]);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: 'Error al actualizar inspección'
        });

    }

});

app.post('/api/mantenimientos', async (req, res) => {

    try {

        const {
            vehiculo_id,
            servicio,
            costo,
            estado,
            observaciones
        } = req.body;

        const resultado = await pool.query(
            `
            INSERT INTO mantenimientos
            (
                vehiculo_id,
                servicio,
                costo,
                estado,
                observaciones
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
            `,
            [
                vehiculo_id,
                servicio,
                costo,
                estado,
                observaciones
            ]
        );

        res.json(resultado.rows[0]);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: 'Error al guardar mantenimiento'
        });

    }

});
app.get('/api/mantenimientos', async (req, res) => {

    try {

        const resultado = await pool.query(
            `
            SELECT 
                mantenimientos.id,
                mantenimientos.vehiculo_id,
                vehiculos.unidad,
                mantenimientos.fecha,
                mantenimientos.servicio,
                mantenimientos.costo,
                mantenimientos.estado,
                mantenimientos.observaciones
            FROM mantenimientos
            JOIN vehiculos
            ON mantenimientos.vehiculo_id = vehiculos.id
            ORDER BY mantenimientos.id DESC
            `
        );

        res.json(resultado.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: 'Error al obtener mantenimientos'
        });

    }

});


app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
