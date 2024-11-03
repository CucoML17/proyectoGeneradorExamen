import { db } from './fireBase.js';
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
const claseId = params.get("id"); // Recupera el ID de la clase
const claveDocente = params.get("clave");



async function obtenerExamenes() {
    // Agregar el filtro por "estado" e "idProfe"
    const examenesQuery = query(
        collection(db, "Examenes"),
        where("estado", "in", ["Cerrado", "Publicado"]),
        where("idProfe", "==", claseId) // Filtra por idProfe que coincida con claseId
    );

    const examenesSnap = await getDocs(examenesQuery);
    const examenes = [];

    examenesSnap.forEach((doc) => {
        const data = doc.data();
        // Solo agrega el examen si tiene el atributo "conta"
        if (data.conta !== undefined) {
            examenes.push({ id: doc.id, ...data });
        }
    });

    // Ordenar los exámenes por "conta" de mayor a menor
    examenes.sort((a, b) => b.conta - a.conta);

    return examenes;
}



async function mostrarExamenesEnTabla() {
    const examenes = await obtenerExamenes();
    const tableBody = document.querySelector("#totExams tbody");

    let tablaHTML = '';

    examenes.forEach(examen => {
        const { titulo, estado, numeroIntentos, tiempoDuracion, fechaFinalizacion, horaFinalizacion, id } = examen;
        const duracion = `${tiempoDuracion.horas.padStart(2, '0')}:${tiempoDuracion.minutos.padStart(2, '0')}`;
        const fechaHoraCierre = `${fechaFinalizacion} ${horaFinalizacion}`;

        tablaHTML += `
        <tr>
            <td>${titulo}</td>
            <td>${estado}</td>
            <td>${numeroIntentos}</td>
            <td>${duracion}</td>
            <td>${fechaHoraCierre}</td>
            <td>
                <button class="btn-ver-reporte" data-id="${id}">Ver reporte</button>
                <button class="btn-ver-calificaciones" data-id="${id}">Ver calificaciones</button> <!-- Nuevo botón -->
            </td>
        </tr>`;
    });

    tableBody.innerHTML = tablaHTML;
    agregarEventosBotones();
}

function agregarEventosBotones() {
    document.querySelectorAll('.btn-ver-reporte').forEach(button => {
        button.addEventListener('click', function() {
            const idExamen = this.getAttribute('data-id');
            mostrarReporteExamen(idExamen);
        });
    });

    // Agregar evento para el botón "Ver calificaciones"
    document.querySelectorAll('.btn-ver-calificaciones').forEach(button => {
        button.addEventListener('click', function() {
            const idExamen = this.getAttribute('data-id');
            abrirModalCalificaciones_resu(idExamen);
        });
    });
}

// Función para abrir el modal de calificaciones
function abrirModalCalificaciones_resu(idExamen) {
    cargarCalificaciones_resu(idExamen); // Llama a la función para cargar datos
    const modal = document.getElementById("modalCalificaciones_resu");
    modal.style.display = "block";

    // Cerrar el modal al hacer clic en la 'x'
    document.querySelector(".close-resu").onclick = function() {
        modal.style.display = "none";
    }

    // Cerrar el modal al hacer clic fuera del contenido
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    }
}

