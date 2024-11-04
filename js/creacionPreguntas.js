let idPPP = "OPZzeC5KGDqDabaNcPFz";

const params = new URLSearchParams(window.location.search);
const claseId = params.get("id"); // Recupera el ID de la clase
const claveDocente = params.get("clave");

document.addEventListener("DOMContentLoaded", () => {
    // Obtener los valores desde la URL
    const params = new URLSearchParams(window.location.search);
    const claseId = params.get("id");
    const claveDocente = params.get("clave"); // Obtener la clave del docente
    console.log(claseId);

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


window.actualizarDato = actualizarDato;
window.eliminarOpcion = eliminarOpcion;

//Obtener el select de tipo de pregunta y la sección donde se colocarán las preguntas
const cmbTipoPregunta = document.getElementById('cmbTipoPregunta');
const preguntasDiv = document.getElementById('preguntas');

//Contador para las opciones, comienza en 2 porque hay dos opciones iniciales (A y B)
let contadorOpciones = 2;

//Arreglo con las letras A, B, C, D, E (puedes ampliarlo si es necesario)
let letrasOpciones = ['A', 'B', 'C', 'D', 'E'];

//Arreglo para almacenar los datos de las opciones
let datosOpciones = ['', '']; //Inicializar con dos cadenas vacías para A y B

// Función para guardar el estado actual de los inputs en datosOpciones
function guardarValoresOpciones() {
    for (let i = 0; i < contadorOpciones; i++) {
        const input = document.getElementById(`txt${letrasOpciones[i]}`);
        if (input) {
            datosOpciones[i] = input.value;  // Guardar el valor actual del input en el arreglo
        }
    }
}

//Función para actualizar el contenido de preguntas
function actualizarPreguntas(tipoIcono) {
    preguntasDiv.innerHTML = ''; //Limpiar el contenido anterior

    //Generar las opciones existentes hasta el valor actual de contadorOpciones
    for (let i = 0; i < contadorOpciones; i++) {
        const letraActual = letrasOpciones[i];
        const esEliminable = contadorOpciones > 2; //Las opciones son eliminables si hay más de 2

        //Crear una nueva opción con o sin el botón rojo de eliminar
        const nuevaOpcion = document.createElement('div');
        nuevaOpcion.classList.add('horizon');

        const valorActual = datosOpciones[i] || ''; //Obtener el valor actual del arreglo

        nuevaOpcion.innerHTML = `
            <div class="tama80">
              <div class="input-field">
                <i class="material-icons prefix">${tipoIcono}</i>
                <input id="txt${letraActual}" type="text" class="validate" value="${valorActual}" oninput="actualizarDato(${i}, this.value)">
                <label for="txt${letraActual}" class="${valorActual ? 'active' : ''}">Opción ${letraActual}</label>
              </div>
            </div>
            <div class="tama10">
              ${esEliminable ? `
                <a class="btn-floating btn-large waves-effect waves-light red" onclick="eliminarOpcion(${i})">
                  <i class="material-icons">clear</i>
                </a>` : ''}
            </div>
        `;

        preguntasDiv.appendChild(nuevaOpcion);
    }
    inicializarOpcionCorrecta();

    //Insertar el botón "Agregar" al final
    const btnAddContainer = document.createElement('div');
    btnAddContainer.id = 'btnAddContainer';
    btnAddContainer.classList.add('horizon');
    btnAddContainer.innerHTML = `
        
        <div class="tama90">
          <a class="btn-floating btn-large waves-effect waves-light blue" id="btnAdd">
            <i class="material-icons">add</i>
          </a>
        </div>
    `;

    preguntasDiv.appendChild(btnAddContainer);

    //Asignar el evento al botón "Agregar"
    document.getElementById('btnAdd').addEventListener('click', function() {
        agregarOpcion(tipoIcono);
    });
}

//Función para agregar una nueva opción dinámica
function agregarOpcion(tipoIcono) {
    if (contadorOpciones < letrasOpciones.length) {
        datosOpciones.push(''); 
        contadorOpciones++; 
        actualizarPreguntas(tipoIcono); 
    }
}

//Función para eliminar una opción
function eliminarOpcion(indice) {
    if (contadorOpciones > 2) {
        datosOpciones.splice(indice, 1); 
        contadorOpciones--; 

        const tipoPregunta = cmbTipoPregunta.value;
        let tipoIcono;

        if (tipoPregunta === 'uni') {
            tipoIcono = 'panorama_fish_eye';
        } else {
            tipoIcono = 'panorama_wide_angle';
        }
        
        actualizarPreguntas(tipoIcono); 
    }
}

//Función para actualizar el dato del arreglo cuando se modifica un input
function actualizarDato(indice, valor) {
    datosOpciones[indice] = valor; //Actualizar el valor en el arreglo
}

//Función para inicializar el contenido basado en el tipo de pregunta
function inicializarPreguntas(tipoPregunta) {
    let tipoIcono;

    if (tipoPregunta === 'uni') {
        tipoIcono = 'panorama_fish_eye';
    } else {
        tipoIcono = 'panorama_wide_angle';
    }

    contadorOpciones = datosOpciones.length; // Mantener la cantidad de opciones guardadas
    actualizarPreguntas(tipoIcono); 
}

//Ejecutar la función al cargar la página (opción preestablecida es 'uni')
window.onload = function() {
    inicializarPreguntas('uni');
    inicializarOpcionCorrecta();
};

//Cambiar preguntas según el tipo de pregunta seleccionado
let changa = 'uni';
cmbTipoPregunta.addEventListener('change', function() {
    
    obtenerValoresOpcionCorrecta();

    guardarValoresOpciones(); // Guardar valores actuales antes de limpiar
    const tipoPregunta = cmbTipoPregunta.value;
    
    inicializarPreguntas(tipoPregunta);
    changa = tipoPregunta;
});

//Función para inicializar la opción correcta

function inicializarOpcionCorrecta() {
    const opcionCorrectaDiv = document.getElementById('opcionCorrectaF');
    
    if (cmbTipoPregunta.value === 'uni') {
        // Crear select para opción única
        let optionsHTML = '<optgroup label="Solo una" >';
        for (let i = 0; i < contadorOpciones; i++) {
            optionsHTML += `
                <option value="${letrasOpciones[i]}" ${letrasOpciones[i] === opcionCorrectaUni ? 'selected' : ''}>
                    Opción ${letrasOpciones[i]} 
                </option>`;
        }
        optionsHTML += '</optgroup>';

        opcionCorrectaDiv.innerHTML = `
            <div class="tama10"></div>
            <div class="tama80">
              <p class="indicacionG">Elige la respuesta correcta</p>
              <div class="input-field col s12 ">
                <select class="menosD">
                  ${optionsHTML}
                </select>
              </div>
            </div>
        `;
    } else if (cmbTipoPregunta.value === 'multi') {
        // Crear select para opción múltiple
        let optionsHTML = '';
        for (let i = 0; i < contadorOpciones; i++) {
            optionsHTML += `
                <option value="${letrasOpciones[i]}" ${opcionesCorrectasMulti.includes(letrasOpciones[i]) ? 'selected' : ''}>
                    Opción ${letrasOpciones[i]}
                </option>`;
        }

        opcionCorrectaDiv.innerHTML = `
            <div class="tama10"></div>
            <div class="tama80">
              <p class="indicacionG">Elige la respuesta correcta</p>
              <div class="input-field col s12">
                <select multiple>
                  ${optionsHTML}
                </select>
              </div>
            </div>
        `;
    }

    // Inicializar selects de Materialize después de establecer el contenido
    const elems = document.querySelectorAll('select');
    M.FormSelect.init(elems);
}


let opcionCorrectaUni = ''; // Opción seleccionada para preguntas únicas
let opcionesCorrectasMulti = []; // Opciones seleccionadas para preguntas múltiples

// Función para obtener los valores de los selects
function obtenerValoresOpcionCorrecta() {
    const opcionCorrectaDiv = document.getElementById('opcionCorrectaF');

    if (changa === 'uni') {
        // Obtener el valor seleccionado para opción única
        const selectUni = opcionCorrectaDiv.querySelector('select');
        if (selectUni) { // Verificamos si selectUni existe
            opcionCorrectaUni = selectUni.value; // Almacenar el valor seleccionado
        }
    } else if (changa === 'multi') {
        // Obtener los valores seleccionados para opción múltiple
        const selectMulti = opcionCorrectaDiv.querySelector('select');
        if (selectMulti) { // Verificamos si selectMulti existe
            const selectedOptions = Array.from(selectMulti.selectedOptions);
            opcionesCorrectasMulti = selectedOptions.map(option => option.value); // Almacenar los valores seleccionados
        }
    }

    // Mostrar en consola los valores obtenidos
    console.log("opcionUni: " + opcionCorrectaUni);
    console.log("opcionMulti: ", opcionesCorrectasMulti);
}

// Escuchar el evento de tecla presionada
document.addEventListener('keydown', function(event) {
    // Verificar si la tecla presionada es la barra espaciadora
    if (event.code === 'Space') {
        // Aquí puedes colocar la acción que quieres realizar
        obtenerValoresOpcionCorrecta();
    }
});

// Función a ejecutar cuando se presiona la barra espaciadora






    //Import the functions you need from the SDKs you need
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, writeBatch  } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

//Tu configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBMoZAu2Acna1WpFimAcVxDXX6vEnBlNbc",
    authDomain: "proyectounidad2-51e5f.firebaseapp.com",
    projectId: "proyectounidad2-51e5f",
    storageBucket: "proyectounidad2-51e5f.appspot.com",
    messagingSenderId: "213504597336",
    appId: "1:213504597336:web:726666e070363f8dc7592d"
};

