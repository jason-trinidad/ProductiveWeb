import React, { useState } from "react";

import { getCSSGridRow } from "./cal-utils";
import "./Event.css";

const Event = (props) => {
  // TODO: put z-indices in CSS file
  const [isSelected, setIsSelected] = useState(false);
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
      className={isSelected ? "event-detail" : "event"}
      style={{ gridRow: rows }}
      draggable={!isSelected}
      onDragStart={handleEventDragStart}
      onClick={(e) => {
        if (e.detail === 2) setIsSelected((prev) => !prev);
      }}
    >
      {isSelected ? (
        <form>
          <input style={{size: 2}} value={props.docSnap.data().title} />
          <div className="time-container">
            <input type="text"
              value={props.docSnap.data().startTime.toDate().getMonth() + 1}
            />
            <input value={props.docSnap.data().startTime.toDate().getDate()} />
            <input
              value={props.docSnap.data().startTime.toDate().getFullYear()}
            />
            <input value={props.docSnap.data().startTime.toDate().getHours()} />
            <input
              value={props.docSnap.data().startTime.toDate().getMinutes()}
            />
          </div>
          <div style={{ display: "flex" }}>
            <input
              value={props.docSnap.data().endTime.toDate().getMonth() + 1}
            />
            <input value={props.docSnap.data().endTime.toDate().getDate()} />
            <input
              value={props.docSnap.data().endTime.toDate().getFullYear()}
            />
            <input value={props.docSnap.data().endTime.toDate().getHours()} />
            <input value={props.docSnap.data().endTime.toDate().getMinutes()} />
          </div>
        </form>
      ) : (
        <>
          <div
            className="edge"
            draggable="true"
            onDragStart={handleTopDragStart}
          />
          <div>
            {props.docSnap.data().title +
              ": " +
              props.docSnap
                .data()
                .endTime.toDate()
                .toLocaleString("en-US")}
          </div>
          <div
            className="edge"
            draggable="true"
            style={{ marginTop: "auto" }}
            onDragStart={handleBottomDragStart}
          />
        </>
      )}
    </div>
  );
};

export default Event;
