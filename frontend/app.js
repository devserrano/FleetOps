function mostrarSeccion(idSeccion) {

    const secciones = document.querySelectorAll('.seccion');

    secciones.forEach((seccion) => {
        seccion.classList.add('oculto');
    });

    const seccionActiva = document.getElementById(idSeccion);

    seccionActiva.classList.remove('oculto');

    const botones = document.querySelectorAll('.sidebar button');

    botones.forEach((boton) => {
        boton.classList.remove('activo-menu');
    });

    const botonActivo = document.querySelector(
        `[data-seccion="${idSeccion}"]`
    );

    if (botonActivo) {
        botonActivo.classList.add('activo-menu');
    }

}