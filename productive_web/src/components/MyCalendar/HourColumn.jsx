import React, { useEffect, useState, useRef } from "react";

import * as settings from "./cal-settings";
import "./HourColumn.css";

//TODO: report "interactiveRatio" for cursor-time math
const HourColumn = (props) => {
  const [isInitialRender, setIsInitialRender] = useState(true);
  const startRef = useRef();

  const now = new Date();
  // console.log(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0));
  const hours = Array.from(
    { length: 24 },
    (x, i) => new Date(now.getFullYear(), now.getMonth(), now.getDate(), i)
  );
  // hours.forEach((hour) => console.log(hour));

  useEffect(() => {
    if (isInitialRender) {
      setIsInitialRender(false);

      startRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [isInitialRender]);

  return (
    <div className={props.className}>
      {hours.map((hour) => (
        <div
          className="hour-label"
          style={{ height: settings.hourHeight }}
          key={hour}
          ref={hour.getHours() === settings.startTime ? startRef : null}
        >
          {hour.toLocaleTimeString("en-US", { hour: "numeric" })}
        </div>
      ))}
    </div>
  );
};

export default HourColumn;
