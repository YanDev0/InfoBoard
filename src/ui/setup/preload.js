// eslint-disable-next-line @typescript-eslint/no-var-requires
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("display", {
    primaryDisplay: () => ipcRenderer.invoke("primaryDisplay"),
    externalDisplay: () => ipcRenderer.invoke("externalDisplay"),
    onExternalDisplay: (callback) => ipcRenderer.on("externalDisplay", (_e, display) => callback(display))
});