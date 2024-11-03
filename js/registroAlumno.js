import { db } from './fireBase.js'; // Asegúrate de que este archivo tiene la configuración de Firebase.
import { collection, getDocs, doc, updateDoc, query, where, writeBatch, addDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

let clavosa="";
const params = new URLSearchParams(window.location.search);
const claseId = params.get("id"); // Recupera el ID de la clase
const claveDocente = params.get("clave");

async function validarClaveClase(claveClase) {
    // Referencia a la colección "Clase" en Firestore
    const clasesRef = collection(db, "Clases");

    // Crear la consulta para buscar una clase donde "claveAcceso" sea igual a la claveClase
    const q = query(clasesRef, where("claveAcceso", "==", claveClase));

    // Ejecutar la consulta
    const querySnapshot = await getDocs(q);

    // Verificar si la clase existe
    if (querySnapshot.empty) {
        // Si no se encuentra la clase, mostrar el modal
        const claveClaseInput = document.getElementById("claveClase");
        claveClaseInput.value = ""; // Borrar el contenido del input
      
    
        const modal = document.getElementById("claseNoExisteModal_s");
        const modalInstance = M.Modal.getInstance(modal);
        modalInstance.open();
    } else {
        console.log("Clase encontrada");
        // Aquí puedes manejar lo que pasa si la clase existe
    }
}

document.getElementById("claveClase").addEventListener("blur", function() {
    const claveClase = document.getElementById("claveClase").value;

    // Llamar a la función que valida la clase en Firestore
    validarClaveClase(claveClase);
});





document.addEventListener('DOMContentLoaded', function() {
    // Inicializar el modal con la clase modal_s
    const modals = document.querySelectorAll('.modal_s');
    M.Modal.init(modals);

    // Agregar evento para cerrar el modal con el botón de cierre
    document.querySelectorAll('.modal-close_s').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = document.getElementById("claseNoExisteModal_s");
            const modalInstance = M.Modal.getInstance(modal);
            modalInstance.close();
        });
    });

    
});







// Mostrar el modal de éxito
function showSuccessModal() {
    const modal = document.getElementById("registroExitosoModal");
    modal.style.display = "block"; // Mostrar el modal
}

// Cerrar el modal
document.getElementById("closeSuccessModal").onclick = function() {
    const modal = document.getElementById("registroExitosoModal");
    modal.style.display = "none"; // Ocultar el modal

    // Verificar si claveAntes tiene un valor
    if (clavosa) {
        window.location.href = `clase.html?claveAntes=${encodeURIComponent(clavosa)}&id=${encodeURIComponent(claseId)}&clave=${encodeURIComponent(claveDocente)}`; // Redirigir a clase.html con claveAntes
    } else {
        window.location.href = 'index.html'; // Redirigir a index.html
    }
};

// Redirigir al hacer clic en el botón de ir a inicio
document.getElementById("goToIndexButton").onclick = function() {
    const modal = document.getElementById("registroExitosoModal");
    modal.style.display = "none"; // Ocultar el modal

    // Verificar si claveAntes tiene un valor
    if (clavosa) {
        window.location.href = `clase.html?claveAntes=${encodeURIComponent(clavosa)}&id=${encodeURIComponent(claseId)}&clave=${encodeURIComponent(claveDocente)}`; // Redirigir a clase.html con claveAntes<-----------
    } else {
        window.location.href = 'index.html'; // Redirigir a index.html
    }
};

// Asegúrate de que el código JavaScript se ejecute después de que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('btnCancelar').addEventListener('click', cancelarRegistro);
});

function cancelarRegistro() {
    // Aquí va la lógica que deseas ejecutar al hacer clic en el botón
    if (clavosa) {
        window.location.href = `clase.html?claveAntes=${encodeURIComponent(clavosa)}&id=${encodeURIComponent(claseId)}&clave=${encodeURIComponent(claveDocente)}`; // Redirigir a clase.html con claveAntes<-----------
    } else {
        window.location.href = 'index.html'; // Redirigir a index.html
    }
}


