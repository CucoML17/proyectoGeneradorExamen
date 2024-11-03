// contestarExamen.js
import { db } from './fireBase.js';
import { collection, getDocs, query, where, addDoc, getDoc, doc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
const claseId = params.get("id"); // Recupera el ID de la clase
const claveDocente = params.get("clave");
const claveExamen = params.get("idEx");

const alumnoId = localStorage.getItem("alumnoId"); // Recupera el ID del alumno
let inicioExamen; // Variable para almacenar la fecha y hora de inicio del examen

// Función para obtener las preguntas del examen
async function obtenerPreguntas(idExamen) {
    const preguntasRef = collection(db, "PreguntasFinal");
    const q = query(preguntasRef, where("idExam", "==", idExamen));
    const preguntasSnap = await getDocs(q);
    const preguntas = [];

    preguntasSnap.forEach((doc) => {
        const data = doc.data();
        preguntas.push({ id: doc.id, ...data });
    });

    return preguntas;
}

// Función para mostrar las preguntas en la página
// Declarar el arreglo global para almacenar índices de preguntas de opción múltiple
const preguntasMultiple = [];

async function mostrarPreguntasEnPagina() {
    const urlParams = new URLSearchParams(window.location.search);
    const idExamen = claveExamen;
    const preguntas = await obtenerPreguntas(idExamen);

    const container = document.getElementById("preguntasContainer");
    let preguntasHTML = '';

    for (let index = 0; index < preguntas.length; index++) {
        const pregunta = preguntas[index];

        // Filtrar y procesar solo preguntas válidas
        if (pregunta.pregunta !== "null" && pregunta.pregunta) {
            // Verificar si el tipo de pregunta no es 'uni' y agregar el índice al arreglo de preguntas múltiples
            if (pregunta.tipoPregunta !== 'uni') {
                preguntasMultiple.push(index); // Guardar el índice en el arreglo global
            }

            // Generar HTML para preguntas
            preguntasHTML += `
                <div class="question" data-id="${pregunta.id}">
                    <p>${index + 1}. ${pregunta.pregunta}</p>
                    <div class="options">
                        ${pregunta.tipoPregunta === 'uni' 
                            ? (() => {
                                let opcionesHTML = '';
                                for (let i = 0; i < pregunta.opciones.length; i++) {
                                    const opcion = pregunta.opciones[i];
                                    if (opcion !== "null" && opcion) {
                                        opcionesHTML += `
                                            <p>
                                                <label>
                                                    <input class="with-gap" type="radio" name="question${pregunta.numPre}" value="${opcion}">
                                                    <span>${opcion}</span>
                                                </label>
                                            </p>
                                        `;
                                    }
                                }
                                return opcionesHTML;
                            })()
                            : (() => {
                                let opcionesHTML = '';
                                for (let i = 0; i < pregunta.opciones.length; i++) {
                                    const opcion = pregunta.opciones[i];
                                    if (opcion !== "null" && opcion) {
                                        opcionesHTML += `
                                            <p>
                                                <label>
                                                    <input type="checkbox" class="filled-in" name="question${pregunta.numPre}" value="${opcion}">
                                                    <span>${opcion}</span>
                                                </label>
                                            </p>
                                        `;
                                    }
                                }
                                return opcionesHTML;
                            })()}
                    </div>
                </div>
            `;
        }
    }
    container.innerHTML = preguntasHTML; // Se actualiza el HTML del contenedor
    console.log(preguntasMultiple);
}


// Función para iniciar el examen y almacenar la fecha y hora de inicio
function iniciarExamen() {
    inicioExamen = new Date(); // Guarda la fecha y hora de inicio
    mostrarPreguntasEnPagina();
}

// Función para enviar las respuestas
async function enviarRespuestas() {
    const idExamen = new URLSearchParams(window.location.search).get('id');
    const container = document.getElementById("preguntasContainer");
    const preguntas = container.querySelectorAll('.question');
    let correctas = 0;
    let totalPreguntas = preguntas.length;

    // Iterar sobre cada pregunta
    for (let i = 0; i < preguntas.length; i++) {
        const pregunta = preguntas[i];
        const idPregunta = pregunta.getAttribute('data-id');
        const nombre = pregunta.querySelector('input[type="radio"]') 
                        ? pregunta.querySelector('input[type="radio"]').name 
                        : pregunta.querySelector('input[type="checkbox"]').name;
        
        let respuestaAlumno;

        // Comprobar si el índice de la pregunta está en preguntasMultiple (opción múltiple)
        if (preguntasMultiple.includes(i)) {
            // Para preguntas de opción múltiple: Obtener todas las respuestas seleccionadas (checkboxes)
            const checkboxes = pregunta.querySelectorAll(`input[name="${nombre}"]:checked`);
            respuestaAlumno = Array.from(checkboxes).map(checkbox => checkbox.value);
        } else {
            // Para preguntas de selección única: Obtener el valor del radio button seleccionado
            const respuestaSeleccionada = pregunta.querySelector(`input[name="${nombre}"]:checked`);
            respuestaAlumno = respuestaSeleccionada ? respuestaSeleccionada.value : null;
        }

        const respuestaCorrecta = await obtenerRespuestaCorrecta(idPregunta);

        // Guardar la respuesta del alumno en la base de datos
        await guardarRespuesta(idExamen, idPregunta, alumnoId, respuestaAlumno, respuestaCorrecta);
        console.log(respuestaAlumno + " : " + respuestaCorrecta);
        
        // Verificar si la respuesta es correcta
        if (Array.isArray(respuestaAlumno)) {
            // Si respuestaAlumno es un arreglo, verifica si incluye todas las respuestas correctas
            if (respuestaCorrecta && respuestaCorrecta.every(respuesta => respuestaAlumno.includes(respuesta)) 
                && respuestaAlumno.length == respuestaCorrecta.length) {
                correctas++;
                console.log("Correcta (múltiple)");
            }
        } else {
            // Si respuestaAlumno es un solo valor, comparar directamente
            if (respuestaAlumno == respuestaCorrecta) {
                correctas++;
                console.log("Correcta (única)");
            }
        }
    }
    
    // Calcular la calificación basada en las respuestas correctas
    const calificacion = (correctas / totalPreguntas) * 100;

    // Finalizar el examen, guardando la calificación
    finalizarExamen(idExamen, calificacion);
}


// Función para obtener la respuesta correcta desde la base de datos
async function obtenerRespuestaCorrecta(idPregunta) {
    const preguntaDoc = doc(db, "PreguntasFinal", idPregunta);
    const docSnap = await getDoc(preguntaDoc);

    if (docSnap.exists()) {
        const preguntaData = docSnap.data();
        const incisoCorrecto = preguntaData.opcionCorrecta; // Asumiendo que esta puede ser una letra o un arreglo

        // Verifica si incisoCorrecto es un arreglo
        let respuestasCorrectas = [];
        if (Array.isArray(incisoCorrecto)) {
            // Si es un arreglo, obtenemos las respuestas correctas
            respuestasCorrectas = incisoCorrecto.map(opcion => {
                const indiceRespuestaCorrecta = opcion.charCodeAt(0) - 65; // Convierte "A"-"E" en índice (0-4)
                return preguntaData.opciones[indiceRespuestaCorrecta];
            });
        } else {
            // Si no es un arreglo, solo obtenemos una respuesta
            const indiceRespuestaCorrecta = incisoCorrecto.charCodeAt(0) - 65; // Convierte "A"-"E" en índice (0-4)
            respuestasCorrectas.push(preguntaData.opciones[indiceRespuestaCorrecta]);
        }

        // Imprimir las respuestas correctas obtenidas
        //console.log("Respuestas correctas: ", respuestasCorrectas);

        // Devuelve las respuestas correctas
        return respuestasCorrectas.length > 0 ? respuestasCorrectas : null;
    }
    return null;
}


// Función para guardar una respuesta en Firestore
async function guardarRespuesta(idExamen, idPregunta, idAlumno, respuestaAlumno, respuestaCorrecta) {
    const datos = {
        idExamen: idExamen,
        idPregunta: idPregunta,
        idAlumno: idAlumno,
        respuestaAlumno: respuestaAlumno,
        respuestaCorrecta: respuestaCorrecta,
        fecha: new Date(),
        estado: respuestaAlumno === respuestaCorrecta ? 'correcta' : 'incorrecta', // Ajuste del estado
    };

    await addDoc(collection(db, 'Respuestas'), datos);
}

// Función para finalizar el examen y guardar en ExamenesContestados
async function finalizarExamen(idExamen, calificacion) {
    const finExamen = new Date(); // Fecha y hora de finalización del examen
 // Obtener el título del examen
 const tituloExamen = await obtenerTituloExamen(idExamen);
 
    const examenContestado = {
        idExamen: idExamen,
        idAlumno: alumnoId,
        Calificacion: calificacion,
        fechaHoraInicializacion: inicioExamen,
        fechaHoraTermina: finExamen,
        tituloExamen: tituloExamen, // Agregar el título del examen
    };

    await addDoc(collection(db, 'ExamenesContestados'), examenContestado);

    alert("Examen finalizado. Tu calificación es: " + calificacion.toFixed(2));
}



// Función para obtener el título del examen usando su ID
async function obtenerTituloExamen(idExamen) {
    const examenDoc = doc(db, "Examenes", idExamen); // Cambia "Examenes" al nombre de tu colección de exámenes
    const docSnap = await getDoc(examenDoc);

    if (docSnap.exists()) {
        const examenData = docSnap.data();
        return examenData.titulo; // Asegúrate de que el campo correcto se llama "titulo"
    }
    return null;
}


// Llama a iniciarExamen cuando el documento esté listo
document.addEventListener('DOMContentLoaded', iniciarExamen);

// Evento de botón enviar
// document.getElementById("btnEnviar").addEventListener("click", enviarRespuestas);




// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Obtener los parámetros de la URL
    const params = new URLSearchParams(window.location.search);
    const claseId = params.get("id"); // Recupera el ID de la clase
    const claveDocente = params.get("clave"); // Recupera la clave del docente

    // Agregar evento al botón "Volver"
    document.querySelectorAll('.Volver').forEach(button => {
        button.addEventListener('click', function() {
            // Construir la URL de redirección
            const url = `panelMaestro.html?id=${claseId}&clave=${claveDocente}`;
            
            // Redirigir a la nueva página
            window.location.href = url; // Cambiar la ubicación de la ventana actual
        });
    });
});
