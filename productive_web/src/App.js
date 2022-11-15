import React, { useCallback, useEffect, useRef, useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";

import { reorder } from "./db/db-actions";
import List from "./components/List/List";
import { MyCalendar } from "./components/MyCalendar/MyCalendar";
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
// Auth/users √
// Deploy √
// Add weekly calendar
// Create calendar template √
// Create events layer (how to resize component?)
// Drag to reschedule
// Add row of dates
// Change to AM/PM times
// Change to starting at default time, rest is overflow
// Drag/drop onto calendar
// Try making all divs lists
// Do at
// Deadline
// Team up
// Streak
// Repeating events
// ---------------------------- MVP
// Change Firestore I/O to real-time updates (replace Redux?) √
// Add Outlook
// Cloud function removing old anons ("time-to-live" may do this!)
// When dragging over calendar, drag in 5 min "steps"
// Refactor (e.g. clean up App.js, standardize cases, map() to forEach())
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
  const [dateCoords, setDateCoords] = useState({});
  const ref = useRef(); // Forwarding ref to datefield

  useEffect(() => {
    if (isInitialRender) {
      setIsInitialRender(() => false);

      // Add a listener to aid creating CalendarItem on DnD from List
      document.addEventListener("mouseup", (event) => {
        setMouseCoords(() => ({ x: event.pageX, y: event.pageY }));
      });

      return;
    }
  }, [isInitialRender]);

  const getIntendedTime = () => {
    const dCoords = {x: ref.current.offsetLeft, y: ref.current.offsetTop};
    const dDims = {x: ref.current.clientWidth, y: ref.current.clientHeight};

    const initHour = 8.0
    const numHours = 14.0;
    const dropTime = initHour + numHours * ((mouseCoords.y - dCoords.y) / dDims.y);
    const hour = Math.floor(dropTime);
    const fracMins = dropTime - hour;
    const nearestFiveMinFloor = Math.floor(fracMins * 12) * 5
    console.log("Time: " + hour + ":" + nearestFiveMinFloor)
    // Buggy: inconsistent. Check math.
    // Render a line where task will be scheduled
  };

  const dragEndHandler = (result) => {
    const time = getIntendedTime();

    const { destination, source, draggableId } = result;
    if (!destination) return;
    reorder(draggableId, source.index, destination.index);
  };

  return (
    <DragDropContext onDragEnd={dragEndHandler}>
      <nav>
        <button onClick={signInWithGoogle}>"Sign in"</button>
        <button onClick={() => auth.signOut()}>"Log out"</button>
      </nav>
      <div className="grid-container">
        <div className="list">
          <List />
        </div>
        <div className="mycalendar">
          {/* <MyCalendar provideDateCoords={updateDateCoords} /> */}
          <MyCalendar ref={ref} />
        </div>
      </div>
    </DragDropContext>
  );
}

export default App;
