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
export const defaultConfigs: iConfigs = {
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
export function saveConfig(config?: iConfigs) {
    const configs: iConfigs = {
        ...defaultConfigs,
        ...config
    }

    writeFileSync(configPath, JSON.stringify(configs));
}

/** Perbarui config */
export function updateConfig(config: iConfigs) {
    const oldConfig = readConfig();
    const newConfig = {
        ...oldConfig,
        ...config
    }

    saveConfig(newConfig);
}

/** Baca konfigurasi */
export function readConfig() {
    let config: iConfigs;

    try {
        config = JSON.parse(readFileSync(configPath, { encoding: "utf-8" })) as iConfigs;
    } catch (e) {
        throw new Error("File konfigurasi tidak dapat dibaca.");
    }

    return config;
}

/** Periksa jika file config ada */
export function isConfigExists() {
    return existsSync(configPath);
}

interface iConfigs {
    nama?: string,
    logo?: string | null,
    aktifkanDevTools?: boolean,
    cegahWindowDitutup?: boolean,
    gunakanSatuMonitor?: boolean,
    zoomFront?: number
}