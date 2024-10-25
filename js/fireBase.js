
    //Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

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