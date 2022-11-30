import React from "react";
import { getCSSGridRow } from "./cal-utils";

import "./Event.css";

const Event = (props) => {
  const rows = getCSSGridRow(props.e);
  const startTime = props.e
    .data()
    .scheduledStart.toDate()
    .toLocaleTimeString("en-US", { timeStyle: "short" });

  const handleDragStart = (e) => {
    e.stopPropagation();
    e.dataTransfer.setData("text/plain", props.e.ref.path);
  };

  return (
    <div
      id="event"
      className="event"
      style={{ gridRow: rows, zIndex: 100 }}
      draggable="true"
      onDragStart={handleDragStart}
    >
      {props.e.data().title + ": " + startTime}
    </div>
  );
};

export default Event;
