const { app, BrowserWindow, Menu, ipcMain, dialog } = require("electron");
const path = require("path");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    frame: true,
    icon: path.join(__dirname, "assets/icons/icon.png"),
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
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    } catch (_) {}
  };

  mainWindow.on('show', restoreFocus);
  mainWindow.on('restore', restoreFocus);

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
        noLink: true,
        normalizeAccessKeys: true,
      })
      .then((response) => {
        if (response.response === 0) {
          mainWindow.destroy();
        }
      });
  });
}

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