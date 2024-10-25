document.getElementById('baseForm').addEventListener('submit', function(event) {
    event.preventDefault(); 
    let nombre  = document.getElementById('txtNombre').value;
    let apeP  = document.getElementById('txtApeP').value;
    let apeM = document.getElementById('txtApeM').value;

    let fechaNac = document.getElementById("txtFecha").value;
    let edad = document.getElementById("txtNumEdad").value;

    let tel = document.getElementById("txtTel").value;
    let correo = document.getElementById("txtCorreo").value;

    let contra = document.getElementById('txtContra').value;

    if (nombre === "") {
      alert('Por favor, no deje el campo de "nombre" vacío.');
      event.preventDefault();  
      return;  
    }

    if (apeP === "") {
      alert('Por favor, no deje el campo de "apellido paterno" vacío.');
      event.preventDefault();  
      return;  
    }
    
    if (apeM === "") {
      alert('Por favor, no deje el campo de "apellido materno" vacío.');
      event.preventDefault();  
      return;  
    }
    
    if (fechaNac === "") {
      alert('Por favor, no deje el campo de "fecha de nacimiento" vacío.');
      event.preventDefault();  
      return;  
    }

    if (edad === "") {
      alert('Por favor, no deje el campo de "edad" vacío.');
      event.preventDefault();  
      return;  
    }

    if (tel === "") {
      alert('Por favor, no deje el campo de "teléfono" vacío.');
      event.preventDefault();  
      return;  
    }

    if (correo === "") {
      alert('Por favor, no deje el campo de "correo" vacío.');
      event.preventDefault();  
      return;  
    }

    if (contra === "") {
      alert('Por favor, no deje el campo de "contraseña" vacío.');
      event.preventDefault();  
      return;  
    }   
    
    //Para obtener el valor de un combobox:
    let cmbCarrera = document.getElementById("cmbCarrera"); //Acá ya se obtiene el valor seleccionado del combo

    let carreraT = cmbCarrera.options[cmbCarrera.selectedIndex].text;
    if (carreraT == "Elija la carrera a la que pertenece") {
      alert('Por favor, elija una carrera.');
      event.preventDefault();
      return;
    }
    //------

    //Para obtener el valor de un radiobuttom
    let radioRes = document.getElementsByName("rbSexo"); 
    let sexS = "";

    for (let i = 0; i < radioRes.length; i++) {
      if (radioRes[i].checked) {
        sexS = radioRes[i].value;
        i=radioRes.length;
      }
    }  
    
    if (sexS === "") {
      alert("Por favor, seleccione una opción de sexo.");
      event.preventDefault();
      return;
    }    
    
    //---

    //Para obtener y validar los datos de los input especiales de fecha:
    //Para las fechas de cita:
    let mesAn = document.getElementById("txtMA").value;
    let semana = document.getElementById("txtSemana").value;
    let hora = document.getElementById("txtTime").value; 
    
    if (mesAn == "") {
      alert("Por favor, elija un mes y año para agendar cita");
      event.preventDefault();  
      return;  
    }   

    if (semana == "") {
      alert("Por favor, elija un número de semana para agendar cita");
      event.preventDefault();  
      return;  
    }  
    
    if (hora == "") {
      alert("Por favor, elija una hora para agendar cita");
      event.preventDefault();  
      return;  
    }      

    //Obtener una imagen:
    let imgA = document.getElementById("imgPicker").files[0];    
    if (!imgA) {
      alert("Por favor, seleccione una imagen");
      event.preventDefault();  
      return;  
    }

    //Obtener el PDF:
    let filePdf = document.getElementById("inputPDF").files[0];
    if (!filePdf) {
      alert("Por favor, seleccione un PDF para el Curriculum");
      event.preventDefault();  
      return;  
    }

    

    // Mostrar los resultados:

    //De los input normales de texto
    document.getElementById("nombreRes").innerHTML = "<span>"+ "Ficha de datos de: \n "+ nombre+ " " + apeP + " " + apeM +"." +"</span>";

    document.getElementById("fechaNacEdadRes").innerHTML = "<span>"+ "Tiene " + edad + " años y nació el "+ fechaNac +""+"</span>";    

    document.getElementById("correoRes").innerHTML = "<span>"+ "Correo:<b> " +correo+"</b></span>";    

    document.getElementById("telRes").innerHTML = "<span>"+ "Teléfono:<b> " +tel+"</b></span>";    

    document.getElementById("contraReso").innerHTML = "<span>"+ "Contraseña:<b> " +contra+"</b></span>";    



    
    
    //Para mostrar el comboBox
    
    document.getElementById("carreraRes").innerHTML = "<span>Carrera: <b>"+ carreraT +"</b></span>";


    //Para mostrar el radioButton
    document.getElementById("sexoRes").innerHTML = "<span>"+ "Sexo:<b> " +sexS+"</b></span>";    

    
   



    //Para el color:
    let colorRes = document.getElementById("colorPicker");
    let colorMostra = document.getElementById("colorResfav"); 
    colorMostra.style.backgroundColor = colorRes.value;


    //Para los range:
    let rango1Res = parseInt(document.getElementById("pre1").value);
    let rango2Res = parseInt(document.getElementById("pre2").value);
    let rango3Res = parseInt(document.getElementById("pre3").value);

    let mensajeOp="";

    if(rango1Res==50){
      mensajeOp = mensajeOp + "<p>Le parece normal la materia de programación web </p>";

    }else{
      if(rango1Res>50){
        mensajeOp = mensajeOp + "<p>Le parece importante la materia de programación web </p>";
  
      }else{
        mensajeOp = mensajeOp + "<p>No le importa la materia de programación web </p>";
      }      

    }

    if(rango2Res==50){
      mensajeOp = mensajeOp + "<p>Está indeciso si enfocarse en programación web al terminar tus estudios </p>";

    }else{
      if(rango2Res>50){
        mensajeOp = mensajeOp + "<p>Está decidido a enfocarse en programación web al terminar tus estudios </p>";
  
      }else{
        mensajeOp = mensajeOp + "<p>No está interesado a enforcarse en programación web al terminar tus estudios </p>";
      }      

    }
    

    if(rango3Res==50){
      mensajeOp = mensajeOp + "<p>Cuenta con la habilidad necesaria para programar páginas web </p>";

    }else{
      if(rango3Res>50){
        mensajeOp = mensajeOp + "<p>Cuenta con mucha habilidad para programar páginas web </p>";
  
      }else{
        mensajeOp = mensajeOp + "<p>Cuenta con poca habilidad para programar páginas web </p>";
      }      

    }   
    
    document.getElementById("resRange").innerHTML = "<p class='indicacionG'>Sus actitudes:</p> <span>"+ mensajeOp +"</span>";    

    //Para mostrar las fechas:
    document.getElementById("AgendadaRes").innerHTML = "<hr><p class=''>Cita agendada:</p> <span> La cita está agendada para el año y mes "+ mesAn +", la semana número "+semana.split('-W')[1]+" a las "+hora+"</span><hr>";    

    //Para mostrar una imagén:
    
    if (imgA) {
        let lectura = new FileReader(); 
    
        lectura.onload = function(e) {
            let htmlFoto = "<img src='" + e.target.result + "' width='100%' height='auto' alt='Imagen seleccionada'>";
            
            // Insertar la imagen dentro del contenedor resuImg
            document.getElementById("resuImg").innerHTML = htmlFoto;
        };
    
        lectura.readAsDataURL(imgA);  
    }

    //Para el URL:
    let urlRes  = document.getElementById("txtLink").value;

    if (urlRes == "") {
      document.getElementById("linkRes").innerHTML = "<p>No cuenta con redes sociales</p>";
    }else{
      document.getElementById("linkRes").innerHTML = "<a id='aRes' href='"+urlRes+"' target='_blank'>Link de su red social</a>";

    }

    


    //Para el PDF

    if (filePdf) {
      let urlPDF = URL.createObjectURL(filePdf);
      let pdfRES = document.getElementById("contenedorPDFRes");

      // Crear el HTML del iframe
      let iframeHTML = "<iframe src="+urlPDF+" type='application/pdf' style='width: 450px;'></iframe>";

      // Insertar el iframe en el contenedor
      pdfRES.innerHTML = iframeHTML;
    }    

    //Para el textarea
    let txtAreaReso  = document.getElementById("textarea1").value;
    let saltosSaltos = txtAreaReso.replace(/\n/g, "<br>");
    document.getElementById("areaRes").innerHTML = "<span>"+saltosSaltos+"</span>";


    //Para obtener los valores de los checkbox

    let chkSeleccionado = document.querySelectorAll("input[name='chkActividad']:checked");
    let resusChk = [];

    let htmlCarrusel = "";
    if(chkSeleccionado.length==0){
      htmlCarrusel += "<a class='carousel-item'><img src='img/actividades/nose.png'></a>";

    }
    for (let i = 0; i < chkSeleccionado.length; i++) {
      //resusChk.push(chkSeleccionado[i].value);  
     console.log(chkSeleccionado[i].value);
      switch (chkSeleccionado[i].value) {
        case "dibujar1":
              htmlCarrusel += "<a class='carousel-item'><img src='img/actividades/dibujar.png'></a>";
          break;
        case "video2":
              htmlCarrusel += "<a class='carousel-item'><img src='img/actividades/videoJuegos.png'></a>";
          break;
        case "deporte3":
              htmlCarrusel += "<a class='carousel-item'><img src='img/actividades/deporte.png'></a>";
          break;
        case "pelis4":
              htmlCarrusel += "<a class='carousel-item'><img src='img/actividades/verPelis.png'></a>";
          break;
        case "bailar5":
              htmlCarrusel += "<a class='carousel-item'><img src='img/actividades/baile.png'></a>";
          break;
        case "amigos6":
              htmlCarrusel += "<a class='carousel-item'><img src='img/actividades/salirAmigos.png'></a>";
          break;          
        default:
              htmlCarrusel += "<a class='carousel-item'><img src='img/actividades/nose.png'></a>";
   
      }  
       
    }
    
    document.getElementById("carru").innerHTML = htmlCarrusel;     
        // Recarga el carrusel, esto es por parte de Materialize

        // document.addEventListener('DOMContentLoaded', function() {
        //   var elems = document.querySelectorAll('.carousel');
        //   var instances = M.Carousel.init(elems, options);
        // });
      
        // Or with jQuery
        setTimeout(function() {
          var elems = document.querySelectorAll('.carousel');
          M.Carousel.init(elems);  // Inicializa los carruseles de Materialize
      }, 100); 

        //Fin de la recarga
});

