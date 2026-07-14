import { app , BrowserWindow , ipcMain, Menu, safeStorage } from "electron";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from 'node:url';
import http from "node:http";

app.name = "VAU" ; 


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mimeTypes = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

let devPort = 3000;
let prodPort = null;
let localServer = null;

function startLocalServer() {
  return new Promise((resolve) => {
    localServer = http.createServer((req, res) => {
      const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
      let safePath = parsedUrl.pathname.replace(/^(\.\.[\/\\])+/, "");
      let filePath = path.join(__dirname, "..", "dist", safePath === "/" ? "index.html" : safePath);

      fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
          filePath = path.join(__dirname, "..", "dist", "index.html");
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = mimeTypes[ext] || "application/octet-stream";

        res.writeHead(200, { "Content-Type": contentType });
        fs.createReadStream(filePath).pipe(res);
      });
    });

    localServer.listen(0, "127.0.0.1", () => {
      prodPort = localServer.address().port;
      console.log(`[Electron Server] Serving production build at http://localhost:${prodPort}`);
      resolve();
    });
  });
}

function checkDevServer() {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${devPort}/`, () => {
      req.destroy();
      resolve(true);
    });
    req.on("error", () => {
      resolve(false);
    });
  });
}

function createWindow(useDevServer){
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
    win.webContents.openDevTools();

    win.once("ready-to-show" , () => {
        win.maximize(),
        win.show();
    })

    if (useDevServer) {
        win.loadURL(`http://localhost:${devPort}/`);
    } else {
        win.loadURL(`http://localhost:${prodPort}/`);
    }
}

app.whenReady().then(async () => {
  let useDevServer = false;
  if (!app.isPackaged) {
    useDevServer = await checkDevServer();
  }

  if (!useDevServer) {
    await startLocalServer();
  }
  createWindow(useDevServer);
});

app.on("window-all-closed", () => {
  if (localServer) {
    localServer.close();
  }
  if (process.platform !== "darwin") {
    app.quit();
  }
});


const keyPath = path.join(app.getPath('userData'), 'secure_vault.dat');

ipcMain.handle("save-key" , async(event , keyString, userId) => {
    try{
        if(!safeStorage.isEncryptionAvailable()){
            throw new Error("Encryption not unavailable on this machine");
        }

        const encrptedBuffer = await safeStorage.encryptStringAsync(keyString);
        const userKeyPath = path.join(app.getPath('userData'), `secure_vault_${userId}.dat`);

        fs.writeFileSync(userKeyPath , encrptedBuffer);
        return {success : true};
    }catch(err){
        console.log("encryption failed " , err) ;
        return {success : false , error : err.message}
    }
});

ipcMain.handle("get-key" , async(event, userId) => {
    try {
    const userKeyPath = path.join(app.getPath('userData'), `secure_vault_${userId}.dat`);
    const legacyKeyPath = path.join(app.getPath('userData'), 'secure_vault.dat');

    if (!fs.existsSync(userKeyPath)) {
        if (fs.existsSync(legacyKeyPath)) {
            fs.renameSync(legacyKeyPath, userKeyPath);
            console.log(`[Electron Key Vault] Migrated legacy key to: ${userKeyPath}`);
        } else {
            return null;
        }
    }

    const encryptedBuffer = fs.readFileSync(userKeyPath);
    
    const decryptedString = safeStorage.decryptString(encryptedBuffer);
    return decryptedString;
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
})
