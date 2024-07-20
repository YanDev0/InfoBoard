import { app, BrowserWindow, shell, ipcMain, screen, dialog } from "electron";
import { readConfig, isConfigExists, defaultConfigs } from "@/config";
import path from "path";

const isDevToolsEnabled = (isConfigExists())
    ? readConfig().aktifkanDevTools
    : defaultConfigs.aktifkanDevTools

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
        frame: false,
        x: externalDisplay.nativeOrigin.x,
        y: 0,
        width,
        height,
        webPreferences: { devTools: isDevToolsEnabled }
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

/** Tampilan window setup */
export function setup() {
    const mainPath = path.join(__dirname, "ui", "setup");

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

    // Matikan screen listener jika window ditutup
    window.on("closed", () => {
        screen.removeAllListeners();
        ipcMain.removeHandler("primaryDisplay");
        ipcMain.removeHandler("externalDisplay");
    });

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