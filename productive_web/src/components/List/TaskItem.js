import React, { useState, useEffect, useRef } from "react";
import { Draggable } from "react-beautiful-dnd";

import styles from "./TaskItem.module.css";
import { tasksActions } from "../../store/tasks-slice";
import { useDispatch, useSelector } from "react-redux";
import * as dbActions from "../../db/db-actions";

const TaskItem = (props) => {
  // const tasks = useSelector((state) => state.tasks);
  const taskInfo = props.snapshot.data();

  const [enteredTitle, setEnteredTitle] = useState(taskInfo.title);
  const dispatch = useDispatch();

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
    // dispatch(tasksActions.toggleDone({ toggleKey: props.id }));
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
