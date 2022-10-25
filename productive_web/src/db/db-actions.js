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
  updateDoc,
  deleteDoc,
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

const getAllTasks = async () => {
  const user = auth.currentUser;
  const taskStore = "Users/" + user.uid + "/Tasks";
  const tasksQuery = query(collection(db, taskStore), orderBy("listIndex"));
  const tasks = await getDocs(tasksQuery);

  return { taskStore, tasks };
};

export const addFirstLine = async () => {
  //   const { taskStore, tasks } = await getAllTasks();
  const user = auth.currentUser;
  const taskStore = "Users/" + user.uid + "/Tasks";

  //   console.log("addFirstLine shows db tasks:");
  //   console.log(tasks);
  //   if (tasks.empty) {
  const newTask = doc(collection(db, taskStore));
  await setDoc(newTask, createNewTask());
  //   }
};

// TODO: using batch for offline capability. Better to use transaction?
export const carriageReturn = async (prevDoc, prevTaskData) => {
  const { taskStore, tasks } = await getAllTasks();
  console.log("carriageReturn sees tasks:");
  console.log(tasks);

  // Save prevTask's title
  const batch = writeBatch(db);
  batch.update(prevDoc.ref, { title: prevTaskData.title });

  // Update successive list indexes
  tasks.docs.map((doc) => {
    if (doc.data().listIndex > prevDoc.data().listIndex)
      batch.update(doc.ref, { listIndex: doc.data().listIndex + 1 });
  });

  // Create a doc for the new task
  const newTask = doc(collection(db, taskStore));
  batch.set(newTask, createNewTask("", prevDoc.data().listIndex + 1));

  batch.commit();
};

export const update = (doc, title) => {
  updateDoc(doc.ref, { title: title });
};

export const remove = (doc) => {
  deleteDoc(doc.ref);
};

// TODO: transaction?
export const reorder = async (dragId, source, destination) => {
  const { tasks } = await getAllTasks(); // TODO: cleaner syntax?
  console.log(
    "Type of source: " +
      typeof source +
      ", Type of destination: " +
      typeof destination
  );
  console.log("Source: " + source + ", Destination: " + destination);
  const test = source > destination;
  console.log(test);

  // Set range of the list indices to be changed, as well how they'll be changed
  const start = destination > source ? source : destination;
  const end = destination > source ? destination : source;
  const inc = start === source ? -1 : 1;

  const batch = writeBatch(db);

  // Start by assigning the destination's index to the originating task
  batch.update(tasks.docs[source].ref, { listIndex: destination });

  // Change the list index for tasks between start and end of the change region
  tasks.docs.map((task) => {
    if (
      task.data().listIndex >= start &&
      task.data().listIndex <= end &&
      task.data().dragId != dragId
    ) {
      batch.update(task.ref, { listIndex: task.data().listIndex + inc });
    }
  });

  batch.commit();
};

export const toggleDone = (doc) => {
  updateDoc(doc.ref, { isDone: !doc.data().isDone });
};
