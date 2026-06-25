const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld("electronAPI" , {
    savePrivateKey : (keyString) => ipcRenderer.invoke("save-key" , keyString),

    getPrivateKey : () => ipcRenderer.invoke("get-key")
});