// Evento para el formulario de registro
document.getElementById("registroForm").addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevenir la recarga de la página

    // Verificar si las contraseñas coinciden antes de continuar
    if (passwordMatch === 0) {
        const passwordError = document.getElementById('passwordMismatch');
        passwordError.textContent = 'Las contraseñas no coinciden, por favor verifica.';
        passwordError.style.display = 'block'; // Mostrar el mensaje de error
        document.getElementById("confirmPassword").focus(); // Hacer foco en el campo de Confirmar Contraseña
        return; // Detener el registro si no coinciden
    }

    const nombreUsuario = document.getElementById("nombreUsuario").value;

    // Verificar si el nombre de usuario ya existe
    const usuarioQuery = query(collection(db, "Alumnos"), where("usuario", "==", nombreUsuario));
    const querySnapshot = await getDocs(usuarioQuery);

    if (!querySnapshot.empty) {
        // Si el nombre de usuario ya existe, mostrar el modal y hacer foco
        const modal = document.getElementById("claseNoExisteModal_s");
        const modalInstance = M.Modal.getInstance(modal);
        
        // Cambiar el mensaje del modal
        const modalMessage = modal.querySelector("p");
        modalMessage.innerText = "Ese nombre de usuario ya existe, elige otro";

        // Abrir el modal
        modalInstance.open();

        // Hacer foco en el campo de nombre de usuario
        document.getElementById("nombreUsuario").focus();
    } else {
        // Si no existe, guardar los datos en Firebase
        const carrera = document.getElementById("carrera").value;
        const password = document.getElementById("password").value;
        const nombre = document.getElementById("nombreAlumno").value;
        const numControl = document.getElementById("numControl").value;
        const semestre = document.getElementById("semestre").value;
        const claveClase = document.getElementById("claveClase").value; // Obtener la clave de la clase
    
        // Guardar los datos en la colección "Alumnos"
        const alumnoRef = await addDoc(collection(db, "Alumnos"), {
            carrera: carrera,
            contrasena: password,
            nombre: nombre,
            numControl: numControl,
            semestre: semestre,
            usuario: nombreUsuario,
        });
    
        // Obtener la ID del alumno recién agregado
        const idAlumno = alumnoRef.id; // Esto te da la ID del nuevo documento
    
        // Buscar la clase por claveAcceso
        const clasesRef = collection(db, "Clases");
        const q = query(clasesRef, where("claveAcceso", "==", claveClase)); // Filtrar por claveAcceso
        const querySnapshot = await getDocs(q); // Obtener los documentos que coinciden
    
        if (!querySnapshot.empty) {
            const claseData = querySnapshot.docs[0].data(); // Obtener el primer documento
            const idClase = querySnapshot.docs[0].id; // Obtener la ID de la clase
    
            // Guardar la relación en la colección "AlumnoClase"
            await addDoc(collection(db, "AlumnoClase"), {
                idAlumno: idAlumno,
                idClase: idClase,
            });
    
            // Mostrar el modal de éxito
            showSuccessModal(); // Llama a la función para mostrar el modal
        } else {
            console.log("No se encontró la clase con la clave de acceso proporcionada.");
        }
    }
});



// Inicializar un valor para indicar el estado de la contraseña
let passwordMatch = 0;

document.getElementById('confirmPassword').addEventListener('input', function() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const passwordError = document.getElementById('passwordMismatch');

    if (password !== confirmPassword) {
        passwordError.textContent = 'Las contraseñas no coinciden';
        passwordError.style.display = 'block'; // Mostrar el mensaje de error
        passwordMatch = 0; // Indicar que no coinciden
    } else {
        passwordError.textContent = ''; // Limpiar el mensaje de error si coinciden
        passwordError.style.display = 'none'; // Ocultar el mensaje de error
        passwordMatch = 1; // Indicar que coinciden
    }
});


// En registrarNuevoAlumno_Alumno.html
// En registrarNuevoAlumno_Alumno.html
document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    const claveAntes = urlParams.get('claveAntes');
    clavosa = claveAntes;

    // Asignar el valor de claveAntes al input
    if (claveAntes) {
        document.getElementById("claveClase").value = claveAntes; // Asignar el valor al input
    }

    // Ahora puedes usar claveAntes como desees
    console.log(claveAntes); // Muestra el valor en la consola
});

