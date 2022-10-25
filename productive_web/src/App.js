import React, { useEffect, useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import { signInWithPopup } from "firebase/auth";

import { reorder } from "./db/db-actions";
import List from "./components/List/List";
import { auth } from "./db/db";
import "./App.css";
import { signInWithGoogle } from "./auth";

// TODO - add:
// Edit √
// Delete √
// Style [first pass] √
// Drag and drop √
// Back-end [Firebase] √
// Done button/styling √
// Auth/users [fix newline bug]
//// On initial log-in, if signed-in, populate √
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
// Change Firestore I/O to real-time updates (replace Redux?) √
// Add Outlook
// Cloud function removing old anons
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
  const [mouseCoords, setMouseCoords] = useState({});

  useEffect(() => {
    if (isInitialRender) {
      setIsInitialRender(() => false);

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
    reorder(result.draggableId, result.source.index, result.destination.index);
  };

  return (
    <DragDropContext onDragEnd={dragEndHandler}>
      <nav>
        <button onClick={signInWithGoogle}>"Sign in"</button>
        <button onClick={() => auth.signOut()}>"Log out"</button>
      </nav>
      <List />
    </DragDropContext>
  );
}

export default App;
