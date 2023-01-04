import React, { useState } from "react";

const BelowSensor = (props) => {
  const [isDraggedOver, setIsDraggedOver] = useState(false);

  const handleDrop = (e) => {
    setIsDraggedOver(false);
    props.onDrop(e);
  }

  return (
    <div
      style={{
        minHeight: "10px",
        backgroundColor: isDraggedOver ? "lightblue" : "transparent",
      }}
      onDragEnter={() => setIsDraggedOver(true)}
      onDragLeave={() => setIsDraggedOver(false)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    />
  );
};

export default BelowSensor;
