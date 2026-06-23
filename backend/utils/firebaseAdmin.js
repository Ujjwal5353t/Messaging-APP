import { initializeApp, cert, getApps, getApp } from "firebase-admin/app";
import serviceAccount from "../serviceAccountKey.json" with { type: "json" };

const adminApp = getApps().length
    ? getApp()
    : initializeApp({
          credential: cert(serviceAccount),
      });

export default adminApp;