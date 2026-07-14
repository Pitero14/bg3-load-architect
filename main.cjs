const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const http = require('http');

let mainWindow;

// Set environment variables for production if not specified
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

// Ensure the Express server knows where to find the static files in the packaged environment
process.env.ELECTRON_APP_PATH = app.getAppPath();

// Require and start the Express server
try {
  require('./dist/server.cjs');
} catch (err) {
  console.error('Failed to start Express server:', err);
  dialog.showErrorBox(
    'Server Error',
    `Errore di avvio del server locale Express:\n\n${err.stack || err.message || err}`
  );
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    },
    title: "BG3 Load Architect",
    autoHideMenuBar: true
  });

  // Poll until the server is up and running before loading the page
  function checkServerReady(callback) {
    const req = http.get('http://127.0.0.1:3000/api/health', (res) => {
      if (res.statusCode === 200) {
        callback(true);
      } else {
        callback(false);
      }
    });
    req.on('error', () => {
      callback(false);
    });
    req.end();
  }

  function pollServer() {
    checkServerReady((ready) => {
      if (ready) {
        mainWindow.loadURL('http://127.0.0.1:3000');
      } else {
        setTimeout(pollServer, 100);
      }
    });
  }

  pollServer();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
