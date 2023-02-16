import React, { useState } from "react";

const BelowSensor = (props) => {
  const [isDraggedOver, setIsDraggedOver] = useState(false);

  const handleDrop = (e) => {
    setIsDraggedOver(false);
    props.onDrop(e);
  }

  return (
    <div
      id={props.id}
      style={{
        minHeight: "10px",
        backgroundColor: isDraggedOver ? "lightgrey" : "transparent",
      }}
      onDragEnter={() => setIsDraggedOver(true)}
      onDragLeave={() => setIsDraggedOver(false)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    />
  );
};

export default BelowSensor;
