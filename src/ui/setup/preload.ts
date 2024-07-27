import { contextBridge, ipcRenderer } from "electron";
import { IDisplay, IFront, ISetup } from "./interface";

document.addEventListener("DOMContentLoaded", () => {
    document.querySelector("#top").classList.add("show");
});

contextBridge.exposeInMainWorld("display", {
    primaryDisplay: () => ipcRenderer.invoke("primaryDisplay"),
    externalDisplay: () => ipcRenderer.invoke("externalDisplay"),
    onExternalDisplay: (callback) => ipcRenderer.on("externalDisplay", (_e, display: Electron.Display) => callback(display))
} as IDisplay);

// Untuk membuka window front
contextBridge.exposeInMainWorld("front", {
    open: () => ipcRenderer.send("openFrontWindow"),
    close: () => ipcRenderer.send("closeFrontWindow"),
    changeZoom: (number) => ipcRenderer.send("changeZoomFrontWindow", number)
} as IFront);

// Untuk fungsi window setup
contextBridge.exposeInMainWorld("setup", {
    destroyWindow: () => ipcRenderer.send("setupDestroy"),
    saveConfigs: (config) => ipcRenderer.invoke("setupSaveConfig", config)
} as ISetup);