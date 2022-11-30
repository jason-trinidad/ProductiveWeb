import React from "react";
import "./DateBar.css";

const DateBar = (props) => {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Today's date, used to highlight today in the date bar
  const today = new Date();
  today.setHours(0);
  today.setMinutes(0);
  today.setSeconds(0);
  today.setMilliseconds(0);

  return (
    <div className={props.className}>
      {props.dates.map((date) => (
        <h3
          key={date}
          style={{
            backgroundColor:
              date.getTime() === today.getTime() ? "lightgrey" : "transparent",
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
