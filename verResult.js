const params = new URLSearchParams(window.location.search);

const claseId = params.get("claseId");
const claveAlumno = params.get("clave")

import { db } from './fireBase.js';
import { doc, getDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// Función para cargar los resultados
async function cargarResultados() {
    const resultadosContainer = document.getElementById('resultadosContainer');

    // Obtener el ID del examen contestado de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const idExamenContestado = urlParams.get('id');

    try {
        // Obtener el examen contestado específico
        const examenDocRef = doc(db, 'ExamenesContestados', idExamenContestado);
        const examenDoc = await getDoc(examenDocRef);

        if (!examenDoc.exists()) {
            resultadosContainer.innerHTML = "<p>No se encontró el examen contestado especificado.</p>";
            return;
        }

        const examenData = examenDoc.data();
        const idExamen = examenData.idExamen;

        // Obtener los datos del alumno
        const alumnoDocRef = doc(db, 'Alumnos', examenData.idAlumno);
        const alumnoDoc = await getDoc(alumnoDocRef);

        if (!alumnoDoc.exists()) {
            resultadosContainer.innerHTML += "<p>No se encontró información del alumno.</p>";
            return;
        }

        const alumnoData = alumnoDoc.data();

        // Crear un contenedor para el examen contestado
        const divExamen = document.createElement('div');
        divExamen.classList.add('examen');

        // Título del examen
        const tituloExamen = document.createElement('h3');
        tituloExamen.textContent = examenData.tituloExamen;
        tituloExamen.classList.add('center-title'); // Clase CSS para centrar el título
        divExamen.appendChild(tituloExamen);

        // Calificación obtenida
        const calificacionExamen = document.createElement('p');
        calificacionExamen.textContent = `Calificación: ${examenData.Calificacion}`;
        calificacionExamen.classList.add('grade-text'); // Clase CSS para estilizar la calificación
        divExamen.appendChild(calificacionExamen);

        // Obtener preguntas y respuestas
        const preguntasRef = collection(db, "PreguntasFinal");
        const preguntasQuery = query(preguntasRef, where("idExam", "==", idExamen));
        const preguntasSnapshot = await getDocs(preguntasQuery);
        const preguntas = [];

        preguntasSnapshot.forEach((doc) => {
            const data = doc.data();
            preguntas.push({ id: doc.id, ...data });
        });

        const respuestasRef = collection(db, 'Respuestas');
        const respuestasQuery = query(respuestasRef, where("idExamen", "==", idExamen), where("idAlumno", "==", examenData.idAlumno));
        const respuestasSnapshot = await getDocs(respuestasQuery);
        const respuestas = [];

        respuestasSnapshot.forEach((doc) => {
            const data = doc.data();
            respuestas.push({ id: doc.id, ...data });
        });

        // Mostrar cada pregunta y respuesta
        if (preguntas.length === 0) {
            divExamen.innerHTML += "<p>No se encontraron preguntas para este examen.</p>";
        } else {
            preguntas.forEach((pregunta) => {
                const respuestaData = respuestas.find(res => res.idPregunta === pregunta.id);
                const divPregunta = document.createElement('div');
                divPregunta.classList.add('question');

                // Texto de la pregunta
                const tituloPregunta = document.createElement('h4');
                tituloPregunta.textContent = `Pregunta: ${pregunta.pregunta || 'Texto no disponible'}`;
                divPregunta.appendChild(tituloPregunta);

                if (respuestaData) {
                    // Respuesta del alumno
                    const divRespuestaAlumno = document.createElement('div');
                    divRespuestaAlumno.classList.add('answer');

                    const labelRespuestaAlumno = document.createElement('span');
                    labelRespuestaAlumno.classList.add('answer-label');
                    labelRespuestaAlumno.textContent = "Tu respuesta: ";
                    divRespuestaAlumno.appendChild(labelRespuestaAlumno);

                    const respuestaAlumnoText = document.createElement('span');
                    respuestaAlumnoText.classList.add('answer-text');
                    respuestaAlumnoText.textContent = respuestaData.respuestaAlumno;
                    respuestaAlumnoText.classList.add(
                        respuestaData.respuestaAlumno === respuestaData.respuestaCorrecta ? 'correct' : 'incorrect'
                    );
                    divRespuestaAlumno.appendChild(respuestaAlumnoText);
                    divPregunta.appendChild(divRespuestaAlumno);

                    // Respuesta correcta
                    const divRespuestaCorrecta = document.createElement('div');
                    divRespuestaCorrecta.classList.add('answer');

                    const labelRespuestaCorrecta = document.createElement('span');
                    labelRespuestaCorrecta.classList.add('answer-label');
                    labelRespuestaCorrecta.textContent = "Respuesta correcta: ";
                    divRespuestaCorrecta.appendChild(labelRespuestaCorrecta);

                    const respuestaCorrectaText = document.createElement('span');
                    respuestaCorrectaText.classList.add('answer-text', 'correct');
                    respuestaCorrectaText.textContent = respuestaData.respuestaCorrecta;
                    divRespuestaCorrecta.appendChild(respuestaCorrectaText);

                    divPregunta.appendChild(divRespuestaCorrecta);
                } else {
                    divPregunta.innerHTML += "<p>No hay respuesta registrada para esta pregunta.</p>";
                }

                divExamen.appendChild(divPregunta);
            });
        }

        // Contenedor de botones
        const botonesContainer = document.createElement('div');
        botonesContainer.classList.add('botones-container'); // Clase CSS para el contenedor de botones

        // Botón de Salir
        const botonSalir = document.createElement('button');
        botonSalir.textContent = "Salir";
        botonSalir.classList.add('btn', 'exit-btn'); // Clases CSS para el botón de salir
        botonSalir.onclick = () => { window.location.href = `panelAlumno.html?id=${claseId}&clave=${claveAlumno}`; };
        botonesContainer.appendChild(botonSalir);

        // Botón de Descargar PDF
        const botonDescargar = document.createElement('button');
        botonDescargar.textContent = "Descargar en PDF";
        botonDescargar.classList.add('btn', 'download-btn'); // Clases CSS para el botón de descargar PDF
        botonDescargar.onclick = () => descargarPDF(examenData, alumnoData);
        botonesContainer.appendChild(botonDescargar);

        // Agregar el contenedor de botones al contenedor de resultados
        divExamen.appendChild(botonesContainer);
        resultadosContainer.appendChild(divExamen);

    } catch (error) {
        console.error("Error al cargar los resultados: ", error);
        resultadosContainer.innerHTML = "<p>Ocurrió un error al cargar los resultados.</p>";
    }
}





//Función para descargar el pdf
function descargarPDF(examenData, alumnoData) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Cargar la imagen del logo
    const logo = new Image();
    logo.src = "img/tecoso.png";

    // Cargar la imagen del logo
    const logoDos = new Image();
    logoDos.src = "img/tocosoDos.png";

    logo.onload = () => {
        // Encabezado del PDF con el logo y el nombre del instituto
        doc.setFont("helvetica", "bold");
        doc.setFontSize(15);
        doc.text("Instituto Tecnológico de Chilpancingo", 105, 15, { align: "center" });

        // Posición del logo y título del examen
        doc.addImage(logo, "PNG", 15, 20, 25, 25);
        // Posición del logo y título del examen
        doc.addImage(logoDos, "PNG", 175, 20, 20, 20);


        doc.setFontSize(14);
        doc.text(examenData.tituloExamen, 105, 30, { align: "center" });

        // Subtítulo con información adicional
        doc.setFontSize(10);
        doc.setTextColor(100);  // Gris para subtítulos
        doc.text(`Alumno: ${alumnoData.nombre}`, 105, 40, { align: "center" });
        doc.text(`Calificación: ${examenData.Calificacion}`, 105, 46, { align: "center" });

        // Línea divisoria
        doc.setDrawColor(200, 200, 200);
        doc.line(10, 55, 200, 55);

        // Configuración inicial para el contenido
        let yPosition = 65;
        const lineHeight = 8;
        const marginLeft = 15;
        doc.setFont("helvetica", "normal");

        // Resetear el color a negro antes de la primera pregunta
        doc.setTextColor(0);

        // Contenedor de los resultados
        const resultadosContainer = document.getElementById('resultadosContainer');
        const preguntas = resultadosContainer.querySelectorAll('.question');

        // Iterar sobre cada pregunta y respuesta para agregar al PDF
        preguntas.forEach((pregunta, index) => {
            if (yPosition >= 280) {
                doc.addPage();
                yPosition = 20;
            }

            // Título de la pregunta
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(0);  // Negro para el título de la pregunta
            doc.text(`Pregunta ${index + 1}:`, marginLeft, yPosition);
            doc.setFont("helvetica", "normal");
            yPosition += lineHeight;

            // Texto de la pregunta
            doc.setFontSize(11);
            doc.setTextColor(0);  // Negro para el texto de la pregunta
            doc.text(pregunta.querySelector('h4').textContent, marginLeft, yPosition);
            yPosition += lineHeight;

            // Respuesta del alumno con color adecuado
            const respuestaAlumno = pregunta.querySelector('.incorrect') || pregunta.querySelector('.correct');
            const respuestaCorrecta = pregunta.querySelector('.correct');

            if (respuestaAlumno && respuestaCorrecta) {
                // Texto para "Tu respuesta:"
                doc.setTextColor(0);  // Negro para la etiqueta "Tu respuesta:"
                doc.text("Tu respuesta:", marginLeft, yPosition);

                // Si la respuesta del alumno es correcta, ambas son verdes; si no, el alumno en rojo y la correcta en verde
                if (respuestaAlumno.textContent === respuestaCorrecta.textContent) {
                    doc.setTextColor("green");  // Verde si son iguales
                } else {
                    doc.setTextColor("red");  // Rojo si es incorrecta
                }

                // Respuesta del alumno
                doc.text(respuestaAlumno.textContent, marginLeft + 30, yPosition);
                yPosition += lineHeight;

                // Texto para "Respuesta correcta:"
                doc.setTextColor(0);  // Negro para la etiqueta "Respuesta correcta:"
                doc.text("Respuesta correcta:", marginLeft, yPosition);

                // Siempre en verde para la respuesta correcta
                doc.setTextColor("green");
                doc.text(respuestaCorrecta.textContent, marginLeft + 40, yPosition);
                yPosition += lineHeight;
            }

            // Línea divisoria entre preguntas
            doc.setDrawColor(200, 200, 200);
            doc.line(10, yPosition, 200, yPosition);
            yPosition += lineHeight;
            doc.setTextColor(0); // Resetear color a negro para el siguiente contenido
        });

        doc.save("resultados_examen.pdf");
    };
}


// Cargar resultados cuando el documento esté listo
document.addEventListener('DOMContentLoaded', cargarResultados);
