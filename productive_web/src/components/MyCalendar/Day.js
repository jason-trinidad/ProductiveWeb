import React from "react";

import "./Day.css";
import Hour from "./Hour";
import * as settings from "./cal-settings";

const Day = (props) => {
  const times = Array.from(
    { length: settings.endTime - settings.startTime },
    (x, i) => settings.startTime + i
  );

  return (
    <div style={{display: "flex", flexDirection: "column", flexGrow: 1}}>
      <div className="day">
        {times.map((time) => (
          <Hour key={time} time={time} />
        ))}
      </div>
    </div>
  );
};

export default Day;
