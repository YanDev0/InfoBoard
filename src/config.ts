import { join } from "path";
import { homedir } from "os";
import { mkdirSync, existsSync, writeFileSync, readFileSync } from "fs";

/** Jalur menuju folder config InfoBoard */
export const path = (process.platform == "win32")
    ? join(homedir(), "AppData", "Roaming", "infoboard")
    : join(homedir(), ".config", "infoboard");

/** Jalur menuju file config InfoBoard */
export const configPath = join(path, "config.json");

/** Konfigurasi default */
export const defaultConfigs: IConfigs = {
    nama: "Anonim",
    logo: null,
    aktifkanDevTools: true, // Ubah nanti di release
    cegahWindowDitutup: false,
    gunakanSatuMonitor: false,
    zoomFront: 1
}

if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
}

/** Simpan konfigurasi */
export function saveConfig(config?: IConfigs) {
    const configs: IConfigs = {
        ...defaultConfigs,
        ...config
    }

    writeFileSync(configPath, JSON.stringify(configs));
}

/** Perbarui config */
export function updateConfig(config: IConfigs) {
    const oldConfig = readConfig();
    const newConfig = {
        ...oldConfig,
        ...config
    }

    saveConfig(newConfig);
}

/** Baca konfigurasi */
export function readConfig() {
    let config: IConfigs;

    try {
        config = JSON.parse(readFileSync(configPath, { encoding: "utf-8" })) as IConfigs;
    } catch (e) {
        throw new Error("File konfigurasi tidak dapat dibaca.");
    }

    return config;
}

/** Periksa jika file config ada */
export function isConfigExists() {
    return existsSync(configPath);
}

export interface IConfigs {
    [key: string]: string | boolean | number,
    nama?: string,
    logo?: string | null,
    aktifkanDevTools?: boolean,
    cegahWindowDitutup?: boolean,
    gunakanSatuMonitor?: boolean,
    zoomFront?: number
}