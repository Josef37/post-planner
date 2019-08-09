exports.__esModule = true;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const electron1 = require('electron');

// https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url
function validURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(str);
}

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
        validURL(url) && electron1.shell.openExternal(url);
    });

    win.setMenuBarVisibility(false);
    win.loadFile('index.html');
}

electron1.app.on('ready', createWindow);
