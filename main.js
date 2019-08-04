Object.defineProperty(exports, '__esModule', {
  value: true,
});

const electron1 = require('electron');

function createWindow() {
  // Create the browser window.
  const win = new electron1.BrowserWindow({
    width: 800,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
    },
  }); // and load the index.html of the app.

  win.webContents.on('new-window', (e, url) => {
    e.preventDefault();    
    require('electron').shell.openExternal(url);
  });

  win.loadFile('index.html');
}

electron1.app.on('ready', createWindow);
