const BasePage = require('./BasePage');

/**
 * ProductPage - Page object for product listing and detail pages
 */
class ProductPage extends BasePage {
  constructor(page) {
    super(page);

    this.selectors = {
      productGrid: '.product-grid',
      productItem: '.product-item',
      productTitle: '.product-title a',
      productPrice: '.actual-price',
      addToCartButton: 'input.button-2.product-box-add-to-cart-button',
      productName: '.product-name h1',
      productDetailPrice: '.product-price span',
      quantityInput: '.qty-input',
      addToCartDetailButton: '#add-to-cart-button-*',
      productDescription: '.full-description',
      productSku: '.sku .value',
      categoryTitle: '.category-page .page-title h1',
      sortDropdown: '#products-orderby',
      pageSizeDropdown: '#products-pagesize',
      viewModeGrid: '.viewmode-icon.grid',
      viewModeList: '.viewmode-icon.list',
      pager: '.pager',
      currentPage: '.current-page',
      nextPage: '.next-page',
      prevPage: '.previous-page',
      barNotification: '#bar-notification',
      notificationContent: '.content',
      closeNotification: '.close',
    };
  }

  async goToCategory(category) {
    await this.navigate(`/${category}`);
    await this.waitForPageLoad();
  }

  async getProducts() {
    const products = [];
    const productItems = await this.page.$$(this.selectors.productItem);

    for (const item of productItems) {
      const titleEl = await item.$(this.selectors.productTitle);
      const priceEl = await item.$(this.selectors.productPrice);

      const title = titleEl ? await titleEl.textContent() : '';
      const price = priceEl ? await priceEl.textContent() : '0';
      const href = titleEl ? await titleEl.getAttribute('href') : '';

      products.push({
        title: title.trim(),
        price: this.parsePrice(price),
        url: href,
      });
    }

    return products;
  }

  async clickProduct(productTitle) {
    const selector = `${this.selectors.productTitle}:has-text("${productTitle}")`;
    await this.page.click(selector);
    await this.waitForPageLoad();
  }

  async clickProductByIndex(index) {
    const products = await this.page.$$(this.selectors.productTitle);
    if (products[index]) {
      await products[index].click();
      await this.waitForPageLoad();
    } else {
      throw new Error(`Product at index ${index} not found`);
    }
  }

  async addToCartFromListing(index) {
    const buttons = await this.page.$$(`${this.selectors.productItem} ${this.selectors.addToCartButton}`);
    if (buttons[index]) {
      await buttons[index].click();
      await this.waitForNotification();
    } else {
      throw new Error(`Add to cart button at index ${index} not found`);
    }
  }

  async getProductName() {
    return await this.getText(this.selectors.productName);
  }

  async getProductDetailPrice() {
    const priceText = await this.getText(this.selectors.productDetailPrice);
    return this.parsePrice(priceText);
  }

  async setQuantity(quantity) {
    await this.page.getByLabel('Qty:').fill(quantity.toString());
  }

  async getQuantity() {
    const value = await this.page.getByLabel('Qty:').inputValue();
    return parseInt(value, 10);
  }

  async addToCartFromDetailPage() {
    const productDetailSection = this.page.locator('.product-essential');
    await productDetailSection.getByRole('button', { name: 'Add to cart' }).click();
    await this.waitForNotification();
  }

  async waitForNotification() {
    await this.page.waitForSelector(this.selectors.barNotification, { state: 'visible', timeout: 10000 });
    return await this.getText(`${this.selectors.barNotification} ${this.selectors.notificationContent}`);
  }

  async closeNotification() {
    try {
      // Try multiple approaches as close buttons can have different ARIA labels
      const closeButton = this.page.locator('#bar-notification').getByRole('link', { name: 'close' });
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }
    } catch (e) {
    }
  }

  async sortProducts(option) {
    await this.page.selectOption(this.selectors.sortDropdown, option);
    await this.waitForPageLoad();
  }

  async setPageSize(size) {
    await this.page.selectOption(this.selectors.pageSizeDropdown, size);
    await this.waitForPageLoad();
  }

  async goToProductDetail(productUrl) {
    await this.navigate(productUrl);
    await this.waitForPageLoad();
  }

  async getProductSku() {
    try {
      return await this.getText(this.selectors.productSku);
    } catch (e) {
      return '';
    }
  }
}

module.exports = ProductPage;
