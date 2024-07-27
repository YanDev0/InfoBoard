import { contextBridge, ipcRenderer } from "electron";

ipcRenderer.once("stackError", (_event, value: Error) => {
    (document.querySelector(".log") as HTMLElement).innerText = value.stack;
});
contextBridge.exposeInMainWorld("quitError", () => ipcRenderer.invoke("quitError"));