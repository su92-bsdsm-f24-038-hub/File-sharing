import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey:"AIzaSyD35aAzNZy7Ptmqojiyj8fzyTm4YK-Svfk",
  authDomain: "file-sharing-c9698.firebaseapp.com",
  projectId: "file-sharing-c9698",
  storageBucket: "file-sharing-c9698.firebasestorage.app",
  messagingSenderId: "1077555764093",
  appId: "1:1077555764093:web:0f1f4d91aaaf39475cca14",
};

let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export const auth: Auth = getAuth(app);
export default app;
