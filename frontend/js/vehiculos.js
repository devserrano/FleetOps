let vehiculosGlobal = [];

let vehiculosFiltradosGlobal = [];

let paginaActual = 1;

const vehiculosPorPagina = 5;

async function obtenerVehiculos() {

    try {

        const respuesta = await fetch(
            'http://localhost:3000/api/vehiculos'
        );

        const vehiculos = await respuesta.json();

        vehiculosGlobal = vehiculos;

        console.log(vehiculos);

        actualizarDashboard(vehiculos);

        renderizarVehiculos(vehiculos);

        actualizarInfoPaginacion(vehiculos);

    } catch (error) {

        console.error(
            'Error al obtener vehículos:',
            error
        );

    }

}

function renderizarVehiculos(vehiculos) {

    vehiculosFiltradosGlobal = vehiculos;

    const inicio = (paginaActual - 1) * vehiculosPorPagina;
    const fin = inicio + vehiculosPorPagina;

    const vehiculosPagina = vehiculos.slice(inicio, fin);

    const contenedor = document.getElementById(
        'contenedorVehiculos'
    );

    contenedor.innerHTML = '';

    vehiculosPagina.forEach((vehiculo) => {

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
                    <button class="btn-editar" onclick="editarVehiculo(${vehiculo.id})">
                        <i class="fa-solid fa-pen"></i>
                    </button>

                    <button class="btn-eliminar" onclick="eliminarVehiculo(${vehiculo.id})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;

    });

    actualizarInfoPaginacion(vehiculos);

}

obtenerVehiculos();

function cambiarPaginaVehiculos(direccion) {

    const totalPaginas = Math.ceil(
        vehiculosFiltradosGlobal.length / vehiculosPorPagina
    );

    paginaActual += direccion;

    if (paginaActual < 1) {
        paginaActual = 1;
    }

    if (paginaActual > totalPaginas) {
        paginaActual = totalPaginas;
    }

    renderizarVehiculos(vehiculosFiltradosGlobal);

}

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


    document.getElementById('totalVehiculos').textContent = total;
    document.getElementById('vehiculosActivos').textContent = activos;
    document.getElementById('vehiculosMantenimiento').textContent = mantenimiento;
    obtenerTotalOperadores();
    cargarUltimasInspeccionesDashboard();
    cargarUltimosMantenimientosDashboard();
    cargarAlertasCriticas(vehiculos);
    actualizarSaludFlota(vehiculos);

}

async function obtenerTotalOperadores() {

    try {

        const respuesta = await fetch(
            'http://localhost:3000/api/operadores'
        );

        const operadores = await respuesta.json();

        document.getElementById(
            'totalOperadores'
        ).textContent = operadores.length;

    } catch (error) {

        console.error(
            'Error al obtener operadores:',
            error
        );

    }

}


async function cargarUltimasInspeccionesDashboard() {

    try {

        const respuesta = await fetch(
            'http://localhost:3000/api/inspecciones'
        );

        const inspecciones = await respuesta.json();

        const contenedor = document.getElementById(
            'ultimasInspecciones'
        );

        contenedor.innerHTML = '';

        inspecciones.slice(0, 4).forEach((inspeccion) => {

            contenedor.innerHTML += `
                <div class="item-dashboard">
                    <div>
                        <strong>${inspeccion.unidad}</strong>
                        <span>${inspeccion.observaciones || 'Sin observaciones'}</span>
                    </div>

                    <span class="resultado ${inspeccion.resultado.toLowerCase().replaceAll(' ', '-')}">
                        ${inspeccion.resultado}
                    </span>
                </div>
            `;

        });

    } catch (error) {

        console.error('Error al cargar inspecciones dashboard:', error);

    }

}

async function cargarUltimosMantenimientosDashboard() {

    try {

        const respuesta = await fetch(
            'http://localhost:3000/api/mantenimientos'
        );

        const mantenimientos = await respuesta.json();

        const contenedor = document.getElementById(
            'ultimosMantenimientos'
        );

        contenedor.innerHTML = '';

        mantenimientos.slice(0, 4).forEach((mantenimiento) => {

            contenedor.innerHTML += `
                <div class="item-dashboard">
                    <div>
                        <strong>${mantenimiento.unidad}</strong>
                        <span>${mantenimiento.servicio}</span>
                    </div>

                    <span class="resultado ${mantenimiento.estado.toLowerCase().replaceAll(' ', '-')}">
                        ${mantenimiento.estado}
                    </span>
                </div>
            `;

        });

    } catch (error) {

        console.error('Error al cargar mantenimientos dashboard:', error);

    }

}

