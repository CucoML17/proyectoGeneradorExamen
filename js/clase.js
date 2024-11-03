import { db } from './fireBase.js'; // Asegúrate de que este archivo tiene la configuración de Firebase.
import { collection, getDocs, doc, updateDoc, query, where, writeBatch, addDoc, deleteDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

//Recuperar los datos que se mandan por la URL
//Investigamos que es mejor PHP, pero eso todavía no lo hemos aprendido 
const params = new URLSearchParams(window.location.search);
const claseId = params.get("id"); // Recupera el ID de la clase
const claveDocente = params.get("clave");

let claveAntes = "";

//Obteniendo los datos de la clase
async function cargarDatosClase() {
    // Referencia al documento específico usando la claseId
    const claseRef = doc(db, "Clases", claseId); //Id de firebase

    const docSnap = await getDoc(claseRef); // Obtener el documento

    if (docSnap.exists()) {
        const claseData = docSnap.data(); //Obtiene los datos de aquella entidad que coincida su id de FIREBASE
        //Pone los datos en los txt
        document.getElementById("txtClave").value = claseData.claveAcceso; // Asigna clave de acceso
        claveAntes = claseData.claveAcceso; // Guardar la clave de acceso
        document.getElementById("txtNombre").value = claseData.nombreClase; // Asigna nombre de clase
    } else {
        console.log("No se encontró la clase con la ID proporcionada.");
    }
}


// Cargar los datos al cargar la página
window.onload = function() {
    cargarDatosClase(); //Llama a la función para cargar los datos al iniciar la base de datos
};



async function obtenerAlumnos() {
    const alumnosRef = collection(db, "Alumnos"); // Colección de Alumnos
    const querySnapshot = await getDocs(alumnosRef);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); //Devuelve un array con todas las entidades de la tabla Alumnos
}

async function obtenerAlumnosPorClase() {
    const alumnosClaseRef = collection(db, "AlumnoClase"); //Tabla AlumnoClase
    const q = query(alumnosClaseRef, where("idClase", "==", claseId)); // Filtrar por claseId

    const querySnapshot = await getDocs(q);
    const idAlumnos = querySnapshot.docs.map(doc => doc.data().idAlumno); // Obtener los idAlumno

    return idAlumnos; //Devolver los IDs de los alumnos
}

async function mostrarAlumnosEnTabla() {
    const idAlumnos = await obtenerAlumnosPorClase(); // Obtiene los IDs de alumnos filtrados por clase
    const allAlumnos = await obtenerAlumnos(); // Obtiene todos los alumnos
    const filteredAlumnos = allAlumnos.filter(alumno => idAlumnos.includes(alumno.id)); // Filtra los alumnos

    const tableBody = document.querySelector("#alumnosTable tbody"); // Ubicación donde se insertarán las filas
    let tablaHTML = ''; // Acumulador de HTML

    filteredAlumnos.forEach(alumno => {
        const { nombre, numControl, usuario, semestre, carrera, id } = alumno;

        //Crea la fila para cada alumno de forma dinámica con INNERHTML
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
    
    // Eliminar el documento de la colección "Alumnos"
    await deleteDoc(alumnoRef);

    // Ahora, eliminar de la colección "AlumnoClase"
    // Obtener la colección AlumnoClase
    const alumnosClaseRef = collection(db, "AlumnoClase");
    
    // Filtrar documentos donde idAlumno coincide
    const q = query(alumnosClaseRef, where("idAlumno", "==", idAlumno));
    const querySnapshot = await getDocs(q); // Obtener los documentos que coinciden

    // Borrar cada documento que coincida
    const batch = writeBatch(db); // Usar batch para realizar varias operaciones en una sola llamada
    querySnapshot.forEach(doc => {
        batch.delete(doc.ref); // Marcar cada documento para eliminación
    });

    await batch.commit(); // Ejecutar la eliminación en la base de datos
}



// Cargar los datos al cargar la página
window.onload = function() {
    mostrarAlumnosEnTabla(); // Llama a la función para mostrar los alumnos
    cargarDatosClase();

    document.getElementById('btnAdd').addEventListener('click', function() {
         // Reemplaza esto con el valor de claveAntes
        // Redirigir a la página con el parámetro claveAntes en la URL
        window.location.href = `registrarNuevoAlumno_Alumno.html?claveAntes=${claveAntes}&id=${claseId}&clave=${claveDocente}`;

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