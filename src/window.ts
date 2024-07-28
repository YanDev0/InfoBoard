import { defaultConfigs, isConfigExists, readConfig } from "@/config";

export const configs = (isConfigExists)
    ? readConfig()
    : defaultConfigs

export { front } from '@/windows/front';
export { setup } from '@/windows/setup';
export { error } from '@/windows/error';