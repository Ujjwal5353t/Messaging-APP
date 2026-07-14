import axios from "axios";
import { signInWithPopup } from "firebase/auth";
import { generateKeys } from "./localSignup";
import { auth, googleProvider , twitterProvider } from "@/lib/firebase";
import { authApi } from "../lib/api";

async function savePriKey(priKey, userId) {
    const electronAPI = window.electronAPI;
    if (electronAPI?.savePrivateKey && userId) {
      const electronResponse = await electronAPI.savePrivateKey(JSON.stringify(priKey), userId);

      // Catch the returned error payload from the Main process catch block
      if (!electronResponse || !electronResponse.success) {
        const errorMsg = electronResponse?.error || "Unknown error";
        alert(`❌ Electron Failed to Save Key: ${errorMsg}`);
        throw new Error(`Vault Error: ${errorMsg}`);
      }

      console.log("Key saved successfully through safeStorage");
    } else {
      alert("⚠️ Electron bridge window.electronAPI is missing or userId is missing!");
    }
}

export async function googleAuthLogin() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const idToken = await result.user.getIdToken();


        const data = await authApi.oauthLogin( { idToken , provider :"google"});

        if (data?.action === "login") {
            return { success: true };
        }

        if (data?.action === "require_encryption_keys") {
            const { pubKey , priKey } = await generateKeys();
            const publicKey = pubKey.x;
            
            console.log("public key sending :", publicKey);
            
            const signupRes = await authApi.oauthSignup( { 
                idToken, 
                publicKey,
                provider : "google" 
            }); 
            const userId = signupRes.userId || signupRes.data?.userId;
            await savePriKey(priKey, userId)

            return { success: true };
        }

        return { success: false, message: "Unknown authentication state" };

    } catch (err) {
        throw err;
    }
}


export async function twitterAuthLogin() {
    try {
        const result = await signInWithPopup(auth, twitterProvider);
        const idToken = await result.user.getIdToken();
        
        console.log("1. Firebase Popup Successful. Token obtained.");

        const data = await authApi.oauthLogin( { 
            idToken, 
            provider: "twitter" 
        });
        
        console.log("2. Backend response data:", data);

        if (data?.action === "login") {
            return { success: true };
        }

        if (data?.action === "require_encryption_keys") {
            const { pubKey , priKey } = await generateKeys();
            const publicKey = pubKey.x;

            console.log("key : " , publicKey);
            
            const signupRes = await authApi.oauthSignup( { 
                idToken, 
                publicKey,
                provider: "twitter"
            }); 
            const userId = signupRes.userId || signupRes.data?.userId;
            await savePriKey(priKey, userId)
            return { success: true };
        }
        
        return { success: false, message: "Unknown authentication state" };
    } catch (err) {
        // Instead of throwing the error blind, return it structured as an object
        console.error("❌ CRITICAL EXCEPTION INSIDE FUNCTION:", err);
        
        return { 
            success: false, 
            message: err.message, 
            backendError: err.response?.data // Captures custom backend error bodies if Axios rejected it
        };
    }
}

