import { db } from './fireBase.js'; // Asegúrate de que este archivo tiene la configuración de Firebase.
import { collection, getDocs, doc, updateDoc, query, where, writeBatch, addDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

let claveDocente = "OPZzeC5KGDqDabaNcPFz";
let claveAntes="";
async function cargarDatosClase() {
    const clasesRef = collection(db, "Clases"); // Colección "Clases"
    const q = query(clasesRef, where("claveDocente", "==", claveDocente)); // Filtra por claveDocente

    const querySnapshot = await getDocs(q); // Obtener los documentos que coinciden

    if (!querySnapshot.empty) {
        const claseData = querySnapshot.docs[0].data(); // Obtener el primer documento
        // Llenar los inputs con los datos de la clase
        document.getElementById("txtClave").value = claseData.claveAcceso; // Asigna clave de acceso
        claveAntes = claseData.claveAcceso;
        document.getElementById("txtNombre").value = claseData.nombreClase; // Asigna nombre de clase
    } else {
        console.log("No se encontraron clases para la clave docente proporcionada.");
    }
}

// Cargar los datos al cargar la página
window.onload = function() {
    cargarDatosClase(); // Llama a la función para cargar los datos
};



async function obtenerAlumnos() {
    const alumnosRef = collection(db, "Alumnos"); // Colección "Alumnos"
    const querySnapshot = await getDocs(alumnosRef); // Obtener todos los documentos

    const alumnos = querySnapshot.docs.map(doc => ({
        id: doc.id, // Guardar el ID de cada documento
        ...doc.data() // Obtener los datos del documento
    }));

    return alumnos; // Retornar la lista de alumnos
}

async function mostrarAlumnosEnTabla() {
    const alumnos = await obtenerAlumnos(); // Obtiene los alumnos
    const tableBody = document.querySelector("#alumnosTable tbody"); // Ubicación donde se insertarán las filas

    let tablaHTML = ''; // Acumulador de HTML

    alumnos.forEach(alumno => {
        const { nombre, numControl, usuario, semestre, carrera, id } = alumno;

        // Crear la fila para cada alumno
        tablaHTML += `
        <tr>
            <td>${nombre}</td>
            <td>${numControl}</td>
            <td>${usuario}</td>
            <td>${semestre}</td>
            <td>${carrera}</td>
            <td>
                <button class="btn-borrar" data-id="${id}">Borrar</button>
            </td>
        </tr>
        `;
    });

    tableBody.innerHTML = tablaHTML; // Insertar el HTML generado en el tbody

    // Agregar eventos a los botones
    agregarEventosBotones();
}


function agregarEventosBotones() {
    // Botón "Borrar"
    document.querySelectorAll('.btn-borrar').forEach(button => {
        button.addEventListener('click', function() {
            const idAlumno = this.getAttribute('data-id');

            // Mostrar el nuevo modal de confirmación
            const modal = document.getElementById("modalConfirmacionBaja");
            const modalMensajeTexto = document.getElementById("modalMensajeTextoBaja");
            modalMensajeTexto.innerText = `¿Quieres dar de baja a este alumno?`;

            // Abrir el modal
            modal.style.display = "block";

            // Agregar evento para el botón "Aceptar"
            const btnAceptar = document.getElementById("btnAceptarBaja");
            btnAceptar.onclick = async function() {
                // Borrar el alumno de Firebase
                await eliminarAlumno(idAlumno);

                // Cambiar el contenido del modal para mostrar el mensaje de éxito
                modalMensajeTexto.innerText = "Borrado con éxito";

                // Opcional: agregar un evento para cerrar el modal después de un tiempo
                setTimeout(() => {
                    modal.style.display = "none"; // Ocultar el modal
                    location.reload(); // Recargar la página para reflejar los cambios
                }, 2000); // Ocultar después de 2 segundos
            };

            // Agregar evento para el botón "Cancelar"
            const btnCancelar = document.getElementById("btnCancelarBaja");
            btnCancelar.onclick = function() {
                modal.style.display = "none"; // Cerrar el modal al cancelar
            };

            // Agregar evento para cerrar el modal con la "X"
            const closeButton = document.getElementById("closeModalBaja");
            closeButton.onclick = function() {
                modal.style.display = "none"; // Cerrar el modal
            };
        });
    });
}

// Función para eliminar el alumno de Firebase
async function eliminarAlumno(idAlumno) {
    // Referencia a la colección "Alumnos" en Firestore
    const alumnoRef = doc(db, "Alumnos", idAlumno);

    // Borrar el documento de la colección
    await deleteDoc(alumnoRef);
}



// Cargar los datos al cargar la página
window.onload = function() {
    mostrarAlumnosEnTabla(); // Llama a la función para mostrar los alumnos
    cargarDatosClase();

    document.getElementById('btnAdd').addEventListener('click', function() {
         // Reemplaza esto con el valor de claveAntes
        // Redirigir a la página con el parámetro claveAntes en la URL
        window.location.href = `registrarNuevoAlumno_Alumno.html?claveAntes=${claveAntes}`;
    });    
};






async function obtenerClases() {
    const clasesRef = collection(db, "Clases"); // Colección "Clases"
    const querySnapshot = await getDocs(clasesRef); // Obtener todos los documentos

    const clases = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    return clases; // Retornar la lista de clases
}

async function actualizarClase(claveAntes) {
    const txtClave = document.getElementById("txtClave").value;
    const txtNombre = document.getElementById("txtNombre").value;

    // Obtener todas las clases
    const clases = await obtenerClases();
    
    // Verificar si la nueva clave ya existe o es igual a "claveAntes"
    const claveExistente = clases.some(clase => clase.claveAcceso === txtClave);
    
    if (claveExistente || txtClave === claveAntes) {
        mostrarModal("Esa clave no es válida");
    } else {
        // Buscar la clase a actualizar por claveAcceso
        const claseAActualizar = clases.find(clase => clase.claveAcceso === claveAntes);
        if (claseAActualizar) {
            // Actualizar los datos en Firebase
            const claseRef = doc(db, "Clases", claseAActualizar.id); // Referencia a la clase a actualizar
            await updateDoc(claseRef, {
                claveAcceso: txtClave,
                nombreClase: txtNombre
            });
            claveAntes = txtClave;
            mostrarModal("Clase actualizada con éxito");
        }
    }
}

// Mostrar el mensaje en el modal
function mostrarModal(mensaje) {
    document.getElementById("modalMensajeTexto_ss").innerText = mensaje; // Establecer el texto del mensaje
    document.getElementById("modalMensaje_ss").style.display = "block"; // Mostrar el modal
}

// Cerrar el modal
document.getElementById("closeModal_ss").onclick = function() {
    document.getElementById("modalMensaje_ss").style.display = "none"; // Cerrar el modal
};

document.getElementById("btnAceptarModal_ss").onclick = function() {
    document.getElementById("modalMensaje_ss").style.display = "none"; // Cerrar el modal
};

// Manejar el evento de envío del formulario
document.querySelector(".form-content").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevenir el envío del formulario
    actualizarClase(claveAntes); // Llamar a la función de actualización con la clave anterior
});

// Cerrar el modal si se hace clic fuera del contenido
window.onclick = function(event) {
    const modal = document.getElementById("modalMensaje_ss");
    if (event.target === modal) {
        modal.style.display = "none"; // Cerrar el modal
    }
};