import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyB0uNWST-WmWXZCEx75WPqmrzfPTjOS3gM",
  authDomain: "rekhanth-routine.firebaseapp.com",
  databaseURL: "https://rekhanth-routine-default-rtdb.firebaseio.com",
  projectId: "rekhanth-routine",
  storageBucket: "rekhanth-routine.firebasestorage.app",
  messagingSenderId: "614187718480",
  appId: "1:614187718480:web:79ece011b21e3c4cbf3e55",
  measurementId: "G-G3MCH9SMZL"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);