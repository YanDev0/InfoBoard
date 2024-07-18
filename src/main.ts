// Impor kebutuhan modul local
import "module-alias/register"

import { app, BrowserWindow } from "electron";
import * as windows from "@/windows";

app.once("ready", () => {
    windows.front();
});

app.once("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

// Error catcher
process.on("unhandledRejection", catchError);
process.on("uncaughtException", catchError);

/** Menampilkan window error jika uncaughtError terjadi */
async function catchError (e: Error) {
    console.error(e);

    await app.whenReady();
    const errWindow = windows.error(e);

    // Tutup window lain
    for (const window of BrowserWindow.getAllWindows()) {
        if (window == errWindow) continue; // Kecuali window error

        window.close();
    }
}