// Función para cargar las calificaciones
async function cargarCalificaciones_resu(idExamen) {
    try {
        // Obtener las calificaciones desde la colección "ExamenesContestados"
        const examenesContestadosRef = collection(db, "ExamenesContestados");
        const q = query(examenesContestadosRef, where("idExamen", "==", idExamen));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.log("No se encontraron exámenes contestados.");
            return; // Salir si no hay resultados
        }

        const tbody = document.querySelector("#totCalificaciones_resu tbody");
        tbody.innerHTML = ''; // Limpiar el contenido previo

        const alumnosPromises = []; // Para almacenar las promesas de obtener los nombres de los alumnos

        snapshot.forEach(doc => {
            const data = doc.data();
            const idAlumno = data.idAlumno; // Obtener idAlumno de ExamenesContestados
            const calificacion = data.Calificacion; // Obtener calificación
            const fechaHoraTermina = data.fechaHoraTermina; // Obtener fecha y hora de finalización

            // Convertir el Timestamp a un formato legible
            const fechaFormateada = formatTimestamp(fechaHoraTermina); // Llama a la función para formatear

            // Obtener el nombre del alumno de la colección "Alumnos"
            const alumnoPromise = getDocs(collection(db, "Alumnos")).then(alumnosSnapshot => {
                alumnosSnapshot.forEach(alumnoDoc => {
                    if (alumnoDoc.id === idAlumno) {
                        const alumnoData = alumnoDoc.data();
                        const nombre = alumnoData.nombre; // Obtener nombre
                        const numeroControl = alumnoData.numControl; // Obtener número de control

                        // Agregar fila a la tabla
                        const row = `
                            <tr>
                                <td>${nombre}</td>
                                <td>${numeroControl}</td>
                                <td>${calificacion}</td>
                                <td>${fechaFormateada}</td>
                            </tr>`;
                        tbody.innerHTML += row; // Agregar fila a la tabla
                    }
                });
            });

            alumnosPromises.push(alumnoPromise); // Guardar la promesa
        });

        // Esperar a que se resuelvan todas las promesas
        await Promise.all(alumnosPromises);
    } catch (error) {
        console.error("Error al cargar las calificaciones:", error);
    }
}

// Función para formatear el Timestamp a una cadena de fecha y hora legible
function formatTimestamp(timestamp) {
    const date = new Date(timestamp.seconds * 1000); // Convertir segundos a milisegundos
    return date.toLocaleString(); // Formato por defecto (puedes personalizarlo)
}



// Cuidado fin del modal de calificaciones 




async function obtenerTextoPregunta(idPregunta) {
    const preguntaRef = collection(db, "PreguntasFinal");
    const preguntaDoc = await getDocs(query(preguntaRef, where("__name__", "==", idPregunta)));

    let textoPregunta = "Pregunta desconocida";

    if (!preguntaDoc.empty) {
        preguntaDoc.forEach(doc => {
            textoPregunta = doc.data().pregunta;
        });
    } else {
        console.log(`No se encontró la pregunta con el id: ${idPregunta}`);
    }

    return textoPregunta;
}


document.addEventListener('DOMContentLoaded', () => {
    console.log("Página cargada, configurando el botón de descarga...");
    agregarEventoDescarga();
});