//Inicializar Firebase
const app = initializeApp(firebaseConfig);

//Inicializar Firestore
const db = getFirestore(app);

//Exportar db para que puedas usarlo en tu archivo JS
export { db };

let idExamPre=getRandomNumberString();
console.log(idExamPre);

document.getElementById('baseForm').addEventListener('submit', async function(event) {
    event.preventDefault(); //Evita el envío del formulario

    //Obtener el valor de la pregunta
    const txtPregunta = document.getElementById('txtPregunta').value;

    //Obtener las opciones
    const opciones = [];
    const inputs = document.querySelectorAll('#preguntas input[type="text"]');
    for (let index = 0; index < inputs.length; index++) {
        
        if (inputs[index].value) {
            opciones[index] = inputs[index].value;
        } else {
            opciones[index] = 'null';
        }
    }
    

    //Completar las opciones hasta 5 con 'null'
    for (let i = opciones.length; i < 5; i++) {
        opciones[i] = 'null';
    }

    
    const opcionesString = opciones.join(', ');

    
    const cmbTipoPregunta = document.getElementById('cmbTipoPregunta').value;

    let opcionCorrecta; //Variable para almacenar la opción correcta

    //Lógica para determinar la opción correcta dependiendo del tipo de pregunta
    if (cmbTipoPregunta === 'uni') { //Pregunta única
        opcionCorrecta = document.querySelector(`#opcionCorrectaF select`).value;
    } else if (cmbTipoPregunta === 'multi') { //Pregunta múltiple
        //Obtener todas las opciones seleccionadas usando el método selectedOptions
        const selectElement = document.querySelector(`#opcionCorrectaF select`);
        opcionCorrecta = Array.from(selectElement.selectedOptions).map(option => option.value);
    }

    //Mostrar los valores en la consola
    console.log('Pregunta:', txtPregunta);
    console.log('Opciones:', opcionesString);
    console.log('Opción correcta:', opcionCorrecta);

    //*** Firebase Firestore - Agregar los datos a la colección ***
    try {
        const preguntasSnapshot = await getDocs(collection(db, "PreguntasFinal"));
        let numPre = 1;

        if (!preguntasSnapshot.empty) {
            let ultimoNumPre = 0;
            
            // Buscar el mayor valor de numPre en los documentos existentes
            preguntasSnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.numPre && data.numPre > ultimoNumPre) {
                    ultimoNumPre = data.numPre;
                }
            });
            
            numPre = ultimoNumPre + 1; // Incrementar para el nuevo documento
        }        



        const docRef = await addDoc(collection(db, "PreguntasFinal"), {
            numPre: numPre,
            pregunta: txtPregunta,
            opciones: opciones,
            opcionCorrecta: opcionCorrecta, 
            tipoPregunta: cmbTipoPregunta,
            idExam: idExamPre
        });
        console.log("Documento agregado con ID: ", docRef.id);

        obtePreguntas().then(preguntas => llenarTabla(preguntas));//-----------------------ALERTA--------
        notificar("¡Pregunta guardada!");

    } catch (e) {
        console.error("Error al agregar el documento: ", e);
    }
});

