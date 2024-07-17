import { app, BrowserWindow, shell, ipcMain, screen } from "electron";
import path from "path";

/** Tampilkan window kesalahan */
export function error(e: Error) {
    const mainPath = path.join(process.cwd(), "ui", "error");
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    const window = new BrowserWindow({
        autoHideMenuBar: true,
        x: 0,
        y: 0,
        width,
        height,
        webPreferences: {
            preload: path.join(mainPath, "preload.js")
        }
    });

    // Deteksi ipc keluar window dari renderer
    ipcMain.handle("quitError", () => window.close());
    // Kirim Error ke preload
    window.webContents.send("stackError", e);

    // Error perlu dibikin fullscreen sekalian
    window.webContents.once("dom-ready", () => window.setFullScreen(true));
    // tag <a> perlu dibuka eksternal
    window.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: "deny" };
    })
    // Tutup program setelah window error ditutup.
    window.once("close", () => app.exit(1));

    window.loadFile(path.join(mainPath, "index.html"));
    return window;
}