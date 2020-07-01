/**
 * @module playwright-addons/adblocker
 */

import blocker from '@cliqz/adblocker-playwright';
import fetch from 'cross-fetch';
import { Browser, BrowserContext } from 'playwright';

export interface PlaywrightAddonsAdblockerOptions {
    customList?: string[]
    blockTrackers?: boolean
}

/**
 * Enable the ad blocker add-on
 * @param {Browser} br - Playwright Browser or BrowserContext object
 * @param {Object} [options={}] - optional options to pass
 * @param {string} [options.customList] - provide a custom block list URL instead of the standard one
 * @param {boolean} [options.blockTrackers=false] - block trackers in addition to ads
 */
export default async function (br: Browser | BrowserContext, options: PlaywrightAddonsAdblockerOptions = {}) {
    if (typeof br !== 'object' || !((br as any).contexts || (br as any).pages)) {
        console.error('Need to provide a Playwright Browser or BrowserContext object');
    } else {
        let bl: blocker.PlaywrightBlocker;
        if (options.customList) {
            bl = await blocker.PlaywrightBlocker.fromLists(fetch, options.customList);
        } else if (options.blockTrackers) {
            bl = await blocker.PlaywrightBlocker.fromPrebuiltAdsAndTracking(fetch);
        } else {
            bl = await blocker.PlaywrightBlocker.fromPrebuiltAdsOnly(fetch);
        }

        let context = (br as any).contexts ? (br as Browser).contexts() : [br as BrowserContext];

        context.forEach(c => {
            // Existing pages
            c.pages().forEach(p => bl.enableBlockingInPage(p));

            // New pages
            c.on('page', async p => {
                await bl.enableBlockingInPage(p);
            });
        });
        console.log('Adblocker enabled');
    }
}