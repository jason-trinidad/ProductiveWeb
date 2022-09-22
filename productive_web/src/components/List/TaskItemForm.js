import React, {useState} from 'react'

const TaskItemForm = (props) => {
    // console.log('TaskItemForm.js');
    const [enteredTitle, setEnteredTitle] = useState('');
    
    // TODO - add:
    // Edit
    // Delete
    // Indents
    // Do at
    // Deadline
    // Undo?
    // Keyboard shortcuts

    const titleChangeHandler = (event) => {
        setEnteredTitle(event.target.value)
    };
    
    const submitHandler = (event) => {
        event.preventDefault();
    
        const taskData = {
            key: Math.random().toString(),
            title: enteredTitle,
        };
        
        // "Carriage return"
        props.onCreateNewTaskItem(taskData)
    };

    return (
        // Should each of these be a separate form? Or should I do multiple inputs for one form?
        <form onSubmit={submitHandler}>
            {/* Why do we have to do this for every change? */}
            <input type='text' value={enteredTitle} onChange={titleChangeHandler} />
        </form>
    )
}

export default TaskItemForm;