
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
                `
                SELECT
                    vehiculos.id,
                    vehiculos.unidad,
                    vehiculos.tipo,
                    vehiculos.estado,
                    vehiculos.operador_id,
                    operadores.nombre AS operador
                FROM vehiculos
                LEFT JOIN operadores
                ON vehiculos.operador_id = operadores.id
                ORDER BY vehiculos.id ASC
                `
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

        const { operador_id, estado } = req.body;

        const resultado = await pool.query(
            `
            UPDATE vehiculos
            SET operador_id = $1,
                estado = $2
            WHERE id = $3
            RETURNING *
            `,
            [operador_id, estado, id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensaje: 'Vehículo no encontrado'
            });
        }

        res.json(resultado.rows[0]);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: 'Error al actualizar vehículo'
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

            await actualizarEstadoVehiculoPorInspeccion(
                 vehiculo_id,
                 resultado
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
        await actualizarEstadoVehiculoPorInspeccion(
          vehiculo_id,
          resultado
        );

        res.json(resultadoQuery.rows[0]);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: 'Error al actualizar inspección'
        });

    }

});



async function actualizarEstadoVehiculoPorMantenimiento(vehiculo_id, estado) {

    const vehiculoActual = await pool.query(
        `
        SELECT estado
        FROM vehiculos
        WHERE id = $1
        `,
        [vehiculo_id]
    );

    if (vehiculoActual.rows.length === 0) {
        return;
    }

    const estadoActual = vehiculoActual.rows[0].estado;

    if (estadoActual === 'Descompuesto') {
        return;
    }

    if (estado === 'Pendiente' || estado === 'En proceso') {

        await pool.query(
            `
            UPDATE vehiculos
            SET estado = 'En mantenimiento'
            WHERE id = $1
            `,
            [vehiculo_id]
        );

    } else if (estado === 'Finalizado') {

        await pool.query(
            `
            UPDATE vehiculos
            SET estado = 'Activo'
            WHERE id = $1
            `,
            [vehiculo_id]
        );

    }

}


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
         await actualizarEstadoVehiculoPorMantenimiento(
            vehiculo_id,
            estado
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

app.put('/api/mantenimientos/:id', async (req, res) => {

    

    try {

        const { id } = req.params;

        const {
            vehiculo_id,
            servicio,
            costo,
            estado,
            observaciones
        } = req.body;

        const resultado = await pool.query(
            `
            UPDATE mantenimientos
            SET vehiculo_id = $1,
                servicio = $2,
                costo = $3,
                estado = $4,
                observaciones = $5
            WHERE id = $6
            RETURNING *
            `,
            [
                vehiculo_id,
                servicio,
                costo,
                estado,
                observaciones,
                id
            ]
        );

        await actualizarEstadoVehiculoPorMantenimiento(
        vehiculo_id,
            estado
        );

        res.json(resultado.rows[0]);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: 'Error al actualizar mantenimiento'
        });

    }

});



async function actualizarEstadoVehiculoPorInspeccion(vehiculo_id, resultado) {

    const vehiculoActual = await pool.query(
        `
        SELECT estado
        FROM vehiculos
        WHERE id = $1
        `,
        [vehiculo_id]
    );

    if (vehiculoActual.rows.length === 0) {
        return;
    }

    const estadoActual = vehiculoActual.rows[0].estado;

    if (estadoActual === 'Descompuesto') {
        return;
    }

    if (resultado === 'Requiere mantenimiento') {

        await pool.query(
            `
            UPDATE vehiculos
            SET estado = 'En mantenimiento'
            WHERE id = $1
            `,
            [vehiculo_id]
        );

    }

    if (resultado === 'Aprobado') {

        await pool.query(
            `
            UPDATE vehiculos
            SET estado = 'Activo'
            WHERE id = $1
            `,
            [vehiculo_id]
        );

    }

}

app.get('/api/operadores', async (req, res) => {

    try {

        const resultado = await pool.query(
            `
            SELECT
                operadores.id,
                operadores.nombre,
                operadores.telefono,
                operadores.estado,
                operadores.foto,
                vehiculos.unidad,
                vehiculos.estado AS estado_vehiculo
            FROM operadores
            LEFT JOIN vehiculos
            ON vehiculos.operador_id = operadores.id
            ORDER BY operadores.id ASC
            `
        );

        res.json(resultado.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: 'Error al obtener operadores'
        });

    }

});


app.put('/api/mantenimientos/:id/finalizar', async (req, res) => {

    try {

        const { id } = req.params;

        const mantenimiento = await pool.query(
            `
            SELECT *
            FROM mantenimientos
            WHERE id = $1
            `,
            [id]
        );

        if (mantenimiento.rows.length === 0) {
            return res.status(404).json({
                mensaje: 'Mantenimiento no encontrado'
            });
        }

        const vehiculo_id = mantenimiento.rows[0].vehiculo_id;

        const resultado = await pool.query(
            `
            UPDATE mantenimientos
            SET estado = 'Finalizado'
            WHERE id = $1
            RETURNING *
            `,
            [id]
        );

        await actualizarEstadoVehiculoPorMantenimiento(
            vehiculo_id,
            'Finalizado'
        );

        res.json(resultado.rows[0]);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: 'Error al finalizar mantenimiento'
        });

    }

});

app.post('/api/operadores', async (req, res) => {

    try {

        const {
            nombre,
            telefono,
            foto,
            estado
        } = req.body;

        const resultado = await pool.query(
            `
            INSERT INTO operadores
            (
                nombre,
                telefono,
                foto,
                estado
            )
            VALUES ($1, $2, $3, $4)
            RETURNING *
            `,
            [
                nombre,
                telefono,
                foto,
                estado
            ]
        );

        res.json(resultado.rows[0]);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: 'Error al agregar operador'
        });

    }

});

app.put('/api/operadores/:id', async (req, res) => {

    try {

        const { id } = req.params;

        const {
            nombre,
            telefono,
            foto,
            estado
        } = req.body;

        const resultado = await pool.query(
            `
            UPDATE operadores
            SET nombre = $1,
                telefono = $2,
                foto = $3,
                estado = $4
            WHERE id = $5
            RETURNING *
            `,
            [
                nombre,
                telefono,
                foto,
                estado,
                id
            ]
        );

        res.json(resultado.rows[0]);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: 'Error al actualizar operador'
        });

    }

});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});


