// eslint-disable-next-line @typescript-eslint/no-var-requires
const { contextBridge, ipcRenderer } = require("electron")

ipcRenderer.once("stackError", (_event, value) => {
    document.querySelector(".log").innerText = value.stack;
});
contextBridge.exposeInMainWorld("quitError", () => ipcRenderer.invoke("quitError"));