exports.__esModule = true;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const electron1 = require('electron');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Utils = require('./bin/utils');

// Create the electron browser window.
function createWindow() {
    const win = new electron1.BrowserWindow({
        width: 800,
        height: 700,
        webPreferences: {
            nodeIntegration: true,
        },
    }); 

    win.webContents.on('new-window', (e, url) => {
        e.preventDefault();
        Utils.validURL(url) && electron1.shell.openExternal(url);
    });

    win.setMenuBarVisibility(false);
    win.loadFile('index.html');
}

electron1.app.on('ready', createWindow);
