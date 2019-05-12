'use strict';
const {
    app, BrowserWindow, Menu, ipcMain
} = require('electron');
const fetch = require("node-fetch");
// reload  application   while   coding
require('electron-reload')(__dirname);
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;
let main_menu;

function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        width: 1200, height: 1000, minWidth: 800 ,minHeight :800 ,  icon:  'assets/images/logo/logo-icon.png',    show: false /*, frame: false*/
    });
    // and load the index.html of the app.
    win.loadFile('html/login.html');// Open the DevTools.
    if(process.argv.indexOf('--debug') !== -1) {
        win.webContents.openDevTools();
    }
    /*    var menu = Menu.buildFromTemplate([{
            label: '', submenu: [{
                label: 'Log out'
            }]
        }])*/
    win.setMenu(null);
    win.once('ready-to-show', () => {
        win.show()
    })
}

//}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}
ipcMain.on('systemPage', () => {
    win.loadFile('html/index.html');
});
ipcMain.on('loginPage', () => {
    win.loadFile('html/login.html');
});
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);





// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
});
app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow()
    }
});
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
