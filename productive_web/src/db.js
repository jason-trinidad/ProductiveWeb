import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAsJn0ewPAipnHWexFvb6Nlz8dvUI8JmlQ",
  authDomain: "productive-c3d8a.firebaseapp.com",
  projectId: "productive-c3d8a",
  storageBucket: "productive-c3d8a.appspot.com",
  messagingSenderId: "59050319106",
  appId: "1:59050319106:web:f844e101dfbd38cdb5761b",
  measurementId: "G-N0GZ76G9KH",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

// Auth
const auth = getAuth();
connectAuthEmulator(auth, "http://localhost:9099");

// DB
const firestore = getFirestore();
connectFirestoreEmulator(firestore, 'localhost', 8080);

export default firestore;