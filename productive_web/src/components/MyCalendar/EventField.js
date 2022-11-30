import React from "react";

import Event from "./Event";
import * as settings from "./cal-settings";

const EventField = (props) => {
  const numRows = (settings.endTime - settings.startTime) * 12; // 5 min increments
  const numCols = settings.displayDays;
  return (
    <div
      className={props.className}
      style={{
        gridTemplateRows: `repeat(${numRows}, 1fr)`,
        gridTemplateColumns: `repeat(${numCols}, 1fr)`,
      }}
    >
      {props.eventList.forEach((event, i) => {
        <Event key={i} event={event} />;
      })}
    </div>
  );
};

export default EventField;
