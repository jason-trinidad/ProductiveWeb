import React, { useEffect, useRef, useState } from "react";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";

import { addFirstLine } from "./db/db-actions";
import { List } from "./components/List/List";
import { MyCalendar } from "./components/MyCalendar/MyCalendar";
import MyNav from "./MyNav";
import { auth } from "./db/db";
import "./App.css";
// import { signInWithGoogle } from "./auth";

// TODO:
// Deadline
// Style (notification bar, login status)
// ---------------------------- MVP
// Re-do date-grid. a) look better, b) align elements √
// Cloud function removing old anons ("time-to-live" may do this!)
// Change migrate function to trigger cloud function that sets anon's tasks to new sign-in
// Look into build tools (incremental builds, FB emulators)
// Add Redux back in to track calendar state (fewer re-renders, fewer document listeners?)
//// Performance metrics: initial load time, number of freezes, memory usage...
// Refactor (e.g. clean up App.js, standardize cases, map() -> forEach(), when to use anon functions in setState?, 
    // refactor db interaction, function naming conventions, dedicated skip initial render hook)
    // Is there a way to write docs for each function using comments?
// Time budgets
// Desktop push notifications
// Create repeats for current-day on backend for push notifications
// Archive "done" tasks at midnight
// Indents (maybe switch to/extend Atlassian's tree framework for list)[DIY] √
// Add Outlook
// Populate from Google Tasks+Calendar / Apple Reminders+Calendar
// Solution for finding team up if no friends (random names? "Make available to team up" option? Matchmaking?)
// (If not fixed:) save value of active input before leaving page [could do this in useEffect return statement] √
// Clean up dates in EventDetail √
// Look at trade-off, massive # divs vs many grid rows, get rid of "DateGrid"
// Undo?
// Focus on previous element on delete (maybe convert to class component?)
// Keyboard shortcuts
// Input on short click, drag/drop on long clicks √
// Offline support
// 5 min task section (drag or tag task as 5 min, shows in window above List. No nesting, copied from List)
// When dragging over calendar, drag in 5 min "steps" [kind of fixed with dateline. Intend to resolve with new DND scheme]

function App() {
  const [isInitialRender, setIsInitialRender] = useState(true);
  const [mouseCoords, setMouseCoords] = useState({});
  const ref = useRef(); // Ref for locating date grid
  // TODO: change to Redux (?)
  const [calDatesDisplayed, setCalDatesDisplayed] = useState([]);
  const [isGoogleSignIn, setIsGoogleSignIn] = useState(false);

  const didLogInWithGoogle = async () => {
    const res = await auth.currentUser.getIdTokenResult();

    return res.signInProvider === "google.com";
  }

  useEffect(() => {
    if (isInitialRender) {
      setIsInitialRender(() => false);

      // Listen for auth state changes. If not logged in, log in anonymously
      onAuthStateChanged(auth, (user) => {
        if (user) {
          console.log("Logged in");
          didLogInWithGoogle().then(res => setIsGoogleSignIn(res))
        } else {
          signInAnonymously(auth)
            .then(() => {
              console.log("Logged in")
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

  const updateCalDates = (dates) => {
    setCalDatesDisplayed(() => dates);
  }

  return (
    <>
      <div className="grid-container">
        <MyNav isGoogleSignIn={isGoogleSignIn} className="nav" />
        {/* <div className="nav">
          <button onClick={signInWithGoogle}>{"Sign in"}</button>
          <button onClick={() => auth.signOut()}>{"Log out"}</button>
  </div> */}
        <h2 className="list-title">List</h2>
        <div className="list-container">
          <List />
        </div>
        <div className="cal-container">
          <MyCalendar ref={ref} updateParentDates={updateCalDates} />
        </div>
      </div> 
    </>
  );
}

export default App;
