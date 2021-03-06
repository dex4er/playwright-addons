/**
 * @module playwright-addons/stealth
 */
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { appendFileSync } from 'fs';
import { Browser, BrowserContext } from 'playwright';

/**
 * Enable the stealth add-on
 * @param {Browser} br - Playwright Browser or BrowserContext object
 */
export default async function (br: Browser | BrowserContext) {
    if (typeof br !== 'object' || !((br as any).contexts || (br as any).pages)) {
        console.error('Need to provide a Playwright Browser or BrowserContext object');
    } else {
        let context = (br as any).context ? (br as Browser).contexts() : [br as BrowserContext];

        context.forEach(async c => {
            // Init evasions script on every page load
            await c.addInitScript({ path: dirname(__dirname) + '/evasions' });

            // Properly set UA info (vanilla Playwright only sets the UA)
            const userAgent = (c as any)._options.userAgent || '';
            const acceptLanguage = (c as any)._options.locale;
            const platform = userAgent.indexOf('Macintosh') !== -1 ? 'MacIntel' : (userAgent.indexOf('Windows') !== -1 ? 'Win32' : '');
            const oscpu = userAgent.match('(Intel.*?|Windows.*?)[;)]') ? userAgent.match('(Intel.*?|Windows.*?)[;)]')[1] : '';
            const userAgentMetadata = undefined; // TODO, see https://chromedevtools.github.io/devtools-protocol/tot/Emulation/#type-UserAgentMetadata

            // Firefox - write to prefs
            if (br.constructor.name === 'FFBrowser') {
                let prefs = `
                user_pref("general.appversion.override", "` + userAgent.replace('Mozilla/', '') + `");
                user_pref("general.oscpu.override", "` + oscpu + `");
                user_pref("general.platform.override", "` + platform + `");
                user_pref("general.useragent.override", "` + userAgent + `");
                `;
                if (acceptLanguage) {
                    prefs += `
                    user_pref("general.useragent.locale", "` + acceptLanguage + `");
                    user_pref("intl.accept_languages", "` + acceptLanguage + `");
                    `;
                }
                (br as any)._options.ownedServer._process.spawnargs.forEach((a: string) => {
                    if (a.indexOf('_firefoxdev_profile') !== -1) {
                        appendFileSync(a + '/prefs.js', prefs);
                    }
                });
            } else { // Chromium - use CDP to override
                c.pages().forEach(async p => {
                    try {
                        (await (p.context() as any).newCDPSession(p)).send('Emulation.setUserAgentOverride', { userAgent, acceptLanguage, platform, userAgentMetadata })
                    } catch (e) { console.log('Warning: could not set UA override:', e); }
                });

                c.on('page', async p => {
                    try {
                        (await (p.context() as any).newCDPSession(p)).send('Emulation.setUserAgentOverride', { userAgent, acceptLanguage, platform, userAgentMetadata })
                    } catch (e) { console.log('Warning: could not set UA override:', e); }
                });

            }
        });

        console.log('Stealth enabled');
    }
}