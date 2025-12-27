const BasePage = require('./BasePage');

/**
 * HomePage - Page object for the home page
 */
class HomePage extends BasePage {
  constructor(page) {
    super(page);

    this.selectors = {
      headerLogo: '.header-logo',
      searchBox: '#small-searchterms',
      searchButton: 'input.search-box-button',
      cartLink: '.ico-cart',
      cartQuantity: '.cart-qty',
      loginLink: 'a.ico-login',
      registerLink: 'a.ico-register',
      logoutLink: 'a.ico-logout',
      accountLink: 'a.ico-account',
      wishlistLink: 'a.ico-wishlist',
      topMenu: '.top-menu',
      booksCategory: '.top-menu a[href="/books"]',
      computersCategory: '.top-menu a[href="/computers"]',
      electronicsCategory: '.top-menu a[href="/electronics"]',
      apparelCategory: '.top-menu a[href="/apparel-shoes"]',
      digitalDownloadsCategory: '.top-menu a[href="/digital-downloads"]',
      jewelryCategory: '.top-menu a[href="/jewelry"]',
      giftCardsCategory: '.top-menu a[href="/gift-cards"]',
      featuredProducts: '.product-grid',
      productItem: '.product-item',
      productTitle: '.product-title a',
      productPrice: '.actual-price',
      addToCartButton: 'input.button-2.product-box-add-to-cart-button',
      barNotification: '#bar-notification',
      closeNotification: '.close',
    };
  }

  async goToHomePage() {
    await this.navigate('/');
    await this.waitForPageLoad();
  }

  async isUserLoggedIn() {
    return await this.isElementVisible(this.selectors.logoutLink);
  }

  async getLoggedInUserEmail() {
    if (await this.isUserLoggedIn()) {
      return await this.getText(this.selectors.accountLink);
    }
    return null;
  }

  async clickLogin() {
    await this.clickElement(this.selectors.loginLink);
  }

  async clickRegister() {
    await this.clickElement(this.selectors.registerLink);
  }

  async clickLogout() {
    await this.clickElement(this.selectors.logoutLink);
  }

  async goToCart() {
    await this.clickElement(this.selectors.cartLink);
  }

  async getCartQuantity() {
    const quantityText = await this.getText(this.selectors.cartQuantity);
    const match = quantityText.match(/\((\d+)\)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  async searchProduct(searchTerm) {
    await this.fillInput(this.selectors.searchBox, searchTerm);
    await this.clickElement(this.selectors.searchButton);
  }

  async goToCategory(categoryName) {
    const categoryMap = {
      books: this.selectors.booksCategory,
      computers: this.selectors.computersCategory,
      electronics: this.selectors.electronicsCategory,
      apparel: this.selectors.apparelCategory,
      'digital-downloads': this.selectors.digitalDownloadsCategory,
      jewelry: this.selectors.jewelryCategory,
      'gift-cards': this.selectors.giftCardsCategory,
    };

    const selector = categoryMap[categoryName.toLowerCase()];
    if (selector) {
      await this.clickElement(selector);
      await this.waitForPageLoad();
    } else {
      throw new Error(`Category "${categoryName}" not found`);
    }
  }

  async getFeaturedProducts() {
    const products = [];
    const productItems = await this.page.$$(this.selectors.productItem);

    for (const item of productItems) {
      const title = await item.$eval(this.selectors.productTitle, (el) => el.textContent.trim());
      const priceEl = await item.$(this.selectors.productPrice);
      const price = priceEl ? await priceEl.textContent() : '0';

      products.push({
        title,
        price: this.parsePrice(price),
      });
    }

    return products;
  }

  async closeNotificationBar() {
    try {
      await this.page.waitForSelector(this.selectors.barNotification, { state: 'visible', timeout: 5000 });
      await this.clickElement(this.selectors.closeNotification);
    } catch (e) {
      // Notification may not appear
    }
  }

  async waitForSuccessNotification() {
    await this.page.waitForSelector(this.selectors.barNotification, { state: 'visible', timeout: 10000 });
    return await this.getText(this.selectors.barNotification);
  }
}

module.exports = HomePage;
