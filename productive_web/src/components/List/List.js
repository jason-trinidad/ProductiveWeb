import React, { useState } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { useDispatch, useSelector } from "react-redux";
import db from "../../db";
import { addDoc, collection } from "firebase/firestore";

import TaskItem from "./TaskItem";
import { tasksActions } from "../../store/tasks-slice";

// Known bugs:
// 1. Drop is a bit ratchety (e.g. overlap on other element and there's a pause/lower element is moved).
//       [I think this is due to some padding list items have that placeholder does not.]

const List = () => {
  const [nextDragId, setNextDragId] = useState(1);
  const dispatch = useDispatch();
  const taskList = useSelector((state) => state.tasks);

  // Trying out firebase
  const ref = collection(db, "Tasks");

  const createTaskInDB = async (newTask) => {
    try {
      addDoc(ref, newTask);
    } catch (error) {
      console.log("Error saving");
    }
  };

  // Add submitted task to list, create new task
  const carriageReturn = (taskData) => {

    const mixedData = {
      ...taskData,
      dragId: nextDragId,
    };

    // Update store with title of current TaskItem, then create a new one
    dispatch(tasksActions.update(taskData));
    dispatch(tasksActions.carriageReturn(mixedData));

    setNextDragId((prev) => prev + 1);
    // const listIndex = taskList.findIndex((task) => task.key === taskData.key);
    // createTaskInDB({ ...taskData, listIndex });
  };

  // Delete a task from the list if not the sole remaining task
  const conditionalTaskDelete = (keyToDelete) => {
    if (taskList.length > 1) {
      dispatch(tasksActions.delete({ keyToDelete }));
    }
  };

  const dragEndHandler = (result) => {
    if (!result.destination) return; // TODO: would bang-less syntax work?
    dispatch(tasksActions.reorder(result));
  };

  return (
    <>
      <h2>List</h2>
      <DragDropContext onDragEnd={dragEndHandler}>
        <Droppable droppableId="list">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {taskList.map((task, index) => (
                <ul key={task.key}>
                  <TaskItem
                    id={task.key}
                    draggableId={task.dragId}
                    index={index}
                    title={task.title}
                    onCarriageReturn={carriageReturn}
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
