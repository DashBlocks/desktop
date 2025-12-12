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

ipcMain.on('show-alert', (event, message) => {
  dialog.showMessageBoxSync(mainWindow, { message });
  mainWindow.focus();
  event.returnValue = null;
});

ipcMain.on('show-confirm', (event, message) => {
  const result = dialog.showMessageBoxSync(mainWindow, { message, buttons: ['OK', 'Cancel'], defaultId: 0, cancelId: 1 });
  mainWindow.focus();
  event.returnValue = result.response === 0;
});

ipcMain.on('show-prompt', (event, message, defaultValue) => {
  const promptWindow = new BrowserWindow({
    width: 400,
    height: 150,
    modal: true,
    parent: mainWindow,
    show: false,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  const html = `
    <html>
    <head><style>body { font-family: Arial, sans-serif; padding: 10px; } input { width: 100%; box-sizing: border-box; margin-bottom: 10px; } button { margin-left: 5px; }</style></head>
    <body>
    <p>${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
    <input id="input" value="${(defaultValue || '').replace(/"/g, '&quot;')}" />
    <div style="text-align: right;">
    <button id="ok">OK</button>
    <button id="cancel">Cancel</button>
    </div>
    <script>
    const { ipcRenderer } = require('electron');
    document.getElementById('input').focus();
    document.getElementById('input').select();
    document.getElementById('ok').onclick = () => {
      ipcRenderer.send('prompt-ok', document.getElementById('input').value);
    };
    document.getElementById('cancel').onclick = () => {
      ipcRenderer.send('prompt-cancel');
    };
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        document.getElementById('ok').click();
      } else if (e.key === 'Escape') {
        document.getElementById('cancel').click();
      }
    });
    </script>
    </body>
    </html>
  `;
  promptWindow.loadURL(`data:text/html,${encodeURIComponent(html)}`);
  promptWindow.once('ready-to-show', () => {
    promptWindow.show();
  });
  let result = null;
  const okHandler = (event2, value) => {
    result = value;
    promptWindow.close();
  };
  const cancelHandler = () => {
    result = null;
    promptWindow.close();
  };
  ipcMain.once('prompt-ok', okHandler);
  ipcMain.once('prompt-cancel', cancelHandler);
  promptWindow.on('closed', () => {
    mainWindow.focus();
    event.returnValue = result;
  });
});

app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
