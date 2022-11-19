import React, { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

import { auth, db } from "../../db/db";
import HourColumn from "./HourColumn";
import Day from "./Day";
import DateBar from "./DateBar";
import "./MyCalendar.css";
import * as settings from "./cal-settings";
import { getIntendedTime } from "./cal-utils";

// TODO: add Redux back in for state?

export const MyCalendar = React.forwardRef((props, ref) => {
  const [eventList, setEventList] = useState([]);
  const [isInitialRender, setIsInitialRender] = useState(true);
  const [displayDates, setdisplayDates] = useState([]);
  const [dateLineObj, setDateLineObj] = useState({
    color: "red",
    top: 0,
  });
  const [cursorTime, setCursorTime] = useState("");

  const listen = (user) => {
    const ref = collection(db, "Users/" + user.uid + "/Tasks");
    const q = query(ref, where("doOn", "!=", null));

    const unsub = onSnapshot(q, (querySnapshot) => {
      if (querySnapshot.empty) return;
      setEventList(() => querySnapshot.docs);
    });

    return unsub;
  };

  const initialDisplayDates = () => {
    const now = new Date();
    const days = Array.from({ length: settings.displayDays }, (x, i) => new Date(
      now.getFullYear(),
      now.getMonth(),
      // Day
      now.getDate() - now.getDay() + settings.firstDisplayDay + i
    ));

    console.log(days);
    setdisplayDates(() => days)
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

      // Setup initial display dates
      initialDisplayDates();
    }
  }, [isInitialRender, eventList]);

  const handleMouseOver = (e) => {
    setTimeout(() => {
      const dfOrigin = { x: ref.current.offsetLeft, y: ref.current.offsetTop };
      const dfDims = {
        x: ref.current.clientWidth,
        y: ref.current.clientHeight,
      };
      const mouseCoords = { x: e.pageX, y: e.pageY };
      const newTime = getIntendedTime(mouseCoords, dfOrigin, dfDims);

      if (newTime !== cursorTime) {
        setDateLineObj({
          ...dateLineObj,
          top: mouseCoords.y,
        });
        setCursorTime(() => newTime);
      }
    }, 10);
  };

  return (
    <>
      <h2>Calendar</h2>
      <div className="calendar-container">
        <div className="scroll-buttons">
          <button>{"<"}</button>
          <button>{">"}</button>
        </div>
        <h3 className="time-readout">{cursorTime}</h3>
        <HourColumn className="hour-column" />
        <DateBar className="date-bar" dates={displayDates} />
        <div ref={ref} className="date-field" onMouseMove={handleMouseOver}>
          {displayDates.map((day) => (
            <Day key={day} day={day} />
          ))}
        </div>
        <div className="time-line" style={dateLineObj} />
        {/* <EventField /> */}
      </div>
    </>
  );
});
