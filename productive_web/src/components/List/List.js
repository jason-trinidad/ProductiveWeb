import React, { useEffect, useState } from "react";
import { Droppable } from "react-beautiful-dnd";
import { auth, db } from "../../db/db";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";

import TaskItem from "./TaskItem";
import "./List.module.css";
import { addFirstLine } from "../../db/db-actions";

// Known bugs:
// 1. Drop is a bit ratchety (i.e. jolts after a drop).
//      I'm not sure why this is.

const List = () => {
  const [taskList, setTaskList] = useState([]);
  const [isInitialRender, setIsInitialRender] = useState(true);

  const listen = (user) => {
    const ref = collection(db, "Users/" + user.uid + "/Tasks");
    const q = query(ref, orderBy("listIndex"));
    const unsub = onSnapshot(q, (querySnapshot) => {
      if (querySnapshot.empty) return;
      setTaskList(() => querySnapshot.docs);
    });
    
    return unsub;
  };

  useEffect(() => {
    if (isInitialRender) {
      // Listen for auth state changes. If not logged in, log in anonymously
      onAuthStateChanged(auth, (user) => {
        if (user) {
          listen(user);
        }
      });

      setIsInitialRender(() => false);
    }
  }, [isInitialRender]);

  return (
    <>
      <Droppable droppableId="list">
        {(provided, snapshot) => (
          <div
            className="list"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {taskList.map((task, index) => (
              <TaskItem
                snapshot={task} // TODO: change db functions so only ref or path is needed
                key={task.data().key}
                draggableId={task.data().dragId}
                index={index}
                data={{ ...task.data() }} 
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
