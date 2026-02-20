// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBGStqCz6kHgdVjAcY0BqXnX6jpSYTBYGc",
  authDomain: "triplymobile.firebaseapp.com",
  projectId: "triplymobile",
  storageBucket: "triplymobile.firebasestorage.app",
  messagingSenderId: "716728288062",
  appId: "1:716728288062:web:e469fc251ed66d6854626f",
  measurementId: "G-8EWELTFKJ2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Initialize Firebase Authentication
const auth = getAuth(app);

export { app, auth, db };
