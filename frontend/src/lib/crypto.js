function base64ToUint8(b64) {
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

function uint8ToBase64(u8) {
  let bin = "";
  for (let i = 0; i < u8.length; i++) bin += String.fromCharCode(u8[i]);
  return btoa(bin);
}


function base64urlToBase64(b64url) {
  let b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4) b64 += "=";
  return b64;
}

function base64ToBase64url(b64) {
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// ─── Key Agreement ──────────────────────────────────────────────────────────

/**
 * Derive a shared AES-256-GCM key from our X25519 private key and their public key.
 *
 * @param {JsonWebKey} myPrivateJwk  – Full JWK of our X25519 private key (from safeStorage)
 * @param {string}     theirPubB64   – The `x` field (base64url) of their X25519 public JWK
 * @returns {Promise<CryptoKey>}     – AES-GCM-256 key usable for encrypt/decrypt
 */
export async function deriveSharedKey(myPrivateJwk, theirPubB64) {
  
  const privateKey = await crypto.subtle.importKey(
    "jwk",
    myPrivateJwk,
    { name: "X25519" },
    false,
    ["deriveBits"]
  );

  
  const theirPublicJwk = {
    kty: "OKP",
    crv: "X25519",
    x: theirPubB64,
  };

  const publicKey = await crypto.subtle.importKey(
    "jwk",
    theirPublicJwk,
    { name: "X25519" },
    false,
    []
  );

  
  const sharedBits = await crypto.subtle.deriveBits(
    { name: "X25519", public: publicKey },
    privateKey,
    256
  );

  
  const hkdfKey = await crypto.subtle.importKey(
    "raw",
    sharedBits,
    "HKDF",
    false,
    ["deriveKey"]
  );

  const aesKey = await crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: new Uint8Array(32), // static salt — fine for E2EE chat
      info: new TextEncoder().encode("vau-e2ee-v1"),
    },
    hkdfKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );

  return aesKey;
}

// ─── Encrypt / Decrypt ──────────────────────────────────────────────────────


export async function encryptMessage(plaintext, sharedKey) {
  const nonce = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV
  const encoded = new TextEncoder().encode(plaintext);

  const ciphertextBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: nonce },
    sharedKey,
    encoded
  );

  return {
    ciphertext: uint8ToBase64(new Uint8Array(ciphertextBuffer)),
    nonce: uint8ToBase64(nonce),
  };
}

/**
 * Decrypt a ciphertext message with AES-256-GCM.
 *
 * @param {string}    ciphertextB64 – base64 encoded ciphertext
 * @param {string}    nonceB64      – base64 encoded 12-byte nonce
 * @param {CryptoKey} sharedKey     – AES-GCM key from deriveSharedKey()
 * @returns {Promise<string>}       – Decrypted plaintext
 */
export async function decryptMessage(ciphertextB64, nonceB64, sharedKey) {
  const ciphertext = base64ToUint8(ciphertextB64);
  const nonce = base64ToUint8(nonceB64);

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: nonce },
    sharedKey,
    ciphertext
  );

  return new TextDecoder().decode(decryptedBuffer);
}

// ─── Private Key Access ─────────────────────────────────────────────────────

export async function getMyPrivateKey(userId) {
  try {
    const electronAPI = window.electronAPI;
    if (!electronAPI?.getPrivateKey || !userId) return null;

    const raw = await electronAPI.getPrivateKey(userId);
    if (!raw) return null;

    return JSON.parse(raw);
  } catch (err) {
    console.error("[E2EE] Failed to retrieve private key:", err);
    return null;
  }
}


export async function isE2EEAvailable(userId) {
  const key = await getMyPrivateKey(userId);
  return key !== null;
}
