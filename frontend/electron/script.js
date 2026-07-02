import { app , BrowserWindow , ipcMain, Menu, safeStorage } from "electron";
import path from "node:path";
import fs from "node:fs"
import { fileURLToPath } from 'node:url';

app.name = "VAU" ; 


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow(){
    const win = new BrowserWindow({
        show : false,
        autoHideMenuBar : true,
        webPreferences :{
            preload : path.join(__dirname , "preload.js") ,
            contextIsolation : true ,
            nodeIntegration : false
        }
    })
    Menu.setApplicationMenu(null)
    // win.webContents.openDevTools();

    win.once("ready-to-show" , () => {
        win.maximize(),
        win.show();
    })

    win.loadURL("http://localhost:3000/");
}

app.whenReady().then(createWindow);


const keyPath = path.join(app.getPath('userData'), 'secure_vault.dat');

ipcMain.handle("save-key" , async(event , keyString) => {
    try{
        if(!safeStorage.isEncryptionAvailable()){
            throw new Error("Encryption not unavailable on this machine");
        }

        const encrptedBuffer = await safeStorage.encryptStringAsync(keyString);

        fs.writeFileSync(keyPath , encrptedBuffer);
        return {success : true};
    }catch(err){
        console.log("encryption failed " , err) ;
        return {success : false , error : err.message}
    }
});

ipcMain.handle("get-key" , async() => {
    try {
    if (!fs.existsSync(keyPath)) return null;

    const encryptedBuffer = await fs.readFileSync(keyPath);
    
    const decryptedString = safeStorage.decryptString(encryptedBuffer);
    return decryptedString;
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
})
