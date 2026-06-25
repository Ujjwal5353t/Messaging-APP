import axios from "axios";
import { signInWithPopup } from "firebase/auth";
import { generateKeys } from "./localSignup";
import { auth, googleProvider , twitterProvider } from "@/lib/firebase";

async function savePriKey(priKey) {
    const electronAPI = window.electronAPI;
    if (electronAPI?.savePrivateKey) {
      const electronResponse = await electronAPI.savePrivateKey(JSON.stringify(priKey));

      // Catch the returned error payload from the Main process catch block
      if (!electronResponse || !electronResponse.success) {
        const errorMsg = electronResponse?.error || "Unknown error";
        alert(`❌ Electron Failed to Save Key: ${errorMsg}`);
        throw new Error(`Vault Error: ${errorMsg}`);
      }

      console.log("Key saved successfully through safeStorage");
    } else {
      alert("⚠️ Electron bridge window.electronAPI is missing!");
    }
}

export async function googleAuthLogin() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const idToken = await result.user.getIdToken();


        const response = await axios.post("http://localhost:8080/auth/Oauth-login", { idToken , provider :"google"});
        const data = response.data;

        if (data?.action === "login") {
            return { success: true, token: data.token };
        }

        if (data?.action === "require_encryption_keys") {
            const { pubKey , priKey } = await generateKeys();
            const publicKey = pubKey.x;
            
            console.log("public key sending :", publicKey);
            
            const signUpRes = await axios.post("http://localhost:8080/auth/Oauth-signup", { 
                idToken, 
                publicKey,
                provider : "google" 
            }); 
            const res = await savePriKey(priKey)
            const finalToken = signUpRes.data.token;

            return { success: true, token: finalToken };
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

        const response = await axios.post("http://localhost:8080/auth/Oauth-login", { 
            idToken, 
            provider: "twitter" 
        });
        
        console.log("2. Backend Axios response structure:", response);
        const data = response.data;

        if (data?.action === "login") {
            return { success: true, token: data.token };
        }

        if (data?.action === "require_encryption_keys") {
            const { pubKey , priKey } = await generateKeys();
            const publicKey = pubKey.x;

            console.log("key : " , publicKey);
            
            const signUpRes = await axios.post("http://localhost:8080/auth/Oauth-signup", { 
                idToken, 
                publicKey,
                provider: "twitter"
            }); 
            const res = await savePriKey(priKey)
            return { success: true, token: signUpRes.data.token };
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

