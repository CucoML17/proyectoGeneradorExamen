import { db } from './fireBase.js'; // Asegúrate de que este archivo tiene la configuración de Firebase.
import { collection, getDocs, doc, updateDoc, query, where, writeBatch, addDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";


// Declarar la variable global
let claveDocente;

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    claveDocente = params.get("clave");

    // Manejar el envío del formulario
    const form = document.querySelector('.form-content');
    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevenir el envío del formulario

        const txtClave = document.getElementById("txtClave").value;
        const txtNombre = document.getElementById("txtNombre").value;

        // Verificar si la clave de acceso ya existe
        const exists = await verificarClaveAcceso(txtClave);

        if (exists) {
            notificar("Clave de acceso no válida, cámbiela por favor.");
        } else {
            // Guardar los datos en Firestore
            await guardarClase(txtClave, txtNombre, claveDocente);
            mostrarModal("Clase registrada con éxito", claveDocente); // Mostrar modal
        }
    });
});

// Función para verificar si la clave de acceso ya existe en la colección
async function verificarClaveAcceso(claveAcceso) {
    const clasesRef = collection(db, "Clases");
    const q = query(clasesRef, where("claveAcceso", "==", claveAcceso));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty; // Retorna true si existe, false si no
}

// Función para guardar la clase en Firestore
async function guardarClase(claveAcceso, nombreClase, claveDocente) {
    try {
        const clasesRef = collection(db, "Clases");
        await addDoc(clasesRef, {
            claveAcceso: claveAcceso,
            claveDocente: claveDocente,
            nombreClase: nombreClase
        });
        //console.log("Clase guardada:", { claveAcceso, claveDocente, nombreClase });
    } catch (error) {
        console.error("Error al guardar la clase: ", error);
    }
}



function mostrarModal(mensaje, claveDocente) {
    const modal = document.getElementById("modalMensaje_ss");
    const modalTexto = document.getElementById("modalMensajeTexto_ss");
    const closeButton = document.getElementById("closeModal_ss");
    const btnAceptarModal = document.getElementById("btnAceptarModal_ss");

    // Establecer el mensaje en el modal
    modalTexto.innerText = mensaje;
    
    // Mostrar el modal
    modal.style.display = "block";

    // Manejar el cierre del modal
    closeButton.onclick = () => {
        modal.style.display = "none";
        window.location.href = `panelClases.html?clave=${claveDocente}`; // Redirigir a panelClases.html con la claveDocente
    };

    btnAceptarModal.onclick = () => {
        modal.style.display = "none";
        window.location.href = `panelClases.html?clave=${claveDocente}`; // Redirigir a panelClases.html con la claveDocente
    };

    // Cerrar el modal si se hace clic fuera de él
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
            window.location.href = `panelClases.html?clave=${claveDocente}`; // Redirigir a panelClases.html con la claveDocente
        }
    };
}



async function generarClaveUnica() {
    const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numeros = '0123456789';
    
    while (true) {
        // Generar las dos letras iniciales
        const letra1 = letras.charAt(Math.floor(Math.random() * letras.length));
        const letra2 = letras.charAt(Math.floor(Math.random() * letras.length));

        // Generar los tres números
        const numero1 = numeros.charAt(Math.floor(Math.random() * numeros.length));
        const numero2 = numeros.charAt(Math.floor(Math.random() * numeros.length));
        const numero3 = numeros.charAt(Math.floor(Math.random() * numeros.length));

        // Generar la letra final
        const letraFinal = letras.charAt(Math.floor(Math.random() * letras.length));

        // Combinar todo en la clave
        const claveGenerada = `${letra1}${letra2}${numero1}${numero2}${numero3}${letraFinal}`;

        // Verificar si la clave ya existe en Firebase
        const clasesRef = collection(db, "Clases");
        const q = query(clasesRef, where("claveClase", "==", claveGenerada));
        const querySnapshot = await getDocs(q);

        // Si la clave no existe, devolverla
        if (querySnapshot.empty) {
            return claveGenerada;
        }
        // Si existe, el ciclo volverá a ejecutarse
    }
}

window.onload = async function() {
    
    const claveAcceso = await generarClaveUnica(); // Esperar a que se genere una clave única
    console.log(claveAcceso);
    document.getElementById("txtClave").value = claveAcceso; // Establecer el valor en el campo de texto
};






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