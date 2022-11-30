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

  const listen = (user) => {
    const start = props.day;
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
      onAuthStateChanged(auth, (user) => {
        if (user) {
          listen(user);
        }
      });
    }
  }, [isInitialRender]);

  const numRows = (settings.endTime - settings.startTime) * 12; // 5 min increments

  return (
    <div
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
