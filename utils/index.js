const { URL } = require("url")
const BrowserService = require("../services/BrowserService")

/**
 * Checks if string is a valid URL
 * @param {string} str String to be checked
 * @param {string[]} protocols Protocols of the URL
 * @returns {Boolean} Returns true if string is a valid URL, false otherwise
 */
const stringIsAValidUrl = (str, protocols = ["http", "https"]) => {
  try {
    const url = new URL(str)
    return protocols
      ? url.protocol
        ? protocols.map((x) => `${x.toLowerCase()}:`).includes(url.protocol)
        : false
      : true
  } catch (err) {
    return false
  }
}

/**
 * Launches the puppeteer browser and opens the URL passed as parameter, returning the browser and page objects
 * @param {Object} options Options for launching the browser and opening the URL
 * @param {string} options.url URL to be opened in browser
 * @param {Boolean} options.dumpio If true, dumps IO from browser
 * @param {Boolean} options.debug If true, logs all console messages from browser
 * @param {Boolean} options.waitForLoad If true, waits until all network requests have finished and the page has been fully loaded. (no network requests for 500ms) or for `timeout`ms if a `selectorForLoad` is passed
 * @param {string} options.selectorForLoad Selector to be used to check if page has been fully loaded
 * @param {Boolean} options.headless If true, runs browser in headless mode
 * @param {Boolean} options.requestInterception If true, intercepts requests and returns the response instead of crawling the page
 * @param {string} options.requestInterceptionURL URL or part of the URL to be intercepted
 * @param {number} options.timeout Timeout for the page to be loaded
 * @returns {Promise<{ browser: puppeteer.Browser, page: puppeteer.Page, resultRequestInterception: Promise<any> }>} Returns the browser and page objects, and the resultRequestInterception promise
 */
const launchBrowserTo = async (options) => {
  const {
    url,
    dumpio = false,
    debug = false,
    waitForLoad = true,
    selectorForLoad,
    headless = true,
    requestInterception = false,
    requestInterceptionURL = "",
    timeout = 5000,
  } = options

  if (!url) {
    throw new Error("URL is required")
  }

  if (typeof url !== "string") {
    throw new Error("URL must be a string")
  }

  if (!stringIsAValidUrl(url)) {
    throw new Error("URL is not valid")
  }

  const browser = await BrowserService.getBrowser({ dumpio, headless })
  const page = await browser.newPage()

  // Custom user agent
  const customUA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36"

  // Set custom user agent
  await page.setUserAgent(customUA)

  // We are going to intercept the requests and return the response instead of crawling the page
  // If we needed to modify the request before sending it, we would need to have a listener for the "request" event
  // and enable the request interception with page.setRequestInterception(true) before initializing the listener
  const resultRequestInterception = new Promise((resolve, reject) => {
    page.on("requestfinished", async (request) => {
      const response = request.response()
      if (!requestInterception) {
        resolve(null)
      }

      try {
        if (requestInterceptionURL && request.url().includes(requestInterceptionURL)) {
          if (request.redirectChain().length === 0 && response.request().method() !== "OPTIONS") {
            const responseBody = await response.buffer()
            const rooms = JSON.parse(responseBody.toString())
            resolve(rooms.hoteis[0].quartos)
          }
        }
      } catch (err) {
        reject(err)
      }
    })
  })

  await page.goto(url)

  if (waitForLoad) {
    if (!selectorForLoad) {
      // waits until there are no more than 2 network connections for at least 500ms
      await page.waitForNavigation({ waitUntil: "networkidle0" })
    } else {
      // waits until the selector is present on the page and visible, or for 5 seconds
      await page.waitForSelector(selectorForLoad, { visible: true, timeout }).catch(() => {
        throw new Error(`Selector ${selectorForLoad} not found on page`)
      })
    }
  }

  if (debug) {
    console.log("Debugging browser console")

    // listening for any "console" events on page and logging them on the server
    page.on("console", (msg) => {
      for (let i = 0; i < msg.args().length; ++i) console.log(`${i}: ${msg.args()[i]}`)
    })
  }

  return { browser, page, resultRequestInterception }
}

/**
 * Closes the puppeteer browser
 * @param {puppeteer.Browser} browser Browser to be closed
 * @returns {Promise<void>} Returns the closing promise
 */
const closeBrowser = (browser) => {
  return BrowserService.closeBrowser(browser)
}

module.exports = {
  launchBrowserTo,
  closeBrowser,
}
