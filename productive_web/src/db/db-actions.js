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
  repeat_kind: null,
  repeat_monthly_dates: [],
  repeat_weekly_days: [],
  repeat_time: null,
  isDone: false,
  isArchived: false,
});

const getAllTasks = async (user = auth.currentUser) => {
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
export const reorder = async (dragId, source, destination) => {
  const { tasks } = await getAllTasks();

  console.log("Source: " + source + ", Dest: " + destination);

  // Set range of the list indices to be changed, as their direction of change
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
      task.data().dragId !== dragId
    ) {
      batch.update(task.ref, { listIndex: task.data().listIndex + inc });
    }
  });

  batch.commit();
};

export const createTeamUp = async (doc, email) => {
  const user = auth.currentUser;
  const requestStore = "Users/" + user.uid + "/Requests";
  await addDoc(collection(db, requestStore), {
    partnerEmail: email,
    taskRef: doc.ref,
  });
};

export const getTeamUpInvites = () => {
  const user = auth.currentUser;
  const inviteStore = "Users/" + user.uid + "/Invites";
  const q = query(collection(db, inviteStore));
  return getDocs(q);
};

export const confirmTeamUp = (invite, taskRef) => {
  console.log("Creating ongoing");
  const user = auth.currentUser;
  const ongoingStore = "Users/" + user.uid + "/Ongoing";
  const newOngoing = doc(collection(db, ongoingStore));

  const batch = writeBatch(db);
  batch.set(newOngoing, {
    confirmer: true,
    taskRef: taskRef,
    partnerEmail: invite.data().partnerEmail,
    partnerRequestId: invite.data().partnerRequestId,
    selfCompletedToday: false, // TODO: actually check
    streak: 0,
    updatedToday: false,
  });

  batch.update(taskRef, {
    teamUpRef: newOngoing,
  });

  batch.delete(invite.ref);

  batch.commit();
};

export const getStreak = async (task) => {
  if (task.data().teamUpRef) {
    const snap = await getDoc(task.data().teamUpRef);
    return snap.empty ? null : snap.data().streak;
  }

  return;
};

export const toggleDone = (doc) => {
  // Update TeamUp doc if it exists
  if (doc.data().teamUpRef)
    updateDoc(doc.data().teamUpRef, { selfCompletedToday: !doc.data().isDone });

  updateDoc(doc.ref, { isDone: !doc.data().isDone });
};

// Migrate anon data to new signed-in user
// TODO: move check for existing user here, to allow more general use of function
export const migrate = async (prevUser, currUser) => {
  // Get previous user's data
  const { tasks } = await getAllTasks(prevUser);

  // Add those tasks to the new user
  const newRef = "Users/" + currUser.uid + "/Tasks";
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
