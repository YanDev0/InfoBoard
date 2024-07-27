import type { IConfigs as IConfig } from "@/config"

export interface IDisplay {
    /** Get primary display information. Always have value unless you setting up InfoBoard without any monitor */
    primaryDisplay: () => Promise<Electron.Display>,
    /** Get external display information. `null` if not detected. */
    externalDisplay: () => Promise<Electron.Display | null>,
    /** Listen to incoming display changes */
    onExternalDisplay: (callback: (display: (Electron.Display | null)) => void) => void
}

export interface IFront {
    /** Open the demo front window */
    open: () => void,
    /** Close the demo front window */
    close: () => void,
    /** Change zoom of demo front window */
    changeZoom: (number: number) => void
}

export interface ISetup {
    /** Destroy setup window */
    destroyWindow: () => void,
    /** Save the configuration */
    saveConfigs: (config: IConfigs) => Promise<boolean>
}

declare global {
    interface Window {
        display: IDisplay,
        front: IFront,
        setup: ISetup
    }
    
    interface IConfigs extends IConfig {}
}