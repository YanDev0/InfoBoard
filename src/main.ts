// Impor kebutuhan modul local
import "module-alias/register"

import { app } from "electron";
import * as windows from "@/windows";

app.once("ready", () => {
    throw new Error("Test");
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
    windows.error(e);
}