import { auth, db } from "./db";
import {
  setDoc,
  writeBatch,
  doc,
  collection,
  query,
  orderBy,
  getDocs,
  getDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  where,
} from "firebase/firestore";
import * as settings from "../components/MyCalendar/cal-settings";

// New task template
const createNewTask = (title = "", listIndex = 0, indents = 0) => ({
  title: title,
  listIndex: listIndex,
  startTime: null,
  endTime: null,
  deadline: null,
  isDone: false,
  isArchived: false,
  repeatRef: null,
  indents: indents,
});

// Returns array of all (un-archived) docs in Users/[userId]/Tasks
export const getAllTasks = async () => {
  const user = auth.currentUser;
  const ref = collection(db, "Users/" + user.uid + "/Tasks");
  const q = query(
    ref,
    where("isArchived", "==", false),
    where("listIndex", ">=", 0), // Hack to allow order by listIndex
    orderBy("listIndex"),
    orderBy("startTime"),
  );
  const tasks = await getDocs(q);

  return tasks.docs;
};

// Returns list-sorted array of the earliest instance of every task
export const getNearestTasks = async () => {
  const tasks = await getAllTasks();
  const res = [];

  let lastRep = null;
  tasks.forEach((task) => {
    const curRep = task.data().repeatRef?.path;
    if (curRep === undefined || curRep !== lastRep) {
      res.push(task);
      if (curRep) lastRep = curRep;
    }
  });

  return res;
};

export const addFirstLine = async () => {
  const user = auth.currentUser;
  const taskStore = "Users/" + user.uid + "/Tasks";

  const newTask = doc(collection(db, taskStore));
  await setDoc(newTask, createNewTask());
};

// Create a new task below the originating task
export const carriageReturn = async (prevDoc) => {
  const tasks = getNearestTasks();
  const prevData = prevDoc.data();

  // Save the originating task's title
  let batch = writeBatch(db);
  batch.update(prevDoc.ref, { title: prevData.title });

  // Update succeeding list indices
  for (let i = prevData.listIndex + 1; i < tasks.length; i++) {
    updateAllRepeats(tasks[i], {
      listIndex: tasks[i].data().listIndex + 1,
    });
  }

  // Create a doc for the new task
  const user = auth.currentUser;
  const taskStore = "Users/" + user.uid + "/Tasks";
  const newTask = doc(collection(db, taskStore));
  batch.set(
    newTask,
    createNewTask("", prevData.listIndex + 1, prevData.indents)
  );

  await batch.commit();
};

export const update = (doc, title) => {
  updateDoc(doc.ref, { title: title });
};

// TODO: is there a way to pass WriteBatch so it stays intact?
export const remove = async (toRemove) => {
  await deleteDoc(toRemove.ref);

  const tasks = await getNearestTasks();
  console.log(tasks);

  // Update new list indices

  tasks.forEach((doc, i) => {
    updateAllRepeats(doc, { listIndex: i });
  });
};

// Note: `tasks` will be mutated!
// TODO why is function not waiting for updateAllRepeats?
export const reorder = (tasks, source, lastChild, dest) => {
  // Extract source and children from tasks
  const numToMove = lastChild - source + 1;
  const sourceAndChildren = tasks.splice(source, numToMove);

  // Add source and children back to tasks below the targeted task
  const finalDest = source > dest ? dest : dest - numToMove;
  tasks.splice(finalDest + 1, 0, ...sourceAndChildren);

  // Save new indices
  tasks.forEach((task, index) => updateAllRepeats(task, { listIndex: index }));
};

export const createTeamUp = async (doc, email) => {
  const user = auth.currentUser;
  const requestStore = "Users/" + user.uid + "/TeamUps";
  const teamUpRef = await addDoc(collection(db, requestStore), {
    isConfirmed: false,
    isRequester: true,
    partnerEmail: email,
    partnerTeamUpRef: null,
    taskRef: doc.ref,
    lastCompletion: doc.data().isDone ? new Date() : null,
    streak: null,
    lastStreakUpdate: null,
  });

  updateDoc(doc.ref, { teamUpRef: teamUpRef });
};

export const getTeamUpInvites = () => {
  const user = auth.currentUser;
  const teamUpStore = "Users/" + user.uid + "/TeamUps";
  const q = query(
    collection(db, teamUpStore),
    where("isConfirmed", "==", false),
    where("isRequester", "==", false)
  );
  return getDocs(q);
};

export const confirmTeamUp = async (invite, task) => {
  await updateDoc(invite.ref, {
    isConfirmed: true,
    streak: 0,
    taskRef: task.ref,
  });
  await updateDoc(task.ref, { teamUpRef: invite.ref });
};

