import React, {useState} from "react";

import TaskItem from './TaskItem'
import TaskItemForm from "./TaskItemForm";

const List = () => {
    console.log('List.js');
    const createNewTask = [
        {
        key: Math.random().toString(),
        title: '',
        },
    ];
    
    // Initialize list of tasks to empty task
    const [tasks, setTasks] = useState(createNewTask);
    
    // Add submitted task to list, create new task
    const createNewTaskItem = (taskData) => {
        console.log(tasks);
        setTasks((prevTasks) => {
            return [...prevTasks, taskData];
        });
    };

    console.log(tasks);

  // List items shown dynamically
  // TODO: Buggy. Seems to render backwards? Why is a new input being created?
  return tasks.map((task) => (
    <ul key={task.key}>
      <TaskItem key={task.key} value={task.title} onCreateNewTaskItem={createNewTaskItem} />
    </ul>
  ));
};

export default List;