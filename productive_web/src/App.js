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
//// Add functionality for dates
//// Decompose MyCalendar (re-add Redux?)
// Drag to reschedule
// Add scheduled details to task
// Change to AM/PM times
// Add row of dates
// Change from divs to hrs for hours
// Make calendar scrollable
// Deadline
// Team up
// Streak
// Repeating events
// ---------------------------- MVP
// Change Firestore I/O to real-time updates (replace Redux?) √
// Add Redux back in to track calendar state (unless DND fixes issue and takes priority?)
// Add Outlook
// Cloud function removing old anons ("time-to-live" may do this!)
// Handle detaching listeners for List and Calendar (?)[having a hard time storing unsub handle in state]
// When dragging over calendar, drag in 5 min "steps" [kind of fixed with dateline. Intend to resolve with new DND scheme]
// Refactor (e.g. clean up App.js, standardize cases, map() to forEach(), when to use anon functions in setState?)
// Solution for finding team up if no friends (random names? "Make available to team up" option? Matchmaking?)
// (If not fixed:) save value of active input before leaving page [could do this in useEffect return statement]
// Indents (maybe switch to/extend Atlassian's tree framework for list)
// Undo?
// Focus on previous element on delete (maybe convert to class component?)
// Keyboard shortcuts
// Input on short click, drag/drop on long clicks
// Offline support

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
              addFirstLine(); // Provide first line for this new user
            })
            .catch((error) => {
              const errorMessage = error.message;
              console.log(errorMessage);
            });
        };
      });

      // Add a listener to aid creating CalendarItem on DnD from List
      document.addEventListener("mouseup", (event) => {
        setMouseCoords(() => ({ x: event.pageX, y: event.pageY }));
      });

      return;
    }
  }, [isInitialRender]);

  const handleCalendarDrop = () => {
    const dfOrigin = { x: ref.current.offsetLeft, y: ref.current.offsetTop };

    // NOTE: sensing currently depends on calendar layout
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
      // console.log(time)
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
        {/* <h2 className="cal-title">Calendar</h2> */}
        <div className="cal-container">
          <MyCalendar ref={ref} updateParentDates={updateCalDates} />
        </div>
      </div>
    </DragDropContext>
  );
}

export default App;
