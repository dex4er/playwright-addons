import { Browser, BrowserContext } from 'playwright';
/**
 * Enable the stealth add-on
 * @param {Browser} br - Playwright Browser or BrowserContext object
 */
export default function (br: Browser | BrowserContext): Promise<void>;
