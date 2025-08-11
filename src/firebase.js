// src/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  databaseURL: "https://vocab-game-db-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "vocab-game-db",
  apiKey: "AIzaSyDlDeTDcwEIz1NmrSSv2hCILUvV-0G1DZs",
  authDomain: "vocab-game-db.firebaseapp.com",
  storageBucket: "vocab-game-db.firebasestorage.app",
  messagingSenderId: "396013621042",
  appId: "1:396013621042:web:484a6e77a8ae7d2e0d512b",
  measurementId: "G-W82RFEZ93Z"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { app, db };
