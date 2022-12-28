import React, { useEffect, useState } from "react";
import { Droppable } from "react-beautiful-dnd";
import { auth, db } from "../../db/db";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

import TaskItem from "./TaskItem";
import "./List.module.css";

// Known bugs:
// 1. Drop is a bit ratchety (i.e. jolts after a drop).
//      I'm not sure why this is.

const List = () => {
  const [taskList, setTaskList] = useState([]);
  const [isInitialRender, setIsInitialRender] = useState(true);
  const [unsub, setUnsub] = useState(null);

  const listen = (user) => {
    const ref = collection(db, "Users/" + user.uid + "/Tasks");
    const q = query(ref, orderBy("listIndex"));
    const u = onSnapshot(q, (querySnapshot) => {
      if (querySnapshot.empty) return;
      setTaskList(querySnapshot.docs);
    });

    return u;
  };

  useEffect(() => {
    if (isInitialRender) {
      setIsInitialRender(false);

      // Listen for auth state changes. If not logged in, log in anonymously
      onAuthStateChanged(auth, (user) => {
        if (user) {
          const u = listen(user);
          setUnsub(() => () => u());
        }
      });
    }

    return () => {
      if (unsub) {
        unsub();
      }
    };
  }, [isInitialRender]);

  return (
    <>
      <Droppable droppableId="list">
        {(provided) => (
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
