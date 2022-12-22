import React, { useEffect, useState } from "react";
import { schedule, scheduleRepeat, update } from "../../db/db-actions";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";

import { dateToCSSGridRow } from "./cal-utils";
import "./Event.css";
import EventDetail from "./EventDetail";

const Event = (props) => {
  const [isSelected, setIsSelected] = useState(false);
  // const [formData, setFormData] = useState(null);
  const startRow = dateToCSSGridRow(props.docSnap.data().startTime.toDate());
  const endRow = dateToCSSGridRow(props.docSnap.data().endTime.toDate());
  const rows = `${startRow} / ${endRow}`;
  const startTimeString = props.docSnap
    .data()
    .startTime.toDate()
    .toLocaleTimeString("en-US", { timeStyle: "short" });

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

  // const trackFormData = (data) => {
  //   console.log("tracking")
  //   setFormData({ ...data });
  // };

  const updateEventData = (formData) => {
    // schedule(
    //   props.docSnap.data().dragId,
    //   formData.startTime,
    //   formData.endTime,
    //   formData.title
    // );
    if (formData.title) {
      update(props.docSnap, formData.title);
    } else if (formData.repeatKind) {
      scheduleRepeat(props.docSnap, formData);
    }
  };

  // Update the data if toggled
  const handleToggle = (e) => {
    setIsSelected((prev) => {
      // if (formData !== null && prev) {
      //   updateEventData();
      // }
      return !prev;
    });
  };

  return (
    <OverlayTrigger
      trigger="click"
      placement="right"
      onToggle={handleToggle}
      overlay={
        <Popover id="popover-basic">
            <EventDetail docSnap={props.docSnap} passFormData={updateEventData} />
        </Popover>
      }
    >
      <div
        className="event"
        style={{ gridRow: rows, boxShadow: isSelected ? "0px 2px 10px rgba(0,0,0,0.1)" : "" }}
        draggable={!isSelected}
        onDragStart={handleEventDragStart}
      >
        <div
          className="edge"
          draggable="true"
          onDragStart={handleTopDragStart}
        />
        {endRow - startRow <= 6 ? (
          <div className="description">
            {props.docSnap.data().title + ", " + startTimeString}
          </div>
        ) : (
          <>
            <div>{startTimeString}</div>
            <div className="description">
              <strong>{props.docSnap.data().title}</strong>
            </div>
          </>
        )}
        <div
          className="edge"
          draggable="true"
          style={{ marginTop: "auto" }}
          onDragStart={handleBottomDragStart}
        />
      </div>
    </OverlayTrigger>
  );
};

export default Event;
