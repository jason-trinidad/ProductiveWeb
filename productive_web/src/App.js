import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { DragDropContext } from "react-beautiful-dnd";

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
// Done button/styling √
// Weekly calendar
// Auth/users
// Do at
// Deadline
// Team up
// Streak
// Repeating events
// ---------------------------- MVP
// Change Firestore I/O to real-time updates
// (If not fixed:) save value of active input before leaving page
// Indents
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

  useEffect(() => {
    if (isInitialRender) {
      // Populate state
      const populate = async () => {
        try {
          const querySnapshot = await getDocs(q);
          if (querySnapshot.empty) {
            dispatch(tasksActions.append());
          } else {
            querySnapshot.docs.map((task) =>
              dispatch(tasksActions.append(task.data()))
            );
          }
        } catch (error) {
          console.log(error);
        }
      };

      populate();
      setIsInitialRender(() => false);

      // Add a listener to aid creating CalendarItem on DnD from List
      document.addEventListener("mouseup", (event) => {
        setMouseCoords(() => ({ mouseX: event.pageX, mouseY: event.pageY }))
      });
      return;
    }

    saveTasksToDB(taskList);
  }, [taskList]);

  const dragEndHandler = (result) => {
    console.log(mouseCoords);
    if (!result.destination) return; // TODO: would bang-less syntax work?
    dispatch(tasksActions.reorder(result));
  };

  return (
    <DragDropContext onDragEnd={dragEndHandler}>
      <List />
    </DragDropContext>
  );
}

export default App;
