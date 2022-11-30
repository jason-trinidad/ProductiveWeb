import React from "react";
import { getCSSGridRow } from "./cal-utils";

import "./Event.css";

const Event = (props) => {
  // TODO: put z-indices in CSS file
  const rows = getCSSGridRow(props.docSnap);

  const handleEventDragStart = (e) => {
    e.stopPropagation();
    const data = {
      startMSecs: props.docSnap.data().startTime.toDate().getTime(),
      endMSecs: props.docSnap.data().endTime.toDate().getTime(),
      path: props.docSnap.ref.path,
      obj: "event",
    };
    e.dataTransfer.setData("text/plain", JSON.stringify(data));
  };

  const handleTopDragStart = (e) => {
    e.stopPropagation();
    const data = {
      startMSecs: props.docSnap.data().startTime.toDate().getTime(),
      endMSecs: props.docSnap.data().endTime.toDate().getTime(),
      path: props.docSnap.ref.path,
      obj: "top",
    };
    e.dataTransfer.setData("text/plain", JSON.stringify(data));
  };

  const handleBottomDragStart = (e) => {
    e.stopPropagation();
    const data = {
      startMSecs: props.docSnap.data().startTime.toDate().getTime(),
      endMSecs: props.docSnap.data().endTime.toDate().getTime(),
      path: props.docSnap.ref.path,
      obj: "bottom",
    };
    e.dataTransfer.setData("text/plain", JSON.stringify(data));
  };

  return (
    <div
      id="event"
      className="event"
      style={{ gridRow: rows }}
      draggable="true"
      onDragStart={handleEventDragStart}
    >
      <div
        className="edge"
        draggable="true"
        // style={{alignSelf: "flex-start"}}
        onDragStart={handleTopDragStart}
      />
      <div>
        {props.docSnap.data().title +
          ": " +
          props.docSnap
            .data()
            .startTime.toDate()
            .toLocaleTimeString("en-US", { timeStyle: "short" })}
      </div>
      <div
        className="edge"
        draggable="true"
        style={{marginTop: "auto"}}
        onDragStart={handleBottomDragStart}
      />
    </div>
  );
};

export default Event;
