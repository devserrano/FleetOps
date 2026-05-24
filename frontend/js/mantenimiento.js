console.log('mantenimiento.js cargado');

const btnAgregarMantenimiento = document.getElementById(
    'btnAgregarMantenimiento'
);

const btnCancelarMantenimiento = document.getElementById(
    'btnCancelarMantenimiento'
);

const btnGuardarMantenimiento = document.getElementById(
    'btnGuardarMantenimiento'
);

btnAgregarMantenimiento.addEventListener('click', async () => {

    await cargarVehiculosMantenimiento();

    document
        .getElementById('modalMantenimiento')
        .classList.remove('oculto');

});

btnCancelarMantenimiento.addEventListener('click', () => {

    document
        .getElementById('modalMantenimiento')
        .classList.add('oculto');

});

async function cargarVehiculosMantenimiento() {

    const respuesta = await fetch(
        'http://localhost:3000/api/vehiculos'
    );

    const vehiculos = await respuesta.json();

    const select = document.getElementById(
        'selectVehiculoMantenimiento'
    );

    select.innerHTML = '';

    vehiculos.forEach((vehiculo) => {

        select.innerHTML += `
            <option value="${vehiculo.id}">
                ${vehiculo.unidad}
            </option>
        `;

    });

}

btnGuardarMantenimiento.addEventListener('click', async () => {

    const modal = document.getElementById('modalMantenimiento');
    const idEditando = modal.getAttribute('data-id');

    const vehiculo_id = document.getElementById('selectVehiculoMantenimiento').value;
    const servicio = document.getElementById('selectServicioMantenimiento').value;
    const costo = document.getElementById('inputCostoMantenimiento').value;
    const estado = document.getElementById('selectEstadoMantenimiento').value;
    const observaciones = document.getElementById('inputObservacionesMantenimiento').value.trim();

    if (!costo) {
        alert('El costo es obligatorio');
        return;
    }

    const url = idEditando
        ? `http://localhost:3000/api/mantenimientos/${idEditando}`
        : 'http://localhost:3000/api/mantenimientos';

    const metodo = idEditando ? 'PUT' : 'POST';

    try {

        await fetch(url, {
            method: metodo,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                vehiculo_id,
                servicio,
                costo,
                estado,
                observaciones
            })
        });

        modal.setAttribute('data-id', '');
        modal.classList.add('oculto');

        document.getElementById('inputCostoMantenimiento').value = '';
        document.getElementById('inputObservacionesMantenimiento').value = '';

        obtenerMantenimientos();

    } catch (error) {

        console.error(
            'Error al guardar mantenimiento:',
            error
        );

    }

});
async function obtenerMantenimientos() {

    try {

        const respuesta = await fetch(
            'http://localhost:3000/api/mantenimientos'
        );

        const mantenimientos = await respuesta.json();

        actualizarCardsMantenimiento(mantenimientos);

        const contenedor = document.getElementById(
            'contenedorMantenimientos'
        );

        contenedor.innerHTML = '';

        mantenimientos.forEach((mantenimiento) => {

            contenedor.innerHTML += `
                <tr>

                    <td>
                        ${new Date(mantenimiento.fecha).toLocaleString('es-MX', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </td>

                    <td>${mantenimiento.unidad}</td>

                    <td>${mantenimiento.servicio}</td>

                    <td>$${Number(mantenimiento.costo).toFixed(2)}</td>

                    <td>
                        <span class="resultado ${mantenimiento.estado.toLowerCase().replaceAll(' ', '-')}">
                            ${mantenimiento.estado}
                        </span>
                    </td>

                    <td>${mantenimiento.observaciones || '-'}</td>

                        <td>

    <button 

        class="btn-editar"

        onclick="editarMantenimiento(${mantenimiento.id})"

        title="Editar mantenimiento">

        <i class="fa-solid fa-pen"></i>

    </button>

    ${mantenimiento.estado !== 'Finalizado'

        ? `

                            <button 

                                class="btn-finalizar"

                                onclick="finalizarMantenimiento(${mantenimiento.id})"

                                title="Marcar como finalizado">

                                <i class="fa-solid fa-check"></i>

                            </button>

                            `

                            : ''

                        }

                    </td>

                </tr>
            `;

        });

    } catch (error) {

        console.error(
            'Error al obtener mantenimientos:',
            error
        );

    }

}

async function editarMantenimiento(id) {

    const respuesta = await fetch(
        'http://localhost:3000/api/mantenimientos'
    );

    const mantenimientos = await respuesta.json();

    const mantenimiento = mantenimientos.find(
        item => item.id === id
    );

    await cargarVehiculosMantenimiento();

    const modal = document.getElementById(
        'modalMantenimiento'
    );

    modal.setAttribute('data-id', id);

    document.getElementById(
        'selectVehiculoMantenimiento'
    ).value = mantenimiento.vehiculo_id;

    document.getElementById(
        'selectServicioMantenimiento'
    ).value = mantenimiento.servicio;

    document.getElementById(
        'inputCostoMantenimiento'
    ).value = mantenimiento.costo;

    document.getElementById(
        'selectEstadoMantenimiento'
    ).value = mantenimiento.estado;

    document.getElementById(
        'inputObservacionesMantenimiento'
    ).value = mantenimiento.observaciones || '';

    modal.classList.remove('oculto');

}


function actualizarCardsMantenimiento(mantenimientos) {

    const total = mantenimientos.length;

    const pendientes = mantenimientos.filter(
        mantenimiento => mantenimiento.estado.toLowerCase() === 'pendiente'|| mantenimiento.estado.toLowerCase() === 'en proceso'
    ).length;

    const enProceso = mantenimientos.filter(
        mantenimiento => mantenimiento.estado.toLowerCase() === 'en proceso'
    ).length;

    const finalizados = mantenimientos.filter(
        mantenimiento => mantenimiento.estado.toLowerCase() === 'finalizado'
    ).length;

    const gastoTotal = mantenimientos.reduce(
        (suma, mantenimiento) => suma + Number(mantenimiento.costo),
        0
    );

    document.getElementById('totalMantenimientos').textContent = total;
    document.getElementById('pendientesMantenimiento').textContent = pendientes;
    document.getElementById('finalizadosMantenimiento').textContent = finalizados;
    document.getElementById('gastoTotal').textContent = `$${gastoTotal.toFixed(2)}`;

}
async function finalizarMantenimiento(id) {

    try {

        await fetch(
            `http://localhost:3000/api/mantenimientos/${id}/finalizar`,
            {
                method: 'PUT'
            }
        );

        obtenerMantenimientos();
        obtenerVehiculos();

    } catch (error) {

        console.error(
            'Error al finalizar mantenimiento:',
            error
        );

    }

}

obtenerMantenimientos();