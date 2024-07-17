import { app } from "electron";
import * as windows from "./windows";

app.once("ready", () => {
    windows.error();
});

app.once("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});