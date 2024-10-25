import { db } from './fireBase.js';
import { collection, getDocs, query, where, updateDoc  } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();  // Evita el envío del formulario

    // Llama a la función de inicio de sesión
    iniciarSesion();
});

// Función para mostrar el modal con un mensaje
function showModal(message) {
    const modal = document.getElementById("errorModal");
    const modalMessage = document.getElementById("modalMessage");
    modalMessage.textContent = message; // Establecer el mensaje del modal
    modal.style.display = "block"; // Mostrar el modal
}

// Cerrar el modal cuando se hace clic en la "X"
document.getElementById("closeModal").onclick = function() {
    const modal = document.getElementById("errorModal");
    modal.style.display = "none"; // Ocultar el modal
}

// Cerrar el modal si se hace clic fuera del modal
window.onclick = function(event) {
    const modal = document.getElementById("errorModal");
    if (event.target === modal) {
        modal.style.display = "none"; // Ocultar el modal
    }
}

// Función de inicio de sesión ajustada
async function iniciarSesion() {
    const usuario = document.getElementById("txtNombre").value;
    const contrasena = document.getElementById("txtContra").value;
    const tipoUsuario = document.getElementById("buttonValue").value;

    let coleccionNombre = tipoUsuario === "0" ? "Maestro" : "Alumnos";

    try {
        const colRef = collection(db, coleccionNombre);
        const consulta = query(
            colRef,
            where("usuario", "==", usuario),
            where("contrasena", "==", contrasena)
        );
        const snapshot = await getDocs(consulta);

        if (snapshot.empty) {
            // Aquí puedes mostrar un mensaje diferente si no existe el usuario
            const usuarioConsulta = await getDocs(query(colRef, where("usuario", "==", usuario)));
            if (usuarioConsulta.empty) {
                showModal("El usuario no existe");
            } else {
                showModal("La contraseña es incorrecta");
            }
            return;
        }

        if (tipoUsuario === "0") {
            window.location.href = "panelMaestro.html";
        } else {
            window.location.href = "panelAlumno.html";
        }
    } catch (error) {
        console.error("Error al iniciar sesión: ", error);
        showModal("Hubo un error al iniciar sesión");
    }
}



async function cerrar() {
    const ahora = new Date(); // Fecha y hora actuales (locales)
    
    // Obtener la fecha actual en formato 'YYYY-MM-DD'
    const yearActual = ahora.getFullYear();
    const mesActual = (ahora.getMonth() + 1).toString().padStart(2, '0'); // Mes de 0 a 11, por eso se suma 1
    const diaActual = ahora.getDate().toString().padStart(2, '0');
    const fechaActual = `${yearActual}-${mesActual}-${diaActual}`;

    // Obtener la hora actual en formato 'hh:mm'
    const horaActual = ahora.getHours().toString().padStart(2, '0') + ":" + ahora.getMinutes().toString().padStart(2, '0');

    try {
        // Consultar los exámenes con estado 'Publicado'
        const examenesSnapshot = await getDocs(query(collection(db, "Examenes"), where("estado", "==", "Publicado")));

        // Iterar sobre los documentos que cumplen con la condición
        examenesSnapshot.forEach(async (doc) => {
            const examen = doc.data(); // Obtener los datos del examen
            const fechaFinalizacion = examen.fechaFinalizacion;
            const horaFinalizacion = examen.horaFinalizacion;

            // Convertir la fecha y hora de finalización en un objeto Date local
            const fechaFinal = new Date(`${fechaFinalizacion}T${horaFinalizacion}:00`);

            if (fechaFinalizacion < fechaActual) {
                // Si la fecha de finalización es menor a la fecha de hoy, se cierra el examen
                await updateDoc(doc.ref, {
                    estado: "Cerrado"
                });
                console.log(`Examen con ID ${doc.id} cerrado por fecha vencida.`);
            } else if (fechaFinalizacion === fechaActual) {
                // Si la fecha de finalización es igual a hoy, comparar la hora
                if (fechaFinal.getTime() < ahora.getTime()) {
                    // Si la hora de finalización es menor a la hora actual, se cierra el examen
                    await updateDoc(doc.ref, {
                        estado: "Cerrado"
                    });
                    console.log(`Examen con ID ${doc.id} cerrado por hora vencida.`);
                }
            }
        });

        console.log("Proceso de cierre de exámenes completado.");
    } catch (error) {
        console.error("Error al cerrar exámenes:", error);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    cerrar(); // Llamar a la función cerrar al cargar la página
});