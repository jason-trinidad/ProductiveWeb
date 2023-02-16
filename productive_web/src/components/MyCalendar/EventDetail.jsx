import React, { useEffect, useState } from "react";
import {
  createTeamUp,
  confirmTeamUp,
  getTeamUpInvites,
  schedule,
  getStreak,
} from "../../db/db-actions";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

import "./EventDetail.css";
import WeeklyRepeatUI from "./WeeklyRepeatUI";
import { Popover } from "react-bootstrap";

const EventDetail = (props) => {
  const [invites, setInvites] = useState([]);
  const [streak, setStreak] = useState(null);
  const [isInitialRender, setIsInitialRender] = useState(true);
  const [enteredTitle, setEnteredTitle] = useState(props.docSnap.data().title);

  useEffect(() => {
    if (isInitialRender) {
      setIsInitialRender(false);

      // Get invites, if any
      getTeamUpInvites().then((inviteQSnap) => {
        if (!inviteQSnap.empty) setInvites(inviteQSnap.docs);
      });

      // Save streak to state, if any
      getStreak(props.docSnap).then((streakLength) => {
        if (streakLength !== null) {
          setStreak(streakLength);
        }
      });

      return;
    }
  }, []);

  const handleSubmitTitle = (e) => {
    e.preventDefault();

    props.passFormData({
      title: enteredTitle,
    });
  };

  const getRepeatData = (repeatVal) => {
      props.passFormData({
        repeatKind: "week",
        repeatVal: repeatVal,
      });
  };

  const titleChangeHandler = (e) => {
    setEnteredTitle(e.target.value);
  };

  const handleClick = (e) => {
    e.preventDefault();
    schedule(props.docSnap.ref.path, null, null);
    setStreak(null);
  };

  const handleTeamUpRequest = (e) => {
    e.preventDefault();
    const requestedPartner = e.target.teamUpEmail.value;
    // TODO: require email login to team up

    // Case where user is confirming an invite
    let inviteFound = false;
    invites.forEach((invite) => {
      if (invite.data().partnerEmail === requestedPartner) {
        inviteFound = true;
        confirmTeamUp(invite, props.docSnap);
        return;
      }
    });

    // Otherwise, invite the requested user
    if (!inviteFound) createTeamUp(props.docSnap, requestedPartner);
  };

  return (
    <>
      <Popover.Header>
        <Form onSubmit={handleSubmitTitle}>
          <div style={{ display: "flex" }}>
            <Form.Control value={enteredTitle} onChange={titleChangeHandler} />
            <div>{streak}</div>
          </div>
        </Form>
      </Popover.Header>
      <Popover.Body>
        <WeeklyRepeatUI
          passRepeatData={getRepeatData}
          repSnap={props.repSnap}
          repeatVal={!props.repSnap ? [] : props.repSnap.data().repeatVal}
          startTime={props.docSnap.data().startTime.toDate()}
        />
        <div style={{ border: "10px solid transparent" }}></div>
        <Form onSubmit={handleTeamUpRequest}>
          <input
            id="teamUpEmail"
            list="teamList"
            type="text"
            autoComplete="email"
            pattern="email"
            placeholder="Team-up?"
          />
          <datalist id="teamList">
            {invites.map((invite, i) => (
              <option key={i} value={invite.data().partnerEmail} />
            ))}
          </datalist>
          <Button onClick={handleClick} size="sm">
            Un-Schedule
          </Button>
        </Form>
      </Popover.Body>
    </>
  );
};

export default EventDetail;

// Time input code graveyard
// const [startTimeText, setStartTimeText] = useState({
//   year: startTime.getFullYear().toString(),
//   month: startTime.getMonth().toString(),
//   date: startTime.getDate().toString(),
//   hours: startTime.getHours().toString(),
//   minutes: startTime.getMinutes().toString(),
// });
// const [endTimeText, setEndTimeText] = useState({
//   year: endTime.getFullYear().toString(),
//   month: endTime.getMonth().toString(),
//   date: endTime.getDate().toString(),
//   hours: endTime.getHours().toString(),
//   minutes: endTime.getMinutes().toString(),
// });

// const datetimeFormatter = (dateTextObj) => {
//   return (
//     dateTextObj.year +
//     "-" +
//     checkForLeadingZero((Number(dateTextObj.month) + 1).toString()) +
//     "-" +
//     checkForLeadingZero(dateTextObj.date) +
//     "T" +
//     checkForLeadingZero(dateTextObj.hours) +
//     ":" +
//     checkForLeadingZero(dateTextObj.minutes) +
//     ":00"
//   );
// };

// Format is "YYYY-MM-DDTHH:MM"
// const parseDatetime = (dateStr) => {
//   const dateTimeArr = dateStr.split("T");
//   let dateObj = {};

//   dateTimeArr.forEach((x, i) => {
//     if (i === 0) {
//       const dateArr = x.split("-");
//       dateArr.forEach((y, j) => {
//         switch (j) {
//           case 0:
//             dateObj = { ...dateObj, year: y };
//             break;
//           case 1:
//             dateObj = { ...dateObj, month: (Number(y) - 1).toString() };
//             break;
//           case 2:
//             dateObj = { ...dateObj, date: y };
//             break;
//         }
//       });
//     } else {
//       const timeArr = x.split(":");
//       timeArr.forEach((z, k) => {
//         switch (k) {
//           case 0:
//             dateObj = { ...dateObj, hours: z };
//             break;
//           case 1:
//             dateObj = { ...dateObj, minutes: z };
//             break;
//         }
//       });
//     }
//   });

//   return dateObj;
// };

// const timeChangeHandler = (e) => {
//   const idString = e.target.id;
//   const desiredTime = e.target.value;

//   // Change time to display
//   idString === "start-time"
//     ? setStartTimeText(() => parseDatetime(desiredTime))
//     : setEndTimeText(() => parseDatetime(desiredTime));
// };

// const handleSubmitTime = (e) => {
//   e.preventDefault();

//   props.passFormData({
//     // startTime: new Date(
//     //   startTimeText.year,
//     //   startTimeText.month,
//     //   startTimeText.date,
//     //   startTimeText.hours,
//     //   startTimeText.minutes
//     // ),
//     // endTime: new Date(
//     //   endTimeText.year,
//     //   endTimeText.month,
//     //   endTimeText.date,
//     //   endTimeText.hours,
//     //   endTimeText.minutes
//     // ),
//   });
// };

{
  /* <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Form.Label>Start:</Form.Label>
            <Form.Control
              id="start-time"
              as="input"
              size="sm"
              onChange={timeChangeHandler}
              type="datetime-local"
              step={60 * 5}
              value={datetimeFormatter(startTimeText)}
              // TODO: change min and max to same format as value
              // max={new Date(endTime.getTime() - 5 * 60 * 1000)} // tasks should be > 5 mins long
            />
            <Form.Label>End:</Form.Label>
            <Form.Control
              id="end-time"
              as="input"
              size="sm"
              onChange={timeChangeHandler}
              type="datetime-local"
              step={60 * 5}
              value={datetimeFormatter(endTimeText)}
              // min={new Date(startTime.getTime() + 5 * 60 * 1000)}
            />
          </FormGroup>
        </Form> */
}
