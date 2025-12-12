const { app, BrowserWindow, Menu, ipcMain, dialog } = require("electron");
const path = require("path");
let mainWindow;
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    frame: true,
    icon: path.join(__dirname, "assets/icons/icon.png"), // Set window icon
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });
  Menu.setApplicationMenu(null);
  mainWindow.loadFile("source/editor.html");
  const restoreFocus = () => {
    try {
      if (mainWindow) mainWindow.focus();
      if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.focus();
        mainWindow.webContents.executeJavaScript(
          'if (window.focus) window.focus(); if (document && document.body && document.body.focus) document.body.focus();',
          true
        );
      }
    } catch (_) {}
  };

  mainWindow.on('show', restoreFocus);
  mainWindow.on('restore', restoreFocus);
  mainWindow.on('focus', restoreFocus);
  mainWindow.webContents.on("did-finish-load", () => {
    setTimeout(() => {
      mainWindow.webContents.executeJavaScript(`
 (function() {
 const elements = document.querySelectorAll('span, div, button, a');
 for (let el of elements) {
 if (el.textContent === 'See Project Page' || (el.children.length === 0 && el.textContent.trim() === 'See Project Page')) {
 el.remove();
 return;
 }
 }
 })();
 `);
    }, 1000);
  });
  mainWindow.on("close", (e) => {
    e.preventDefault();
    dialog
      .showMessageBox(mainWindow, {
        type: "question",
        buttons: ["Close", "Cancel"],
        defaultId: 1,
        title: "Close Dash Desktop?",
        message: "Are you sure you want to close?",
        detail: "Make sure you saved your work.",
      })
      .then((response) => {
        if (response.response === 0) {
          mainWindow.destroy();
        }
      });
  });
}
/*
mainWindow.webContents.on('did-finish-load', () => {
 mainWindow.webContents.insertCSS(`
 .electron-titlebar {
 position: fixed;
 top: 0;
 right: 150px;
 height: 32px;
 display: flex;
 z-index: 999999;
 -webkit-app-region: no-drag;
 }
 .electron-drag-overlay {
 position: fixed;
 top: 0;
 right: 188px;
 left: 50%;
 height: 45px;
 z-index: 999998;
 -webkit-app-region: drag;
 background: transparent;
 }
 .electron-titlebar button {
 width: 46px;
 height: 32px;
 border: none;
 background: transparent;
 color: #fff;
 cursor: pointer;
 font-family: "Segoe UI", Arial, sans-serif;
 font-size: 10px;
 transition: background 0.1s;
 }
 .electron-titlebar button:hover {
 background: rgba(255,255,255,0.1);
 }
 .electron-titlebar button.close:hover {
 background: #e81123;
 }
 `);
 mainWindow.webContents.executeJavaScript(`
 (function() {
 // Create draggable overlay (right half only)
 const dragOverlay = document.createElement('div');
 dragOverlay.className = 'electron-drag-overlay';
 document.body.appendChild(dragOverlay);
 // Create window controls
 const titlebar = document.createElement('div');
 titlebar.className = 'electron-titlebar';
 titlebar.innerHTML = \`
 <button onclick="window.electronAPI.minimizeWindow()" title="Minimize">
 <span>─</span>
 </button>
 <button onclick="window.electronAPI.maximizeWindow()" title="Maximize">
 <span>□</span>
 </button>
 <button class="close" onclick="window.electronAPI.closeWindow()" title="Close">
 <span>✕</span>
 </button>
 \`;
 document.body.appendChild(titlebar);
 })();
 `);
});
}
*/
ipcMain.on("window-minimize", () => {
  mainWindow.minimize();
});
ipcMain.on("window-maximize", () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});
ipcMain.on("window-close", () => {
  mainWindow.close();
});
app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