async function agregarEventoDescarga() {
    const botonDescargar = document.getElementById("btnDescargarReporte");
    if (!botonDescargar) {
        console.error("No se encontró el botón de descarga");
        return;
    }

    botonDescargar.addEventListener("click", async () => {
        console.log("Botón de descarga presionado.");

        const doc = new window.jspdf.jsPDF();
        const contenidoReporte = document.getElementById("contenidoReporteExamen");

        if (!contenidoReporte) {
            console.error("No se encontró el contenido del reporte.");
            return;
        }

        // Cargar la imagen del primer logo
        const logo = new Image();
        logo.src = "img/tecoso.png";

        // Cargar la imagen del segundo logo
        const logoDos = new Image();
        logoDos.src = "img/tocosoDos.png";

        logo.onload = () => {
            logoDos.onload = () => {
                // Encabezado del PDF con ambos logos y el nombre del instituto
                doc.setFont("helvetica", "bold");
                doc.setFontSize(15);
                doc.text("Instituto Tecnológico de Chilpancingo", 105, 15, { align: "center" });

                // Posicionar ambos logos
                doc.addImage(logo, "PNG", 15, 20, 25, 25);       // Logo izquierdo
                doc.addImage(logoDos, "PNG", 175, 20, 20, 20);   // Logo derecho

                 // Subtítulo (personalizable)
                 doc.setFontSize(20);
                 doc.setTextColor(100);  // Gris para el subtítulo
                 doc.text("Reporte de examen", 105, 30, { align: "center" });


                // Subtítulo (personalizable)
                doc.setFontSize(10);
                doc.setTextColor(100);  // Gris para el subtítulo
                doc.text("Generado automáticamente", 105, 37, { align: "center" });

                // Línea divisoria
                doc.setDrawColor(200, 200, 200);
                doc.line(10, 45, 200, 45);

                // Configuración inicial para el contenido
                let yPosition = 55;
                let preguntasPorPagina = 0;
                doc.setFont("helvetica", "normal");
                doc.setTextColor(0);

                const preguntas = contenidoReporte.querySelectorAll(".pregunta-container");

                for (const pregunta of preguntas) {
                    if (preguntasPorPagina === 2) {
                        doc.addPage();
                        yPosition = 40;
                        preguntasPorPagina = 0;
                    }

                    // Fondo y bordes para cada pregunta
                    doc.setDrawColor(200, 200, 200); // Color gris para los bordes
                    doc.setFillColor(230, 240, 255); // Fondo azul claro para el bloque
                    doc.rect(5, yPosition - 5, 195, 120, "FD"); // Caja con fondo y borde ajustada a cada bloque de pregunta
                    yPosition += 5;

                    // Pregunta
                    const textoPregunta = pregunta.querySelector("h5").innerText;
                    doc.setFontSize(12);
                    doc.setFont("helvetica", "bold");
                    doc.text(`Pregunta: ${textoPregunta}`, 10, yPosition);
                    yPosition += 10;

                    // Gráfico
                    const canvas = pregunta.querySelector("canvas");
                    if (canvas) {
                        const imgData = canvas.toDataURL("image/png");
                        doc.addImage(imgData, "PNG", 50, yPosition, 90, 90);
                        yPosition += 100;
                    }

                    // Línea divisoria
                    doc.setDrawColor(200, 200, 200);
                    doc.setLineWidth(0.5);
                    doc.line(10, yPosition - 5, 200, yPosition - 5);
                    yPosition += 10;

                    preguntasPorPagina++;
                }

                doc.save("Reporte de examen.pdf");
                console.log("PDF generado y descargado.");
            };

            logoDos.onerror = () => {
                console.error("No se pudo cargar el segundo logo.");
            };
        };

        logo.onerror = () => {
            console.error("No se pudo cargar el primer logo.");
        };
    });
}









