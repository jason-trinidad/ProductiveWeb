import React from "react";

import * as settings from "./cal-settings"

const DateBar = (props) => {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Today's date, used to highlight today in the date bar
  const today = new Date();
  today.setHours(0);
  today.setMinutes(0);
  today.setSeconds(0);
  today.setMilliseconds(0);

  return (
    <div className={props.className} style={{gridTemplateColumns: `repeat(${settings.displayDays}, minmax(0, 1fr))`}}>
      {props.dates.map((date, i) => (
        <h3
          key={date}
          style={{
            backgroundColor:
              date.getTime() === today.getTime() ? "lightgrey" : "transparent",
            gridArea: `${1} / ${i +1} / ${2} / ${i + 2}`,
            margin: 0,
          }}
        >
          {dayNames[date.getDay()] +
            " " +
            (date.getMonth() + 1) +
            "/" +
            date.getDate()}
        </h3>
      ))}
    </div>
  );
};

export default DateBar;
