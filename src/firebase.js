// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyALWQIWtxrgF2PRA7eRkJChpuUFGt2LEAw",
  authDomain: "masseria-menu.firebaseapp.com",
  databaseURL: "https://masseria-menu-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "masseria-menu",
  storageBucket: "masseria-menu.firebasestorage.app",
  messagingSenderId: "635343291445",
  appId: "1:635343291445:web:c1db7ee95e17311a481d7c",
  measurementId: "G-V24VWSFP2R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the real-time database
const db = getDatabase(app);

// Export the database to use in other files
export { db };
