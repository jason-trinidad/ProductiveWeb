import React, { useState } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";

import TaskItem from "./TaskItem";

const List = () => {
  // Helpers
  const createRandomKey = () => Math.random().toString();
  const d = new Date();
  const [nextDragId, setNextDragId] = useState(1);

  //   const createNewTask = () => {
  //     const newTask = {
  //         key: createRandomKey(),
  //         draggableId: lastDraggableId.toString(),
  //     }

  //     setLastDraggableId((prev) => prev + 1) // Updating after in case of async update
  //     console.log(lastDraggableId)
  //     return newTask
  //   }

  // Initialize list of tasks to empty task
  const [tasks, setTasks] = useState([
    {
      key: createRandomKey(),
      dragId: 0,
    },
  ]); // Key included for warning. TODO: fix hack

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
    const newId = nextDragId;

    setTasks((prevTasks) => {
      // Store edited task's title
      const i = updateTitle(taskData);

      // Return list with previous tasks, current task, and new task
      prevTasks.splice(i + 1, 0, {
        key: createRandomKey(),
        dragId: newId,
      });
      return [...prevTasks]; // TODO: inefficient. Better way to make sure refresh occurs?
    });

    setNextDragId((prev) => prev + 1)
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

  const dragEndHandler = (result) => {
    if (!result.destination) return;
    const { source, destination } = result;

    // Update task list
    setTasks((prevTasks) => {
      const [removed] = prevTasks.splice(source.index, 1);
      prevTasks.splice(destination.index, 0, removed);
      return [...prevTasks];
    });
  };

  return (
    <>
      <h2>List</h2>
      <DragDropContext onDragEnd={dragEndHandler}>
        <Droppable droppableId="drop-list">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {tasks.map((task, index) => (
                <ul key={task.key}>
                  <TaskItem
                    id={task.key}
                    draggableId={task.dragId}
                    index={index}
                    title={task.title}
                    onClickOut={updateTitle}
                    onCreateNewTaskItem={createNewTaskItem}
                    onConditionalDelete={conditionalTaskDelete}
                  />
                </ul>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </>
  );
};

export default List;
