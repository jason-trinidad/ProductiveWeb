import React, { useState, useEffect, useRef } from "react";
import { Draggable } from "react-beautiful-dnd";

import styles from "./TaskItem.module.css";
import { tasksActions } from "../../store/tasks-slice";
import { useDispatch } from "react-redux";

const TaskItemForm = (props) => {
  const [enteredTitle, setEnteredTitle] = useState("");
  const ref = useRef();
  const dispatch = useDispatch();

  // Handle keyboard shortcuts
  const keyShortsHandler = (event) => {
    // "Backspace delete" TaskItem from List
    if (event.key === "Backspace" && event.target.value === "") {
        // dispatch(tasksActions.delete({keyToDelete: props.id}));
        props.onConditionalDelete(props.id); // Using callback to allow List to handle list length
    }
  };

  // Handle typing internally
  const titleChangeHandler = (event) => {
    setEnteredTitle(event.target.value);
  };

  // Saves internal title state to store
  const blurHandler = () => {
    dispatch(tasksActions.update({ key: props.id, title: enteredTitle }));
  };

  const submitHandler = (event) => {
    event.preventDefault();
    // "Carriage return"
    props.onCarriageReturn({ key: props.id, title: enteredTitle });
  };

  return (
    <Draggable draggableId={(props.draggableId).toString()} index={props.index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          {/* Should each of these be a separate form? Or should I do multiple inputs for one form? */}
          <form onSubmit={submitHandler}>
            <input
              className={styles.TaskItem}
              autoFocus
              ref={ref}
              type="text"
              onBlur={blurHandler}
              onChange={titleChangeHandler}
              onKeyDown={keyShortsHandler}
            />
          </form>
        </div>
      )}
    </Draggable>
  );
};

export default TaskItemForm;
