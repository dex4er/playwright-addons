// Delete webdriver
delete Object.getPrototypeOf(navigator).webdriver;

// Fake webGL vendor + renderer
try {
    // Remove traces of our Proxy ;-)
    var stripErrorStack = (stack: string) =>
        stack
            .split('\n')
            .filter(line => !line.includes(`at Object.apply`))
            .filter(line => !line.includes(`at Object.get`))
            .join('\n')

    const getParameterProxyHandler = {
        get(target: any, key: any) {
            try {
                // Mitigate Chromium bug (#130)
                if (typeof target[key] === 'function') {
                    return target[key].bind(target)
                }
                return Reflect.get(target, key)
            } catch (err) {
                err.stack = stripErrorStack(err.stack)
                throw err
            }
        },
        apply: function (target: any, thisArg: any, args: any) {
            const param = (args || [])[0]
            // UNMASKED_VENDOR_WEBGL
            if (param === 37445) {
                return 'Intel Inc.'
            }
            // UNMASKED_RENDERER_WEBGL
            if (param === 37446) {
                return 'Intel Iris OpenGL Engine'
            }
            try {
                return Reflect.apply(target, thisArg, args)
            } catch (err) {
                err.stack = stripErrorStack(err.stack)
                throw err
            }
        }
    }

    const proxy = new Proxy(
        WebGLRenderingContext.prototype.getParameter,
        getParameterProxyHandler
    )
    // To find out the original values here: Object.getOwnPropertyDescriptors(WebGLRenderingContext.prototype.getParameter)
    Object.defineProperty(WebGLRenderingContext.prototype, 'getParameter', {
        configurable: true,
        enumerable: false,
        writable: false,
        value: proxy
    })
} catch (err) {
    console.warn(err)
}