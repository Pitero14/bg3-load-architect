const { app, BrowserWindow } = require("electron");
const http = require("http");

let mainWindow;

console.log("1 - Electron starting...");

// Production
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "production";
}

process.env.ELECTRON_APP_PATH = app.getAppPath();

console.log("2 - Loading Express server...");

try {
  require("./dist/server.cjs");
  console.log("3 - Express server loaded.");
} catch (err) {
  console.error("Failed to start Express server:");
  console.error(err);
}

function createWindow() {
  console.log("4 - Creating BrowserWindow...");

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    title: "BG3 Load Architect",
    autoHideMenuBar: true,
    backgroundColor: "#1b1b1b",

    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });

  // Apri automaticamente la console
  mainWindow.webContents.openDevTools({ mode: "detach" });

  function checkServerReady(callback) {
    const req = http.get("http://127.0.0.1:3000/api/health", (res) => {
      callback(res.statusCode === 200);
    });

    req.on("error", () => callback(false));
    req.end();
  }

  let attempts = 0;

  function pollServer() {
    attempts++;

    if (attempts % 10 === 0) {
      console.log(`Waiting for server... (${attempts})`);
    }

    checkServerReady((ready) => {
      if (ready) {
        console.log("5 - Server is ready.");
        console.log("6 - Loading React app...");
        mainWindow.loadURL("http://127.0.0.1:3000");
      } else {
        setTimeout(pollServer, 100);
      }
    });
  }

  pollServer();

  mainWindow.webContents.on("did-finish-load", () => {
    console.log("7 - React loaded successfully.");
  });

  mainWindow.webContents.on(
    "did-fail-load",
    (event, code, desc) => {
      console.error("FAILED TO LOAD");
      console.error(code);
      console.error(desc);
    }
  );

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  console.log("8 - App ready.");
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
