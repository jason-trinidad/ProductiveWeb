import React, { useState } from "react";

// TODO - add:
// Edit
// Delete
// Indents
// Do at
// Deadline
// Undo?
// Keyboard shortcuts

const TaskItemForm = (props) => {
  const [enteredTitle, setEnteredTitle] = useState("");
  const [inFocus, setInFocus] = useState(false);

  const focusHandler = () => {
    setInFocus((prevState) => {
      console.log('Changed focus, focus is ' + (!prevState).toString())
        return !prevState;
    });
  };

  const titleChangeHandler = (event) => {
    setEnteredTitle(event.target.value);
  };

  const submitHandler = (event) => {
    event.preventDefault();

    console.log("Form submitted");

    // JSON format may be better going forward
    const taskData = {
        key: props.id,
        title: enteredTitle,
    }

    // "Carriage return"
    props.onCreateNewTaskItem(taskData);
  };

  // If in focus or new form, render enteredTitle. Otherwise, render props from list
  let renderTitle;
  if (inFocus || !props.title) {
    renderTitle = enteredTitle;
  } else {
    renderTitle = props.title
  }

  return (
    // Should each of these be a separate form? Or should I do multiple inputs for one form?
    <form onSubmit={submitHandler}>
      {console.log("TaskItem returned " + renderTitle)}
      <input
        autoFocus
        type="text" 
        value={renderTitle}
        onFocus={focusHandler}
        onBlur={focusHandler}
        onChange={titleChangeHandler} />
    </form>
  );
};

export default TaskItemForm;
