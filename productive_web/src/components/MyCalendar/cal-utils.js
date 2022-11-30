// Useful calendar functions

import {toDate} from "firebase/firestore"
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

export const getCSSGridRow = (doc) => {
  // TODO: save event duration to db. Once scheduled, save current default.
  const scheduledStart = doc.data().scheduledStart.toDate();

  const startFrac =
    (scheduledStart.getHours() - settings.startTime) * 12 +
    Math.floor(scheduledStart.getMinutes() / 5);
  const endFrac = startFrac + settings.defaultDuration / 5; // TODO

  return `${startFrac} / ${endFrac}`;
};
