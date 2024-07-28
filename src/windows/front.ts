import { configs } from "@/window";
import { screen, BrowserWindow } from "electron";
import path from "path";

/** Tampilkan window depan (papan jadwal) */
export function front(demo?: boolean) {
    const mainPath = path.join(__dirname, "..", "ui", "front");
    const displays = screen.getAllDisplays();
    const externalDisplay = (configs.gunakanSatuMonitor)
        ? displays[0]
        : displays[1];

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
        webPreferences: {
            devTools: configs.aktifkanDevTools
        }
    });

    // Deteksi jika monitor eksternal terlepas
    if (!demo) screen.on("display-removed", () => {
        throw new Error("Window jadwal terlepas dari monitor external.");
    });

    // Atur front ke fullscreen
    window.webContents.once("dom-ready", () => {
        window.setFullScreen(true);
        window.webContents.setZoomFactor(configs.zoomFront || 1);
    });
    // Cegah front keluar dari fullscreen
    window.on("leave-full-screen", () => window.setFullScreen(true));

    window.loadFile(path.join(mainPath, "index.html"));
    return window;
}