function cargarAlertasCriticas(vehiculos) {

    const contenedor = document.getElementById(
        'alertasCriticas'
    );

    contenedor.innerHTML = '';

    const alertas = vehiculos.filter(

        vehiculo =>

            vehiculo.estado.toLowerCase() === 'en mantenimiento'

    );

    if (alertas.length === 0) {

        contenedor.innerHTML = `
            <div class="alerta-item">

                <strong>
                    ✅ Sin alertas críticas
                </strong>

                <span>
                    Todo operativo
                </span>

            </div>
        `;

        return;

    }

    alertas.forEach((vehiculo) => {

        contenedor.innerHTML += `
            <div class="alerta-item">

                <strong>
                    ${vehiculo.unidad}
                </strong>

                <span>
                    Requiere atención
                </span>

            </div>
        `;

    });

}

function actualizarSaludFlota(vehiculos) {

    const total = vehiculos.length;

    const activos = vehiculos.filter(
        vehiculo => vehiculo.estado.toLowerCase() === 'activo'
    ).length;

    const porcentaje = total === 0
        ? 0
        : Math.round((activos / total) * 100);

    const porcentajeDashboard = document.getElementById('porcentajeFlota');

    if (porcentajeDashboard) {
        porcentajeDashboard.textContent = `${porcentaje}%`;
    }

    const barraDashboard = document.getElementById('barraFlotaFill');

    if (barraDashboard) {
        barraDashboard.style.width = `${porcentaje}%`;
    }

    const saludVehiculos = document.getElementById('saludVehiculos');

    if (saludVehiculos) {
        saludVehiculos.textContent = `${porcentaje}%`;
    }

}


function filtrarVehiculos(texto) {

    const textoBusqueda = texto.toLowerCase();

    const vehiculosFiltrados = vehiculosGlobal.filter((vehiculo) => {

        const unidad = vehiculo.unidad?.toLowerCase() || '';

        const operador = vehiculo.operador?.toLowerCase() || '';

        const estado = vehiculo.estado?.toLowerCase() || '';

        return (

            unidad.includes(textoBusqueda)

            ||

            operador.includes(textoBusqueda)

            ||

            estado.includes(textoBusqueda)

        );

    });

    paginaActual = 1;

    renderizarVehiculos(vehiculosFiltrados);

}

let estadoFiltroActual = 'todos';

function filtrarPorEstado(estado) {

    estadoFiltroActual = estado;

    let vehiculosFiltrados = vehiculosGlobal;

    if (estado !== 'todos') {

        vehiculosFiltrados = vehiculosGlobal.filter(

            vehiculo =>

                vehiculo.estado.toLowerCase() === estado

        );

    }
    paginaActual = 1;

    renderizarVehiculos(vehiculosFiltrados);

    actualizarInfoPaginacion(vehiculosFiltrados);

}

function actualizarInfoPaginacion(vehiculos) {

    const info = document.getElementById('infoPaginacion');
    const pagina = document.getElementById('paginaActualVehiculos');

    if (!info || !pagina) {
        return;
    }

    const total = vehiculos.length;

    const inicio = total === 0
        ? 0
        : (paginaActual - 1) * vehiculosPorPagina + 1;

    const fin = Math.min(
        paginaActual * vehiculosPorPagina,
        total
    );

    info.textContent = `Mostrando ${inicio} a ${fin} de ${total} vehículos`;

    pagina.textContent = paginaActual;

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

const inputBusqueda = document.getElementById('inputBusqueda');

if (inputBusqueda) {

    inputBusqueda.addEventListener('input', (evento) => {

        const texto = evento.target.value;

        if (texto.trim() !== '') {

            mostrarSeccion('vehiculos');

        }

        filtrarVehiculos(texto);

    });

}


