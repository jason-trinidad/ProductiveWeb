import React, { useEffect, useState } from "react";
import { auth, db } from "../../db/db";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

import TaskItem from "./TaskItem";
import "./List.module.css";
import { makeChild } from "../../db/db-actions";

// Known bugs:
// 1. Drop is a bit ratchety (i.e. jolts after a drop).
//      I'm not sure why this is.

export const List = (props) => {
  const [taskList, setTaskList] = useState([]);
  const [isChronoView, setIsChronoView] = useState(false);
  const [isInitialRender, setIsInitialRender] = useState(true);
  const [unsub, setUnsub] = useState(null);
  const [authUnsub, setAuthUnsub] = useState(null);

  // Today defined in main body to refresh in case window is open overnight
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Listen for desired tasks
  const listen = (user) => {
    const ref = collection(db, "Users/" + user.uid + "/Tasks");
    const q = query(
      ref,
      where("isArchived", "==", false),
      where("listIndex", ">=", 0), // Hack to allow "listIndex" order by
      orderBy("listIndex"),
      orderBy("startTime")
    );

    // Invoke listener
    const u = onSnapshot(q, (querySnapshot) => {
      // querySnapshot.docs.forEach(doc => console.log(doc.data()))
      querySnapshot.empty
        ? console.log("empty")
        : setTaskList(querySnapshot.docs);
      // const now = new Date();

      // if (querySnapshot.empty) return;

      // // Key: Path to repeatRef. Value: index in querySnapshot.docs
      // const mostRecentRepeat = {};
      // const docsToKeep = [];

      // // TODO: this is awful. FireSQL seems like a better solution.
      // querySnapshot.docs.forEach((doc, index) => {
      //   const snapData = doc.data();

      //   // Find the earliest instance for each repeated task.
      //   if (snapData.repeatRef !== null) {
      //     const repPath = snapData.repeatRef.path;
      //     if (repPath in mostRecentRepeat) {
      //       const prevRep = querySnapshot.docs[mostRecentRepeat[repPath]];
      //       if (
      //         Math.abs(snapData.startTime.toDate().getTime() - now.getTime()) <
      //         Math.abs(
      //           prevRep.data().startTime.toDate().getTime() - now.getTime()
      //         )
      //       ) {
      //         mostRecentRepeat[repPath] = index;
      //       }
      //     } else {
      //       mostRecentRepeat[repPath] = index; // First time seeing this repeat
      //     }
      //   }
      // });

      // Compose an array of non-repeated and most recent repeated tasks, in order of listIndex
      // querySnapshot.docs.forEach((doc, index) => {
      //   if (doc.data().repeatRef === null || Object.values(mostRecentRepeat).includes(index)) {
      //     docsToKeep.push(doc);
      //   }
      // });

      // setTaskList(docsToKeep);
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
  }, [taskList]);

  const filterList = (taskList) => {
    const res = [];
    if (isChronoView) {
      // TODO
      console.log("Feature is not yet implemented");
    } else {
      // Alternative is "Task View", showing the most recent instance of each un-archived task
      let lastRep = null;
      taskList.forEach((task) => {
        const curRep = task.data().repeatRef?.path;
        if (curRep === undefined || curRep !== lastRep) {
          res.push(task);
          if (curRep) lastRep = curRep;
        }
      });
    }

    return res;
  };

  const handleNewChild = async (e) => {
    e.preventDefault();

    const data = JSON.parse(e.dataTransfer.getData("text/plain"));
    // console.log(
    //   data.docPath + " dropped on task #" + props.snapshot.data().title
    // );
    makeChild(filterList(taskList), data.startIndex, e.target.id);
  }

  return (
    <div className="list">
      {/* <TopSensor onDrop={handleTopSensorDrop} /> */}
      {filterList(taskList).map((task, index) => (
        <TaskItem
          snapshot={task}
          key={task.data().key}
          draggableId={task.data().dragId}
          index={index}
          data={{ ...task.data() }}
          handleNewChild={handleNewChild}
          maxIndent={index === 0 ? 0 : filterList(taskList)[index - 1].data().indents + 1}
        />
      ))}
    </div>
  );
};