//Función para obtener preguntas desde Firebase
//Función para obtener las preguntas de Firestore
async function obtePreguntas() {
    const pregunDoco = await getDocs(collection(db, "PreguntasFinal")); // Usa 'getDocs' para obtener las preguntas
    const preguntas = [];

    pregunDoco.forEach((doc) => {
        const data = doc.data();
        
        // Filtrar las preguntas cuyo atributo 'idExam' sea "none"
        if (data.idExam === idExamPre) {
            preguntas.push({ id: doc.id, ...data }); // Agrega solo las preguntas que tienen 'idExam' en "none"
        }
    });

    preguntas.sort((a, b) => a.numPre - b.numPre); // Ordenar las preguntas por número

    return preguntas; // Devolver solo las preguntas filtradas
}


//Función para llenar la tabla con las preguntas
function llenarTabla(preguntas) {
    // Comienza a construir la tabla
    let html = `
            <table class="custom-table" style="width: 100%;">
                <thead>
                    <tr>
                        <th>Número</th>
                        <th>Pregunta</th>
                        <th>A</th>
                        <th>B</th>
                        <th>C</th>
                        <th>D</th>
                        <th>E</th>
                        <th>Respuesta Correcta</th>
                        <th>Opciones</th> <!-- Nueva columna de Opciones -->
                    </tr>
                </thead>
                <tbody>
    `;

    // Iterar sobre las preguntas
    preguntas.forEach((pregunta, index) => {
        const { pregunta: textoPregunta, opciones, opcionCorrecta, id } = pregunta; // Usa 'id' en lugar de 'firebaseKey'
        let row = `<tr>
                    <td>${index + 1}</td>
                    <td>${textoPregunta}</td>`; 

        // Agregar las opciones a la fila
        for (let i = 0; i < 5; i++) {
            if (i < opciones.length && opciones[i] !== 'null') {
                row += `<td>${opciones[i]}</td>`; 
            } else {
                row += `<td>--</td>`; 
            }
        }

        // Agregar la respuesta correcta
        let cellContent;

        if (Array.isArray(opcionCorrecta)) {
            cellContent = opcionCorrecta.join(', ');
        } else {
            cellContent = opcionCorrecta || '--';
        }

        row += `<td>${cellContent}</td>`;

        // Nueva columna para las opciones con botones
        row += `<td>
                    <a class="btn-floating btn-small waves-effect waves-light red modal-trigger" 
                        href="#modalDelete" 
                        data-id="${id}" 
                        data-pregunta="${textoPregunta}"> 
                        <i class="material-icons">clear</i>
                    </a>
                    <a class="btn-floating btn-small waves-effect waves-light blue modal-trigger" 
                        href="#modal1" 
                        data-id="${index}" 
                        data-firebase-id="${id}"> <!-- Usa la clave de Firebase correcta -->
                        <i class="material-icons">edit</i>
                    </a>
                </td>`;

        row += `</tr>`;
        html += row;
    });

    // Cerrar las etiquetas de la tabla
    html += `
                </tbody>
            </table>
    `;

    // Insertar el HTML generado en el div
    document.getElementById('tablasPreguntas').innerHTML = html;

    // Inicializar los modales de Materialize
    const modales = document.querySelectorAll('.modal');
    M.Modal.init(modales);
}



