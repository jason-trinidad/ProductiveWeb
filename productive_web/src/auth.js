import { collection, getDocs, query } from "firebase/firestore";
import { auth, db } from "./db/db";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { migrate } from "./db/db-actions";

const firstTimeLogin = async (uid) => {
  const taskPath = "Users/" + uid + "/Tasks"
  const q = query(collection(db, taskPath));
  const res = await getDocs(q);
  return res.empty
};

export const signInWithGoogle = async () => {
  const prevUser = auth.currentUser;

  const provider = new GoogleAuthProvider();

  signInWithPopup(auth, provider)
    .then(async (result) => {
        // If first time Google login, copy anonymous data to Google login. TODO: delete anon account using cloud function
        try {
            if (await firstTimeLogin(result.user.uid) && prevUser.isAnonymous) {
                migrate(prevUser, result.user)
            };
        } catch (error) {
            console.log(error)
        }
    })
    .catch((error) => {
      console.log(error)
    });
};
