import HourColumn from "./HourColumn";
import Day from "./Day"
import "./MyCalendar.css";
import * as settings from "./CalendarSettings"

export const MyCalendar = () => {
  const days = Array.from({length: settings.displayDays}, (x,i) => i);
  

  const handleDragOver = (event) => {
    console.log("I'm being dragged over")
  }

  return (
    <>
      <h2>Calendar</h2>
      <div className="calendar-container">
        <HourColumn className="hour-column" />
        {days.map((day) => <Day className="day" key={(day)} />)}
      </div>
    </>
  );
};
