import React, { useEffect, useState } from "react";
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
import { orderBelow } from "../../db/db-actions";

// Known bugs:
// 1. Drop is a bit ratchety (i.e. jolts after a drop).
//      I'm not sure why this is.

export const List = (props) => {
  const [taskList, setTaskList] = useState([]);
  const [isChronoView, setIsChronoView] = useState(false);
  const [isInitialRender, setIsInitialRender] = useState(true);
  const [unsub, setUnsub] = useState(null);
  const [authUnsub, setAuthUnsub] = useState(null);

  // Listen for desired tasks
  const listen = (user) => {
    const ref = collection(db, "Users/" + user.uid + "/Tasks");
    const q = query(
      ref,
      where("isArchived", "==", false),
      where("listIndex", ">=", 0), // Hack to allow order by listIndex
      orderBy("listIndex"),
      orderBy("startTime"),
    );

    // Invoke listener
    const u = onSnapshot(q, (querySnapshot) => {
      querySnapshot.empty
        ? console.log("empty")
        : setTaskList(querySnapshot.docs);
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

  const filterList = (taskList) => {
    const res = [];
    if (isChronoView) {
      // TODO
      console.log("Feature is not yet implemented");
    // Alternative is "Task View", showing the most recent instance of each un-archived task
    } else {
      // Assumes tasks are ordered by startTime, and past repeats are archived
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

    const tasks = filterList(taskList);
    const dest = Number(e.target.id);
    const data = JSON.parse(e.dataTransfer.getData("text/plain"));

    if (data.docPath !== tasks[dest].ref.path)
      orderBelow(
        tasks,
        data.startIndex,
        dest,
        true
      );
  };

  const handleDropBelow = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Split id to find index number

    const tasks = filterList(taskList);
    const dest = Number(e.target.id);
    const data = JSON.parse(e.dataTransfer.getData("text/plain"));

    if (data.docPath !== tasks[dest].ref.path)
      orderBelow(
        tasks,
        data.startIndex,
        dest,
        false
      );
  };

  return (
    <div className="list">
      {/* <TopSensor onDrop={handleTopSensorDrop} /> */}
      {filterList(taskList).map((task, index) => (
        <TaskItem
          snapshot={task}
          key={task.ref.path}
          index={index}
          data={{ ...task.data() }}
          handleNewChild={handleNewChild}
          handleDropBelow={handleDropBelow}
          maxIndent={
            index === 0 ? 0 : filterList(taskList)[index - 1].data().indents + 1
          }
        />
      ))}
    </div>
  );
};
