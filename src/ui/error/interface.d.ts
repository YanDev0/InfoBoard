declare global {
    interface Window {
        /** Destroy the program when error */
        quitError: () => void
    }
}

export {}