exports.__esModule = true;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const electron1 = require('electron');

function createWindow() {
    // Create the browser window.
    const win = new electron1.BrowserWindow({
        width: 800,
        height: 700,
        webPreferences: {
            nodeIntegration: true,
        },
    }); 

    win.webContents.on('new-window', (e, url) => {
        e.preventDefault();
        electron1.shell.openExternal(url);
    });

    win.loadFile('index.html');
}

electron1.app.on('ready', createWindow);
