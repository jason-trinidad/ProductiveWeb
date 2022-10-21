import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { DragDropContext } from "react-beautiful-dnd";
import {
  signInWithPopup,
  signInAnonymously,
  onAuthStateChanged,
  GoogleAuthProvider,
  linkWithPopup,
} from "firebase/auth";

import { addFirstLine } from "./db/db-actions";
import List from "./components/List/List";
import { db, auth } from "./db/db";
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
  // const taskList = useSelector((state) => state.tasks);
  const [mouseCoords, setMouseCoords] = useState({});

  useEffect(() => {
    if (isInitialRender) {
      setIsInitialRender(() => false);

      // // Listen for auth state changes
      // onAuthStateChanged(auth, (user) => {
      //   if (user) {
      //     console.log("Logged in");
      //   } else {
      //     signInAnonymously(auth)
      //       .then(() => {
      //         addFirstLine();
      //       })
      //       .catch((error) => {
      //         const errorCode = error.code;
      //         const errorMessage = error.message;
      //         console.log(errorMessage);
      //       });
      //   }
      // });

      // Add a listener to aid creating CalendarItem on DnD from List
      document.addEventListener("mouseup", (event) => {
        setMouseCoords(() => ({ mouseX: event.pageX, mouseY: event.pageY }));
      });

      return;
    }
  }, []);

  const dragEndHandler = (result) => {
    console.log(mouseCoords);
    if (!result.destination) return; // TODO: would bang-less syntax work?
    dispatch(tasksActions.reorder(result));
  };

  return (
    <DragDropContext onDragEnd={dragEndHandler}>
      <nav>
        {/* <button onClick={linkGoogle}>"Link account"</button> */}
        {/* <button onClick={signInWithGoogle}>"Sign in"</button>
        <button onClick={signOutHandler}>"Log out"</button> */}
      </nav>
      <List />
    </DragDropContext>
  );
}

export default App;
