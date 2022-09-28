import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

// Firebase imports
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

// Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyAsJn0ewPAipnHWexFvb6Nlz8dvUI8JmlQ",
//   authDomain: "productive-c3d8a.firebaseapp.com",
//   projectId: "productive-c3d8a",
//   storageBucket: "productive-c3d8a.appspot.com",
//   messagingSenderId: "59050319106",
//   appId: "1:59050319106:web:f844e101dfbd38cdb5761b",
//   measurementId: "G-N0GZ76G9KH",
// };

// Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

// Auth
const auth = getAuth();
connectAuthEmulator(auth, "http://localhost:9099");

// DB
const db = getFirestore();
connectFirestoreEmulator(db, 'localhost', 8080);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  // <React.StrictMode>
  <App />
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
