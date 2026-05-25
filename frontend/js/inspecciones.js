console.log('inspecciones.js cargado');
const btnAgregarInspeccion = document.getElementById('btnAgregarInspeccion');
const btnCancelarInspeccion = document.getElementById('btnCancelarInspeccion');
const btnGuardarInspeccion = document.getElementById('btnGuardarInspeccion');

btnAgregarInspeccion.addEventListener('click', async () => {

    await cargarVehiculosEnInspeccion();

    const modal = document.getElementById('modalInspeccion');

    modal.setAttribute('data-id', '');
    modal.classList.remove('oculto');

});

btnCancelarInspeccion.addEventListener('click', () => {

    document
        .getElementById('modalInspeccion')
        .classList.add('oculto');

});

async function cargarVehiculosEnInspeccion() {

    const respuesta = await fetch('http://localhost:3000/api/vehiculos');

    const vehiculos = await respuesta.json();

    const select = document.getElementById('selectVehiculoInspeccion');

    select.innerHTML = '';

    vehiculos.forEach((vehiculo) => {

        select.innerHTML += `
            <option value="${vehiculo.id}">
                ${vehiculo.unidad}
            </option>
        `;

    });

}


btnGuardarInspeccion.addEventListener('click', async () => {

    const modal = document.getElementById('modalInspeccion');
    const idEditando = modal.getAttribute('data-id');

    const vehiculo_id = document.getElementById('selectVehiculoInspeccion').value;
    const frenos = document.getElementById('selectFrenos').value;
    const llantas = document.getElementById('selectLlantas').value;
    const luces = document.getElementById('selectLuces').value;
    const cadena = document.getElementById('selectCadena').value;
    const resultado = document.getElementById('selectResultadoInspeccion').value;
    const observaciones = document.getElementById('inputObservaciones').value.trim();

    const url = idEditando
        ? `http://localhost:3000/api/inspecciones/${idEditando}`
        : 'http://localhost:3000/api/inspecciones';

    const metodo = idEditando ? 'PUT' : 'POST';

    try {

        const respuesta = await fetch(url, {
            method: metodo,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                vehiculo_id,
                frenos,
                llantas,
                luces,
                cadena,
                resultado,
                observaciones
            })
        });

        if (!respuesta.ok) {
            throw new Error('Error del servidor al guardar inspección');
        }

        modal.setAttribute('data-id', '');
        modal.classList.add('oculto');

        document.getElementById('inputObservaciones').value = '';

        obtenerInspecciones();

    } catch (error) {

        console.error('Error al guardar inspección:', error);

    }

});



async function obtenerInspecciones() {

    try {

        const respuesta = await fetch(
            'http://localhost:3000/api/inspecciones'
        );

        const inspecciones = await respuesta.json();
        actualizarCardsInspecciones(inspecciones);

        const contenedor = document.getElementById(
            'contenedorInspecciones'
        );

        contenedor.innerHTML = '';

        inspecciones.forEach((inspeccion) => {

            contenedor.innerHTML += `
                <tr>

                   <td>${inspeccion.unidad}</td>

                    <td>
                        ${new Date(inspeccion.fecha).toLocaleString('es-MX', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </td>

                    <td>
                        <span class="resultado ${inspeccion.resultado.toLowerCase().replaceAll(' ', '-')}">
                            ${inspeccion.resultado}
                        </span>
                    </td>

                    <td>${inspeccion.observaciones || '-'}</td>

                    <td>
                        <button 
                            class="btn-editar" 
                            onclick="editarInspeccion(${inspeccion.id})"
                            title="Editar inspección">

                            <i class="fa-solid fa-pen"></i>

                        </button>
                    </td>

                </tr>
            `;

        });

    } catch (error) {

        console.error(
            'Error al obtener inspecciones:',
            error
        );

    }

}

obtenerInspecciones();


function actualizarCardsInspecciones(inspecciones) {

    const total = inspecciones.length;

    const aprobadas = inspecciones.filter(
        inspeccion => inspeccion.resultado.toLowerCase() === 'aprobado'
    ).length;

    const mantenimiento = inspecciones.filter(
        inspeccion => inspeccion.resultado.toLowerCase() === 'requiere mantenimiento'
    ).length;

    document.getElementById('totalInspecciones').textContent = total;
    document.getElementById('inspeccionesAprobadas').textContent = aprobadas;
    document.getElementById('inspeccionesMantenimiento').textContent = mantenimiento;

}



async function editarInspeccion(id) {

    await cargarVehiculosEnInspeccion();

    const respuesta = await fetch(
        'http://localhost:3000/api/inspecciones'
    );

    const inspecciones = await respuesta.json();

    const inspeccion = inspecciones.find(
        item => item.id === id
    );

    const modal = document.getElementById('modalInspeccion');

    modal.setAttribute('data-id', id);

    document.getElementById('selectVehiculoInspeccion').value = inspeccion.vehiculo_id;
    document.getElementById('selectFrenos').value = inspeccion.frenos;
    document.getElementById('selectLlantas').value = inspeccion.llantas;
    document.getElementById('selectLuces').value = inspeccion.luces;
    document.getElementById('selectCadena').value = inspeccion.cadena;
    document.getElementById('selectResultadoInspeccion').value = inspeccion.resultado;
    document.getElementById('inputObservaciones').value = inspeccion.observaciones || '';

    modal.classList.remove('oculto');

}