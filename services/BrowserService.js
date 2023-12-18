const puppeteer = require("puppeteer")

class BrowserService {
  /**
   * Launches a puppeteer browser
   * @param {Object} options Options for launching the browser
   * @param {Boolean} options.dumpio If true, dumps IO from browser\
   * @param {Boolean} options.headless If true, runs browser in headless mode
   * @returns {Promise<puppeteer.Browser>} Returns the browser object
   */
  static async getBrowser(options) {
    const { dumpio = false, headless = true } = options

    if (dumpio) {
      console.log("Dumping IO from browser")
    }

    return puppeteer.launch({ dumpio, headless })
  }

  /**
   * Closes the puppeteer browser
   * @param {puppeteer.Browser} browser Browser to be closed
   * @returns {Promise<void>} Returns the closing promise
   */
  static async closeBrowser(browser) {
    if (!browser) {
      throw new Error("Browser is required")
    }

    return browser.close()
  }
}

module.exports = BrowserService
