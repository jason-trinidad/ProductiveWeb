import React, { useEffect, useState } from "react";
import { Droppable } from "react-beautiful-dnd";
import { useDispatch, useSelector } from "react-redux";
import { auth, db } from "../../db/db";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";

import TaskItem from "./TaskItem";
import { tasksActions } from "../../store/tasks-slice";
import classes from "./List.module.css";
import { addFirstLine } from "../../db/db-actions";

// Known bugs:
// 1. Drop is a bit ratchety (e.g. overlap on other element and there's a pause/lower element is moved).
//      I'm not sure why this is.

const List = () => {
  const dispatch = useDispatch();
  // const taskList = useSelector((state) => state.tasks);
  // const [listenerDeployed, setListenerDeployed] = useState(false);
  const [taskList, setTaskList] = useState([]);
  const [isInitialRender, setIsInitialRender] = useState(true);

  const listen = (user) => {
    const ref = collection(db, "Users/" + user.uid + "/Tasks");
    const q = query(ref, orderBy("listIndex"));
    const unsub = onSnapshot(q, (querySnapshot) => {
      if (querySnapshot.empty) return;
      console.log("Snapshot sees following tasks in DB:");
      console.log(querySnapshot.docs);
      setTaskList(() => querySnapshot.docs);
      console.log("DB listener set local taskList in List.");
    });
    return unsub;
  };

  useEffect(() => {
    if (isInitialRender) {
      // Listen for auth state changes
      onAuthStateChanged(auth, (user) => {
        if (user) {
          console.log("Logged in");
        } else {
          signInAnonymously(auth)
            .then(() => {
              addFirstLine();
            })
            .catch((error) => {
              const errorCode = error.code;
              const errorMessage = error.message;
              console.log(errorMessage);
            });
        }
        listen(user);
      });

      setIsInitialRender(() => false);
    }
  }, []);

  // // Add submitted task to list, create new task
  // const carriageReturn = (taskData) => {
    // // Update store with title of current TaskItem, then create a new one "underneath"
    // dispatch(tasksActions.update(taskData));
    // dispatch(tasksActions.carriageReturn(taskData));
  // };

  // Delete a task from the list if not the sole remaining task
  const conditionalTaskDelete = (keyToDelete) => {
    if (taskList.length > 1) {
      dispatch(tasksActions.delete({ keyToDelete }));
    }
  };

  return (
    <>
      <h2>List</h2>
      {/* <div className={classes.list}> */}
      <Droppable droppableId="list">
        {(provided) => (
          <div
            className={classes.list}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {taskList.map((task, index) => (
              <TaskItem
                snapshot={task}
                key={task.data().key}
                id={task.data().key}
                draggableId={task.data().dragId}
                index={index}
                title={task.data().title}
                // onCarriageReturn={carriageReturn}
                onConditionalDelete={conditionalTaskDelete}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      {/* </div> */}
    </>
  );
};

export default List;
