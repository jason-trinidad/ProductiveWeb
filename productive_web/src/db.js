import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
  collection,
  getDocs,
  query,
  addDoc,
  deleteDoc,
} from "firebase/firestore";

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
export const auth = getAuth();
connectAuthEmulator(auth, "http://localhost:9099");

// DB
export const db = getFirestore();
connectFirestoreEmulator(db, "localhost", 8080);

// Overwrites existing DB with current state
export const saveTasksToDB = (tasks) => {
  const user = auth.currentUser;
  const tasksRef = collection(db, "Users/"+user.uid+"/Tasks");

  const update = async () => {
    try {
      const allDocs = await getDocs(query(tasksRef));
      if (!allDocs.empty) {
        console.log('Delete triggered')
        // console.log('Attempting to delete:')
        allDocs.forEach((doc) => {
            console.log(doc.data())
            deleteDoc(doc.ref)
        });
      }

    // console.log('Attempting to save:')
    // console.log(tasks);
    tasks.map((task, index) => {
      try {
        // console.log({...task, listIndex: index})
        addDoc(tasksRef, {...task, listIndex: index});
      } catch (error) {
        throw new Error('Failed to save new state.')
      }
    });
    } catch (error) {
      console.log(error);
      throw new Error('Failed to delete existing.');
    }
  };

  update();
};
