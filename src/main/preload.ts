import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

type ProgressCallback = (message: string) => void;

type CredentialsPayload = {
  openrouter: string;
  github: string;
  gitlab: string;
};

type CredentialsData = {
  openrouter: string | null;
  github: string | null;
  gitlab: string | null;
};

contextBridge.exposeInMainWorld('api', {
  analyzeCode: (data: unknown) => ipcRenderer.invoke('analyze-code', data),
  onProgress: (callback: ProgressCallback) => {
    const listener = (_event: IpcRendererEvent, msg: string) => callback(msg);
    ipcRenderer.on('analysis-progress', listener);
    return () => ipcRenderer.removeListener('analysis-progress', listener);
  },
  openConfig: () => ipcRenderer.send('open-config'),
  postReviewComment: (data: { url: string; comment: string }) => ipcRenderer.invoke('post-review-comment', data)
});

contextBridge.exposeInMainWorld('config', {
  save: (data: CredentialsPayload) => ipcRenderer.invoke('save-credentials', data),
  load: () => ipcRenderer.invoke('get-credentials') as Promise<CredentialsData>
});
