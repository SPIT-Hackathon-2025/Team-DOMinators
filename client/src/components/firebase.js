import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCOAdozeLE2H4gGjg6wVYgcTYJAU9xk4Dg",
  authDomain: "spit-hack-c29e8.firebaseapp.com",
  projectId: "spit-hack-c29e8",
  storageBucket: "spit-hack-c29e8.appspot.com",
  messagingSenderId: "587944777",
  appId: "1:587944777:web:e1903a4af7ec740d65c098"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const saveUserPreference = async (userId, assetId, gameType, enabled) => {
  const userRef = doc(db, "users", userId);
  const userDoc = await getDoc(userRef);

  if (userDoc.exists()) {
    const userData = userDoc.data();
    const preferences = userData.preferences || {};
    preferences[assetId] = { ...preferences[assetId], [gameType]: enabled };
    await setDoc(userRef, { preferences }, { merge: true });
  } else {
    await setDoc(userRef, { preferences: { [assetId]: { [gameType]: enabled } } });
  }
};

export const getUserPreferences = async (userId) => {
  const userRef = doc(db, "users", userId);
  const userDoc = await getDoc(userRef);
  return userDoc.exists() ? userDoc.data().preferences : {};
};

export const getAssetDetails = async (assetId) => {
  const assetRef = doc(db, "assets", assetId);
  const assetDoc = await getDoc(assetRef);
  return assetDoc.exists() ? assetDoc.data() : null;
};

export default app;