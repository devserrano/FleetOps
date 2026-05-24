async function obtenerVehiculos() {

    try {

        const respuesta = await fetch(
            'http://localhost:3000/api/vehiculos'
        );

        const vehiculos = await respuesta.json();

        console.log(vehiculos);

        actualizarDashboard(vehiculos);

        const contenedor = document.getElementById(
            'contenedorVehiculos'
        );

        contenedor.innerHTML = '';

        vehiculos.forEach((vehiculo) => {

            contenedor.innerHTML += `
                <tr>
                    
                    <td>${vehiculo.unidad}</td>
                    <td>${vehiculo.operador}</td>
                    <td>${vehiculo.tipo}</td>
                    <td>
                        <span class="estado ${vehiculo.estado.toLowerCase().replaceAll(' ', '-')}">
                            ${vehiculo.estado}
                        </span>
                    </td>
                    <td>
                                                <button 
                    class="btn-editar" 
                    onclick="editarVehiculo(${vehiculo.id})"
                    title="Editar vehículo">

                    <i class="fa-solid fa-pen"></i>

                    </button>

                    <button 
                    class="btn-eliminar" 
                    onclick="eliminarVehiculo(${vehiculo.id})"
                    title="Eliminar vehículo">

                    <i class="fa-solid fa-trash"></i>

                    </button>
                    </td>
                </tr>
            `;

        });

    } catch (error) {

        console.error(
            'Error al obtener vehículos:',
            error
        );

    }

}



obtenerVehiculos();

async function eliminarVehiculo(id) {

    const confirmar = confirm(
        '¿Seguro que deseas eliminar este vehículo?'
    );

    if (!confirmar) {
        return;
    }

    try {

        await fetch(`http://localhost:3000/api/vehiculos/${id}`, {
            method: 'DELETE'
        });

        obtenerVehiculos();

    } catch (error) {

        console.error(
            'Error al eliminar vehículo:',
            error
        );

    }

}

async function editarVehiculo(id) {

    const respuesta = await fetch(

        'http://localhost:3000/api/vehiculos'

    );

    const vehiculos = await respuesta.json();

    const vehiculo = vehiculos.find(

        v => v.id === id

    );

    await cargarOperadoresEditar();

    const modal = document.getElementById('modalEstado');

    modal.setAttribute('data-id', id);

    document.getElementById('selectOperadorEditar').value = vehiculo.operador_id;

    document.getElementById('selectEstado').value = vehiculo.estado;

    modal.classList.remove('oculto');

}



function agregarVehiculo() {

    const modal = document.getElementById('modalAgregar');

    modal.classList.remove('oculto');

}



const btnAgregar = document.getElementById(
    'btnAgregar'
);

btnAgregar.addEventListener(
    'click',
    agregarVehiculo
);

function actualizarDashboard(vehiculos) {

    const total = vehiculos.length;

    const activos = vehiculos.filter(
        vehiculo => vehiculo.estado.toLowerCase() === 'activo'
    ).length;

    const mantenimiento = vehiculos.filter(
        vehiculo => vehiculo.estado.toLowerCase() === 'en mantenimiento'
    ).length;

    const descompuestos = vehiculos.filter(
        vehiculo => vehiculo.estado.toLowerCase() === 'descompuesto'
    ).length;

    document.getElementById('totalVehiculos').textContent = total;
    document.getElementById('vehiculosActivos').textContent = activos;
    document.getElementById('vehiculosMantenimiento').textContent = mantenimiento;
    document.getElementById('vehiculosDescompuestos').textContent = descompuestos;

}

const btnCancelarEstado = document.getElementById(
    'btnCancelarEstado'
);

const btnGuardarEstado = document.getElementById(
    'btnGuardarEstado'
);

const btnGuardarAgregar = document.getElementById('btnGuardarAgregar');
const btnCancelarAgregar = document.getElementById('btnCancelarAgregar');

btnCancelarEstado.addEventListener('click', () => {

    const modal = document.getElementById('modalEstado');

    modal.setAttribute('data-id', '');
    modal.classList.add('oculto');

});








btnCancelarAgregar.addEventListener('click', () => {

    const modal = document.getElementById('modalAgregar');

    modal.classList.add('oculto');

});




btnGuardarAgregar.addEventListener('click', async () => {

    const unidad = document
        .getElementById('inputUnidad')
        .value
        .trim();

    const operador = document
        .getElementById('inputOperador')
        .value
        .trim();

    const estado = document
        .getElementById('selectEstadoAgregar')
        .value;

    const formatoUnidad = /^BT-\d{2}$/;

    if (!formatoUnidad.test(unidad)) {
        alert('La unidad debe tener formato BT-01, BT-02, etc.');
        return;
    }

    if (!operador) {
        alert('El operador es obligatorio');
        return;
    }

    try {

        await fetch('http://localhost:3000/api/vehiculos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                unidad,
                operador,
                tipo: 'Bicitaxi',
                estado
            })
        });

        document.getElementById('inputUnidad').value = '';
        document.getElementById('inputOperador').value = '';

        document
            .getElementById('modalAgregar')
            .classList.add('oculto');

        obtenerVehiculos();

    } catch (error) {

        console.error('Error al agregar vehículo:', error);

    }

});





btnGuardarEstado.addEventListener('click', async () => {

    const modal = document.getElementById('modalEstado');

    const id = modal.getAttribute('data-id');

    const operador_id = document
        .getElementById('selectOperadorEditar')
        .value;

    const nuevoEstado = document
        .getElementById('selectEstado')
        .value;

    if (!id) {
        alert('No hay vehículo seleccionado');
        return;
    }

    if (!operador_id) {
        alert('El operador es obligatorio');
        return;
    }

    try {

        await fetch(`http://localhost:3000/api/vehiculos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                operador_id,
                estado: nuevoEstado
            })
        });

        modal.setAttribute('data-id', '');
        modal.classList.add('oculto');

        obtenerVehiculos();

    } catch (error) {

        console.error(
            'Error al actualizar vehículo:',
            error
        );

    }

});



async function cargarOperadoresEditar() {

    const respuesta = await fetch(
        'http://localhost:3000/api/operadores'
    );

    const operadores = await respuesta.json();

    const select = document.getElementById(
        'selectOperadorEditar'
    );

    select.innerHTML = '';

    operadores.forEach((operador) => {

        select.innerHTML += `
            <option value="${operador.id}">
                ${operador.nombre}
            </option>
        `;

    });

}

