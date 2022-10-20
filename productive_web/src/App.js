import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  collection,
  query,
  orderBy,
  getDocs,
  where,
  documentId,
} from "firebase/firestore";
import { DragDropContext } from "react-beautiful-dnd";
import {
  signInWithPopup,
  signInAnonymously,
  GoogleAuthProvider,
  linkWithPopup,
} from "firebase/auth";

import List from "./components/List/List";
import { db, auth, saveTasksToDB } from "./db";
import { tasksActions } from "./store/tasks-slice";
import "./App.css";

// TODO - add:
// Edit √
// Delete √
// Style [first pass] √
// Drag and drop √
// Back-end [Firebase] √
// Done button/styling √
// Auth/users
//// On initial log-in, if signed-in, populate
//// Otherwise display blank
//// If Google log-in
////// If Google log-in exists, populate
////// Otherwise, create new user using anonymous id and save current state
// Weekly calendar
// Do at
// Deadline
// Team up
// Streak
// Repeating events
// ---------------------------- MVP
// Change Firestore I/O to real-time updates (replace Redux?)
// Add Outlook
// Refactor (e.g. clean up App.js, standardize cases)
// Solution for finding team up if no friends (random names? "Make available to team up" option? Matchmaking?)
// (If not fixed:) save value of active input before leaving page
// Indents (maybe switch to/extend Atlassian's tree framework for list)
// Add anonymous sign-in?
// Undo?
// Focus on previous element on delete (maybe convert to class component?)
// Keyboard shortcuts
// Input on short click, drag/drop on long clicks
// Offline support

function App() {
  const [isInitialRender, setIsInitialRender] = useState(true);
  const dispatch = useDispatch();
  const taskList = useSelector((state) => state.tasks);
  const [mouseCoords, setMouseCoords] = useState({});

  const ref = collection(db, "Tasks");
  const q = query(ref, orderBy("listIndex"));

  // Populate state. TODO: Add as thunk to store
  const populate = async () => {
    const user = auth.currentUser
    const tasksRef = collection(db, "Users/"+user.uid+"/Tasks");
    const tasksQuery = query(tasksRef, orderBy("listIndex"));
    try {
      const querySnapshot = await getDocs(tasksQuery);
      if (!querySnapshot.empty) {
        // dispatch(tasksActions.append()); // Adds empty line to state
      // } else {
        querySnapshot.docs.map((task) =>
          dispatch(tasksActions.append(task.data()))
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();

    signInWithPopup(auth, provider)
      .then(async (result) => {
        // Check if user is in DB. If not, add them, alongside current tasksList state
        const user = result.user;
        const usersRef = collection(db, "Users/"+user.uid+"/Tasks");
        // const userQuery = query(usersRef, where(documentId(), "==", user.uid))
        try {
          const querySnapshot = await getDocs(usersRef);
          console.log("Query snapshot from login: ")
          querySnapshot.docs.map((doc) => console.log(doc.data()))
          if (querySnapshot.empty) {
            console.log("Deleting/saving from signIn.")
            saveTasksToDB(taskList);
          } else {
            console.log("We populating biiiiiih")
            populate();
          }
        } catch (error) {
          console.log("signInWithGoogle encountered error:");
          console.log(error);
        }
      })
      .catch((error) => {
        const errorMessage = error.message;
        console.log("Google login encountered error:");
        console.log(errorMessage);
      });
  };

  const signOutHandler = () => {
    auth.signOut();
    console.log("Signed out.")
    dispatch(tasksActions.clear())
    // signInAnon();
  };

  useEffect(() => {
    if (taskList.length == 0) dispatch(tasksActions.append()); // Adds empty line to state

    if (isInitialRender) {
      setIsInitialRender(() => false);

      // Add a listener to aid creating CalendarItem on DnD from List
      document.addEventListener("mouseup", (event) => {
        setMouseCoords(() => ({ mouseX: event.pageX, mouseY: event.pageY }));
      });
      
      return;
    }

    console.log("Non-initial render sees user as:")
    console.log(auth.currentUser);
    if (auth.currentUser) {
      console.log("App.useEffect is saving taskList");
      saveTasksToDB(taskList);
    }
  }, [taskList]);

  const dragEndHandler = (result) => {
    console.log(mouseCoords);
    if (!result.destination) return; // TODO: would bang-less syntax work?
    dispatch(tasksActions.reorder(result));
  };

  return (
    <DragDropContext onDragEnd={dragEndHandler}>
      <nav>
        {/* <button onClick={linkGoogle}>"Link account"</button> */}
        <button onClick={signInWithGoogle}>"Sign in"</button>
        <button onClick={signOutHandler}>"Log out"</button>
      </nav>
      <List />
    </DragDropContext>
  );
}

export default App;
