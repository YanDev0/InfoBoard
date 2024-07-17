// eslint-disable-next-line @typescript-eslint/no-var-requires
const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("quitError", () => ipcRenderer.invoke("quitError"));