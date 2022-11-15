import HourColumn from "./HourColumn";
import Day from "./Day";
import "./MyCalendar.css";
import * as settings from "./CalendarSettings";
import React from "react";

export const MyCalendar = React.forwardRef((props, ref) => {
  const days = Array.from({ length: settings.displayDays }, (x, i) => i);

  return (
    <>
      <h2>Calendar</h2>
      <div className="calendar-container">
        <HourColumn className="hour-column" />
        <div ref={ref} className="datefield">
          {days.map((day) => (
            <Day key={day} />
          ))}
        </div>
      </div>
    </>
  );
});
