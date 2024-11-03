import { db } from './fireBase.js';
import { collection, getDocs, query, where, updateDoc  } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();  //Evitar el envío del formulario

    //Nada más cargar manda al inicio de sesión
    iniciarSesion();
});

//Función que crea y  muestra el modal
function showModal(message) {
    const modal = document.getElementById("errorModal");
    const modalMessage = document.getElementById("modalMessage");
    modalMessage.textContent = message; 
    modal.style.display = "block"; 
}

//Cierra el modal
document.getElementById("closeModal").onclick = function() {
    const modal = document.getElementById("errorModal");
    modal.style.display = "none"; 
}


window.onclick = function(event) {
    const modal = document.getElementById("errorModal");
    if (event.target === modal) {
        modal.style.display = "none"; 
    }
}

//Función de inicio de sesión
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
            // Un mensaje si el usuario o contraseña no coinciden
            const usuarioConsulta = await getDocs(query(colRef, where("usuario", "==", usuario)));
            if (usuarioConsulta.empty) {
                showModal("El usuario no existe");
            } else {
                showModal("La contraseña es incorrecta");
            }
            return;
        }
        
        // Almacenar el ID del alumno en localStorage
        localStorage.setItem("alumnoId", snapshot.docs[0].id); // Almacena el ID en localStorage
        
        if (tipoUsuario == "0") {
            const claveMaestro = await obtenerClaveMaestro(usuario, contrasena);
            if (claveMaestro) {
                window.location.href = `panelClases.html?clave=${claveMaestro}`;
            }
        } else {
            // Aquí se obtiene la ID del alumno y se pasa por URL
            const alumnoId = snapshot.docs[0].id; // Obtén la ID del primer documento (alumno)
            window.location.href = `panelClasesAlum.html?alumnoId=${alumnoId}`; // Pasa la ID por URL
        }
    } catch (error) {
        console.error("Error al iniciar sesión: ", error);
        showModal("Hubo un error al iniciar sesión");
    }
}




//Esta función cierra los exámenes vencidos de acuerdo a la fecha establecida
async function cerrar() {
    const ahora = new Date(); 
    
    
    const yearActual = ahora.getFullYear();
    const mesActual = (ahora.getMonth() + 1).toString().padStart(2, '0'); 
    const diaActual = ahora.getDate().toString().padStart(2, '0');
    const fechaActual = `${yearActual}-${mesActual}-${diaActual}`;

    
    const horaActual = ahora.getHours().toString().padStart(2, '0') + ":" + ahora.getMinutes().toString().padStart(2, '0');

    try {
        //Primero consulta los exámenes con estado 'Publicado'
        const examenesSnapshot = await getDocs(query(collection(db, "Examenes"), where("estado", "==", "Publicado")));

        //Viaja por todo firebase para revisar cada examen publicado
        examenesSnapshot.forEach(async (doc) => {
            const examen = doc.data(); 
            const fechaFinalizacion = examen.fechaFinalizacion;
            const horaFinalizacion = examen.horaFinalizacion;

            //Obtiene la fecha
            const fechaFinal = new Date(`${fechaFinalizacion}T${horaFinalizacion}:00`);

            if (fechaFinalizacion < fechaActual) {
                //Si la fecha de finalización es menor a la fecha de hoy entonces se cierra el examen
                await updateDoc(doc.ref, {
                    estado: "Cerrado"
                });
                console.log(`Examen con ID ${doc.id} cerrado por fecha vencida.`);
            } else if (fechaFinalizacion === fechaActual) {
                
                if (fechaFinal.getTime() < ahora.getTime()) {
                    
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
    cerrar(); //Cierra examenes al cargar la página index
});



//Obtener clave del maestro para usarla en las clases
async function obtenerClaveMaestro(usuario, contrasena) {
    try {
        const colRef = collection(db, "Maestro");
        const consulta = query(
            colRef,
            where("usuario", "==", usuario),
            where("contrasena", "==", contrasena)
        );
        const snapshot = await getDocs(consulta);

        if (!snapshot.empty) {
            
            const doc = snapshot.docs[0];
            return doc.id; 
        }
    } catch (error) {
        console.error("Error al obtener clave del maestro: ", error);
        showModal("Error al recuperar la clave del maestro.");
    }
    return null;
}