import React from "react";

import { dateToCSSGridRow } from "./cal-utils";

const EventBlock = (props) => {
  const startRow = dateToCSSGridRow(props.blockStartTime);
  const endRow = dateToCSSGridRow(props.blockEndTime);
  
  const numRows = endRow - startRow;
  const numCols = props.events.length;

//   console.log(`EventBlock #${props.key} sees:`)
//   props.events.forEach(event => console.log(event.data()))

  return (
    <div style={{gridRows: `${startRow} / ${endRow}`,
                 display: "grid",
                 gridTemplateRows: `repeat(${numRows}, 1fr)`,
                 gridTemplateColumns: `repeat(${numCols}, 1fr)`,
                 }} >

    </div>
  )
};

export default EventBlock;
