import React from "react";

import * as settings from "./cal-settings";
import "./HourColumn.css";

const HourColumn = (props) => {
  const hours = Array.from(
    { length: settings.endTime - settings.startTime },
    (x, i) => i + settings.startTime
  );

  return (
    <div className={props.className}>
      {hours.map((hour) => (
        <div
          className="hour"
          key={hour}
          onDrop={() => {
            console.log("Dropped on HourColumn");
          }}
        >
          {hour}
        </div>
      ))}
    </div>
  );
};

export default HourColumn;
