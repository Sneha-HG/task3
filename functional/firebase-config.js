
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";

  const firebaseConfig = {
    apiKey: "AIzaSyAqnOYPxiCkXBIajDnXkbUBm8o76aY62ak",
    authDomain: "project-92e2a.firebaseapp.com",
    databaseURL: "https://project-92e2a-default-rtdb.firebaseio.com",
    projectId: "project-92e2a",
    storageBucket: "project-92e2a.firebasestorage.app",
    messagingSenderId: "615965212803",
    appId: "1:615965212803:web:b8ec34e12162d32c449bb6"
  };


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };


