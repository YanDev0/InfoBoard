/**
 * @todo Lagi nyari cara biar front window tidak bisa ditutup saat masuk step "bottom".
 * @todo Cuman saya tidak mau pikirin itu dulu untuk saat ini.
 */

import { isDevToolsEnabled, front } from "@/window";
import { BrowserWindow, dialog, app, shell, screen, ipcMain } from "electron";
import path from "path";

/** Tampilkan window penyiapan InfoBoard */
export function setup() {
    const mainPath = path.join(__dirname, "..", "ui", "setup");

    const window = new BrowserWindow({
        autoHideMenuBar: true,
        resizable: false,
        webPreferences: {
            devTools: isDevToolsEnabled,
            preload: path.join(mainPath, "preload.js")
        }
    });

    // Berikan info sebelum menutup setup
    window.on("close", e => {
        e.preventDefault();
        const choice = dialog.showMessageBoxSync(window, {
            title: "InfoBoard",
            message: "Penyiapan InfoBoard belum selesai. Apakah anda yakin ingin menutup aplikasi?",
            type: "question",
            buttons: ["Tidak", "Iya"]
        });

        if (choice) app.exit();
    });

    // tag <a> perlu dibuka eksternal
    window.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: "deny" };
    });

    // Kirim data display ke preload
    const sendExternalDisplayInfo = (display: Electron.Display | null) => {
        window.webContents.send("externalDisplay", display);
    }

    // Dengarkan input monitor masuk dan keluar lalu kirim ke renderer
    screen.on("display-added", (_e, display) => sendExternalDisplayInfo(display));
    screen.on("display-removed", () => sendExternalDisplayInfo(null));
    // Langsung kirim 
    ipcMain.handle("primaryDisplay", () => screen.getPrimaryDisplay());
    ipcMain.handle("externalDisplay", () => screen.getAllDisplays()[1] || null);

    // Handle pembukaan front window
    let frontWindow: BrowserWindow;
    ipcMain.on("openFrontWindow", () => {
        frontWindow = front(true);
        window.focus();
    });
    ipcMain.on("closeFrontWindow", () => {
        if (frontWindow) frontWindow.close();
    });
    ipcMain.on("changeZoomFrontWindow", (_e, number) => {
        if (frontWindow) frontWindow.webContents.setZoomFactor(number);
    });

    // Matikan screen listener jika window ditutup
    window.on("closed", () => {
        screen.removeAllListeners();
        ipcMain.removeHandler("primaryDisplay");
        ipcMain.removeHandler("externalDisplay");
        ipcMain.removeHandler("openFrontWindow");
        ipcMain.removeHandler("closeFrontWindow");
    });

    window.loadFile(path.join(mainPath, "index.html"));
    return window;
}