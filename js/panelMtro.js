import { db } from './fireBase.js'; // Asegúrate de que este archivo tiene la configuración de Firebase.
import { collection, getDocs, doc, updateDoc, query, where, writeBatch } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

async function obtenerExamenes() {
    const examenesSnap = await getDocs(collection(db, "Examenes"));
    const examenes = [];

    examenesSnap.forEach((doc) => {
        const data = doc.data();
        const estado = data.estado;

        // Filtrar exámenes por estado: "En proceso" o "Publicado"
        if (estado === "En proceso" || estado === "Publicado") {
            examenes.push({ id: doc.id, ...data });
        }
    });

    return examenes;
}

async function mostrarExamenesEnTabla() {
    const examenes = await obtenerExamenes(); // Obtiene los exámenes filtrados
    const tableBody = document.querySelector("#totExams tbody"); // Ubicación donde se insertarán las filas

    let tablaHTML = ''; // Acumulador de HTML

    examenes.forEach(examen => {
        const { titulo, estado, numeroIntentos, tiempoDuracion, fechaFinalizacion, horaFinalizacion, id } = examen;

        // Formato para la duración del examen (horas y minutos)
        const duracion = `${tiempoDuracion.horas.padStart(2, '0')}:${tiempoDuracion.minutos.padStart(2, '0')}`;
        
        // Formato para la fecha y hora de finalización
        const fechaHoraCierre = `${fechaFinalizacion} ${horaFinalizacion}`;

        // Crear la fila para cada examen
        tablaHTML += `
        <tr>
            <td>${titulo}</td>
            <td>${estado}</td>
            <td>${numeroIntentos}</td>
            <td>${duracion}</td>
            <td>${fechaHoraCierre}</td>
            <td>
                ${estado === "Publicado" ? `
                    <button class="btn-ver-cuestionario" data-id="${id}">Ver cuestionario</button><br>
                    <button class="btn-publicar disabled" data-id="${id}" disabled>Publicar</button><br>
                    <button class="btn-borrar disabled" data-id="${id}" disabled>Borrar</button><br>
                ` : `
                    <button class="btn-ver-editar" data-id="${id}">Ver y editar</button><br>
                    <button class="btn-publicar" data-id="${id}">Publicar</button><br>
                    <button class="btn-borrar" data-id="${id}">Borrar</button><br>
                `}
            </td>
        </tr>
    `;
    });

    tableBody.innerHTML = tablaHTML; // Insertar el HTML generado en el tbody

    // Agregar eventos a los botones
    agregarEventosBotones();
}

function agregarEventosBotones() {
    // Botón "Ver cuestionario" (para exámenes publicados)
    document.querySelectorAll('.btn-ver-cuestionario').forEach(button => {
        button.addEventListener('click', function() {
            const idExamen = this.getAttribute('data-id');
            // Aquí puedes agregar la lógica para ver el cuestionario
            console.log(`Ver cuestionario del examen con ID: ${idExamen}`);
        });
    });

    // Botón "Ver y editar" (para exámenes en proceso)
    document.querySelectorAll('.btn-ver-editar').forEach(button => {
        button.addEventListener('click', function() {
            const idExamen = this.getAttribute('data-id');
            window.location.href = `editExamen.html?id=${idExamen}`; // Redirigir a editExamen.html con el ID
        });
    });

    // Botón "Publicar"
    document.querySelectorAll('.btn-publicar').forEach(button => {
        if (!button.classList.contains('disabled')) {
            button.addEventListener('click', function() {
                const idExamen = this.getAttribute('data-id');
                // Mostrar el modal de confirmación
                const modal = document.getElementById('modalConfirmacion');
                modal.style.display = "block";

                // Agregar evento al botón de confirmar en el modal
                document.getElementById('btn-confirmar-publicar').onclick = function() {
                    publicando(idExamen);
                    modal.style.display = "none"; // Cerrar el modal
                };

                // Agregar evento para cerrar el modal
                document.getElementById('btn-cerrar-modal').onclick = function() {
                    modal.style.display = "none"; // Cerrar el modal
                };

                // Cerrar el modal si se hace clic fuera del contenido
                window.onclick = function(event) {
                    if (event.target === modal) {
                        modal.style.display = "none"; // Cerrar el modal
                    }
                };
            });
        }
    });

    // Botones "Borrar"
    document.querySelectorAll('.btn-borrar').forEach(button => {
        if (!button.classList.contains('disabled')) {
            button.addEventListener('click', function() {
                const idExamen = this.getAttribute('data-id');
                
                // Mostrar el modal de confirmación
                const modalBorrado = document.getElementById('modalConfirmacionBorrado');
                modalBorrado.style.display = "block";
    
                // Evento para confirmar el borrado
                document.getElementById('btn-confirmar-borrar').onclick = async function() {
                    // Llamar a la función para borrar el examen y sus preguntas
                    await borrarExamen(idExamen);
                    
                    // Cerrar el modal de confirmación
                    modalBorrado.style.display = "none";
    
                    // Mostrar el modal de éxito
                    const modalExito = document.getElementById('modalExitoBorra');
                    modalExito.style.display = "block";
    
                    // Actualizar la tabla (ejecutar la función para mostrar los exámenes de nuevo)
                    await mostrarExamenesEnTabla();
                };
    
                // Evento para cerrar el modal de confirmación
                document.getElementById('btn-cerrar-modal_borrado').onclick = function() {
                    modalBorrado.style.display = "none"; // Cerrar el modal
                };
    
                // Cerrar el modal si se hace clic fuera del contenido
                window.onclick = function(event) {
                    if (event.target === modalBorrado) {
                        modalBorrado.style.display = "none"; // Cerrar el modal
                    }
                };
            });
        }
    });
    

    
}

document.getElementById('btn-cerrar-modal-exito_borrade').onclick = function() {
    const modalExito = document.getElementById('modalExitoBorra');
    modalExito.style.display = "none"; // Cerrar el modal
};

// Asegúrate de que esto esté fuera de cualquier otra función para que se ejecute una vez
document.getElementById('btn-cerrar-modal-exito_borrade').onclick = function() {
    const modalExito = document.getElementById('modalExitoBorra');
    modalExito.style.display = "none"; // Cerrar el modal
};


// Llama a mostrarExamenesEnTabla cuando el documento esté listo
document.addEventListener('DOMContentLoaded', mostrarExamenesEnTabla);




//Para publicar
async function publicando(idExamen) {
    try {
        // Referencia al documento en Firebase
        const docRef = doc(db, "Examenes", idExamen);

        // Actualizar el estado a "Publicado"
        await updateDoc(docRef, { estado: "Publicado" });

        // Notificación de éxito
        console.log(`El examen con ID: ${idExamen} ha sido publicado correctamente.`);

        // Aquí podrías volver a cargar los exámenes o actualizar la tabla
        mostrarExamenesEnTabla(); // Volver a cargar la tabla si es necesario

    } catch (error) {
        console.error("Error al publicar el examen:", error);
    }
}

//Para borrar
async function borrarExamen(idExamen) {
    const preguntasRef = collection(db, 'PreguntasFinal'); // Referencia a la colección de preguntas
    const examenesRef = collection(db, 'Examenes'); // Referencia a la colección de exámenes

    // Primero, buscar y borrar todas las preguntas relacionadas con el examen
    const preguntasSnapshot = await getDocs(query(preguntasRef, where('idExam', '==', idExamen)));
    
    const batch = writeBatch(db); // Usar un batch para realizar múltiples operaciones

    preguntasSnapshot.forEach(doc => {
        batch.delete(doc.ref); // Borrar cada documento de preguntas
    });

    // Ahora borrar el examen en sí
    const examenDocRef = doc(examenesRef, idExamen); // Referencia al documento del examen
    batch.delete(examenDocRef); // Borrar el documento del examen

    // Ejecutar todas las operaciones en el batch
    await batch.commit();
}

