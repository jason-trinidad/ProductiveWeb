import React, { useState, useEffect } from "react";

import HourColumn from "./HourColumn";
import DateBar from "./DateBar";
import { DateGrid } from "./DateGrid";
import "./MyCalendar.css";
import * as settings from "./cal-settings";
import { getDateTime } from "./cal-utils";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../db/db";
import { DateField } from "./DateField";
import { onAuthStateChanged } from "firebase/auth";
import { schedule } from "../../db/db-actions";

// TODO: add Redux back in for view state? (Not data state.)

export const MyCalendar = React.forwardRef((props, ref) => {
  const [isInitialRender, setIsInitialRender] = useState(true);
  const [displayDates, setDisplayDates] = useState([]);
  const [detachAuthListener, setDetachAuthListener] = useState(null);
  const [dateOffset, setDateOffset] = useState(0);
  const [dateLineObj, setDateLineObj] = useState({
    color: "red",
    top: 0,
  });
  const [cursorTime, setCursorTime] = useState(new Date());

  // Returns current week, starting with calendar's setting for first day of week
  const initialDisplayDates = () => {
    const now = new Date();
    const dates = Array.from(
      { length: settings.displayDays },
      (x, i) =>
        new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - now.getDay() + settings.firstDisplayDay + i
        )
    );
    
    setDisplayDates(() => dates);
  };

  useEffect(() => {
    if (isInitialRender) {
      setIsInitialRender(() => false);

      const u = onAuthStateChanged(auth, (user) => {
        if (user) {
          // Setup initial display dates
          initialDisplayDates();
        }
      });

      setDetachAuthListener(() => () => u());
    }

    // Keep parent up to date on dates displayed
    props.updateParentDates(displayDates);

    return () => {
      if (detachAuthListener !== null) {
        detachAuthListener();
      }
    };
  }, [isInitialRender, displayDates]);

  // Necessary to display time while dragging list item
  const handleCursorTime = (e) => {
    setTimeout(() => {
      const newTime = getDateTime(ref, e, displayDates[0]);

      if (newTime.getTime() !== cursorTime.getTime()) {
        setDateLineObj({
          ...dateLineObj,
          top: e.pageY,
        });
        setCursorTime(() => newTime);
      }
    }, 10);
  };

  // Necessary to display time while dragging events
  const handleDragOver = (e) => {
    e.preventDefault();

    handleCursorTime(e);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropTime = getDateTime(ref, e, displayDates[0]);
    const data = JSON.parse(e.dataTransfer.getData("text/plain"));
    let newStart;
    let newEnd;

    // Decode dropped item
    switch (data.obj) {
      case "task":
        newStart = dropTime;
        schedule(data.docPath, newStart);
        return;
      case "event":
        newStart = dropTime;
        newEnd = new Date(
          dropTime.getTime() + (data.endMSecs - data.startMSecs)
        );
        break;
      case "top":
        newEnd = new Date(data.endMSecs);
        dropTime.getTime() < newEnd.getTime()
          ? (newStart = dropTime)
          : (newStart = new Date(data.startMSecs));
        break;
      case "bottom":
        newStart = new Date(data.startMSecs);
        dropTime.getTime() > newStart.getTime()
          ? (newEnd = dropTime)
          : (newEnd = new Date(data.endMSecs));
        break;
    }

    updateDoc(doc(db, data.path), { startTime: newStart, endTime: newEnd });
  };

  const scrollCalendar = (e) => {
    let direction;
    e.currentTarget.id === "left-scroll" ? (direction = -1) : (direction = 1);

    setDisplayDates((prev) =>
      prev.map(
        (prevDate) =>
          new Date(prevDate.getTime() + direction * 24 * 60 * 60 * 1000)
      )
    );
    setDateOffset((prev) => prev + direction * 1);
  };

  return (
    <div id="calendar-container" className="calendar-container">
      <div className="scroll-buttons">
        <button id="left-scroll" onClick={scrollCalendar}>
          {"<"}
        </button>
        <button id="right-scroll" onClick={scrollCalendar}>
          {">"}
        </button>
      </div>
      <h3 className="time-readout">
        {cursorTime.toLocaleTimeString("en-US", { timeStyle: "short" })}
      </h3>
      <div id="date-container" className="date-container">
        <DateBar className="date-bar" dates={displayDates} />
        <div className="hour-and-date" ref={ref}>
          <div className="time-line" style={dateLineObj} />
          <HourColumn className="hour-column" />
          <DateGrid className="date-grid" />
          <DateField
            className="date-field"
            displayDates={displayDates}
            dateOffset={dateOffset}
            onDragOver={handleDragOver}
            onMouseMove={handleCursorTime}
            onDrop={handleDrop}
          />
        </div>
      </div>
    </div>
  );
});
