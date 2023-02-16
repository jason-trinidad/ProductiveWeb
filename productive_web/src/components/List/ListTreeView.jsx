import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";

import { addFirstLine } from "../../db/db-actions";

const ListTreeView = (props) => {
  const [taskMap, setTaskMap] = useState(new Map());
  const [taskList, setTaskList] = useState([]); // allows swapping docs without re-ordering
  const [isInitialRender, setIsInitialRender] = useState(true);

  const listDetails = props.listDetails;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const listen = (user) => {
    const ref = collection(db, "Users/" + user.uid + "/Tasks");
    const q = query(
      ref,
      where("isArchived", "==", false),
      where("startTime", ">", today),
    );

    // Invoke listener
    const u = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        console.log("List is empty");
        addFirstLine(user);
      } else {
        console.log("Makin' changes")
        snapshot.docChanges().forEach((change) => {
          switch(change.type) {
            case ("added" || "modified"):
              setTaskMap(prev => prev.set(change.doc.ref.path, change.doc))
              composeList(change.doc);
              break;
            case ("removed"):
              setTaskMap(prev => prev.delete(change.doc.ref.path))
              break;
          }
        });
      }
    });

    return u;
  };

  useEffect(() => {
    if (isInitialRender) {
      setIsInitialRender(false);

      // Listen for auth state changes. If not logged in, log in anonymously
      const u = onAuthStateChanged(auth, (user) => {
        if (user) {
          const unsub = listen(user);
          setUnsub(() => () => unsub());
        }
      });

      setAuthUnsub(() => () => u());
    }

    return () => {
      // Unsubscribe from listeners
      if (unsub !== null) unsub();
      if (authUnsub !== null) authUnsub();
    };
  }, [isInitialRender]);

  const composeList = (doc) => {
    const docDetails = listDetails[doc.ref.path];
    if (taskList.length === 0) {
      setTaskList(prev => prev.push({docSnap: [doc], indents: docDetails.indents}))
      return;
    }

    // Find this doc's corresponding index in the listDetails array
    
    
  }

  // Currently orders list on each snapshot change. Follows listDetails being stored as array in DB (vs object)
  return (
    <div className="list">
      {/* <TopSensor onDrop={handleTopSensorDrop} /> */}
      {taskList.map((task, index) => (
        <TaskItem
          snapshot={task}
          key={task.ref.path}
          index={index}
          data={{ ...task.data() }}
          handleNewChild={handleNewChild}
          handleDropBelow={handleDropBelow}
          handleCarriageReturn={handleCarriageReturn}
          maxIndent={
            index === 0 ? 0 : filterList(taskList)[index - 1].data().indents + 1
          }
        />
      ))}
    </div>
  );
};

export default ListTreeView;
