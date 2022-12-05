import React, { useEffect, useState } from "react";
import { schedule } from "../../db/db-actions";

import { getCSSGridRow } from "./cal-utils";
import "./Event.css";
import EventDetail from "./EventDetail";

const Event = (props) => {
  // TODO: put z-indices in CSS file
  const [isSelected, setIsSelected] = useState(false);
  const [formData, setFormData] = useState(null);
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

  const trackFormData = (data) => {
    setFormData({ ...data });
  };

  useEffect(() => {
    if (formData && !isSelected)
      schedule(
        props.docSnap.data().dragId,
        formData.startTime,
        formData.endTime,
        formData.title
      );
  }, [isSelected]);

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
        <EventDetail docSnap={props.docSnap} passFormData={trackFormData} />
      ) : (
        <>
          <div
            className="edge"
            draggable="true"
            onDragStart={handleTopDragStart}
          />
          <div>
            {props.docSnap
              .data()
              .startTime.toDate()
              .toLocaleTimeString("en-US", { timeStyle: "short" })}
          </div>
          <h3 style={{margin: "0"}}>{props.docSnap.data().title}</h3>
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
