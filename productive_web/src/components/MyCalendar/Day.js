import React, { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

import Event from "./Event";
import "./Day.css";
import * as settings from "./cal-settings";
import { auth, db } from "../../db/db";
import { recordDate } from "../../db/db-actions";

const Day = (props) => {
  const [isInitialRender, setIsInitialRender] = useState(true);
  const [eventList, setEventList] = useState([]);
  const [detachTaskListener, setDetachTaskListener] = useState(null);
  const [detachAuthListener, setDetachAuthListener] = useState(null);

  const taskListener = (user) => {
    const start = props.date;
    const end = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate() + 1
    );

    const ref = collection(db, "Users/" + user.uid + "/Tasks");

    const q = query(
      ref,
      where("startTime", ">", start),
      where("startTime", "<", end)
    );

    const unsub = onSnapshot(q, (querySnapshot) => {
      querySnapshot.empty
        ? setEventList(() => [])
        : setEventList(querySnapshot.docs);
    });

    return unsub;
  };

  useEffect(() => {
    if (isInitialRender) {
      setIsInitialRender(() => false);

      // Listen for auth state changes. If not logged in, log in anonymously
      const u = onAuthStateChanged(auth, (user) => {
        if (user) {
          recordDate(props.date);

          const unsubTasks = taskListener(user);

          setDetachTaskListener(() => () => unsubTasks());
        }
      });

      setDetachAuthListener(() => () => u());
    }

    return () => {
      if (detachTaskListener !== null) {
        detachTaskListener();
      }

      if (detachAuthListener !== null) {
        detachAuthListener();
      }
    };
  }, [isInitialRender]);

  const numRows = 24 * 12; // 5 min increments
  const dayHeight = 24 * settings.hourHeight;

  return (
    <div
      id={props.date.toLocaleDateString("en-US")}
      className="day"
      style={{
        gridTemplateRows: `repeat(${numRows}, 1fr)`,
        gridTemplateColumns: "1fr",
        height: dayHeight - 24, // correcting for grid margin
      }}
    >
      {eventList.map((docSnap, i) => (
        <Event key={i} docSnap={docSnap} />
      ))}
    </div>
  );
};

export default Day;
