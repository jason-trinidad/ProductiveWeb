import React, { useEffect, useState } from "react";
import { schedule } from "../../db/db-actions";

import "./EventDetail.css";

// Mystery 1: Why are start and end times shown in EventDetail initially the same? Scheduled that way? [typo] √
// Mystery 2: Why is a new task's listIndex so high?
// Mystery 3: Why does re-ordering now fail on a new task? (Bc of changes to schedule?)

const EventDetail = (props) => {
  const startTime = props.docSnap.data().startTime.toDate();
  const endTime = props.docSnap.data().endTime.toDate();


  const [isInitialRender, setIsInitialRender] = useState(true);
  const [enteredTitle, setEnteredTitle] = useState(props.docSnap.data().title);
  const [startTimeText, setStartTimeText] = useState({
    year: startTime.getFullYear().toString(),
    month: startTime.getMonth().toString(),
    date: startTime.getDate().toString(),
    hours: startTime.getHours().toString(),
    minutes: startTime.getMinutes().toString(),
  });
  const [endTimeText, setEndTimeText] = useState({
    year: endTime.getFullYear().toString(),
    month: endTime.getMonth().toString(),
    date: endTime.getDate().toString(),
    hours: endTime.getHours().toString(),
    minutes: endTime.getMinutes().toString(),
  });

  useEffect(() => {
    if (isInitialRender) {
        setIsInitialRender(false);
        return;
    }

    props.passFormData( {
      startTime: new Date(
        startTimeText.year,
        startTimeText.month,
        startTimeText.date,
        startTimeText.hours,
        startTimeText.minutes
      ),
      endTime: new Date(
        endTimeText.year,
        endTimeText.month,
        endTimeText.date,
        endTimeText.hours,
        endTimeText.minutes
      ),
      title: enteredTitle,
    });
  }, [enteredTitle, startTimeText, endTimeText]);

  const titleChangeHandler = (e) => {
    setEnteredTitle(e.target.value);
  };

  const timeChangeHandler = (e) => {
    const splitIdString = e.target.id.split("/");
    const desiredTime = e.target.value;

    let textSetter;
    splitIdString[0] === "start"
      ? (textSetter = setStartTimeText)
      : (textSetter = setEndTimeText);

    switch (splitIdString[1]) {
      case "year":
        textSetter((prev) => ({
          ...prev,
          year: desiredTime,
        }));
        break;
      case "month":
        textSetter((prev) => ({
          ...prev,
          month: desiredTime,
        }));
        break;
      case "date":
        textSetter((prev) => ({
          ...prev,
          date: desiredTime,
        }));
        break;
      case "hours":
        textSetter((prev) => ({
          ...prev,
          hours: desiredTime,
        }));
        break;
      case "minutes":
        textSetter((prev) => ({
          ...prev,
          minutes: desiredTime,
        }));
        break;
    }
  };

  const handleClick = (e) => {
    e.preventDefault();
    schedule(props.docSnap.data().dragId, null, null);
  }

  return (
    <form>
      <input value={enteredTitle} onChange={titleChangeHandler} />
      <div className="time-container">
        <input
          id="start/month"
          type="text"
          onChange={timeChangeHandler}
          value={Number(startTimeText.month) + 1}
        />
        <input
          id="start/date"
          type="text"
          onChange={timeChangeHandler}
          value={startTimeText.date}
        />
        <input
          id="start/year"
          type="text"
          onChange={timeChangeHandler}
          style={{ width: "4em" }}
          value={startTimeText.year}
        />
        <input
          id="start/hours"
          type="text"
          onChange={timeChangeHandler}
          value={startTimeText.hours}
        />
        <input
          id="start/minutes"
          type="text"
          onChange={timeChangeHandler}
          value={startTimeText.minutes}
        />
      </div>
      <div className="time-container">
        <input
          id="end/month"
          type="text"
          onChange={timeChangeHandler}
          value={Number(endTimeText.month) + 1}
        />
        <input
          id="end/date"
          type="text"
          onChange={timeChangeHandler}
          value={endTimeText.date}
        />
        <input
          id="end/year"
          type="text"
          onChange={timeChangeHandler}
          style={{ width: "4em" }}
          value={endTimeText.year}
        />
        <input
          id="end/hours"
          type="text"
          onChange={timeChangeHandler}
          value={endTimeText.hours}
        />
        <input
          id="end/minutes"
          type="text"
          onChange={timeChangeHandler}
          value={endTimeText.minutes}
        />
      </div>
      <button onClick={handleClick}>Un-Schedule</button>
    </form>
  );
};

export default EventDetail;
