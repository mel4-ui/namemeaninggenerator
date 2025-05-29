// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "@firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDHzw0lOdLgN_s5YIkXDknc1yNx7RNFaYM",
  authDomain: "saymyname-5bf50.firebaseapp.com",
  projectId: "saymyname-5bf50",
  storageBucket: "saymyname-5bf50.firebasestorage.app",
  messagingSenderId: "61228461854",
  appId: "1:61228461854:web:0af37d23c323827e2ce30f",
  measurementId: "G-5LQ4HQKJBH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { db };