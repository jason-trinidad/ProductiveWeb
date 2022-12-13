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
  .document("Users/{userId}/Requests/{requestId}")
  .onCreate(async (snap, context) => {
    const contents = snap.data();

    // functions.logger.info(context, {structuredData: true});

    const partner = await admin.auth().getUserByEmail(contents.partnerEmail);
    const requester = await admin.auth().getUser(context.params.userId);

    db.collection(`Users/${partner.uid}/Invites`).add({
      partnerEmail: requester.email,
      partnerRequestId: context.params.requestId,
    });
  });

exports.confirmTeamUp = functions.firestore
  .document("Users/{userId}/Ongoing/{ongoingId}")
  .onCreate(async (snap, context) => {
    const contents = snap.data();

    if (contents.confirmer) {
      const partner = await admin.auth().getUserByEmail(contents.partnerEmail);
      const confirmer = await admin.auth().getUser(context.params.userId);

      const originalRequest = await db
        .doc(`Users/${partner.uid}/Requests/${contents.partnerRequestId}`)
        .get();

      // Make an "ongoing" team-up in the partner user's directory
      const requesterOngoingRef = await db
        .collection(`Users/${partner.uid}/Ongoing`)
        .add({
          confirmer: false,
          taskRef: originalRequest.data().taskRef,
          partnerOngoingRef: snap.ref,
          partnerEmail: confirmer.email,
          selfCompletedToday: false,
          streak: 0,
          updatedToday: false,
        });

      await db
        .doc(`Users/${confirmer.uid}/Ongoing/${context.ongoingId}`)
        .update({
          confirmer: contents.confirmer,
          taskRef: contents.taskRef,
          partnerOngoingRef: requesterOngoingRef,
          partnerEmail: contents.partnerEmail,
          selfCompletedToday: contents.selfCompletedToday,
          streak: contents.streak,
          updatedToday: false,
        });

      // Connect the requester's task with their new TeamUp doc
      await db.doc(originalRequest.data().taskRef.path).update({
        teamUpRef: requesterOngoingRef,
      });

      // Delete original request
      originalRequest.delete();
    }
  });

exports.checkStreakCompletion = functions.firestore
  .document("Users/{userId}/Ongoing/{ongoingId}")
  .onUpdate(async (change, context) => {
    const contents = change.after.data();
    const partnerContents = await db.doc(contents.teamUpRef.path).get();

    if (contents.selfCompletedToday && partnerContents.selfCompletedToday && !contents.updatedToday) {
        // TODO: try updating ref directly
        await db.doc(change.after.ref.path).update({
            streak: contents.streak + 1,
            updatedToday: true,
        })

        await db.doc(contents.teamUpRef.path).update({
            streak: contents.streak + 1,
            updatedToday: true,
        })
    }
  });
