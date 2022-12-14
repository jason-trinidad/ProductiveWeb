const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();

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
      const responderTeamUpRef = await db
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
      await db.doc(afterData.partnerTeamUpRef.path).update({
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
            const partnerTeamUpDoc = await db
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
              await db.doc(change.after.ref.path).update({
                streak: prevStreak + 1,
                lastStreakUpdate: new Date(),
              });
              await db.doc(afterData.partnerTeamUpRef.path).update({
                streak: prevStreak + 1,
                lastStreakUpdate: new Date(),
              });
            }
          }
        }
      }
    }
  });

// exports.checkStreakCompletion = functions.firestore
//   .document("Users/{userId}/Ongoing/{ongoingId}")
//   .onUpdate(async (change, context) => {
//     const contents = change.after.data();
//     const partnerContents = await db.doc(contents.teamUpRef.path).get();

//     if (contents.lastCompletion && partnerContents.lastCompletion && !contents.updatedToday) {
//         // TODO: try updating ref directly
//         await db.doc(change.after.ref.path).update({
//             streak: contents.streak + 1,
//             updatedToday: true,
//         })

//         await db.doc(contents.teamUpRef.path).update({
//             streak: contents.streak + 1,
//             updatedToday: true,
//         })
//     }
//   });

// exports.handleTeamUp = functions.firestore
//   .document("Users/{userId}/TeamUps/{teamUpId}")
//   .onWrite(async (change, context) => {
//     const originator = await admin.auth().getUser(context.params.userId);
//     const responder = await admin
//       .auth()
//       .getUserByEmail(change.after.data().partnerEmail);

//     // Create unisConfirmed TeamUp doc in responder's directory
//     // TODO: send an email if "responder" is not in DB
//     if (
//       !change.before.exists &&
//       !change.after.data().isConfirmed &&
//       change.after.data().isRequester
//     ) {
//       //   functions.logger.info("Sensed teamUp initiation", {
//       //     structuredData: true,
//       //   });

//       const responderTeamUpRef = await db
//         .collection(`Users/${responder.uid}/TeamUps`)
//         .add({
//           isConfirmed: false,
//           isRequester: false,
//           partnerEmail: originator.email,
//           partnerTeamUpRef: change.after.ref,
//           taskRef: null,
//           lastCompletion: null,
//           streak: null,
//         });

//       await db
//         .doc(change.after.ref)
//         .update({ partnerTeamUpRef: responderTeamUpRef });
//     }
//   });
