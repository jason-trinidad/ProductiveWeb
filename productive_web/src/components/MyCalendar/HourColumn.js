import React from "react";

import * as settings from "./CalendarSettings";
import "./HourColumn.css";

const HourColumn = () => {
  const hours = Array.from(
    { length: settings.endTime - settings.startTime },
    (x, i) => i + settings.startTime
  );

  return(
    <div className="column">
        {hours.map((hour) => <div className="hour" key={hour}>{hour}</div>)}
    </div>
  )
};

export default HourColumn;