import React, { useEffect, useState } from "react";
import {
  createTeamUp,
  confirmTeamUp,
  getTeamUpInvites,
  schedule,
  getStreak,
} from "../../db/db-actions";

import "./EventDetail.css";

const EventDetail = (props) => {
  const [invites, setInvites] = useState([]);
  const [streak, setStreak] = useState(null);

  const startTime = props.docSnap.data().startTime.toDate();
  const endTime = props.docSnap.data().endTime.toDate();

  const [isInitialRender, setIsInitialRender] = useState(true);
  const [enteredTitle, setEnteredTitle] = useState(props.docSnap.data().title);
  const [startTimeText, setStartTimeText] = useState({
    year: startTime.getFullYear().toString(),
    month: startTime.getMonth().toString(),
    date: startTime.getDate().toString(),
    hours: startTime.getHours().toString(),
    minutes: startTime.getMinutes().toString(),
  });
  const [endTimeText, setEndTimeText] = useState({
    year: endTime.getFullYear().toString(),
    month: endTime.getMonth().toString(),
    date: endTime.getDate().toString(),
    hours: endTime.getHours().toString(),
    minutes: endTime.getMinutes().toString(),
  });

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

    props.passFormData({
      startTime: new Date(
        startTimeText.year,
        startTimeText.month,
        startTimeText.date,
        startTimeText.hours,
        startTimeText.minutes
      ),
      endTime: new Date(
        endTimeText.year,
        endTimeText.month,
        endTimeText.date,
        endTimeText.hours,
        endTimeText.minutes
      ),
      title: enteredTitle,
    });
  }, [enteredTitle, startTimeText, endTimeText]);

  const titleChangeHandler = (e) => {
    setEnteredTitle(e.target.value);
  };

  const timeChangeHandler = (e) => {
    const splitIdString = e.target.id.split("/");
    const desiredTime = e.target.value;

    let textSetter;
    splitIdString[0] === "start"
      ? (textSetter = setStartTimeText)
      : (textSetter = setEndTimeText);

    switch (splitIdString[1]) {
      case "year":
        textSetter((prev) => ({
          ...prev,
          year: desiredTime,
        }));
        break;
      case "month":
        textSetter((prev) => ({
          ...prev,
          month: desiredTime,
        }));
        break;
      case "date":
        textSetter((prev) => ({
          ...prev,
          date: desiredTime,
        }));
        break;
      case "hours":
        textSetter((prev) => ({
          ...prev,
          hours: desiredTime,
        }));
        break;
      case "minutes":
        textSetter((prev) => ({
          ...prev,
          minutes: desiredTime,
        }));
        break;
    }
  };

  // TODO: reset TeamUp, streak and rename function
  const handleClick = (e) => {
    e.preventDefault();
    schedule(props.docSnap.data().dragId, null, null);
    setStreak(null);
  };

  const handleTeamUpRequest = (e) => {
    e.preventDefault();
    const requestedPartner = e.target.teamUpEmail.value;
    // TODO: require email login to team up

    // Case where user is confirming an invite
    let inviteFound = false;
    invites.forEach((invite) => {
      console.log("Checking invites");
      if (invite.data().partnerEmail === requestedPartner) {
        console.log("Found match");
        inviteFound = true;
        confirmTeamUp(invite, props.docSnap);
        return;
      }
    });

    // TODO: validate inputted address
    // Otherwise, invite the requested user
    if (!inviteFound) createTeamUp(props.docSnap, requestedPartner);
  };

  //   const handleInviteList = () => {
  //     // Save invites to state, if any
  //     getTeamUpInvites().then((inviteQSnap) => {
  //         if (!inviteQSnap.empty) setInvites(inviteQSnap.docs);
  //       });
  //   }

  return (
    <>
      <div style={{ display: "flex" }}>
        <form>
          <input value={enteredTitle} onChange={titleChangeHandler} />
        </form>
        {/* {streak ? <div>{streak}</div> : null} */}
        <div>{streak}</div>
      </div>
      <form>
        <div className="time-container">
          <input
            id="start/month"
            type="text"
            onChange={timeChangeHandler}
            value={Number(startTimeText.month) + 1}
          />
          <input
            id="start/date"
            type="text"
            onChange={timeChangeHandler}
            value={startTimeText.date}
          />
          <input
            id="start/year"
            type="text"
            onChange={timeChangeHandler}
            style={{ width: "4em" }}
            value={startTimeText.year}
          />
          <input
            id="start/hours"
            type="text"
            onChange={timeChangeHandler}
            value={startTimeText.hours}
          />
          <input
            id="start/minutes"
            type="text"
            onChange={timeChangeHandler}
            value={startTimeText.minutes}
          />
        </div>
        <div className="time-container">
          <input
            id="end/month"
            type="text"
            onChange={timeChangeHandler}
            value={Number(endTimeText.month) + 1}
          />
          <input
            id="end/date"
            type="text"
            onChange={timeChangeHandler}
            value={endTimeText.date}
          />
          <input
            id="end/year"
            type="text"
            onChange={timeChangeHandler}
            style={{ width: "4em" }}
            value={endTimeText.year}
          />
          <input
            id="end/hours"
            type="text"
            onChange={timeChangeHandler}
            value={endTimeText.hours}
          />
          <input
            id="end/minutes"
            type="text"
            onChange={timeChangeHandler}
            value={endTimeText.minutes}
          />
        </div>
      </form>
      <form onSubmit={handleTeamUpRequest}>
        <input
          id="teamUpEmail"
          list="teamList"
          type="text"
          autoComplete="email"
          placeholder="Team-up?"
          //   onFocus={handleInviteList}
        />
        <datalist id="teamList">
          {invites.map((invite, i) => (
            <option key={i} value={invite.data().partnerEmail} />
          ))}
        </datalist>
      </form>
      <button onClick={handleClick}>Un-Schedule</button>
    </>
  );
};

export default EventDetail;
