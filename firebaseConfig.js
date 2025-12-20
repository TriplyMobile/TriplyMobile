// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// import { getAnalytics } from "firebase/analytics";
// import {...} from 'firebase/auth';
// import {...} from 'firebase/database';
// import {...} from 'firebase/functions';
// import {...} from 'firebase/storage';
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

export { app, db };
