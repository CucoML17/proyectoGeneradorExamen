import { db } from './fireBase.js'; // Asegúrate de que este archivo tiene la configuración de Firebase.
import { collection, getDocs, doc, updateDoc, query, where, writeBatch, addDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";




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

        window.location.href = 'index.html'; // Redirigir a index.html

};

// Redirigir al hacer clic en el botón de ir a inicio
document.getElementById("goToIndexButton").onclick = function() {
    const modal = document.getElementById("registroExitosoModal");
    modal.style.display = "none"; // Ocultar el modal

    window.location.href = 'index.html'; // Redirigir a index.html
};

// Asegúrate de que el código JavaScript se ejecute después de que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('btnCancelar').addEventListener('click', cancelarRegistro);
});

function cancelarRegistro() {
    // Aquí va la lógica que deseas ejecutar al hacer clic en el botón
    window.location.href = 'index.html'; // Redirigir a index.html
}

// Agregar el listener al formulario de registro
document.getElementById("registroForm").addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevenir la recarga de la página

    // Verificar si las contraseñas coinciden antes de continuar
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    if (password !== confirmPassword) {
        const passwordError = document.getElementById('passwordMismatch');
        passwordError.textContent = 'Las contraseñas no coinciden, por favor verifica.';
        passwordError.style.display = 'block'; // Mostrar el mensaje de error
        document.getElementById("confirmPassword").focus(); // Enfocar campo de Confirmar Contraseña
        return; // Detener el registro si no coinciden
    }

    // Obtener el nombre de usuario y otros datos del formulario
    const nombreUsuario = document.getElementById("txtUsuario").value;
    const nombre = document.getElementById("txtNombre").value;
    const noControl = document.getElementById("txtNoControl").value;
    const especialidad = document.getElementById("txtEspe").value;

    try {
        // Verificar si el nombre de usuario ya existe en la colección "Maestro"
        const usuarioQuery = query(collection(db, "Maestro"), where("usuario", "==", nombreUsuario));
        const querySnapshot = await getDocs(usuarioQuery);

        if (!querySnapshot.empty) {
            // Mostrar modal de error si el nombre de usuario ya existe
            const modal = document.getElementById("claseNoExisteModal_s");
            const modalInstance = M.Modal.getInstance(modal);
            const modalMessage = modal.querySelector("p");
            modalMessage.innerText = "Ese nombre de usuario ya existe, elige otro";
            modalInstance.open();
            document.getElementById("nombreUsuario").focus(); // Enfocar campo de nombre de usuario
            return;
        } else {
            // Si no existe, guardar los datos en Firebase
            const maestroRef = await addDoc(collection(db, "Maestro"), {
                contrasena: password,
                especialidad: especialidad,
                noControl: noControl,
                nombre: nombre,
                usuario: nombreUsuario,
            });

            // Obtener la ID del maestro recién agregado
            const idMaestro = maestroRef.id; // Esto te da la ID del nuevo documento

            // Mostrar el modal de éxito al finalizar el registro
            showSuccessModal(); // Llama a la función para mostrar el modal de éxito
        }
    } catch (error) {
        console.error("Error al registrar el maestro:", error);
    }
});

