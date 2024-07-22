import { isDevToolsEnabled } from "@/window";
import { screen, BrowserWindow } from "electron";
import path from "path";

/** Tampilkan window depan (papan jadwal) */
export function front(demo?: boolean) {
    const mainPath = path.join(process.cwd(), "src", "ui", "front");
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
    if (!demo) screen.on("display-removed", () => {
        throw new Error("Window jadwal terlepas dari monitor external.");
    });

    // Atur front ke fullscreen
    window.webContents.once("dom-ready", () => window.setFullScreen(true));
    // Cegah front keluar dari fullscreen
    window.on("leave-full-screen", () => window.setFullScreen(true));

    window.loadFile(path.join(mainPath, "index.html"));
    return window;
}