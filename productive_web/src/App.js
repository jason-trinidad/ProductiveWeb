import React, { useEffect, useRef, useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";

import { reorder, addFirstLine, schedule } from "./db/db-actions";
import List from "./components/List/List";
import { MyCalendar } from "./components/MyCalendar/MyCalendar";
import { auth } from "./db/db";
import "./App.css";
import { signInWithGoogle } from "./auth";
import { getDateTime } from "./components/MyCalendar/cal-utils";

// TODO - add:
// Edit √
// Delete √
// Style [first pass] √
// Drag and drop √
// Back-end [Firebase] √
// Done button/styling √
// Auth/users √
// Deploy √
// Add weekly calendar
//// Create calendar template √
//// Determine intended time from drop √
//// Schedule task on drop √
//// Create line/display showing time for scheduling √
//// Add functionality for dates √
//// Drag to reschedule √
//// Drag to re-size event √
//// Modal to show event details on click √
//// Implement repeats
//// Add row of dates √
//// Make calendar scrollable √
//// Fix drop-time math
//// Prettify
// Deadline
// Team up
//// Create request √
//// Create invite √
//// 
// Streak
// Change hour-column to AM/PM times √
// Style (notification bar, login status)
// ---------------------------- MVP
// Re-do date-grid. a) look better, b) align elements
// Cloud function removing old anons ("time-to-live" may do this!)
// Look into build tools (incremental builds, FB emulators)
// Add Redux back in to track calendar state (fewer re-renders, fewer document listeners?)
// Refactor (e.g. clean up App.js, standardize cases, map() -> forEach(), when to use anon functions in setState?, 
    // refactor db interaction, function naming conventions, dedicated skip initial render hook)
    // Is there a way to write docs for each function using comments?
// Time budgets
// Desktop push notifications
// Indents (maybe switch to/extend Atlassian's tree framework for list)
// Add Outlook
// Populate from Google Tasks+Calendar / Apple Reminders+Calendar
// When dragging over calendar, drag in 5 min "steps" [kind of fixed with dateline. Intend to resolve with new DND scheme]
// Solution for finding team up if no friends (random names? "Make available to team up" option? Matchmaking?)
// (If not fixed:) save value of active input before leaving page [could do this in useEffect return statement]
// Undo?
// Focus on previous element on delete (maybe convert to class component?)
// Keyboard shortcuts
// Input on short click, drag/drop on long clicks
// Offline support
// 5 min task section (drag or tag task as 5 min, shows in window above List. No nesting, copied from List)

function App() {
  const [isInitialRender, setIsInitialRender] = useState(true);
  const [mouseCoords, setMouseCoords] = useState({});
  const ref = useRef(); // Forwarding ref to datefield
  // TODO: change to Redux (?)
  const [calDatesDisplayed, setCalDatesDisplayed] = useState([]);

  useEffect(() => {
    if (isInitialRender) {
      setIsInitialRender(() => false);

      // Listen for auth state changes. If not logged in, log in anonymously
      onAuthStateChanged(auth, (user) => {
        if (user) {
          console.log("Logged in");
        } else {
          signInAnonymously(auth)
            .then(() => {
              addFirstLine();
            })
            .catch((error) => {
              const errorMessage = error.message;
              console.log(errorMessage);
            });
        };
      });

      // Add a listener to aid creating calendar event on drop from List
      document.addEventListener("mouseup", (event) => {
        setMouseCoords(() => ({ x: event.pageX, y: event.pageY }));
      });

      return;
    }
  }, [isInitialRender]);

  const handleCalendarDrop = () => {
    const dfOrigin = { x: ref.current.offsetLeft, y: ref.current.offsetTop };

    if (mouseCoords.x < dfOrigin.x || mouseCoords.y < dfOrigin.y) {
      return null;
    }

    const dfDims = { x: ref.current.clientWidth, y: ref.current.clientHeight };

    return getDateTime(mouseCoords, dfOrigin, dfDims, calDatesDisplayed[0]);
  };

  const dragEndHandler = (result) => {
    const { destination, source, draggableId } = result;

    const time = handleCalendarDrop();
    if (time) {
      schedule(draggableId, time);
      return;
    }

    if (!destination) return;
    reorder(draggableId, source.index, destination.index);
  };

  const updateCalDates = (dates) => {
    setCalDatesDisplayed(() => dates);
  }

  return (
    <DragDropContext onDragEnd={dragEndHandler}>
      <div className="grid-container">
        <div className="nav">
          <button onClick={signInWithGoogle}>{"Sign in"}</button>
          <button onClick={() => auth.signOut()}>{"Log out"}</button>
        </div>
        <h2 className="list-title">List</h2>
        <div className="list-container">
          <List />
        </div>
        <div className="cal-container">
          <MyCalendar ref={ref} updateParentDates={updateCalDates} />
        </div>
      </div>
    </DragDropContext>
  );
}

export default App;
