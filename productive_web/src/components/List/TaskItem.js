import React from 'react'

import TaskItemForm from './TaskItemForm'

const TaskItem = (props) => {
    // console.log('TaskItem.js');
    // "Carriage return"
    const createNewTaskItemHandler = (taskData) => {
        props.onCreateNewTaskItem(taskData) // When do we name things "on" exactly?
    };

    return (
        <li>
            <TaskItemForm  onCreateNewTaskItem={createNewTaskItemHandler} />
        </li>
    )
};

export default TaskItem;