//Llamar a las funciones
obtePreguntas().then(preguntas => llenarTabla(preguntas));


//Edición de las preguntas (Abrir modal y cargar datos)
let megaKey;

document.addEventListener('DOMContentLoaded', function() {
    //Inicializar los modales de Materialize
    const modales = document.querySelectorAll('.modal');
    M.Modal.init(modales);

    //Añadir un evento click a los botones de editar
    document.addEventListener('click', function(event) {
        const target = event.target.closest('.modal-trigger');
        if (target && target.dataset.firebaseId) {
            const firebaseKey = target.dataset.firebaseId;
            megaKey = firebaseKey;
            console.log("Clave de Firebase:", firebaseKey);
            
            //Aquí puedes usar la clave firebaseKey para recuperar los datos de Firebase
            obtenerDatosPregunta(firebaseKey);
        }
    });
});


//Función para obtener los datos de una pregunta específica usando Firestore---------------------------------------------------------------------------
let contadorOps = 0; //Contador de opciones
let opsV = ['Opción A', 'Opción B', 'Opción C', 'Opción D', 'Opción E']; //Opciones iniciales

let megatipoPregunta="";
let megaopcionesValidas;
async function obtenerDatosPregunta(firebaseKey) {
    try {
        const docRef = doc(db, "PreguntasFinal", firebaseKey);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            const preguntaTexto = data.pregunta;
            const tipoPregunta = data.tipoPregunta;
            megatipoPregunta = data.tipoPregunta;
            const opciones = data.opciones || [];
            const opcionCorrecta = data.opcionCorrecta;

            //Asigna el valor al campo de entrada
            const inputElement = document.getElementById('txtPreguntaM');
            inputElement.value = preguntaTexto;

            //Añade la clase "active" a la etiqueta
            const labelElement = document.querySelector('label[for="txtPreguntaM"]');
            labelElement.classList.add('active');

            //Establecer el valor del select
            const selectElement = document.getElementById('cmbTipoPreguntaM');
            selectElement.value = tipoPregunta;

            //Obtener el contenedor de opciones
            const preguntasContainer = document.getElementById('preguntasM');
            preguntasContainer.innerHTML = `
                <div class="horizon">
                    <div class="tama10"></div>
                    <div class="tama90">
                        <p class="indicacionG">Escribe las respuestas a tu pregunta. . .</p>
            `;

            //Asigna las opciones válidas
            const opcionesValidas = opciones.filter(opcion => opcion !== "null");
            megaopcionesValidas = opciones.filter(opcion => opcion !== "null"); //OJO.-----
            contadorOps = opcionesValidas.length; //Establece el contador con el número de opciones válidas
            opsV = [...opcionesValidas]; //Guardar las opciones válidas en opsV
            const icono = tipoPregunta === 'uni' ? 'panorama_fish_eye' : 'panorama_wide_angle';

            //Crear las opciones en el contenedor
            opcionesValidas.forEach((opcion, index) => {
                preguntasContainer.innerHTML += `
                    <div class="horizon">
                        <div class="tama50">
                            <div class="input-field">
                                <i class="material-icons prefix">${icono}</i>
                                <input id="txtOpcion${index}M" type="text" class="validate" value="${opcion}">
                                <label for="txtOpcion${index}M" class="active">Opción ${letrasOpciones[index]}</label>
                            </div>
                        </div>
                        ${contadorOps > 2 ? `
                        <div class="tama10">
                            <a class="btn-floating btn-large waves-effect waves-light red"><i class="material-icons">clear</i></a>
                        </div>` : ''}
                    </div>
                `;
            });

            //Añadir el botón "Agregar" al final
            preguntasContainer.innerHTML += `
                <div class="horizon">
                    <div class="tama10"></div>
                    <div class="tama90">
                        <a class="btn-floating btn-large waves-effect waves-light blue" id="btnAgregarOpcionM">
                            <i class="material-icons">add</i>
                        </a>
                    </div>
                </div>
            `;

            preguntasContainer.innerHTML += `</div></div>`;

            //Manejar la opción correcta
            const opcionCorrectaDiv = document.getElementById('opcionCorrectaFM');
            let optionsHTML = '';

            if (tipoPregunta === 'uni') {
                optionsHTML += '<optgroup label="Solo una">';
                for (let i = 0; i < opcionesValidas.length; i++) {
                    optionsHTML += `<option value="${String.fromCharCode(65 + i)}" ${opcionCorrecta === String.fromCharCode(65 + i) ? 'selected' : ''}>Opción ${String.fromCharCode(65 + i)}</option>`;
                }
                optionsHTML += '</optgroup>';
            } else if (tipoPregunta === 'multi') {
                for (let i = 0; i < opcionesValidas.length; i++) {
                    optionsHTML += `<option value="${String.fromCharCode(65 + i)}" ${opcionCorrecta.includes(String.fromCharCode(65 + i)) ? 'selected' : ''}>Opción ${String.fromCharCode(65 + i)}</option>`;
                }
            }

            opcionCorrectaDiv.innerHTML = `
                <div class="tama10"></div>
                <div class="tama80">
                    <p class="indicacionG">Elige la respuesta correcta</p>
                    <div class="input-field col s12">
                        <select ${tipoPregunta === 'multi' ? 'multiple' : ''}>
                            ${optionsHTML}
                        </select>
                    </div>
                </div>
            `;

            const elems = document.querySelectorAll('select');
            M.FormSelect.init(elems);

            //Evento para agregar nuevas opciones
            document.getElementById('btnAgregarOpcionM').addEventListener('click', agregarOpcionM);

            renderizarOpciones();
        } else {
            console.log("No se encontraron datos para la clave:", firebaseKey);
        }
    } catch (error) {
        console.error("Error al recuperar la pregunta:", error);
    }
}

