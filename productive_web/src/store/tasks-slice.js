import { createSlice } from "@reduxjs/toolkit";

const createRandomKey = () => Math.random().toString();

const createNewTask = (title = "") => ({
  key: createRandomKey(), //TODO: consider. id from db entry, or keep internal keys?
  dragId: createRandomKey(),
  title: title,
  doOn: null,
  deadline: null,
  repeat_kind: null,
  repeat_monthly_dates: [],
  repeat_weekly_days: [],
  repeat_time: null,
  isDone: false,
  isArchived: false,
});

const tasksSlice = createSlice({
  name: "tasks",
  initialState: [],
  reducers: {
    carriageReturn(state, action) {
      // Add new task after current
      const i = state.findIndex((task) => task.key === action.payload.key);
      // console.log('Slice task data:');
      // console.log('Key: ' + action.payload.key + ', Title: ' + action.payload.title);
      state.splice(i + 1, 0, createNewTask(action.payload.dragId));
      // console.log("State after carriage return:");
      // state.map((task) => console.log('Title: ' + task.title + ', dID: ' + task.dragId));
    },
    update(state, action) {
      state.find((task) => task.key === action.payload.key).title =
        action.payload.title;
      // console.log("Updated state:");
      // state.map((task) => console.log('Title: ' + task.title + ', dID: ' + task.dragId));
    },
    delete(state, action) {
      const i = state.findIndex((task) => task.key === action.payload.keyToDelete);
      state.splice(i, 1);
    },
    reorder(state, action) {
      const [removed] = state.splice(action.payload.source.index, 1);
      state.splice(action.payload.destination.index, 0, removed);
    },
    append(state, action) {
      state.push(action.payload ? action.payload : createNewTask());
    },
    toggleDone(state, action) {
      const i = state.findIndex((task) => task.key === action.payload.toggleKey);
      state[i].isDone = !state[i].isDone;
    }
  },
});

export const tasksActions = tasksSlice.actions;

export default tasksSlice;
