import React, { useState, useEffect, useRef } from "react";
import { Draggable } from "react-beautiful-dnd";

import styles from "./TaskItem.module.css";

// TODO - add:
// Edit √
// Delete √
// Style [first pass] √
// Drag and drop
// Weekly calendar
// Indents
// Do at
// Deadline
// Undo?
// Focus on previous element on delete (maybe convert to class component?)
// Keyboard shortcuts
// Input on short click, drag/drop on long clicks

const TaskItemForm = (props) => {
  const [enteredTitle, setEnteredTitle] = useState("");
  const [inFocus, setInFocus] = useState(false);
  const ref = useRef();

  // Handling focus edge cases. https://exogen.github.io/blog/focus-state/
  useEffect(() => {
    if (document.hasFocus() && ref.current.contains(document.activeElement)) {
      setInFocus(() => true);
    }
  }, []);

  // Handle keyboard shortcuts
  const keyShortsHandler = (event) => {
    // "Backspace delete" TaskItem from List
    if (event.key === "Backspace" && event.target.value === "") {
      props.onConditionalDelete(props.id);
    }
  };

  const titleChangeHandler = (event) => {
    setEnteredTitle(event.target.value);
  };

  // Addresses delete title, click away, title reappears bug
  const blurHandler = () => {
    setInFocus(() => false);

    // Package data
    const taskData = {
      key: props.id,
      title: enteredTitle,
    };

    props.onClickOut(taskData);
  };

  const submitHandler = (event) => {
    event.preventDefault();

    // console.log("Form submitted");

    // JSON format may be better going forward
    const taskData = {
      key: props.id,
      title: enteredTitle,
    };

    // "Carriage return"
    props.onCreateNewTaskItem(taskData);
  };

  // If in focus or new form, render enteredTitle. Otherwise, render props from list
  let renderTitle;
  if (inFocus || !props.title) {
    renderTitle = enteredTitle;
  } else {
    renderTitle = props.title;
  }

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
              value={renderTitle}
              onFocus={() => setInFocus(() => true)}
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
