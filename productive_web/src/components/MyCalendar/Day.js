import React from "react";

import "./Day.css"
import FiveMin from "./FiveMin";

const Day = () => {
  const startTime = 8.0;
  const endTime = 22.0;
  const times = new Array();
  for (let i = startTime; i < endTime; i += 0.05) {
    //BUG: Weird float error in time values
    times.push(i);
  }

  return(
    <div className="day">
        {times.map((time) => <FiveMin key={time} time={time} />)}
    </div>
  )
};

export default Day;