//Función para agregar una nueva opción
function agregarOpcionM() {
    //Guardar los valores actuales en opsV antes de agregar una nueva opción
    const inputs = document.querySelectorAll('#preguntasM input[type="text"]');
    inputs.forEach((input, index) => {
        opsV[index] = input.value; //Guardar el valor actual de cada opción
    });

    contadorOps++;
    opsV.push(''); 

    
    const preguntasContainer = document.getElementById('preguntasM');
    const tipoPreguntaM = document.getElementById('cmbTipoPreguntaM').value;
    const icono = tipoPreguntaM === 'uni' ? 'panorama_fish_eye' : 'panorama_wide_angle';

 
    preguntasContainer.innerHTML = `
        <div class="horizon">
            <div class="tama10"></div>
            <div class="tama80">
                <p class="indicacionG">Escribe las respuestas a tu pregunta. . .</p>
    `;

    for (let i = 0; i < contadorOps; i++) {
        const opcionActual = opsV[i] || ''; 
        preguntasContainer.innerHTML += `
            <div class="horizon">
                <div class="tama50">
                    <div class="input-field">
                        <i class="material-icons prefix">${icono}</i>
                        <input id="txtOpcion${i}M" type="text" class="validate" value="${opcionActual}">
                        <label for="txtOpcion${i}M" class="active">Opción ${String.fromCharCode(65 + i)}</label>
                    </div>
                </div>
                ${contadorOps > 2 ? `
                <div class="tama10">
                    <a class="btn-floating btn-large waves-effect waves-light red"><i class="material-icons">clear</i></a>
                </div>` : ''}
            </div>
        `;
    }

    //Añadir el botón "Agregar" nuevamente
    preguntasContainer.innerHTML += `
        <div class="horizon">
            <div class="tama10"></div>
            <div class="tama50">
                <a class="btn-floating btn-large waves-effect waves-light blue" id="btnAgregarOpcionM">
                    <i class="material-icons">add</i>
                </a>
            </div>
        </div>
    `;

    preguntasContainer.innerHTML += `</div></div>`;
    
    //Reestablecer el evento para agregar nuevas opciones
    document.getElementById('btnAgregarOpcionM').addEventListener('click', agregarOpcionM);

    
}

//Inicialización de los modales
document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('.modal');
    var instances = M.Modal.init(elems);
});

//Obtener el select de tipo de pregunta del modal
const cmbTipoPreguntaM = document.getElementById('cmbTipoPreguntaM');

//Agregar el evento 'change' al select del modal
//Evento para cambiar el ícono al seleccionar un tipo de pregunta
document.getElementById('cmbTipoPreguntaM').addEventListener('change', function() {
    //Primero guardar los valores actuales en el arreglo opsV
    for (let i = 0; i < contadorOps; i++) {
        let inputActual = document.getElementById(`txtOpcion${i}M`);
        if (inputActual) {
            opsV[i] = inputActual.value; //Actualizar el valor de opsV con el valor del input
        }
    }

    //Procede con el cambio del icono y la renderización
    renderizarOpciones();
});

