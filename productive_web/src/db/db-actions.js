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

const createRandomKey = () => Math.random().toString();

// New task template
const createNewTask = (title = "", listIndex = 0) => ({
  key: createRandomKey(), //TODO: consider. id from db entry, or keep internal keys?
  dragId: createRandomKey(),
  title: title,
  listIndex: listIndex,
  startTime: null,
  endTime: null,
  deadline: null,
  isDone: false,
  isArchived: false,
  repeatRef: null,
});

export const getAllTasks = async (user = auth.currentUser) => {
  const taskStore = "Users/" + user.uid + "/Tasks";
  const tasksQuery = query(collection(db, taskStore), orderBy("listIndex"));
  const tasks = await getDocs(tasksQuery);

  return { taskStore, tasks };
};

export const addFirstLine = async () => {
  const user = auth.currentUser;
  const taskStore = "Users/" + user.uid + "/Tasks";

  const newTask = doc(collection(db, taskStore));
  await setDoc(newTask, createNewTask());
};

// TODO: using batch for offline capability. Better to use transaction?
export const carriageReturn = async (prevDoc, prevTaskData) => {
  const { taskStore, tasks } = await getAllTasks();

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

// TODO: check if last item in collection! Rn someone could hold delete on first/only line and cause a bunch of pings
// TODO: re-think ordering scheme so we can order by on server AND avoid iteration on client
export const remove = async (toRemove) => {
  await deleteDoc(toRemove.ref);

  const { taskStore, tasks } = await getAllTasks();

  // Update new list indices
  const batch = writeBatch(db);

  tasks.docs.forEach((doc, i) => {
    batch.update(doc.ref, { listIndex: i });
  });

  batch.commit();
};

// TODO: transaction?
export const reorder = (tasks, dragId, source, destination) => {
  tasks.forEach((task) => console.log(task.data()))
  // Set range of the list indices to be changed and their direction of change
  const start = destination > source ? source : destination;
  const end = destination > source ? destination : source;
  const inc = start === source ? -1 : 1;

  const batch = writeBatch(db);

  // Start by assigning the destination's index to the originating task
  batch.update(tasks[source].ref, { listIndex: destination });

  // Change the list index for tasks between start and end of the change region
  tasks.map((task) => {
    if (
      task.data().listIndex >= start &&
      task.data().listIndex <= end &&
      task.data().dragId !== dragId
    ) {
      batch.update(task.ref, { listIndex: task.data().listIndex + inc });
    }
  });

  batch.commit();
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
// TODO: move check for existing user here, to allow more general use of function
export const migrate = async (user, tasks) => {
  const newRef = "Users/" + user.uid + "/Tasks";
  tasks.docs.map(
    async (task) => await addDoc(collection(db, newRef), task.data())
  );
};

// TODO: fix this dragId stuff
export const schedule = async (
  dragId,
  startTime,
  endTime = null,
  title = null
) => {
  // Query to find docRef from dragId
  const user = auth.currentUser;
  const taskStore = "Users/" + user.uid + "/Tasks";
  const q = query(collection(db, taskStore), where("dragId", "==", dragId));
  const snapshot = await getDocs(q);

  // If no end time provided, assume event should end after default duration
  if (startTime && !endTime) {
    endTime = new Date(
      startTime.getTime() + settings.defaultDuration * 60 * 1000
    );
  }

  if (!title) {
    title = snapshot.docs[0].data().title;
  }

  await updateDoc(snapshot.docs[0].ref, {
    title: title,
    startTime: startTime,
    endTime: endTime,
  });
};

// Purpose of creating repeat docs is to have smaller pool to query for repeat purposes
export const scheduleRepeat = async (task, repeatInfo) => {
  // If repeat exists, update it
  if (task.data().repeatRef !== null) {
    await updateDoc(task.data().repeatRef, {
      repeatKind: repeatInfo.repeatKind,
      repeatVal: repeatInfo.repeatVal,
      repeatStart: task.data().startTime,
      taskToClone: task.ref,
    });
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
