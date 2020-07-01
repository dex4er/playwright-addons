"use strict";
/**
 * @module playwright-addons/adblocker
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const adblocker_playwright_1 = __importDefault(require("@cliqz/adblocker-playwright"));
const cross_fetch_1 = __importDefault(require("cross-fetch"));
/**
 * Enable the ad blocker add-on
 * @param {Browser} br - Playwright Browser or BrowserContext object
 * @param {Object} [options={}] - optional options to pass
 * @param {string} [options.customList] - provide a custom block list URL instead of the standard one
 * @param {boolean} [options.blockTrackers=false] - block trackers in addition to ads
 */
async function default_1(br, options = {}) {
    if (typeof br !== 'object' || !(br.contexts || br.pages)) {
        console.error('Need to provide a Playwright Browser or BrowserContext object');
    }
    else {
        let bl;
        if (options.customList) {
            bl = await adblocker_playwright_1.default.PlaywrightBlocker.fromLists(cross_fetch_1.default, options.customList);
        }
        else if (options.blockTrackers) {
            bl = await adblocker_playwright_1.default.PlaywrightBlocker.fromPrebuiltAdsAndTracking(cross_fetch_1.default);
        }
        else {
            bl = await adblocker_playwright_1.default.PlaywrightBlocker.fromPrebuiltAdsOnly(cross_fetch_1.default);
        }
        let context = br.contexts ? br.contexts() : [br];
        context.forEach(c => {
            // Existing pages
            c.pages().forEach(p => bl.enableBlockingInPage(p));
            // New pages
            c.on('page', async (p) => {
                await bl.enableBlockingInPage(p);
            });
        });
        console.log('Adblocker enabled');
    }
}
exports.default = default_1;
//# sourceMappingURL=index.js.map