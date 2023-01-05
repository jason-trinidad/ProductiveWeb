const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const fs = admin.firestore();

// // Create and deploy your first functions
// // https://firebase.google.com/docs/functions/get-started
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

exports.requestTeamUp = functions.firestore
  .document("Users/{userId}/TeamUps/{teamUpId}")
  .onCreate(async (snap, context) => {
    const contents = snap.data();

    const originator = await admin.auth().getUser(context.params.userId);
    const responder = await admin.auth().getUserByEmail(contents.partnerEmail);

    if (contents.isRequester) {
      const responderTeamUpRef = await fs
        .collection(`Users/${responder.uid}/TeamUps`)
        .add({
          isConfirmed: false,
          isRequester: false,
          partnerEmail: originator.email,
          partnerTeamUpRef: snap.ref,
          taskRef: null,
          lastCompletion: null,
          streak: null,
          lastStreakUpdate: null,
        });
    }
  });

exports.handleTeamUp = functions.firestore
  .document("Users/{userId}/TeamUps/{teamUpId}")
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();

    // On team up confirmation, update requester TeamUp doc
    if (
      !afterData.isRequester &&
      !beforeData.isConfirmed &&
      afterData.isConfirmed
    ) {
      await fs.doc(afterData.partnerTeamUpRef.path).update({
        isConfirmed: true,
        partnerTeamUpRef: change.after.ref,
        streak: 0,
      });
    }

    // Handle streak completion. Nested conditions to avoid unecessary function/API calls
    if (afterData.isConfirmed) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      let lastStreakUpdate;
      if (afterData.lastStreakUpdate === null) {
        lastStreakUpdate = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      } else {
        lastStreakUpdate = afterData.lastStreakUpdate.toDate();
      }

      if (lastStreakUpdate < today.getTime()) {
        if (afterData.lastCompletion !== null) {
          const lastCompletionDate = new Date( // TODO: locale strings may work for this. Unsure about time zones
            afterData.lastCompletion.toDate().getFullYear(),
            afterData.lastCompletion.toDate().getMonth(),
            afterData.lastCompletion.toDate().getDate()
          );
          if (lastCompletionDate.getTime() === today.getTime()) {
            const partnerTeamUpDoc = await fs
              .doc(afterData.partnerTeamUpRef.path)
              .get();
            if (partnerTeamUpDoc.data().lastCompletion === null) return;
            const partnerLastCompletionDate = new Date(
              partnerTeamUpDoc.data().lastCompletion.toDate().getFullYear(),
              partnerTeamUpDoc.data().lastCompletion.toDate().getMonth(),
              partnerTeamUpDoc.data().lastCompletion.toDate().getDate()
            );
            if (partnerLastCompletionDate.getTime() === today.getTime()) {
              const prevStreak = afterData.streak;
              await fs.doc(change.after.ref.path).update({
                streak: prevStreak + 1,
                lastStreakUpdate: new Date(),
              });
              await fs.doc(afterData.partnerTeamUpRef.path).update({
                streak: prevStreak + 1,
                lastStreakUpdate: new Date(),
              });
            }
          }
        }
      }
    }
  });

// Done via function vs Day due to listener execution order
// Create repeated instances of tasks for qualifying, existing dates
exports.createRepeatInstances = functions.firestore
  .document("/Users/{userId}/Repeats/{repeatId}")
  .onCreate(async (snap, context) => {
    const repeat = { ...snap.data() };
    // Query for relevant dates
    const dateStore = "Users/" + context.params.userId + "/Dates";
    const dates = await fs
      .collection(dateStore)
      .where("dateMSecs", ">", snap.data().repeatStartMSecs)
      .get();

    // Check relevant dates to see if task has been created for this repeat.
    dates.forEach(async (x) => {
      const dateData = { ...x.data() };
      const jsDate = dateData.date.toDate();

      // If date is eligible for a repeated task, and this repeat has not yet been fulfilled, create a new task
      if (
        repeat.repeatVal.includes(jsDate.getDay() + 1) &&
        !dateData.repeatRefs.includes(snap.ref)
      ) {

        // Create the new (repeated) task
        const donorSnap = await fs.doc(repeat.taskToClone.path).get();
        const donor = { ...donorSnap.data() };
        await fs.collection(`Users/${context.params.userId}/Tasks`).add({
          ...donor,
          startTime: new Date(
            jsDate.getFullYear(),
            jsDate.getMonth(),
            jsDate.getDate(),
            donor.startTime.toDate().getHours(),
            donor.startTime.toDate().getMinutes()
          ),
          endTime: new Date(
            jsDate.getFullYear(),
            jsDate.getMonth(),
            jsDate.getDate(),
            donor.endTime.toDate().getHours(),
            donor.endTime.toDate().getMinutes()
          ),
          isDone: false,
          isArchived: false,
        });

        // Record repeat fulfillment in date doc
        await fs
          .doc(x.ref.path)
          .update({ repeatRefs: [...dateData.repeatRefs, snap.ref] });
      }
    });
  });

// Done via function vs Day due to listener execution order
// Create repeated instances of tasks for new dates
exports.createRepeatsOnNewDate = functions.firestore
  .document("/Users/{userId}/Dates/{dateId}")
  .onCreate(async (snap, context) => {
    const dateData = { ...snap.data() };
    const jsDate = dateData.date.toDate();
    
    // Query for relevant repeats
    const repeatStore = "Users/" + context.params.userId + "/Repeats";
    const repeats = await fs
      .collection(repeatStore)
      .where("repeatStartMSecs", "<", dateData.dateMSecs)
      .where("repeatVal", "array-contains", jsDate.getDay() + 1)
      .get();

    // If a repeat has not been copied, make a new instance
    repeats.forEach(async (repeat) => {
      if (!dateData.repeatRefs.includes(repeat.ref)) {
        // Create the new (repeated) task
        const donorSnap = await fs.doc(repeat.data().taskToClone.path).get();
        const donor = { ...donorSnap.data() };
        await fs.collection(`Users/${context.params.userId}/Tasks`).add({
          ...donor,
          startTime: new Date(
            jsDate.getFullYear(),
            jsDate.getMonth(),
            jsDate.getDate(),
            donor.startTime.toDate().getHours(),
            donor.startTime.toDate().getMinutes()
          ),
          endTime: new Date(
            jsDate.getFullYear(),
            jsDate.getMonth(),
            jsDate.getDate(),
            donor.endTime.toDate().getHours(),
            donor.endTime.toDate().getMinutes()
          ),
          isDone: false,
          isArchived: false,
        });

        // Record repeat fulfillment in date doc
        await fs
          .doc(snap.ref.path)
          .update({ repeatRefs: [...dateData.repeatRefs, snap.ref] });
      }
    });
  });
