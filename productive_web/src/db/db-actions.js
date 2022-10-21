import React from "react";
import { auth, db } from "./db";
import {
  setDoc,
  writeBatch,
  doc,
  collection,
  query,
  orderBy,
  getDocs,
} from "firebase/firestore";

const createRandomKey = () => Math.random().toString();

// New task template
const createNewTask = (title = "", listIndex = 0) => ({
  key: createRandomKey(), //TODO: consider. id from db entry, or keep internal keys?
  dragId: createRandomKey(),
  title: title,
  listIndex: listIndex,
  doOn: null,
  deadline: null,
  repeat_kind: null,
  repeat_monthly_dates: [],
  repeat_weekly_days: [],
  repeat_time: null,
  isDone: false,
  isArchived: false,
});

export const addFirstLine = async () => {
  const user = auth.currentUser;
  const taskStore = "Users/" + user.uid + "/Tasks";
  const tasksQuery = query(collection(db, taskStore), orderBy("listIndex"));

  const querySnapshot = await getDocs(tasksQuery);
  console.log("addFirstLine shows db tasks:");
  console.log(querySnapshot);
  if (querySnapshot.empty) {
    const newTask = doc(collection(db, taskStore));
    await setDoc(newTask, createNewTask());
  }
};

export const carriageReturn = async (prevDoc, prevTaskData) => {
  const user = auth.currentUser;
  const taskStore = "Users/" + user.uid + "/Tasks";
  const tasksQuery = query(collection(db, taskStore), orderBy("listIndex"));

  const tasks = await getDocs(tasksQuery);
  console.log("db-actions.carriageReturn sees the following docs for this user in DB:")
  tasks.docs.map((doc) => console.log(doc.data()));

  // // Save prevTask's title
  // const batch = writeBatch(db);
  // batch.update(prevDoc, {title: prevTaskData.title})

  // // Create a doc for the new task
  // const newTask = doc(collection(db, taskStore));
  // batch.set(newTask, createNewTask({listIndex: prevDoc.data().listIndex + 1}))
};

// carriageReturn(state, action) {
//   // Add new task after current
//   const i = state.findIndex((task) => task.key === action.payload.key);
//   state.splice(i + 1, 0, createNewTask(action.payload.dragId));
// },
// update(state, action) {
//   state.find((task) => task.key === action.payload.key).title =
//     action.payload.title;
// },
// delete(state, action) {
//   const i = state.findIndex((task) => task.key === action.payload.keyToDelete);
//   state.splice(i, 1);
// },
// reorder(state, action) {
//   const [removed] = state.splice(action.payload.source.index, 1);
//   state.splice(action.payload.destination.index, 0, removed);
// },
// append(state, action) {
//   state.push(action.payload ? action.payload : createNewTask());
// },
// toggleDone(state, action) {
//   const i = state.findIndex((task) => task.key === action.payload.toggleKey);
//   state[i].isDone = !state[i].isDone;
// },
// clear(state) {
//   state = [];
// }
