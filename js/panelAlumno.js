
const params = new URLSearchParams(window.location.search);

// Obtener los valores de los parámetros
const claseId = params.get("id");
const claveAlumno = params.get("clave");

import { db } from './fireBase.js';
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// Obtener el ID del alumno almacenado en localStorage
const alumnoId = localStorage.getItem("alumnoId");

// Función para formatear fecha y hora en el formato DD/MM/YYYY HH:MM
function formatearFecha(fecha, hora) {
    if (!fecha || !hora) {
        console.error("Fecha u hora inválida:", fecha, hora);
        return "No disponible";
    }
    try {
        const [anio, mes, dia] = fecha.split("-");
        return `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${anio} ${hora}`;
    } catch (error) {
        console.error("Error al formatear fecha y hora:", fecha, hora, error);
        return "No disponible";
    }
}

// Finalizados Función para formatear una marca de tiempo al formato DD/MM/YYYY HH:MM
function formatearFechas(fechaTimestamp) {
    if (!fechaTimestamp) {
        return "No disponible";
    }

    try {
        const fecha = fechaTimestamp.toDate(); // Convierte la marca de tiempo de Firebase a un objeto Date
        const dia = String(fecha.getDate()).padStart(2, '0');
        const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Los meses comienzan desde 0
        const anio = fecha.getFullYear();
        const horas = String(fecha.getHours()).padStart(2, '0');
        const minutos = String(fecha.getMinutes()).padStart(2, '0');
        
        return `${dia}/${mes}/${anio} ${horas}:${minutos}`;
    } catch (error) {
        console.error("Error al formatear la fecha:", error);
        return "No disponible";
    }
}


// Función para contar los intentos de cada examen contestado por el alumno
async function obtenerIntentosExamenesContestados() {
    try {
        const examenesRef = collection(db, "ExamenesContestados");
        const q = query(examenesRef, where("idAlumno", "==", alumnoId));
        const querySnapshot = await getDocs(q);

        // Mapeo de intentos por examen
        const intentosPorExamen = {};
        querySnapshot.docs.forEach(doc => {
            const { idExamen } = doc.data();
            intentosPorExamen[idExamen] = (intentosPorExamen[idExamen] || 0) + 1;
        });

        return intentosPorExamen;
    } catch (error) {
        console.error("Error al obtener intentos de exámenes contestados:", error);
        return {};
    }
}



// Función para obtener todos los exámenes publicados
// Supongamos que claseId ya está definida globalmente
async function obtenerExamenesPublicados() {
    try {
        // Crear la referencia a la colección "Examenes" con dos filtros where
        const examenesSnap = await getDocs(
            query(
                collection(db, "Examenes"),
                where("estado", "==", "Publicado"),
                where("idProfe", "==", claseId) // Usar la variable global claseId
            )
        );

        // Mapear los documentos obtenidos y devolver un array con los datos
        return examenesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error al obtener exámenes publicados:", error);
        return [];
    }
}


