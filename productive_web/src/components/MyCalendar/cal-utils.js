// Useful calendar functions
import * as settings from "./cal-settings";

export const getIntendedTime = (mouseCoords, dfOrigin, dfDims) => {
    const numHours = settings.endTime - settings.startTime;
    const dropTime =
      settings.startTime + numHours * ((mouseCoords.y - dfOrigin.y) / dfDims.y);
    const hour = Math.floor(dropTime);
    const fracMins = dropTime - hour;
    const nearestFiveMinFloor = Math.floor(fracMins * 12) * 5;
    // const date = 
    return hour + ":" + (nearestFiveMinFloor < 10 ? "0" + nearestFiveMinFloor : nearestFiveMinFloor);
  };