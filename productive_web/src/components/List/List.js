import React, { useState } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";

import TaskItem from "./TaskItem";
import firestore from "../../db";
import { addDoc, collection } from "firebase/firestore";

// Known bugs:
// 1. When new active input is dropped at top of list, "carriage return" pushes that input to 2nd
// 2. Drop is a bit ratchety (e.g. overlap on other element and there's a pause/lower element is moved). Why?

const List = () => {
  // Helpers
  const createRandomKey = () => Math.random().toString();
  const [nextDragId, setNextDragId] = useState(1);

  // Initialize list of tasks to empty task
  const [tasks, setTasks] = useState([
    {
      key: createRandomKey(),
      dragId: 0,
    },
  ]); // TODO: consolidate new task creation. In a hook?

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

  // Trying out firebase
  const ref = collection(firestore, "Tasks");

  const saveTask = async (newTask) => {
    try {
        addDoc(ref, newTask);
    } catch (newTask) {
        console.log('Error saving');
    }
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

    saveTask(taskData);
    setNextDragId((prev) => prev + 1);
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
        <Droppable droppableId="list">
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