//Función para renderizar las opciones nuevamente
function renderizarOpciones() {
    const tipoPreguntaM = cmbTipoPreguntaM.value;
    let icono = tipoPreguntaM === 'uni' ? 'panorama_fish_eye' : 'panorama_wide_angle';

    const preguntasContainer = document.getElementById('preguntasM');
    preguntasContainer.innerHTML = '';

    for (let i = 0; i < contadorOps; i++) {
        let opcionActual = opsV[i] || '';

        preguntasContainer.innerHTML += `
            <div class="horizon">
                <div class="tama70">
                    <div class="input-field">
                        <i class="material-icons prefix">${icono}</i>
                        <input id="txtOpcion${i}M" type="text" class="validate" value="${opcionActual}">
                        <label for="txtOpcion${i}M" class="active">Opción ${String.fromCharCode(65 + i)}</label>
                    </div>
                </div>
                ${contadorOps > 2 ? `
                <div class="tama10">
                    <a class="btn-floating btn-large waves-effect waves-light red btnEliminarOpcion" data-index="${i}">
                        <i class="material-icons">clear</i>
                    </a>
                </div>` : ''}
            </div>
        `;
    }

    preguntasContainer.innerHTML += `
        <div class="horizon">
            <div class="tama10"></div>
            <div class="tama90">
                <a class="btn-floating btn-large waves-effect waves-light blue" id="btnAgregarOpcionM">
                    <i class="material-icons">add</i>
                </a>
            </div>
        </div>
    `;

    //Reasignar el evento al botón "Agregar opción"
    document.getElementById('btnAgregarOpcionM').addEventListener('click', function() {
        contadorOps++;

        if(contadorOps>5){
            contadorOps--;
        }else{
        opsV.push(''); //Agregar nueva opción vacía al array

        //Agregar una nueva opción al array de opciones válidas
        guardarSeleccionActual();//--------------------Alerta
        megaopcionesValidas.push(String.fromCharCode(65 + (contadorOps - 1)));

        renderizarOpciones(); //Volver a renderizar las opciones
        renderizarOpcionesFinal(); //Actualizar el select con las nuevas opciones
        }
    });

    //Asignar eventos a los botones para eliminar opciones (si existen)
    const btnsEliminar = document.querySelectorAll('.btnEliminarOpcion');
    btnsEliminar.forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));

            //Eliminar la opción tanto del array de opciones como de las opciones válidas
            opsV.splice(index, 1);
            guardarSeleccionActual();//-----------------------------------------------------Alerta
            megaopcionesValidas.splice(index, 1);

            contadorOps--;
            renderizarOpciones();
            renderizarOpcionesFinal(); //Actualizar el select con las nuevas opciones
        });
    });
}


//Función para eliminar una opción
function eliminarOpcionM(index) {
    if (contadorOps > 2) {
        opsV.splice(index, 1); //Eliminar la opción del array
        contadorOps--;
        renderizarOpciones(); //Volver a renderizar las opciones
    }
}





let opcionSeleccionadaUni = ''; //Para tipo 'uni'
let opcionesSeleccionadasMulti = []; //Para tipo 'multi'

function guardarSeleccionActual() {
    const opcionCorrectaSelect = document.getElementById('opcionCorrectaFM').querySelector('select');
    
    //Guardar la selección actual dependiendo del tipo de pregunta
    if (megatipoPregunta === 'uni') {
        opcionSeleccionadaUni = opcionCorrectaSelect.value;
    } else if (megatipoPregunta === 'multi') {
        opcionesSeleccionadasMulti = Array.from(opcionCorrectaSelect.selectedOptions).map(option => option.value);
    }
}

function renderizarOpcionesFinal() {
    const opcionCorrectaDiv = document.getElementById('opcionCorrectaFM');
    let optionsHTML = '';

    //Generar las opciones según el tipo de pregunta
    if (megatipoPregunta === 'uni') {
        optionsHTML += '<optgroup label="Solo una">';
        for (let i = 0; i < megaopcionesValidas.length; i++) {
            const opcionValor = letrasOpciones[i];
            const seleccionada = opcionSeleccionadaUni === opcionValor ? 'selected' : '';
            optionsHTML += `<option value="${opcionValor}" ${seleccionada}>Opción ${opcionValor}</option>`;
        }
        optionsHTML += '</optgroup>';
    } else if (megatipoPregunta === 'multi') {
        for (let i = 0; i < megaopcionesValidas.length; i++) {
            const opcionValor = letrasOpciones[i];
            const seleccionada = opcionesSeleccionadasMulti.includes(opcionValor) ? 'selected' : '';
            optionsHTML += `<option value="${opcionValor}" ${seleccionada}>Opción ${opcionValor}</option>`;
        }
    }

    //Insertar el nuevo HTML en el contenedor
    opcionCorrectaDiv.innerHTML = `
        <div class="tama10"></div>
        <div class="tama80">
            <p class="indicacionG">Elige la respuesta correcta</p>
            <div class="input-field col s12">
                <select ${megatipoPregunta === 'multi' ? 'multiple' : ''}>
                    ${optionsHTML}
                </select>
            </div>
        </div>
    `;

    //Volver a inicializar el select de Materialize después de insertar el nuevo HTML
    const elems = document.querySelectorAll('select');
    M.FormSelect.init(elems);

    //Vincular el evento para guardar la selección actual
    document.getElementById('opcionCorrectaFM').querySelector('select').addEventListener('change', guardarSeleccionActual);
}

document.getElementById('cmbTipoPreguntaM').addEventListener('change', function() {
    //Guardar la selección actual antes de cambiar el tipo de pregunta
    guardarSeleccionActual();

    //Cambiar el tipo de pregunta
    megatipoPregunta = this.value;

    //Re-renderizar el select con las nuevas opciones
    renderizarOpcionesFinal();
});




// Añadir evento submit al formulario
document.getElementById('baseFormM').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevenir el envío del formulario

    // Llamar a la función para actualizar los datos en Firebase
    await actualizarDatosPregunta();
});

