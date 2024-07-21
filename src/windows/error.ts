import { isDevToolsEnabled } from "@/window";
import { BrowserWindow, screen, shell, ipcMain, app } from "electron";
import path from "path"

/** Tampilkan window kesalahan */
export function error(e: Error) {
    const mainPath = path.join(process.cwd(), "src", "ui", "error");
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    const window = new BrowserWindow({
        autoHideMenuBar: true,
        alwaysOnTop: true,
        x: 0,
        y: 0,
        width,
        height,
        webPreferences: {
            devTools: isDevToolsEnabled,
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