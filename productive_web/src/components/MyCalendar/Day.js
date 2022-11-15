import React from "react";

import "./Day.css"
import Hour from "./Hour";

const Day = () => {
  const startTime = 8.0;
  const endTime = 22.0;
  const times = Array.from({length: endTime - startTime}, (x,i) => startTime + i);

  return(
    <div className="day">
        {times.map((time) => <Hour key={time} time={time} />)}
    </div>
  )
};

export default Day;
