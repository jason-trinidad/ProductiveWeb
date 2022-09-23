import React, { useState } from "react";

import TaskItem from "./TaskItem";

const List = () => {
  const createRandomKey = () => Math.random().toString();

  // Initialize list of tasks to empty task
  const [tasks, setTasks] = useState([{key: createRandomKey()}]); // Key included for warning. TODO: fix
  console.log('State created')

  // Add submitted task to list, create new task
  const createNewTaskItem = (taskData) => {
    setTasks((prevTasks) => {
    // Store edited task's title
    const i = prevTasks.findIndex((task) => task.key === taskData.key)
    prevTasks[i].title = taskData.title

    // Return list with previous tasks, current task, and new task (submission = new line)
      console.log('Task list updated. New taskList: ')
      let test = [...prevTasks.slice(0, i + 1), {key: createRandomKey()}, ...prevTasks.slice(i + 1,)];
      test.map((entry) => console.log(entry));
      return test
    //   return [...(prevTasks.slice(1,)), taskData, {key: createRandomKey()}]; // TODO
    });
  };

  // List items shown dynamically
  // TODO: Buggy. Seems to render backwards? Why is a new input being created?
  return tasks.map((task) => (
    <ul key={task.key}>
        {console.log('List passed ' + task.title)}
      <TaskItem
        id={task.key}
        title={task.title}
        onCreateNewTaskItem={createNewTaskItem}
      />
    </ul>
  ));
};

export default List;
