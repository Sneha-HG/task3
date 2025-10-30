
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "",
  authDomain: "scorebuzz-2025.firebaseapp.com",
  projectId: "scorebuzz-2025",
  storageBucket: "scorebuzz-2025.firebasestorage.app",
  messagingSenderId: "129277879983",
  appId: "1:129277879983:web:47f693058647d955b0d65a",
  databaseURL: "https://scorebuzz-2025-default-rtdb.firebaseio.com/"
};


const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };

