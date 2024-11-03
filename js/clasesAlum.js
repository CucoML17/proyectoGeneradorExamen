import { db } from './fireBase.js'; // Asegúrate de que este archivo tiene la configuración de Firebase.
import { collection, getDocs, doc, query, where, getDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// Obtener el valor de 'clave' desde la URL
const params = new URLSearchParams(window.location.search);
const claveAlumno = params.get("alumnoId");

async function cargarClases() {
    // Cambiar referencia a la colección "AlumnoClase"
    const clasesRef = collection(db, "AlumnoClase");
    // Crear la consulta para filtrar por idAlumno
    const q = query(clasesRef, where("idAlumno", "==", claveAlumno));
    console.log("Clave Alumno:", claveAlumno); // Verificar el valor de claveAlumno

    try {
        const querySnapshot = await getDocs(q);
        let contenidoHTML = '<div class="card-container_ds">';

        // Verificar si hay documentos en el snapshot
        if (querySnapshot.empty) {
            contenidoHTML += '<p>No se encontraron clases para este alumno.</p>';
        } else {
            // Array para almacenar las promesas de las consultas a "Clases"
            const promesasClases = [];

            querySnapshot.forEach((docSnapshot) => {
                const claseData = docSnapshot.data();
                const idClase = claseData.idClase; // Obtener el idClase de AlumnoClase

                if (idClase) {
                    // Crear una referencia para el documento de "Clases"
                    const claseDocRef = doc(db, "Clases", idClase);

                    // Crear una promesa para obtener los datos de "Clases"
                    const clasePromise = getDoc(claseDocRef).then((claseDoc) => {
                        if (claseDoc.exists()) {
                            const nombreClase = claseDoc.data().nombreClase || ""; // Asegúrate de que este campo exista en "Clases"
                            const claveAcceso = claseDoc.data().claveAcceso || ""; // Verifica este campo

                            // Agregar el HTML a contenidoHTML
                            contenidoHTML += `
                                <div class="card_ds">
                                    <div class="card-inner_ds">
                                        <div class="card-icon_ds">
                                            <h4>${nombreClase.slice(0, 2)}</h4> <!-- Primeras dos letras de nombreClase -->
                                        </div>
                                        <div class="card-content_ds">
                                            <h3>${nombreClase}</h3> <!-- Nombre completo de la clase -->
                                            <p>Clave de acceso: ${claveAcceso}</p> <!-- Clave de acceso -->
                                            <button class="card-button_ds" data-clase-id="${idClase}">Entrar a clase</button> <!-- ID del documento -->
                                        </div>
                                    </div>
                                </div>`;
                        }
                    });

                    // Agregar la promesa al array
                    promesasClases.push(clasePromise);
                }
            });

            // Esperar a que todas las promesas se resuelvan
            await Promise.all(promesasClases);
        }

        contenidoHTML += '</div>';

        // Insertar el HTML en el contenedor deseado
        document.getElementById("contenedorClases").innerHTML = contenidoHTML;

    } catch (error) {
        console.error("Error al obtener las clases: ", error);
    }
}

// Llama a la función para cargar clases
cargarClases();



// Escuchar clicks en los botones de "Ver más"

document.getElementById("contenedorClases").addEventListener("click", function(event) {
    if (event.target.classList.contains("card-button_ds")) {
        const claseId = event.target.getAttribute("data-clase-id");
        console.log("ID de la clase seleccionada:", claseId);
        
        // Redirigir a panelMaestro.html incluyendo tanto claseId como claveDocente
        window.location.href = `panelAlumno.html?id=${claseId}&clave=${claveAlumno}`;
    }
});




// Seleccionar todos los enlaces con la clase "bloqueado"
const enlacesBloqueados = document.querySelectorAll('a.bloqueado');

// Función para interceptar el clic
enlacesBloqueados.forEach(enlace => {
    enlace.addEventListener('click', function(event) {
        event.preventDefault(); // Evitar la navegación
        notificar("Entre primero a una clase por favor."); // Llamar a la función de notificación
    });
});


function notificar(mensaje) {
    // Crear el elemento de la notificación
    const toast = document.createElement("div");
    toast.classList.add("toast");
    toast.innerText = mensaje;

    // Agregar la notificación al contenedor
    const toastContainer = document.getElementById("toastContainer");
    toastContainer.appendChild(toast);

    // Mostrar la notificación con animación
    setTimeout(() => {
        toast.classList.add("show");
    }, 100); // Pequeño retraso para que la animación funcione correctamente

    // Ocultar la notificación después de 4 segundos
    setTimeout(() => {
        toast.classList.remove("show");
        toast.classList.add("hide");

        // Eliminar la notificación del DOM después de que se oculta
        setTimeout(() => {
            toast.remove();
        }, 500); // Espera 0.5 segundos para permitir la animación de salida
    }, 4000); // La notificación se muestra durante 4 segundos
}


// Esperar a que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {
    const btnNuevaClase = document.getElementById("btnNuevaClase");

    // Obtener el valor de 'clave' desde la URL
    const params = new URLSearchParams(window.location.search);
    const claveDocente = params.get("clave");
    
    // Verificar si el botón existe y agregar el evento de redirección
    if (btnNuevaClase) {
        btnNuevaClase.addEventListener("click", () => {
            // Redirigir a nuevaClase.html con el parámetro claveDocente
            window.location.href = `nuevaClase.html?clave=${claveDocente}`;
        });
    }
});
