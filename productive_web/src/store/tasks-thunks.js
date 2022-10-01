import {
  getDocs,
  collection,
  query,
  orderBy,
  where,
} from "firebase/firestore";

import db from "../db";
import { tasksActions } from "./tasks-slice";

// From DB
export const fetchTasksFromDb = () => {
  return async (dispatch) => {
    const fetchData = async () => {
      const tasksRef = collection(db, "Tasks"); // Reference to the collection
      const q = query(tasksRef, where("listIndex", ">", -1), orderBy("listIndex")); // Create query

      let dbTasks;
      try {
        dbTasks = await getDocs(q);
      } catch (error) {
        throw new Error('Failed to fetch from DB');
      }

      // Return as list
      if (!dbTasks.empty) {
        const taskList = [];
        dbTasks.forEach((dbTask) => taskList.push(dbTask.data()));
        return taskList;
      }
    };

    try {
      const taskData = await fetchData();
      if (taskData) dispatch(tasksActions.populate(taskData));
    } catch (error) {
      console.log(error); // TODO: notify user
    }
  };
};
