import { initializeApp } from "firebase/app";
import { browserLocalPersistence, connectAuthEmulator, getAuth, setPersistence } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";

/* Local testing against the Firebase emulators (never production):
   VITE_EMULATORS=1 VITE_FIREBASE_PROJECT=demo-alke-e2e npm run dev */
const EMULATORS = import.meta.env.VITE_EMULATORS === "1";

/* The shared Alkebuleum / Nuru Firebase project (amid-7592b). ALKÉ members
   are Nuru people: the same accounts, the same `nuru_people` listing.
   This is the public web config (safe to ship); access is enforced by
   Firestore rules and the Cloud Functions. Sign-in pop-ups run on nuru.si,
   which hosts the auth handler for this project. */
const config = {
  apiKey: "AIzaSyDSHwlWQ06WDah-pmzBukRSJAqTm-AwyVk",
  appId: "1:301918770506:web:ecc9d6ac102a030c6b1db3",
  messagingSenderId: "301918770506",
  projectId: EMULATORS ? import.meta.env.VITE_FIREBASE_PROJECT || "demo-alke-e2e" : "amid-7592b",
  authDomain: "nuru.si",
  storageBucket: "amid-7592b.firebasestorage.app",
};

export const app = initializeApp(config);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app, "us-central1");

if (EMULATORS) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);
}

setPersistence(auth, browserLocalPersistence).catch(() => {
  /* falls back to Firebase's default persistence */
});
