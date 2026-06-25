import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider , TwitterAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDpawBBWa5cMvGaVNmGK-bB4hZBZnsJPLM",
  authDomain: "chatting-app-61a2d.firebaseapp.com",
  projectId: "chatting-app-61a2d",
  storageBucket: "chatting-app-61a2d.firebasestorage.app",
  messagingSenderId: "838693487717",
  appId: "1:838693487717:web:f805d78c75efb3398ab28c",
  measurementId: "G-WBMLZEH8N4"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const twitterProvider = new TwitterAuthProvider();