export const getStreak = async (task) => {
  if (task.data().teamUpRef) {
    const snap = await getDoc(task.data().teamUpRef);
    return snap.data().streak;
  }

  return;
};

export const toggleDone = (doc) => {
  // Update TeamUp if relevant
  if (doc.data().teamUpRef) {
    if (!doc.data().isDone) {
      updateDoc(doc.data().teamUpRef, {
        lastCompletion: new Date(),
      });
    }
  }

  updateDoc(doc.ref, { isDone: !doc.data().isDone });
};

// Migrate anon data to new signed-in user
export const migrate = async (user, tasks) => {
  const newRef = "Users/" + user.uid + "/Tasks";
  tasks.map(async (task) => await addDoc(collection(db, newRef), task.data()));
};

export const schedule = async (
  docPath,
  startTime,
  endTime = null,
  title = null
) => {
  // Get the task in question from DB
  const docRef = doc(db, docPath);
  const snapshot = await getDoc(docRef);

  // If no end time provided, assume event should end after default duration
  if (startTime && !endTime) {
    endTime = new Date(
      startTime.getTime() + settings.defaultDuration * 60 * 1000
    );
  }

  if (!title) {
    title = snapshot.data().title;
  }

  await updateDoc(snapshot.ref, {
    title: title,
    startTime: startTime,
    endTime: endTime,
  });
};

export const scheduleRepeat = async (task, repeatInfo) => {
  // If repeat exists, do nothing (pending re-schedule implementation)
  if (task.data().repeatRef !== null) {
    return;
    // await updateDoc(task.data().repeatRef, {
    //   repeatKind: repeatInfo.repeatKind,
    //   repeatVal: repeatInfo.repeatVal,
    //   repeatStart: task.data().startTime,
    //   taskToClone: task.ref,
    // });
  } else {
    const user = auth.currentUser;
    const repeatStore = "Users/" + user.uid + "/Repeats";
    const repeats = collection(db, repeatStore);

    const newRepeat = await addDoc(repeats, {
      repeatKind: repeatInfo.repeatKind,
      repeatVal: repeatInfo.repeatVal,
      repeatStartMSecs: task.data().startTime.toDate().getTime(),
      taskToClone: task.ref,
    });
    await updateDoc(task.ref, {
      repeatRef: newRepeat,
    });
  }
};

export const recordDate = async (date) => {
  const user = auth.currentUser;
  const dateStore = "Users/" + user.uid + "/Dates";
  const ref = collection(db, dateStore);
  const q = query(ref, where("dateMSecs", "==", date.getTime()));
  const dateDocs = await getDocs(q);

  if (dateDocs.empty) {
    await addDoc(ref, {
      date: date,
      dateMSecs: date.getTime(),
      repeatRefs: [],
    });
  }
};

export const dltDoc = (docRef) => deleteDoc(docRef);

// Generic function to update every non-archived instance of a repeated task with
export const updateAllRepeats = async (taskDoc, newProps) => {
  let tasks = [];

  // Get the task's repeats, if necessary
  if (taskDoc.data().repeatRef === null) {
    tasks.push(taskDoc);
  } else {
    const user = auth.currentUser;
    const taskStore = "Users/" + user.uid + "/Tasks";
    const q = query(
      collection(db, taskStore),
      where("repeatRef", "==", taskDoc.data().repeatRef)
    );

    const res = await getDocs(q);
    tasks = res.docs;
  }

  // Update each task
  tasks.forEach(async (task) => {
    await updateDoc(task.ref, newProps);
  });
};

export const orderBelow = async (tasks, source, dest, isChild) => {
  // Find dropped task's children and adjust indents
  const sourceOGIndents = tasks[source].data().indents;
  const indentChange =
    tasks[dest].data().indents - sourceOGIndents + (isChild ? 1 : 0);
  let lastChildIndex;

  for (let i = source; i < tasks.length; i++) {
    if (i !== source && tasks[i].data().indents <= sourceOGIndents) break; // Returned to parent level

    // Update indents, including any repeats
    const newIndents = tasks[i].data().indents + indentChange;
    await updateAllRepeats(tasks[i], { indents: newIndents });

    // Store last child's index for re-ordering
    lastChildIndex = i;
  }

  reorder(tasks, source, lastChildIndex, dest);
};

export const indent = async (docSnap, increment) => {
  await updateDoc(docSnap.ref, {
    indents: docSnap.data().indents + increment,
  });
};

export const toggleArchived = async (docSnap) => {
  await updateDoc(docSnap.ref, { isArchived: !docSnap.data().isArchived })
};
