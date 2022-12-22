import React from "react";

import "./DateGrid.css";
import * as settings from "./cal-settings";

export const DateGrid = React.forwardRef((props, ref) => {
  const days = Array.from({ length: settings.displayDays }, (x, i) => i);
  const hours = Array.from({ length: 24 }, (x, i) => i);
  return (
    <div
      className={props.className}
      ref={ref}
      // style={{ height: settings.hourHeight * 24 - 24 }}
      onDrop={props.onDrop}
    >
      {days.map((day) => (
        <div key={day} className="day">
          {hours.map((hour) => (
            <div
              className="hour"
              key={hour}
              style={{ minHeight: settings.hourHeight, minWidth: 0 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
});