// Función para actualizar los datos en Firebase
async function actualizarDatosPregunta() {
    try {
        // Obtener los valores de los campos
        const preguntaTexto = document.getElementById('txtPreguntaM').value;
        const tipoPregunta = document.getElementById('cmbTipoPreguntaM').value;

        // Obtener las opciones dinámicamente
        const opciones = obtenerOpcionesDesdeInputs(); // Llama a la función para obtener las opciones

        const opcionCorrecta = obtenerSeleccionCorrecta();

        // Aquí puedes obtener el firebaseKey que necesitas para hacer el update
        const firebaseKey = megaKey;

        // Crear el objeto con los datos que se van a actualizar
        const datosActualizados = {
            pregunta: preguntaTexto,
            tipoPregunta: tipoPregunta,
            opciones: opciones,
            opcionCorrecta: opcionCorrecta
        };

        // Referencia al documento en Firebase
        const docRef = doc(db, "PreguntasFinal", firebaseKey);

        // Hacer el update en Firebase
        await updateDoc(docRef, datosActualizados);

        obtePreguntas().then(preguntas => llenarTabla(preguntas));

        //Cerrar el modal "modal1"
        //Abrir otro modal que diga "Datos editados exitosamente"
        // Cerrar el modal "modal1"
        const modal1 = M.Modal.getInstance(document.getElementById('modal1'));
        

        notificar("Pregunta actualizada");
        restaurarOverflow();
        // // Establecer la función para abrir el modal de éxito al finalizar el cierre de modal1
        // modal1.options.onCloseEnd = function() {
        //     // Mostrar el modal de éxito
        //     const modalExito = document.getElementById('modalExito2');
        //     const instance = M.Modal.init(modalExito);
        //     instance.open(); // Abrir el modal de éxito
        // };

        // modal1.close();         
        // --------------------------------------------------------------------------OJOSO
        // Notificación de éxito
        console.log("Los datos han sido actualizados correctamente.");
    } catch (error) {
        console.error("Error al actualizar la pregunta:", error);
    }
}

// Función para obtener las opciones desde los inputs dinámicos
function obtenerOpcionesDesdeInputs() {
    const opciones = [];
    for (let i = 0; i < contadorOps; i++) {
        let inputActual = document.getElementById(`txtOpcion${i}M`);
        if (inputActual) {
            opciones[i] = inputActual.value; // Actualiza el valor de opciones con el valor del input
        }
    }
    return opciones.filter(opcion => opcion !== ""); // Filtrar opciones vacías
}

// Función para obtener la selección correcta
function obtenerSeleccionCorrecta() {
    const tipoPregunta = document.getElementById('cmbTipoPreguntaM').value;
    const selectElement = document.getElementById('opcionCorrectaFM').querySelector('select');
    
    if (tipoPregunta === 'uni') {
        return selectElement.value; // Retorna una única opción correcta
    } else if (tipoPregunta === 'multi') {
        const opcionesSeleccionadas = Array.from(selectElement.selectedOptions).map(option => option.value);
        return opcionesSeleccionadas; // Retorna un array con las opciones seleccionadas
    }
}



// Para borrar---------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', function() {
    const modales = document.querySelectorAll('.modal');
    M.Modal.init(modales);

    let preguntaId; // Variable para almacenar el ID de la pregunta a eliminar

    // Capturar el evento cuando el botón de eliminar se presione
    document.addEventListener('click', function(event) {
        if (event.target.closest('.modal-trigger[data-id]')) {
            const button = event.target.closest('.modal-trigger');
            preguntaId = button.getAttribute('data-id'); // Obtener el ID de la pregunta
            const textoPregunta = button.getAttribute('data-pregunta'); // Obtener el texto de la pregunta
            document.getElementById('preguntaEliminar').textContent = textoPregunta; // Mostrar la pregunta en el modal
        }
    });

    // Manejar la confirmación de la eliminación
    document.getElementById('btnConfirmarEliminar').addEventListener('click', async function() {
        if (preguntaId) {
            try {
                await eliminarPregunta(preguntaId); // Llamar la función para eliminar la pregunta
                obtePreguntas().then(preguntas => llenarTabla(preguntas));
                notificar("¡Pregunta eliminada de forma correcta!");
                //location.reload(); // Recargar la página para reflejar los cambios
            } catch (error) {
                console.error('Error eliminando la pregunta:', error);
            }
        }
    });
});


async function eliminarPregunta(id) {
    try {
        const preguntaRef = doc(db, "PreguntasFinal", id); // Referencia a la pregunta en Firebase
        await deleteDoc(preguntaRef); // Borrar la pregunta
    } catch (error) {
        console.error("Error eliminando la pregunta:", error);
    }
}




