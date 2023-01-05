import React, { useEffect, useState } from "react";
import { scheduleRepeat, update } from "../../db/db-actions";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";

import { dateToCSSGridRow } from "./cal-utils";
import "./Event.css";
import EventDetail from "./EventDetail";
import { getDoc } from "firebase/firestore";

const Event = (props) => {
  const [isInitialRender, setIsInitialRender] = useState(true);
  const [isSelected, setIsSelected] = useState(false);
  const [repeatDoc, setRepeatDoc] = useState(null);

  const startRow = dateToCSSGridRow(props.docSnap.data().startTime.toDate());
  const endRow = dateToCSSGridRow(props.docSnap.data().endTime.toDate());
  const rows = `${startRow} / ${endRow}`;
  const startTimeString = props.docSnap
    .data()
    .startTime.toDate()
    .toLocaleTimeString("en-US", { timeStyle: "short" });
  const isDone = props.docSnap.data().isDone;

  useEffect(() => {
    (async () => {
      if (props.docSnap.data().repeatRef && isInitialRender) {
        setIsInitialRender(false);
        const ref = props.docSnap.data().repeatRef;
        const rep = await getDoc(ref);
        // Store repeat info if event is part of repeat
        if (
          rep.data().repeatStartMSecs <
          props.docSnap.data().startTime.toDate().getTime()
        )
          setRepeatDoc(rep);
      }
    })();
  }, [isInitialRender]);

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

  const updateEventData = (formData) => {
    if (formData.title) {
      update(props.docSnap, formData.title);
    } else if (formData.repeatKind) {
      scheduleRepeat(props.docSnap, formData);
    }
  };

  // Update the data if toggled
  const handleToggle = () => {
    setIsSelected((prev) => !prev);
  };

  return (
    <OverlayTrigger
      trigger="click"
      placement="right"
      onToggle={handleToggle}
      overlay={
        <Popover id="popover-basic">
          <EventDetail docSnap={props.docSnap} repeatDoc={repeatDoc} passFormData={updateEventData} />
        </Popover>
      }
    >
      <div
        className={isDone ? "event-done" : "event"}
        style={{
          gridRow: rows,
          boxShadow: isSelected ? "0px 2px 10px rgba(0,0,0,0.1)" : "",
        }}
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
