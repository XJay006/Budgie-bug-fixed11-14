// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBL6aZd4K48gjSmWiftQomCIUNm-axZ3Zo",
  authDomain: "budgie-e749f.firebaseapp.com",
  projectId: "budgie-e749f",
  storageBucket: "budgie-e749f.appspot.com",
  messagingSenderId: "288459242912",
  appId: "1:288459242912:web:2faaf2ce3f6c4f9a20b8c5"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);