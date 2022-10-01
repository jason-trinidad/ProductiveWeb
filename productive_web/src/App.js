import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import List from "./components/List/List";
import { fetchTasksFromDb } from "./store/tasks-thunks";
import { saveTasksToDB } from "./db";
import "./App.css";

// TODO - add:
// Edit √
// Delete √
// Style [first pass] √
// Drag and drop √
// Back-end [Firebase]
// Done button/styling
// Weekly calendar
// Change Firestore I/O to real-time updates
// Auth/users
// Indents
// Do at
// Deadline
// Undo?
// Focus on previous element on delete (maybe convert to class component?)
// Keyboard shortcuts
// Input on short click, drag/drop on long clicks
// Offline support

function App() {
  const [isInitialRender, setIsInitialRender] = useState(true);
  const dispatch = useDispatch();
  const taskList = useSelector((state) => state.tasks);

  useEffect(() => {
    if (isInitialRender) {
      dispatch(fetchTasksFromDb());
      setIsInitialRender(() => false);
      return;
    }

    // console.log("Save triggered")
    // console.log("State: ")
    // console.log(taskList)
    saveTasksToDB(taskList);
  }, [taskList]);

  return <List />;
}

export default App;
