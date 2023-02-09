import { createSlice } from "@reduxjs/toolkit";

const tasksSlice = createSlice({
  name: "tasks",
  initialState: [],
  reducers: {
    set(state, action) {
      // action.payload.docs.map((doc) => console.log(doc.data()));
      state = action.payload.docs
    }
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
  },
});

export const tasksActions = tasksSlice.actions;

export default tasksSlice;
