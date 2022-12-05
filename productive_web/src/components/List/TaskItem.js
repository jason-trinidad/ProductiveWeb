import React, { useState } from "react";
import { Draggable } from "react-beautiful-dnd";

import styles from "./TaskItem.module.css";
import * as dbActions from "../../db/db-actions";

// TODO: this should be a controlled element from the element with a listener so that it will update correctly
const TaskItem = (props) => {
  const [enteredTitle, setEnteredTitle] = useState(props.data.title);
  const taskInfo = props.data;

  // Handle keyboard shortcuts
  const keyShortsHandler = (event) => {
    // "Backspace delete" TaskItem from List
    if (event.key === "Backspace" && event.target.value === "") {
      dbActions.remove(props.snapshot);
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
    
    dbActions.carriageReturn(props.snapshot, { index: props.index, title: enteredTitle })
  };

  const completionHandler = () => {
    dbActions.toggleDone(props.snapshot)
  };

  return (
    <Draggable draggableId={props.draggableId.toString()} index={props.index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <div className={taskInfo.isDone ? styles.completedTask : styles.task}>
            <button onClick={completionHandler} />
            <form onSubmit={submitHandler}>
              <input
                autoFocus
                type="text"
                value={enteredTitle}
                onBlur={blurHandler}
                onChange={titleChangeHandler}
                onKeyDown={keyShortsHandler}
              />
            </form>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default TaskItem;