//Para guardar el mero examén
document.getElementById('btnSubirEx').addEventListener('click', async function(event) {
    event.preventDefault(); // Evita la acción predeterminada del botón

    // Obtener el valor máximo de "conta" actual en la colección "Examenes"
    let maxConta = -1; // Inicializar en -1, por si es el primer examen

    const examenesSnapshot = await getDocs(collection(db, "Examenes"));
    examenesSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.conta !== undefined && data.conta > maxConta) {
            maxConta = data.conta;
        }
    });

    // El nuevo valor de "conta" será el máximo actual más 1
    const nuevoConta = maxConta + 1;

    // Obtener los valores de los campos del examen
    const tituloExamen = document.getElementById('txtTit').value;
    const fechaFinalizacion = document.getElementById('txtFecha').value; // YYYY-MM-DD
    const horaFinalizacion = document.getElementById('txtHora').value;   // HH:MM (formato 24 horas)
    const tiempoHoras = document.getElementById('txtTempoHoras').value;
    const tiempoMinutos = document.getElementById('txtTempoMins').value;
    const numIntentos = document.getElementById('txtNumIntentos').value;
    const idPPP = claseId; // Supón que esto viene de tu sistema

    // Validaciones de fecha y hora...
    const ahora = new Date();
    const fechaFinal = new Date(`${fechaFinalizacion}T${horaFinalizacion}:00`);
    const fechaActual = ahora.toLocaleDateString('en-CA');

    if (fechaFinalizacion < fechaActual) {
        notificar("La fecha de finalización no puede ser anterior a la fecha actual.");
        document.getElementById('txtFecha').focus();
        return;
    }

    if (fechaFinalizacion === fechaActual) {
        const horaLimite = new Date(ahora.getTime() + (60 * 60 * 1000));
        const [horaFinalizacionHoras, horaFinalizacionMinutos] = horaFinalizacion.split(':');

        if (fechaFinal < horaLimite) {
            notificar(`La hora debe ser al menos ${horaLimite.getHours()}:${horaLimite.getMinutes()} o posterior.`);
            document.getElementById('txtHora').focus();
            return;
        }
    }

    try {
        // Agregar el examen a Firebase con el nuevo campo "conta"
        const docRef = await addDoc(collection(db, "Examenes"), {
            titulo: tituloExamen,
            fechaFinalizacion: fechaFinalizacion,
            horaFinalizacion: horaFinalizacion,
            tiempoDuracion: {
                horas: tiempoHoras,
                minutos: tiempoMinutos
            },
            numeroIntentos: numIntentos,
            estado: "En proceso",
            idProfe: idPPP,
            conta: nuevoConta // Agregar el campo "conta" autoincrementado
        });

        console.log("Examen agregado con ID: ", docRef.id);

        // Actualizar las preguntas con el ID del examen
        const preguntasSnapshot = await getDocs(collection(db, "PreguntasFinal"));
        preguntasSnapshot.forEach(async (doc) => {
            const data = doc.data();
            if (data.idExam === idExamPre) {
                await updateDoc(doc.ref, {
                    idExam: docRef.id
                });
                console.log(`Pregunta con ID ${doc.id} actualizada con idExam: ${docRef.id}`);
            }
        });

        // Mostrar el modal de éxito y redirigir
        const modalExito = document.getElementById('modalExito');
        const instance = M.Modal.init(modalExito);
        instance.open();

        document.getElementById('btnCerrarModal').addEventListener('click', function() {
            window.location.href = `panelMaestro.html?id=${claseId}&clave=${claveDocente}`;
        });

        modalExito.addEventListener('click', function() {
            window.location.href = `panelMaestro.html?id=${claseId}&clave=${claveDocente}`;
        });

    } catch (e) {
        console.error("Error al agregar el examen o actualizar preguntas: ", e);
    }
});




function getRandomNumberString() {
    // Genera un número aleatorio entre 1 y 10,000
    const randomNumber = Math.floor(Math.random() * 10000) + 1;
    
    // Convierte el número a una cadena y lo retorna
    return randomNumber.toString();
  }



async function borrarPreguntasSinExamen() {
    const pregunDoco = await getDocs(collection(db, "PreguntasFinal")); // Obtén todas las preguntas
    const batch = writeBatch(db); // Crea un batch para realizar múltiples operaciones de escritura

    pregunDoco.forEach((doc) => {
        const data = doc.data();
        
        // Verificar si el atributo 'idExam' es 'none'
        if (data.idExam === idExamPre) {
            const docRef = doc.ref; // Obtén la referencia del documento
            batch.delete(docRef); // Agregar la eliminación al batch
        }
    });

    // Ejecuta el batch para eliminar todas las preguntas con 'idExam' === 'none'
    await batch.commit();

    console.log('Se eliminaron todas las preguntas sin examen');
}

document.getElementById('brnCancelarEx').addEventListener('click', () => {
    const modalConfirm = M.Modal.getInstance(document.getElementById('modalConfirm'));
    modalConfirm.open(); // Abre el modal de confirmación
});

document.getElementById('btnConfirmDelete').addEventListener('click', async () => {
    // Llamar a la función de eliminación de preguntas
    await borrarPreguntasSinExamen();
    
    // Mostrar el modal de "Examen eliminado"
    const modalSuccess = M.Modal.getInstance(document.getElementById('modalSuccess'));
    modalSuccess.open();
});

document.getElementById('btnCloseSuccess').addEventListener('click', () => {
    window.location.href = `panelMaestro.html?id=${claseId}&clave=${claveDocente}`;// Redirigir al panel maestro
});

// O también al hacer clic fuera del modal
const modalSuccess = M.Modal.getInstance(document.getElementById('modalSuccess'));
modalSuccess.options.onCloseEnd = function() {
    window.location.href = `panelMaestro.html?id=${claseId}&clave=${claveDocente}`;// Redirigir al panel maestro
};


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


function restaurarOverflow() {
    // Restaurar el comportamiento del scroll
    document.body.style.overflow = "auto";
}


