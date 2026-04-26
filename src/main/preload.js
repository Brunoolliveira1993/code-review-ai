const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    analyzeCode: (data) => ipcRenderer.invoke('analyze-code', data),
    onProgress: (callback) => ipcRenderer.on('analysis-progress', (_, msg) => callback(msg)),
    openConfig: () => ipcRenderer.send('open-config')
});

contextBridge.exposeInMainWorld('config', {
    save: (data) => ipcRenderer.invoke('save-credentials', data),
    load: () => ipcRenderer.invoke('get-credentials')
});