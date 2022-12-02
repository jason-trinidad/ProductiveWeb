import React, { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

import Event from "./Event";
import "./Day.css";
import * as settings from "./cal-settings";
import { auth, db } from "../../db/db";

const Day = (props) => {
  const [eventList, setEventList] = useState([]);
  const [isInitialRender, setIsInitialRender] = useState(true);
  const [detachListener, setDetachListener] = useState(null);

  const listen = (user) => {
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
    console.log("Attached listener")

    return unsub;
  };

  useEffect(() => {
    if (isInitialRender) {
      setIsInitialRender(() => false);

      // Listen for auth state changes. If not logged in, log in anonymously
      onAuthStateChanged(auth, (user) => {
        if (user) {
          const unsub = listen(user);
          setDetachListener(() => () => unsub());
        }
      });
    }

    return () => {
      if (detachListener) {
        detachListener();
        console.log("Detached listener");
      }
    };
  }, [isInitialRender]);

  const numRows = (settings.endTime - settings.startTime) * 12; // 5 min increments

  return (
    <div
      id={props.date.toLocaleDateString("en-US")}
      className="day"
      style={{
        gridTemplateRows: `repeat(${numRows}, 1fr)`,
        gridTemplateColumns: "1fr",
      }}
    >
      {eventList.map((docSnap, i) => (
        <Event key={i} docSnap={docSnap} />
      ))}
    </div>
  );
};

export default Day;
