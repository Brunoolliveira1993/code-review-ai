import { app, BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron';
import path from 'path';
import { AnalyzeCodeUseCase } from '../application/usecases/AnalyzeCodeUseCase';
import { credentialService } from '../infrastructure/security/CredentialService';
import { AnalyzeCodeRequestSchema } from '../application/types/schemas';
import { GitProviderFactory } from '../infrastructure/git/GitProviderFactory';

function createWindow(): void {
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

    if (!app.isPackaged) {
        win.webContents.openDevTools();
    }

    win.loadFile(path.join(__dirname, '../presentation/index.html'));
}

app.whenReady().then(createWindow);

ipcMain.handle('analyze-code', async (event: IpcMainInvokeEvent, request: unknown) => {
    const parsedRequest = AnalyzeCodeRequestSchema.safeParse(request);
    if (!parsedRequest.success) {
        throw new Error(`Requisição inválida: ${parsedRequest.error.message}`);
    }

    const useCase = new AnalyzeCodeUseCase();

    return await useCase.execute(parsedRequest.data, (status: string) => {
        event.sender.send('analysis-progress', status);
    });
});

ipcMain.handle('save-credentials', async (_, data: { openrouter?: string; github?: string; gitlab?: string }) => {
    await credentialService.set('OPENROUTER_API_KEY', data.openrouter ?? '');
    await credentialService.set('GITHUB_TOKEN', data.github ?? '');
    await credentialService.set('GITLAB_TOKEN', data.gitlab ?? '');

    return true;
});

ipcMain.handle('get-credentials', async () => {
    return {
        openrouter: await credentialService.get('OPENROUTER_API_KEY'),
        github: await credentialService.get('GITHUB_TOKEN'),
        gitlab: await credentialService.get('GITLAB_TOKEN')
    };
});

ipcMain.handle('post-review-comment', async (_, { url, comment }: { url: string; comment: string }) => {
    const provider = GitProviderFactory.create(url);
    await provider.postComment(url, comment);
    return true;
});

ipcMain.on('open-config', (event) => {
    const parentWindow = BrowserWindow.fromWebContents(event.sender);

    const configWindow = new BrowserWindow({
        parent: parentWindow ?? undefined,
        width: 600,
        height: 450,
        title: 'Configurações',
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
