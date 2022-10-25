import React, { useEffect, useState } from "react";
import { Droppable } from "react-beautiful-dnd";
import { auth, db } from "../../db/db";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";

import TaskItem from "./TaskItem";
import classes from "./List.module.css";
import { addFirstLine } from "../../db/db-actions";

// Known bugs:
// 1. Drop is a bit ratchety (e.g. overlap on other element and there's a pause/lower element is moved).
//      I'm not sure why this is.

const List = () => {
  const [taskList, setTaskList] = useState([]);
  const [isInitialRender, setIsInitialRender] = useState(true);

  const listen = (user) => {
    const ref = collection(db, "Users/" + user.uid + "/Tasks");
    const q = query(ref, orderBy("listIndex"));
    const unsub = onSnapshot(q, (querySnapshot) => {
      if (querySnapshot.empty) return;
      // console.log("Snapshot sees following tasks in DB:");
      // console.log(querySnapshot.docs);
      setTaskList(() => querySnapshot.docs);
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
              console.log("Adding a line after anon sign-in.")
              addFirstLine();
            })
            .catch((error) => {
              const errorMessage = error.message;
              console.log(errorMessage);
            });
        }
        listen(user);
      });

      setIsInitialRender(() => false);
    }
  }, []);

  return (
    <>
      <h2>List</h2>
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
