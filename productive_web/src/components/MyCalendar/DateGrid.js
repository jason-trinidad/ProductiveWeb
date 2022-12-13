import React from "react";

import "./DateGrid.css";
import * as settings from "./cal-settings";

const DateGrid = (props) => {
  const days = Array.from({ length: settings.displayDays }, (x, i) => i);
  const hours = Array.from({ length: 24 }, (x, i) => i);

  return (
    <div
      className={props.className}
      style={{ display: "flex" }}
    >
      {days.map((day) => (
        <div key={day} style={{display: "flex", flexDirection: "column", flexGrow: 1}}>
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
};

export default DateGrid;
