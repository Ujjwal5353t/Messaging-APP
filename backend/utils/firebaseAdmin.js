import { initializeApp, cert, getApps, getApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth"; 
import serviceAccount from "../serviceAccountKey.json" with { type: "json" };

const adminApp = getApps().length
    ? getApp()
    : initializeApp({
          credential: cert(serviceAccount),
      });

export const adminAuth = getAuth(adminApp); 

export default adminApp;