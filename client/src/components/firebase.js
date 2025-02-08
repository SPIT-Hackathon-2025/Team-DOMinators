// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore"
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCOAdozeLE2H4gGjg6wVYgcTYJAU9xk4Dg",
  authDomain: "spit-hack-c29e8.firebaseapp.com",
  projectId: "spit-hack-c29e8",
  storageBucket: "spit-hack-c29e8.firebasestorage.app",
  messagingSenderId: "587944777",
  appId: "1:587944777:web:e1903a4af7ec740d65c098"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;