// Función para obtener los exámenes finalizados por el alumno
async function obtenerExamenesFinalizados() {
    try {
        const examenesRef = collection(db, 'ExamenesContestados');
        const q = query(examenesRef, where("idAlumno", "==", alumnoId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error al obtener exámenes finalizados:", error);
        return [];
    }
}

// Función para obtener exámenes pendientes
// Supongamos que claseId ya está definida globalmente
async function obtenerExamenesPendientes() {
    try {
        // Obtener los exámenes publicados con estado "Publicado" y que coincidan con el idProfe
        const examenesSnap = await getDocs(
            query(
                collection(db, "Examenes"),
                where("estado", "==", "Publicado"),
                where("idProfe", "==", claseId) // Filtro por idProfe usando claseId
            )
        );

        // Mapear los exámenes publicados
        const examenesPublicados = examenesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Obtener los exámenes contestados por el alumno
        const contestadosSnap = await getDocs(
            query(
                collection(db, "ExamenesContestados"),
                where("idAlumno", "==", alumnoId)
            )
        );

        // Obtener los IDs de los exámenes ya contestados por el alumno
        const examenesContestadosIds = contestadosSnap.docs.map(doc => doc.data().idExamen);

        // Filtrar los exámenes publicados que no hayan sido contestados
        const examenesPendientes = examenesPublicados.filter(examen => !examenesContestadosIds.includes(examen.id));

        return examenesPendientes;

    } catch (error) {
        console.error("Error al obtener exámenes pendientes:", error);
        return [];
    }
}


async function mostrarExamenesEnTabla(tipo) {
    const tablaHead = document.querySelector("#tablaHead");
    const tableBody = document.querySelector("#tablaExamenes");

    // Definición del encabezado
    tablaHead.innerHTML = `
        <tr>
            <th>Título del Examen</th>
            <th>Estado</th>
            <th>Número de intentos</th>
            <th>Duración</th>
            <th>Termina</th>
            <th>Acciones</th>
        </tr>
    `;

    let examenes = [];
    if (tipo === 'todos') {
        examenes = await obtenerExamenesPublicados();
    } else if (tipo === 'pendientes') {
        examenes = await obtenerExamenesPendientes();
    }

    // Obtener intentos previos de los exámenes contestados por el alumno
    const intentosExamenes = await obtenerIntentosExamenesContestados();

    let tablaHTML = '';
    examenes.forEach(examen => {
        const { titulo, estado, numeroIntentos, tiempoDuracion, fechaFinalizacion, horaFinalizacion, id } = examen;
        const fechaInicio = formatearFecha(fechaFinalizacion, horaFinalizacion);
        const intentosUsados = intentosExamenes[id] || 0;

        // Deshabilitar botón si el examen está cerrado o si alcanzó el máximo de intentos
        let botonContestar;
        if (estado === "Cerrado") {
            botonContestar = `<button class="btn-contestar" data-id="${id}" disabled>No Disponible</button>`;
        } else if (intentosUsados >= parseInt(numeroIntentos)) {
            botonContestar = `<button class="btn-contestar" data-id="${id}" disabled>Intentos Máximos Alcanzados</button>`;
        } else {
            botonContestar = `<button class="btn-contestar" data-id="${id}">Contestar</button>`;
        }

        // Contenido de la fila
        tablaHTML += `
            <tr>
                <td>${titulo}</td>
                <td>${estado}</td>
                <td>${numeroIntentos}</td>
                <td>${tiempoDuracion.horas}h ${tiempoDuracion.minutos}m</td>
                <td>${fechaInicio}</td>
                <td>
                    ${botonContestar}
                </td>
            </tr>
        `;
    });

    tableBody.innerHTML = tablaHTML;
    agregarEventosBotones();
}



// Función para mostrar exámenes finalizados en la tabla
async function mostrarExamenesFinalizados() {
    const tablaHead = document.querySelector("#tablaHead");
    const tablaExamenes = document.querySelector("#tablaExamenes");

    tablaHead.innerHTML = `
        <tr>
            <th>Título del Examen</th>
            <th>Fecha y Hora de Inicio</th>
            <th>Fecha y Hora de Finalización</th>
            <th>Calificación</th>
            <th>Acciones</th>
        </tr>
    `;

    const examenesFinalizados = await obtenerExamenesFinalizados();

    let tablaHTML = '';
    examenesFinalizados.forEach(examen => {
        const { tituloExamen, fechaHoraInicializacion, fechaHoraTermina, Calificacion } = examen;
        const fechaInicio = formatearFechas(fechaHoraInicializacion);
        const fechaFin = formatearFechas(fechaHoraTermina);

        tablaHTML += `
            <tr>
                <td>${tituloExamen}</td>
                <td>${fechaInicio}</td>
                <td>${fechaFin}</td>
                <td>${Calificacion}</td>
                <td>
                    <button class="ver-resultados-btn" data-id="${examen.id}">Ver Resultados</button>
                </td>
            </tr>
        `;
    });

    tablaExamenes.innerHTML = tablaHTML;
    agregarEventosFinalizados();
}

// Función para agregar eventos a los botones "Contestar" y "Ver resultados"
function agregarEventosBotones() {
    document.querySelectorAll('.btn-contestar').forEach(button => {
        button.addEventListener('click', function() {
            const idExamen = this.getAttribute('data-id');
            window.location.href = `contestarExamen.html?id=${idExamen}&claseId=${claseId}&clave=${claveAlumno}`;

        });
    });

    document.querySelectorAll('.btn-ver-examen').forEach(button => {
        button.addEventListener('click', function() {
            const idExamen = this.getAttribute('data-id');
            window.location.href = `verResultados.html?id=${idExamen}&claseId=${claseId}&clave=${claveAlumno}`;

            
        });
    });
}

function agregarEventosFinalizados() {
    document.querySelectorAll('.ver-resultados-btn').forEach(button => {
        button.addEventListener('click', function() {
            const idExamen = this.getAttribute('data-id');
            window.location.href = `verResultados.html?id=${idExamen}&claseId=${claseId}&clave=${claveAlumno}`;

        });
    });
}


// Mostrar exámenes pendientes por defecto al cargar la página
window.onload = () => {
    mostrarExamenesEnTabla('pendientes');
};

// Eventos para cambiar entre secciones
document.getElementById("todosExamenes").addEventListener("click", () => mostrarExamenesEnTabla('todos'));
document.getElementById("finalizados").addEventListener("click", mostrarExamenesFinalizados);
document.getElementById("pendientes").addEventListener("click", () => mostrarExamenesEnTabla('pendientes'));
