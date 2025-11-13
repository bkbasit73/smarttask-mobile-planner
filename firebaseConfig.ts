// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBatupbMoPYjGSzc2VzayX8xCWLkEGigrQ",
  authDomain: "smarttask-mobile-planner.firebaseapp.com",
  projectId: "smarttask-mobile-planner",
  storageBucket: "smarttask-mobile-planner.firebasestorage.app",
  messagingSenderId: "712039910479",
  appId: "1:712039910479:web:436c423173e47738ba6e3a",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Firestore Database
export const db = getFirestore(app);

// Firebase Authentication
export const auth = getAuth(app);
