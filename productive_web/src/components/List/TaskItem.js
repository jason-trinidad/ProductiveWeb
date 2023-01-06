import React, { useEffect, useState } from "react";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import BelowSensor from "./BelowSensor";
import styles from "./TaskItem.module.css";
import * as dbActions from "../../db/db-actions";
import Indent from "./Indent";

// TODO: this should be a controlled element from the element with a listener so that it will update correctly
const TaskItem = (props) => {
  const [enteredTitle, setEnteredTitle] = useState(props.data.title);
  const taskData = props.snapshot.data();
  const indents = Array.from({ length: taskData.indents }, (x, i) => i);

  useEffect(() => {
    setEnteredTitle(props.data.title);
  }, [props.data.title]);

  // Handle keyboard shortcuts
  const keyShortsHandler = (e) => {
    // "Backspace delete" TaskItem from List
    if (e.key === "Backspace" && e.target.value === "") {
      dbActions.remove(props.snapshot);
    } else if (e.key === "Tab" && e.shiftKey) {
      e.preventDefault();
      if (taskData.indents > 0) dbActions.indent(props.snapshot, -1);
    } else if (e.key === "Tab") {
      e.preventDefault();
      if (taskData.indents < props.maxIndent)
        dbActions.indent(props.snapshot, 1);
    }
  };

  // Handle typing internally
  const titleChangeHandler = (event) => {
    setEnteredTitle(event.target.value);
  };

  // Saves internal title state to store
  const blurHandler = () => {
    dbActions.update(props.snapshot, enteredTitle);
  };

  const submitHandler = (event) => {
    event.preventDefault();

    dbActions.carriageReturn(props.snapshot, {
      index: props.index,
      title: enteredTitle,
    });
  };

  const completionHandler = () => {
    dbActions.toggleDone(props.snapshot);
  };

  const handleDragStart = (e) => {
    e.stopPropagation();
    const data = {
      docPath: props.snapshot.ref.path,
      startIndex: props.index,
      obj: "task",
    };
    e.dataTransfer.setData("text/plain", JSON.stringify(data));
  };

  const handleClickArchive = (e) => {
    e.preventDefault();

    dbActions.toggleArchived(props.snapshot);
  };

  // TODO: make IDs unique
  return (
    <div
      draggable={true}
      onDragStart={handleDragStart}
      onDrop={props.handleNewChild}
      style={{ display: "flex", flexDirection: "column" }}
    >
      <div style={{ display: "flex" }}>
        {indents.map((num, index) => (
          <Indent key={index} />
        ))}
        <div className={taskData.isDone ? styles.completedTask : styles.task}>
          <button onClick={completionHandler} />
          <form onSubmit={submitHandler}>
            <input
              autoFocus
              id={props.index}
              type="text"
              value={enteredTitle}
              onBlur={blurHandler}
              onChange={titleChangeHandler}
              onKeyDown={keyShortsHandler}
            />
          </form>
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id={`arcv-tooltip-${props.index}`}>Archive</Tooltip>
            }
          >
            <button
              style={{
                padding: 0,
                border: "none",
                borderRadius: "0%",
                backgroundColor: "transparent",
                textAlign: "center",
              }}
              onClick={handleClickArchive}
            >
              🗑️
            </button>
          </OverlayTrigger>
        </div>
      </div>
      <BelowSensor id={props.index} onDrop={props.handleDropBelow} />
    </div>
  );
};

export default TaskItem;
