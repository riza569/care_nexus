import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC0DhIkrwC5xg4TUNmT52T0EAR9HorVy6Q",
  authDomain: "care-project-38d01.firebaseapp.com",
  projectId: "care-project-38d01",
  storageBucket: "care-project-38d01.firebasestorage.app",
  messagingSenderId: "400249513973",
  appId: "1:400249513973:web:8514159eb5e771fa36a2bc",
  measurementId: "G-TTM63X6FSH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