//Para que, cuando se elija una imagen, esta se muestre en un contenedor img
document.getElementById("imgPicker").addEventListener("change", function(event) {
    let archivo = event.target.files[0];  
  
    if (archivo) {
        let lectura = new FileReader(); 
  
      lectura.onload = function(e) {
       
        let vistaPrevia = document.getElementById("fotoEjem");
        vistaPrevia.src = e.target.result;
        vistaPrevia.style.display = 'block'; 
      };
  
      lectura.readAsDataURL(archivo);  
    }
  });

  

  //Para las contraseñas

  function compararContrasenas() {
    let contra1 = document.getElementById('txtContra').value;
    let contra2 = document.getElementById('txtContraC').value;

    if (contra1 != contra2) {

    document.getElementById('txtContra').style.borderBottom = "1px solid red";
    document.getElementById('txtContraC').style.borderBottom = "1px solid red";
    document.getElementById('txtContra').style.boxShadow = "0 1px 0 0 red";
    document.getElementById('txtContraC').style.boxShadow = "0 1px 0 0 red";

    } else {
        document.getElementById('txtContra').style.borderBottom = "";
        document.getElementById('txtContraC').style.borderBottom = "";
        document.getElementById('txtContra').style.boxShadow = "";
        document.getElementById('txtContraC').style.boxShadow = "";        
        
    }
  }  

//Evento de las contraseñas, el blur lo que dice es que cuando se pierda en focus a ese objeto haga lo que estamos diciendo, es como el onclick
txtContra.addEventListener('blur', compararContrasenas);
txtContraC.addEventListener('blur', compararContrasenas);  

//Para que el color sea dinámico:
let inputColor = document.getElementById('colorPicker');
let divColor = document.getElementById('colorMuestra'); 

function actualizarColor() {
    divColor.style.backgroundColor = inputColor.value;
}       
colorPicker.addEventListener('input', actualizarColor);
actualizarColor();

//Para archivos pdf
document.getElementById("inputPDF").addEventListener('change', function(event) {
  let arch = event.target.files[0];
  if (arch) {
    let url = URL.createObjectURL(arch);
    let frame = document.getElementById("framePdf");
    frame.src = url;
    frame.style.display = "block"; 
  }
});