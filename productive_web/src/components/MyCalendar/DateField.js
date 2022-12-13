import React from "react";

import Day from "./Day";

const DateField = (props) => {
  return (
    <div className={props.className}>
      {props.displayDates.map((date, i) => (
        <Day
          key={(i + props.dateOffset).toString()}
          dayNumber={i}
          date={date}
        />
      ))}
    </div>
  );
};

export default DateField;
