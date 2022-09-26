import React, { useState } from "react";

import TaskItem from "./TaskItem";

const List = () => {
  // Helpers
  const createRandomKey = () => Math.random().toString();

  // Initialize list of tasks to empty task
  const [tasks, setTasks] = useState([{ key: createRandomKey() }]); // Key included for warning. TODO: fix hack

  // Updates task title for a given key. Returns the TaskItem's index in the List.
  const updateTitle = (taskData) => {
    let i;
    setTasks((prevTasks) => {
      // Store edited task's title
      i = prevTasks.findIndex((task) => task.key === taskData.key); // Better with find()?
      prevTasks[i].title = taskData.title;
      return [...prevTasks];
    });

    return i;
  };

  // Add submitted task to list, create new task
  const createNewTaskItem = (taskData) => {
    setTasks((prevTasks) => {
      // Store edited task's title
      const i = updateTitle(taskData);

      // Return list with previous tasks, current task, and new task
      prevTasks.splice(i + 1, 0, { key: createRandomKey() });
      return [...prevTasks]; // TODO: inefficient. Better way to make sure refresh occurs?
    });
  };

  // Delete a task from the list if not the sole remaining task
  const conditionalTaskDelete = (keyToDelete) => {
    if (tasks.length > 1) {
      setTasks((prevTasks) => {
        const i = prevTasks.findIndex((task) => task.key === keyToDelete);
        prevTasks.splice(i, 1);
        return [...prevTasks]; // Terrible efficiency, but we need new object to force React to re-render List
      });
    }
  };

  // List items shown dynamically
  return (
    <>
      <h2>List</h2>
      {tasks.map((task) => (
        <ul key={task.key}>
          <TaskItem
            id={task.key}
            title={task.title}
            onClickOut={updateTitle}
            onCreateNewTaskItem={createNewTaskItem}
            onConditionalDelete={conditionalTaskDelete}
          />
        </ul>
      ))}
    </>
  );
};

export default List;
