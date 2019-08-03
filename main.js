"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var electron_1 = require("electron");

function createWindow() {
  // Create the browser window.
  var win = new electron_1.BrowserWindow({
    width: 800,
    height: 700,
    webPreferences: {
      nodeIntegration: true
    }
  }); // and load the index.html of the app.

  win.webContents.on('new-window', function(e, url) {
    e.preventDefault();    
    require('electron').shell.openExternal(url);
  });

  win.loadFile('index.html');
}

electron_1.app.on('ready', createWindow);
