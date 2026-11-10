/* Electron shell for the desktop build.
   Loads the single-file bundle so the app is identical to the web version. */
const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('node:path');

function resolveHtml() {
  // packaged: the bundle is copied to resources/ by electron-builder
  if (app.isPackaged) return path.join(process.resourcesPath, 'holistic.html');
  // development: read the build output directly
  return path.join(__dirname, '..', 'dist', 'holistic.html');
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1180,
    height: 820,
    minWidth: 380,
    minHeight: 560,
    backgroundColor: '#0a0e1a',
    title: 'Holistic',
    autoHideMenuBar: true,
    icon: path.join(__dirname, '..', 'assets', 'icon-512.png'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  win.loadFile(resolveHtml());

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

Menu.setApplicationMenu(null);

app.whenReady().then(createWindow);

app.on('window-all-closed', () => app.quit());

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
