import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { collection, query, orderBy, getDocs } from "firebase/firestore";

import List from "./components/List/List";
import { db, saveTasksToDB } from "./db";
import { tasksActions } from "./store/tasks-slice";
import "./App.css";

// TODO - add:
// Edit √
// Delete √
// Style [first pass] √
// Drag and drop √
// Back-end [Firebase] √
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

  const ref = collection(db, "Tasks");
  const q = query(ref, orderBy("listIndex"));

  useEffect(() => {
    if (isInitialRender) {
      // Populate state
      const populate = async () => {
        try {
          const querySnapshot = await getDocs(q);
          if (querySnapshot.empty) {
            dispatch(tasksActions.append());
          } else {
            querySnapshot.docs.map((task) => dispatch(tasksActions.append(task.data())));
          }
        } catch (error) {
          console.log(error)
        };
      };

      populate();
      setIsInitialRender(() => false);
      return;
    };

    saveTasksToDB(taskList);
  }, [taskList]);

  return <List />;
}

export default App;
