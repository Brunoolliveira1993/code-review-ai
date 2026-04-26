const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

const AnalyzeCodeUseCase = require('../application/usecases/AnalyzeCodeUseCase');
const credentialService = require('../infrastructure/security/CredentialService');

function createWindow() {
    const win = new BrowserWindow({
        width: 900,
        height: 700,

        resizable: true,
        maximizable: false,

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


ipcMain.handle('save-credentials', async (_, data) => {
    await credentialService.set('OPENROUTER_API_KEY', data.openrouter);
    await credentialService.set('GITHUB_TOKEN', data.github);
    await credentialService.set('GITLAB_TOKEN', data.gitlab);

    return true;
});

ipcMain.handle('get-credentials', async () => {
    return {
        openrouter: await credentialService.get('OPENROUTER_API_KEY'),
        github: await credentialService.get('GITHUB_TOKEN'),
        gitlab: await credentialService.get('GITLAB_TOKEN')
    };
});

ipcMain.on('open-config', (event) => {

    const parentWindow = BrowserWindow.fromWebContents(event.sender);

    const configWindow = new BrowserWindow({
        width: 600,
        height: 450,
        title: "Configurações",
        parent: parentWindow,
        modal: true,
        resizable: false,
        maximizable: false,

        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true
        }
    });

    configWindow.loadFile(path.join(__dirname, '../presentation/config.html'));
});