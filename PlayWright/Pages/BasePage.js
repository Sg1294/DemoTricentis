/**
 * BasePage - Parent class for all page objects
 */
class BasePage {
  constructor(page) {
    this.page = page;
    this.baseURL = 'https://demowebshop.tricentis.com';
  }

  async navigate(path = '/') {
    // If path is a full URL, use it as-is; otherwise append to baseURL
    const url = path.startsWith('http') ? path : `${this.baseURL}${path}`;
    await this.page.goto(url);
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async getPageTitle() {
    return await this.page.title();
  }

  async clickElement(selector) {
    await this.page.click(selector);
  }

  async fillInput(selector, value) {
    await this.page.fill(selector, value);
  }

  async getText(selector, timeout = 5000) {
    try {
      return await this.page.textContent(selector);
    } catch (e) {
      return null;
    }
  }

  async isElementVisible(selector) {
    return await this.page.isVisible(selector);
  }

  async waitForElement(selector, timeout = 10000) {
    await this.page.waitForSelector(selector, { state: 'visible', timeout });
  }

  async takeScreenshot(name) {
    await this.page.screenshot({ path: `playwright-report/screenshots/${name}.png` });
  }

  parsePrice(priceString) {
    if (!priceString) return 0;
    return parseFloat(priceString.replace(/[^0-9.-]+/g, ''));
  }

  formatPrice(price) {
    return price.toFixed(2);
  }

  // Footer verification methods
  async verifyFooterMenuExists() {
    const footerSelector = '.footer-menu-wrapper';
    return await this.isElementVisible(footerSelector);
  }

  async verifyFooterSections() {
    const footerSections = {
      information: '.footer-menu-wrapper .column.information h3',
      customerService: '.footer-menu-wrapper .column.customer-service h3',
      myAccount: '.footer-menu-wrapper .column.my-account h3',
      followUs: '.footer-menu-wrapper .column.follow-us h3',
    };

    const results = {};
    for (const [section, selector] of Object.entries(footerSections)) {
      results[section] = await this.isElementVisible(selector);
    }
    return results;
  }

  async verifyFooterLinks() {
    const links = {
      sitemap: 'a[href="/sitemap"]',
      shippingReturns: 'a[href="/shipping-returns"]',
      privacyPolicy: 'a[href="/privacy-policy"]',
      conditionsOfUse: 'a[href="/conditions-of-use"]',
      aboutUs: 'a[href="/about-us"]',
      contactUs: 'a[href="/contactus"]',
      search: 'a[href="/search"]',
      news: 'a[href="/news"]',
      blog: 'a[href="/blog"]',
      myAccount: 'a[href="/customer/info"]',
      orders: 'a[href="/customer/orders"]',
      addresses: 'a[href="/customer/addresses"]',
      cart: 'a[href="/cart"]',
      wishlist: 'a[href="/wishlist"]',
    };

    const results = {};
    for (const [link, selector] of Object.entries(links)) {
      results[link] = await this.isElementVisible(selector);
    }
    return results;
  }
}

module.exports = BasePage;
