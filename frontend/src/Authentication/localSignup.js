import axios from "axios";
import { toast } from "sonner";
import { authApi } from "../lib/api";

export async function generateKeys() {
  const keyPair = await window.crypto.subtle.generateKey(
    { name: "X25519" },
    true,
    ["deriveKey", "deriveBits"]
  );

  const pubKey = await window.crypto.subtle.exportKey("jwk", keyPair.publicKey);
  const priKey = await window.crypto.subtle.exportKey("jwk", keyPair.privateKey);

  return { pubKey, priKey };
}

export async function localSignup({ e, form, navigate }) {
  e.preventDefault();

  try {
    const { pubKey, priKey } = await generateKeys();

    
    const publicKey = pubKey.x; 
    const userInput = { ...form, publicKey };

    
    await authApi.register(userInput);
    
    const electronAPI = window.electronAPI;
    if (electronAPI?.savePrivateKey) {
      const electronResponse = await electronAPI.savePrivateKey(JSON.stringify(priKey));

      if (!electronResponse.success) {
        throw new Error(electronResponse.error || "Failed to secure private key hardware vault.");
      }

      console.log("Key saved successfully through safeStorage");
    } else {
      console.warn("Electron bridge is unavailable; skipping private key storage.");
    }
    toast.success("Account created successfully");

    navigate("/home");
    
  } catch (err) {
    console.error("Signup failed:", err);
    toast.error(err.response?.data?.message || err.message || "An error occurred during signup");
  }
}