async function mostrarReporteExamen(idExamen) {
    const respuestasQuery = query(collection(db, "Respuestas"), where("idExamen", "==", idExamen));
    const respuestasSnap = await getDocs(respuestasQuery);
    const preguntas = {};

    // Agrupar respuestas por pregunta
    respuestasSnap.forEach((doc) => {
        const { idPregunta } = doc.data();
        
        if (!preguntas[idPregunta]) {
            preguntas[idPregunta] = { respuestas: {}, incorrectas: 0, correctas: 0 };
        }
    });

    const reportContent = document.getElementById("contenidoReporteExamen");
    reportContent.innerHTML = '<div class="loading">Cargando gráficos, por favor espera...</div>';

    // Abrir el nuevo modal
    const modal = M.Modal.getInstance(document.getElementById("modalReporteExamen"));
    modal.open();

    const chartPromises = [];

    for (const [idPregunta] of Object.entries(preguntas)) {
        // Obtener las respuestas de esta pregunta en particular
        const respuestasQuery = query(collection(db, "Respuestas"), where("idPregunta", "==", idPregunta));
        const respuestasSnap = await getDocs(respuestasQuery);
        
        // Reiniciar los contadores para cada pregunta
        preguntas[idPregunta] = { respuestas: {}, incorrectas: 0, correctas: 0 };

        // Agrupar respuestas y contar correctas e incorrectas
        respuestasSnap.forEach((doc) => {
            const { respuestaAlumno, respuestaCorrecta } = doc.data();
            
            // Contar respuestas únicas
            if (!preguntas[idPregunta].respuestas[respuestaAlumno]) {
                preguntas[idPregunta].respuestas[respuestaAlumno] = 0;
            }
            preguntas[idPregunta].respuestas[respuestaAlumno]++;

            // Contar correctas e incorrectas
            if (respuestaAlumno === respuestaCorrecta) {
                preguntas[idPregunta].correctas++;
            } else {
                preguntas[idPregunta].incorrectas++;
            }
        });

        // Continuar con la generación de la gráfica
        const textoPregunta = await obtenerTextoPregunta(idPregunta);
        const canvasId = `chart-${idPregunta}-${Math.random().toString(36).substring(7)}`;
        const totalRespuestas = preguntas[idPregunta].correctas + preguntas[idPregunta].incorrectas;
        const porcentajeCorrectas = totalRespuestas ? ((preguntas[idPregunta].correctas / totalRespuestas) * 100).toFixed(1) : 0;
        const porcentajeIncorrectas = totalRespuestas ? ((preguntas[idPregunta].incorrectas / totalRespuestas) * 100).toFixed(1) : 0;
    
        reportContent.insertAdjacentHTML('beforeend', `
            <div class="pregunta-container">
                <h5>${textoPregunta}</h5>
                <div class="canvas-container">
                    <canvas id="${canvasId}" width="300" height="300"></canvas>
                </div>
                
                <div>
                    Total de respuestas: <strong>${totalRespuestas}</strong>
                </div>
            </div>
        `);
    
        const ctx = document.getElementById(canvasId)?.getContext("2d");
        if (!ctx) continue;
    
        const labels = Object.keys(preguntas[idPregunta].respuestas);
        const dataCounts = Object.values(preguntas[idPregunta].respuestas);
    
        chartPromises.push(new Promise((resolve) => {
            const chart = new Chart(ctx, {
                type: "pie",
                data: {
                    labels: labels,
                    datasets: [{
                        label: "Respuestas",
                        data: dataCounts,
                        backgroundColor: labels.map((_, index) => `hsl(${index * (360 / labels.length)}, 70%, 50%)`),
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(tooltipItem) {
                                    const respuestaLabel = tooltipItem.label;
                                    const respuestaCount = tooltipItem.raw;
                                    const porcentaje = ((respuestaCount / totalRespuestas) * 100).toFixed(1);
                                    return `${respuestaLabel}: ${respuestaCount} (${porcentaje}%)`;
                                }
                            }
                        }
                    }
                },
                onComplete: resolve
            });
        }));
    }

    await Promise.all(chartPromises);
    const loadingMessage = reportContent.querySelector('.loading');
    if (loadingMessage) {
        loadingMessage.remove();
    }
    agregarEventoDescarga();
}










document.addEventListener('DOMContentLoaded', () => {
    mostrarExamenesEnTabla();
    const elemsModal = document.querySelectorAll('.modal');
    M.Modal.init(elemsModal);
});




document.addEventListener("DOMContentLoaded", () => {
    // Obtener los valores desde la URL
    const params = new URLSearchParams(window.location.search);
    const claseId = params.get("id");
    const claveDocente = params.get("clave"); // Obtener la clave del docente

    // Modificar los enlaces de clase bloqueada
    const bloqueados = document.querySelectorAll('.nuevo-examen, .ver-examenes, .ver-examenes-cerrados, .datos-clase');
    
    bloqueados.forEach(link => {
        const originalHref = link.getAttribute('href');

        // Actualizar el enlace para incluir la clase ID y claveDocente
        link.addEventListener('click', (event) => {
            event.preventDefault(); // Evitar la recarga de página
            window.location.href = `${originalHref}?id=${claseId}&clave=${claveDocente}`; // Redirigir con el ID de clase y clave docente
        });
    });

    // Modificar el enlace "Ver clases"
    const verClasesLink = document.querySelector('a[href="panelClases.html"]'); // Seleccionar el enlace "Ver clases"
    if (verClasesLink) {
        verClasesLink.addEventListener('click', (event) => {
            event.preventDefault(); // Evitar la recarga de página
            window.location.href = `panelClases.html?clave=${claveDocente}`; // Redirigir solo con la clave docente
        });
    }
});
