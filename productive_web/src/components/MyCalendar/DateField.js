import React from "react";

import Day from "./Day";
import * as settings from "./cal-settings"

export const DateField = React.forwardRef((props, ref) => (
  <div
    ref={ref}
    style={{ height: settings.hourHeight * 24 - 24 }}
    className={props.className}
    onDragOver={props.onDragOver}
    onDrop={props.onDrop}
    onMouseMove={props.onMouseMove}
  >
    {props.displayDates.map((date, i) => (
      <Day key={(i + props.dateOffset).toString()} dayNumber={i} date={date} />
    ))}
  </div>
));
