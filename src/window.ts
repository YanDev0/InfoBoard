import { readConfig, isConfigExists, defaultConfigs } from "@/config";

export const isDevToolsEnabled = (isConfigExists())
    ? readConfig().aktifkanDevTools
    : defaultConfigs.aktifkanDevTools

export { front } from '@/windows/front';
export { setup } from '@/windows/setup';
export { error } from '@/windows/error';