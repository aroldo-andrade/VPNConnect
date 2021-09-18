const {app, BrowserWindow } = require('electron');


function createWindow() {

    let win = new BrowserWindow({
        width:400,
        height:600,
        webPreferences:{
            nodeIntegration:true,
            contextIsolation: false,
            devTools:true,

            
        },
        resizable:false,
        alwaysOnTop:true,

    })
    win.removeMenu()
    win.loadFile('src/index.html')
    //win.webContents.openDevTools()

}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
      app.quit()
  })