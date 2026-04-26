const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    analyzeCode: (data) => ipcRenderer.invoke('analyze-code', data),
    onProgress: (callback) => ipcRenderer.on('analysis-progress', (_, msg) => callback(msg))
});