/**
 * @module playwright-addons/adblocker
 */
import { Browser, BrowserContext } from 'playwright';
export interface PlaywrightAddonsAdblockerOptions {
    customList?: string[];
    blockTrackers?: boolean;
}
/**
 * Enable the ad blocker add-on
 * @param {Browser} br - Playwright Browser or BrowserContext object
 * @param {Object} [options={}] - optional options to pass
 * @param {string} [options.customList] - provide a custom block list URL instead of the standard one
 * @param {boolean} [options.blockTrackers=false] - block trackers in addition to ads
 */
export default function (br: Browser | BrowserContext, options?: PlaywrightAddonsAdblockerOptions): Promise<void>;
