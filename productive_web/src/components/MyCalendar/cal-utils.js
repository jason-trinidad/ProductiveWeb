// Useful calendar functions
import * as settings from "./cal-settings";

export const calcDateTime = (
  mouseCoords,
  xData,
  scrollTop,
  totalScroll,
  firstDate
) => {
  // Get time
  const numHours = 24;
  const dropTime =
    numHours * ((scrollTop + mouseCoords.y) / totalScroll);
  const hour = Math.floor(dropTime);
  const fracMins = dropTime - hour;
  const nearestFiveMinFloor = Math.floor(fracMins * 12) * 5;

  // Get date
  const dropFrame = Math.floor(
    settings.displayDays * ((mouseCoords.x - xData.origin) / xData.width)
  );

  // Construct new Date
  return new Date(
    firstDate.getFullYear(),
    firstDate.getMonth(),
    firstDate.getDate() + dropFrame,
    hour,
    nearestFiveMinFloor
  );
};

export const getDateTime = (ref, e, firstDate) => {
  const scrollTop = ref.current.scrollTop;
  const totalScroll = ref.current.scrollHeight;
  const mouseData = {
    x: e.pageX,
    y: e.pageY - (ref.current.offsetTop + ref.current.clientTop),
  };
  const xData = {
    width: ref.current.clientWidth,
    origin: ref.current.offsetLeft,
  };

  return calcDateTime(mouseData, xData, scrollTop, totalScroll, firstDate);
};

export const dateToCSSGridRow = (date) =>
  date.getHours() * 12 + Math.floor(date.getMinutes() / 5) + 1;
