const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld("electronAPI" , {
    savePrivateKey : (keyString, userId) => ipcRenderer.invoke("save-key" , keyString, userId),

    getPrivateKey : (userId) => ipcRenderer.invoke("get-key", userId)
});