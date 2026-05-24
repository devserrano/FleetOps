console.log('operadores.js cargado');

async function obtenerOperadores() {

    try {

        const respuesta = await fetch(
            'http://localhost:3000/api/operadores'
        );

        const operadores = await respuesta.json();

        console.log(operadores);

        const contenedor = document.getElementById(
            'contenedorOperadores'
        );

        contenedor.innerHTML = '';

        operadores.forEach((operador) => {

            contenedor.innerHTML += `

                <div class="card-operador">

                    <div class="foto-contenedor">

                        <img 
                            src="${operador.foto}" 
                            class="foto-operador"
                        >

                    </div>

                    <div class="info-operador">

                        <h3>${operador.nombre}</h3>

                        <p class="telefono">
                            ${operador.telefono}
                        </p>

                        <p class="unidad">
                            🚲 ${operador.unidad || 'Sin unidad'}
                        </p>

                        <span class="badge-estado ${operador.estado_vehiculo?.toLowerCase().replaceAll(' ', '-') || ''}">

                            ${operador.estado_vehiculo || 'Sin vehículo'}

                        </span>

                    </div>

                    <div class="acciones-operador">

                    <button 

                        class="btn-editar"

                        onclick="editarOperador(${operador.id})"

                        title="Editar operador">

                            <i class="fa-solid fa-pen"></i>

                            </button>

                            <button class="btn-eliminar">

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </div>

                </div>

            `;

        });
                    contenedor.innerHTML += `

                    <div 

                        class="card-agregar-operador"

                        onclick="abrirModalOperador()"

                     >

                    <div class="icono-agregar">

                        <i class="fa-solid fa-plus"></i>

                    </div>

                    <h3>Agregar Operador</h3>

                </div>

            `;

    } catch (error) {

        console.error(
            'Error al obtener operadores:',
            error
        );

    }

}

obtenerOperadores();


function abrirModalOperador() {

    const modal = document.getElementById('modalOperador');

    modal.setAttribute('data-id', '');

    document.getElementById('inputNombreOperador').value = '';
    document.getElementById('inputTelefonoOperador').value = '';
    document.getElementById('inputFotoOperador').value = '';
    document.getElementById('selectEstadoOperador').value = 'Reserva';
    document.getElementById('previewFotoOperador').src = 'https://i.pravatar.cc/300';

    modal.classList.remove('oculto');

}

async function editarOperador(id) {

    const respuesta = await fetch(
        'http://localhost:3000/api/operadores'
    );

    const operadores = await respuesta.json();

    const operador = operadores.find(
        item => item.id === id
    );

    const modal = document.getElementById('modalOperador');

    modal.setAttribute('data-id', id);

    document.getElementById('inputNombreOperador').value = operador.nombre;
    document.getElementById('inputTelefonoOperador').value = operador.telefono || '';
    document.getElementById('inputFotoOperador').value = operador.foto || '';
    document.getElementById('selectEstadoOperador').value = operador.estado || 'Activo';
    document.getElementById('previewFotoOperador').src = operador.foto || 'https://i.pravatar.cc/300';

    modal.classList.remove('oculto');

}

const btnGuardarOperador = document.getElementById(
    'btnGuardarOperador'
);

const btnCancelarOperador = document.getElementById(
    'btnCancelarOperador'
);

btnCancelarOperador.addEventListener('click', () => {

    document
        .getElementById('modalOperador')
        .classList.add('oculto');

});


const inputFotoOperador = document.getElementById(
    'inputFotoOperador'
);

inputFotoOperador.addEventListener('input', () => {

    const url = inputFotoOperador.value.trim();

    document.getElementById(
        'previewFotoOperador'
    ).src = url || 'https://i.pravatar.cc/300';

});

btnGuardarOperador.addEventListener('click', async () => {

    const modal = document.getElementById(
        'modalOperador'
    );

    const idEditando = modal.getAttribute('data-id');

    const nombre = document
        .getElementById('inputNombreOperador')
        .value
        .trim();

    const telefono = document
        .getElementById('inputTelefonoOperador')
        .value
        .trim();

    const foto = document
        .getElementById('inputFotoOperador')
        .value
        .trim() || 'https://i.pravatar.cc/300';

    const estado = document
        .getElementById('selectEstadoOperador')
        .value;

    if (!nombre) {

        alert('El nombre es obligatorio');

        return;

    }

    const url = idEditando
        ? `http://localhost:3000/api/operadores/${idEditando}`
        : 'http://localhost:3000/api/operadores';

    const metodo = idEditando
        ? 'PUT'
        : 'POST';

    try {

        await fetch(url, {

            method: metodo,

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                nombre,
                telefono,
                foto,
                estado
            })

        });

        modal.setAttribute('data-id', '');

        modal.classList.add('oculto');

        obtenerOperadores();

    } catch (error) {

        console.error(
            'Error al guardar operador:',
            error
        );

    }

});