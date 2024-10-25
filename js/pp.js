let imagenesSeleccionadas = [];  // Array para almacenar las imágenes seleccionadas

document.getElementById('baseForm').addEventListener('submit', function(event) {
    event.preventDefault();  // Evita que el formulario recargue la página

    let recibirDiv = document.getElementById("recibir");  // Div donde se mostrarán las imágenes enviadas
    recibirDiv.innerHTML = '';  // Limpiar el div antes de insertar las imágenes
    let htmlImgs = "";  // Variable para almacenar el HTML de las imágenes enviadas
    
    if (imagenesSeleccionadas.length > 0) {
        for (let i = 0; i < imagenesSeleccionadas.length; i++) {
            let archivo = imagenesSeleccionadas[i];
            
            if (archivo) {
                let lectura = new FileReader();
                
                lectura.onload = function(e) {
                    // Acumular el HTML de cada imagen con su vista previa en orden
                    htmlImgs += "<img src='"+e.target.result+"' style='width: 150px; margin: 10px;'>";                    
                    recibirDiv.innerHTML = htmlImgs;  // Inserta todas las imágenes en el div 'recibir'
                };
                
                lectura.readAsDataURL(archivo);  // Convierte la imagen a una URL para mostrarla
            }
        }
    }
});

document.getElementById("imgPicker").addEventListener("change", function(event) {
    imagenesSeleccionadas = Array.from(event.target.files);  // Guardar las imágenes seleccionadas en el array
    let galeria = document.getElementById("galeria");
    galeria.innerHTML = '';  // Limpiar la galería antes de insertar nuevas imágenes
    let htmlImgs = "";  // Variable para acumular el HTML de las imágenes
    
    if (imagenesSeleccionadas.length > 0) {
        for (let i = 0; i < imagenesSeleccionadas.length; i++) {
            let archivo = imagenesSeleccionadas[i];
            
            if (archivo) {
                let lectura = new FileReader();
                
                lectura.onload = function(e) {
                    // Acumula el HTML de la nueva imagen, manteniendo el orden por índice
                    htmlImgs += `<img src="${e.target.result}" style="width: 150px; margin: 10px;">`;
                    galeria.innerHTML = htmlImgs;  // Inserta todas las imágenes acumuladas en el contenedor
                };
                
                lectura.readAsDataURL(archivo);  // Lee la imagen y la convierte a una URL
            }
        }
    }
});
