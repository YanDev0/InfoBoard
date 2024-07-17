import { app, BrowserWindow } from "electron";
import path from "path";

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        autoHideMenuBar: true
    });

    win.loadFile(path.join(process.cwd(), "ui", "index.html"));
}

app.once("ready", () => {
    createWindow();
});

app.once("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});