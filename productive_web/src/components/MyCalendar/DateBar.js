import React from "react";
import "./DateBar.css";

const DateBar = (props) => {
  // Today's date, used to highlight today in the date bar
  const now = new Date();
  now.setHours(0);
  now.setMinutes(0);
  now.setSeconds(0);
  now.setMilliseconds(0);

  return (
    <div className={props.className}>
      {props.dates.map((date) => (
        <h3
          key={date}
          style={{ backgroundColor: date.getTime() === now.getTime() ? "lightgrey" : "transparent" }}
        >
          {date.getMonth() + 1 + "/" + date.getDate()}
        </h3>
      ))}
    </div>
  );
};

export default DateBar;
