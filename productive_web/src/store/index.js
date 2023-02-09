import { configureStore } from '@reduxjs/toolkit';

import tasksSlice from './tasks-slice';

// See if bringing back redux can fix this BSSSSSS
const store = configureStore({
  reducer: { tasks: tasksSlice.reducer },
});

export default store;