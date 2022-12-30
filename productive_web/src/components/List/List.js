import React, { useEffect, useState } from "react";
import { Droppable } from "react-beautiful-dnd";
import { auth, db } from "../../db/db";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

import TaskItem from "./TaskItem";
import "./List.module.css";

// Known bugs:
// 1. Drop is a bit ratchety (i.e. jolts after a drop).
//      I'm not sure why this is.

export const List = (props) => {
  const [taskList, setTaskList] = useState([]);
  const [isInitialRender, setIsInitialRender] = useState(true);
  const [unsub, setUnsub] = useState(null);
  const [authUnsub, setAuthUnsub] = useState(null);

  // Listen for desired tasks
  const listen = (user) => {
    const ref = collection(db, "Users/" + user.uid + "/Tasks");
    const q = query(
      ref,
      where("isArchived", "==", false),
      where("listIndex", ">=", 0), // Necessary to allow "isArchived" where clause
      orderBy("listIndex")
    );

    // Invoke listener
    const u = onSnapshot(q, (querySnapshot) => {
      const now = new Date();

      if (querySnapshot.empty) return;

      // Key: Path to repeatRef. Value: index in querySnapshot.docs
      const mostRecentRepeat = {};
      const docsToKeep = [];

      // TODO: this is awful. FireSQL seems like a better solution.
      querySnapshot.docs.forEach((doc, index) => {
        const snapData = doc.data();

        // Find the earliest instance for each repeated task.
        if (snapData.repeatRef !== null) {
          const repPath = snapData.repeatRef.path;
          if (repPath in mostRecentRepeat) {
            const prevRep = querySnapshot.docs[mostRecentRepeat[repPath]];
            if (
              Math.abs(snapData.startTime.toDate().getTime() - now.getTime()) <
              Math.abs(
                prevRep.data().startTime.toDate().getTime() - now.getTime()
              )
            ) {
              mostRecentRepeat[repPath] = index;
            }
          } else {
            mostRecentRepeat[repPath] = index; // First time seeing this repeat
          }
        }
      });

      // Compose an array of non-repeated and most recent repeated tasks, in order of listIndex
      querySnapshot.docs.forEach((doc, index) => {
        if (doc.data().repeatRef === null || Object.values(mostRecentRepeat).includes(index)) {
          docsToKeep.push(doc);
        }
      });

      setTaskList(docsToKeep);
    });

    return u;
  };

  useEffect(() => {
    if (isInitialRender) {
      setIsInitialRender(false);

      // Listen for auth state changes. If not logged in, log in anonymously
      const u = onAuthStateChanged(auth, (user) => {
        if (user) {
          const unsub = listen(user);
          setUnsub(() => () => unsub());
        }
      });

      setAuthUnsub(() => () => u());
    }

    return () => {
      // Unsubscribe from listeners
      if (unsub !== null) {
        setTaskList([]);
        unsub();
      }
      if (authUnsub !== null) authUnsub();
    };
  }, [isInitialRender]);

  useEffect(() => {
    // Update app on tasks displayed
    props.updateParentTasks(taskList);
  }, [taskList])

  return (
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
  );
};

// export default List;
