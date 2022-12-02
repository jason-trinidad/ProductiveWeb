import React, { useState, useEffect } from "react";

import HourColumn from "./HourColumn";
import Day from "./Day";
import DateBar from "./DateBar";
import "./MyCalendar.css";
import * as settings from "./cal-settings";
import { getDateTime } from "./cal-utils";
import { schedule } from "../../db/db-actions";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../db/db";

// TODO: add Redux back in for view state? (Not data state.)

export const MyCalendar = React.forwardRef((props, ref) => {
  const [isInitialRender, setIsInitialRender] = useState(true);
  const [displayDates, setDisplayDates] = useState([]);
  const [dateOffset, setDateOffset] = useState(0)
  const [dateLineObj, setDateLineObj] = useState({
    color: "red",
    top: 0,
  });
  const [cursorTime, setCursorTime] = useState(new Date());

  const initialDisplayDates = () => {
    const now = new Date();
    const dates = Array.from(
      { length: settings.displayDays },
      (x, i) =>
        new Date(
          now.getFullYear(),
          now.getMonth(),
          // Gets week, starting with calendar's setting for first day of week
          now.getDate() - now.getDay() + settings.firstDisplayDay + i
        )
    );
    setDisplayDates(() => dates);
  };

  useEffect(() => {
    if (isInitialRender) {
      setIsInitialRender(() => false);

      // Setup initial display dates
      initialDisplayDates();
    }

    // Keep parent up to date on dates displayed
    props.updateParentDates(displayDates);
  }, [isInitialRender, displayDates]);

  const getTimeFromCoords = (e) => {
    const dfOrigin = { x: ref.current.offsetLeft, y: ref.current.offsetTop };
    const dfDims = {
      x: ref.current.clientWidth,
      y: ref.current.clientHeight,
    };
    const mouseCoords = { x: e.pageX, y: e.pageY };
    return getDateTime(mouseCoords, dfOrigin, dfDims, displayDates[0]);
  };

  // Necessary to display time while dragging list item
  const handleMouseOver = (e) => {
    setTimeout(() => {
      const newTime = getTimeFromCoords(e);

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

    const newTime = getTimeFromCoords(e);

    if (newTime.getTime() !== cursorTime.getTime()) {
      setDateLineObj({
        ...dateLineObj,
        top: e.pageY,
      });
      setCursorTime(() => newTime);
    }
  };

  // TODO: why is drop firing so inconsistent?
  const handleDrop = (e) => {
    console.log("Dropped");
    e.preventDefault();
    const dropTime = getTimeFromCoords(e);
    const data = JSON.parse(e.dataTransfer.getData("text/plain"));
    let newStart;
    let newEnd;

    switch (data.obj) {
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

    // TODO: re-write `schedule` in db-actions to use document path
    updateDoc(doc(db, data.path), { startTime: newStart, endTime: newEnd });
  };

  const scrollCalendar = (e) => {
    let direction;
    e.currentTarget.id === "left-scroll" ? direction = -1 : direction = 1;

    setDisplayDates(prev =>
      prev.map(prevDate => new Date(prevDate.getTime() + direction * 24 * 60 * 60 * 1000))
    );
    setDateOffset(prev => prev + direction * 1);
  };

  return (
    <>
      <div id="calendar-container" className="calendar-container">
        <div className="time-line" style={dateLineObj} />
        <div className="scroll-buttons">
          <button id="left-scroll" onClick={scrollCalendar}>{"<"}</button>
          <button id="right-scroll" onClick={scrollCalendar}>{">"}</button>
        </div>
        <h3 className="time-readout">
          {cursorTime.toLocaleTimeString("en-US", { timeStyle: "short" })}
        </h3>
        <HourColumn className="hour-column" />
        <DateBar className="date-bar" dates={displayDates} />
        {/*TODO: change to full 24 hours, size to start scroll at startTime, window shows to endTime*/}
        <div
          ref={ref}
          id="date-field"
          className="date-field"
          onMouseMove={handleMouseOver}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {displayDates.map((date, i) => (
            <Day key={(i + dateOffset).toString()} dayNumber={i} date={date} />
          ))}
        </div>
      </div>
    </>
  );
});
