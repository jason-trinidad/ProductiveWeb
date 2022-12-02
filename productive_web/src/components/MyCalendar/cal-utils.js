// Useful calendar functions
import * as settings from "./cal-settings";

export const getDateTime = (mouseCoords, dfOrigin, dfDims, firstDate) => {
  // Get time
  const numHours = settings.endTime - settings.startTime;
  const dropTime =
    settings.startTime + numHours * ((mouseCoords.y - dfOrigin.y) / dfDims.y);
  const hour = Math.floor(dropTime);
  const fracMins = dropTime - hour;
  const nearestFiveMinFloor = Math.floor(fracMins * 12) * 5;

  // Get date
  const dropFrame = Math.floor(
    settings.displayDays * ((mouseCoords.x - dfOrigin.x) / dfDims.x)
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

// TODO: this would be more helpful if generalized time -> grid row
export const getCSSGridRow = (doc) => {
  const eventStartTime = doc.data().startTime.toDate();
  const eventEndTime = doc.data().endTime.toDate();

  const startFrac =
    (eventStartTime.getHours() - settings.startTime) * 12 +
    Math.floor(eventStartTime.getMinutes() / 5);
  const endFrac = (eventEndTime.getHours() - settings.startTime) * 12 +
    Math.floor(eventEndTime.getMinutes() / 5);

  return `${startFrac} / ${endFrac}`;
};
