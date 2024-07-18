import { app, BrowserWindow, shell, ipcMain, screen } from "electron";
import path from "path";

/** Tampilkan window depan (papan jadwal) */
export function front() {
    const mainPath = path.join(__dirname, "ui", "front");
    const externalDisplay = screen.getAllDisplays()[1];

    if (!externalDisplay) {
        throw new Error("Monitor eksternal tidak terdeteksi.");
    }

    const { width, height } = externalDisplay.workAreaSize;
    const window = new BrowserWindow({
        autoHideMenuBar: true,
        x: externalDisplay.nativeOrigin.x,
        y: 0,
        width,
        height
    });

    // Deteksi jika monitor eksternal terlepas
    screen.on("display-removed", () => {
        throw new Error("Window jadwal terlepas dari monitor external.");
    });

    // Atur front ke fullscreen
    window.webContents.once("dom-ready", () => window.setFullScreen(true));
    // Cegah front keluar dari fullscreen
    window.on("leave-full-screen", () => window.setFullScreen(true));

    window.loadFile(path.join(mainPath, "index.html"));
    return window;
}

/** Tampilkan window kesalahan */
export function error(e: Error) {
    const mainPath = path.join(__dirname, "ui", "error");
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    const window = new BrowserWindow({
        autoHideMenuBar: true,
        alwaysOnTop: true,
        x: 0,
        y: 0,
        width,
        height,
        webPreferences: {
            preload: path.join(mainPath, "preload.js")
        }
    });

    // tag <a> perlu dibuka eksternal
    window.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: "deny" };
    });
    // Deteksi ipc keluar window dari renderer
    ipcMain.handle("quitError", () => window.close());
    // Kirim Error ke preload
    window.webContents.send("stackError", e);

    // Error perlu dibikin fullscreen sekalian
    window.webContents.once("dom-ready", () => window.setFullScreen(true));
    // Tutup program setelah window error ditutup.
    window.once("close", () => app.exit(1));

    window.loadFile(path.join(mainPath, "index.html"));
    return window;
}