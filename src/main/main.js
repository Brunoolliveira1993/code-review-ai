const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

const AnalyzeCodeUseCase = require('../application/usecases/AnalyzeCodeUseCase');

function createWindow() {
    const win = new BrowserWindow({
        width: 900,
        height: 700,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    win.webContents.openDevTools();

    
    win.loadFile(path.join(__dirname, '../presentation/index.html'));
}

app.whenReady().then(createWindow);

ipcMain.handle('analyze-code', async (event, request) => {
    const useCase = new AnalyzeCodeUseCase();

    return await useCase.execute(request, (status) => {
        event.sender.send('analysis-progress', status);
    });
});