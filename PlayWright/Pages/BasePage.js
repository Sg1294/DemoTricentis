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

  // Header UI verification methods
  async verifyHeaderLogoExists() {
    const logoSelector = '.header-logo img';
    return await this.isElementVisible(logoSelector);
  }

  async verifySearchBoxExists() {
    const searchBoxSelector = '.search-box';
    const searchInputSelector = '#small-searchterms';
    const searchButtonSelector = '.search-box-button';

    const searchBoxVisible = await this.isElementVisible(searchBoxSelector);
    const searchInputVisible = await this.isElementVisible(searchInputSelector);
    const searchButtonVisible = await this.isElementVisible(searchButtonSelector);

    return {
      searchBox: searchBoxVisible,
      searchInput: searchInputVisible,
      searchButton: searchButtonVisible,
      allVisible: searchBoxVisible && searchInputVisible && searchButtonVisible,
    };
  }

  async verifyShoppingCartFlyoutExists() {
    const cartFlyoutSelector = '#flyout-cart';
    try {
      // Check if element exists in DOM (may not be visible initially)
      const element = await this.page.$(cartFlyoutSelector);
      return element !== null;
    } catch (e) {
      return false;
    }
  }

  async verifyHeaderLinksWrapperExists() {
    const headerLinksSelector = '.header-links-wrapper';
    return await this.isElementVisible(headerLinksSelector);
  }

  async verifyLoggedInUserHeader(expectedEmail = null) {
    const loggedInElements = {
      userAccountLink: 'a.account',
      logoutLink: 'a.ico-logout',
      shoppingCartLink: 'a.ico-cart',
      wishlistLink: 'a.ico-wishlist',
      cartQty: '.cart-qty',
      wishlistQty: '.wishlist-qty',
    };

    const results = {};

    // Check if user account link is visible
    results.userAccountLinkVisible = await this.isElementVisible(loggedInElements.userAccountLink);

    // Verify user email if provided
    if (expectedEmail && results.userAccountLinkVisible) {
      try {
        const accountText = await this.getText(loggedInElements.userAccountLink);
        results.userEmail = accountText ? accountText.trim() : '';
        results.emailMatches = results.userEmail === expectedEmail;
      } catch (e) {
        results.userEmail = '';
        results.emailMatches = false;
      }
    } else if (results.userAccountLinkVisible) {
      try {
        const accountText = await this.getText(loggedInElements.userAccountLink);
        results.userEmail = accountText ? accountText.trim() : '';
        results.emailMatches = results.userEmail.length > 0; // Just verify email exists
      } catch (e) {
        results.userEmail = '';
        results.emailMatches = false;
      }
    }

    // Check other logged-in elements
    results.logoutLinkVisible = await this.isElementVisible(loggedInElements.logoutLink);
    results.shoppingCartLinkVisible = await this.isElementVisible(loggedInElements.shoppingCartLink);
    results.wishlistLinkVisible = await this.isElementVisible(loggedInElements.wishlistLink);
    results.cartQtyVisible = await this.isElementVisible(loggedInElements.cartQty);
    results.wishlistQtyVisible = await this.isElementVisible(loggedInElements.wishlistQty);

    // Get cart and wishlist quantities
    try {
      const cartQtyText = await this.getText(loggedInElements.cartQty);
      results.cartQuantity = cartQtyText ? cartQtyText.trim() : '';
    } catch (e) {
      results.cartQuantity = '';
    }

    try {
      const wishlistQtyText = await this.getText(loggedInElements.wishlistQty);
      results.wishlistQuantity = wishlistQtyText ? wishlistQtyText.trim() : '';
    } catch (e) {
      results.wishlistQuantity = '';
    }

    // Overall verification
    results.allLoggedInElementsVisible =
      results.userAccountLinkVisible &&
      results.logoutLinkVisible &&
      results.shoppingCartLinkVisible &&
      results.wishlistLinkVisible &&
      results.cartQtyVisible &&
      results.wishlistQtyVisible &&
      results.emailMatches;

    return results;
  }

  async verifyGuestUserHeader() {
    const guestElements = {
      registerLink: 'a.ico-register',
      loginLink: 'a.ico-login',
    };

    const registerVisible = await this.isElementVisible(guestElements.registerLink);
    const loginVisible = await this.isElementVisible(guestElements.loginLink);

    return {
      registerLinkVisible: registerVisible,
      loginLinkVisible: loginVisible,
      isGuestMode: registerVisible && loginVisible,
    };
  }

  async getHeaderCartQuantity() {
    const cartQtySelector = '.cart-qty';
    try {
      const cartQtyText = await this.getText(cartQtySelector);
      if (cartQtyText) {
        // Extract number from "(5)" format
        const match = cartQtyText.match(/\((\d+)\)/);
        return match ? parseInt(match[1], 10) : 0;
      }
      return 0;
    } catch (e) {
      return 0;
    }
  }

  async verifyHeaderCartQuantity(expectedQuantity) {
    const actualQuantity = await this.getHeaderCartQuantity();
    return {
      expectedQuantity,
      actualQuantity,
      matches: actualQuantity === expectedQuantity,
    };
  }

  async verifyCompleteHeaderUI() {
    const logoExists = await this.verifyHeaderLogoExists();
    const searchBox = await this.verifySearchBoxExists();
    const cartExists = await this.verifyShoppingCartFlyoutExists();
    const headerLinks = await this.verifyHeaderLinksWrapperExists();

    return {
      logo: logoExists,
      searchBox: searchBox,
      shoppingCart: cartExists,
      headerLinks: headerLinks,
      allHeaderElementsVisible: logoExists &&
                                 searchBox.allVisible &&
                                 cartExists &&
                                 headerLinks,
    };
  }

  // Header Menu verification methods
  async verifyHeaderMenuExists() {
    const headerMenuSelector = '.header-menu';
    return await this.isElementVisible(headerMenuSelector);
  }

  async verifyHeaderMenuItems() {
    const menuItems = {
      books: 'a[href="/books"]',
      computers: 'a[href="/computers"]',
      electronics: 'a[href="/electronics"]',
      apparelShoes: 'a[href="/apparel-shoes"]',
      digitalDownloads: 'a[href="/digital-downloads"]',
    };

    const results = {};
    for (const [item, selector] of Object.entries(menuItems)) {
      results[item] = await this.isElementVisible(selector);
    }
    return results;
  }

  async verifyHeaderSubMenuItems() {
    const subMenuItems = {
      // Computers submenu
      desktops: 'a[href="/desktops"]',
      notebooks: 'a[href="/notebooks"]',
      accessories: 'a[href="/accessories"]',
      // Electronics submenu
      cameraPhoto: 'a[href="/camera-photo"]',
      cellPhones: 'a[href="/cell-phones"]',
    };

    const results = {};
    for (const [item, selector] of Object.entries(subMenuItems)) {
      results[item] = await this.isElementVisible(selector);
    }
    return results;
  }

  async verifyCompleteHeaderMenu() {
    const headerExists = await this.verifyHeaderMenuExists();
    const menuItems = await this.verifyHeaderMenuItems();
    const subMenuItems = await this.verifyHeaderSubMenuItems();

    return {
      headerExists,
      mainMenu: menuItems,
      subMenu: subMenuItems,
      allItemsVisible: headerExists &&
        Object.values(menuItems).every(visible => visible) &&
        Object.values(subMenuItems).every(visible => visible),
    };
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

  // Left Sidebar verification methods
  async verifyLeftSidebarExists() {
    const leftSidebarSelector = '.leftside-3';
    return await this.isElementVisible(leftSidebarSelector);
  }

  async verifyCategoryNavigationBlock() {
    const categoryBlockSelector = '.block-category-navigation';
    const categoryTitleSelector = '.block-category-navigation .title strong';

    const blockVisible = await this.isElementVisible(categoryBlockSelector);
    const titleVisible = await this.isElementVisible(categoryTitleSelector);

    let titleText = '';
    if (titleVisible) {
      titleText = await this.getText(categoryTitleSelector);
    }

    return {
      blockVisible,
      titleVisible,
      titleText: titleText ? titleText.trim() : '',
      isValid: blockVisible && titleVisible && titleText?.trim() === 'Categories'
    };
  }

  async getCategoryNavigationItems() {
    const categoryLinksSelector = '.block-category-navigation .list li a';
    const categoryLinks = await this.page.$$(categoryLinksSelector);

    const categories = [];
    for (const link of categoryLinks) {
      const text = await link.textContent();
      const href = await link.getAttribute('href');
      categories.push({
        name: text ? text.trim() : '',
        href: href || ''
      });
    }

    return categories;
  }

  async verifyCategoryNavigationItems(expectedCategories) {
    const actualCategories = await this.getCategoryNavigationItems();
    const actualCategoryNames = actualCategories.map(cat => cat.name);

    const results = {
      expectedCount: expectedCategories.length,
      actualCount: actualCategories.length,
      countMatches: expectedCategories.length === actualCategories.length,
      categories: actualCategories,
      categoryNames: actualCategoryNames,
      allCategoriesPresent: true,
      missingCategories: [],
      extraCategories: []
    };

    // Check if all expected categories are present
    for (const expectedCat of expectedCategories) {
      if (!actualCategoryNames.includes(expectedCat)) {
        results.allCategoriesPresent = false;
        results.missingCategories.push(expectedCat);
      }
    }

    // Check for extra categories not in expected list
    for (const actualCat of actualCategoryNames) {
      if (!expectedCategories.includes(actualCat)) {
        results.extraCategories.push(actualCat);
      }
    }

    return results;
  }

  async verifyManufacturerNavigationBlock() {
    const manufacturerBlockSelector = '.block-manufacturer-navigation';
    const manufacturerTitleSelector = '.block-manufacturer-navigation .title strong';

    const blockVisible = await this.isElementVisible(manufacturerBlockSelector);
    const titleVisible = await this.isElementVisible(manufacturerTitleSelector);

    let titleText = '';
    if (titleVisible) {
      titleText = await this.getText(manufacturerTitleSelector);
    }

    return {
      blockVisible,
      titleVisible,
      titleText: titleText ? titleText.trim() : '',
      isValid: blockVisible && titleVisible && titleText?.trim() === 'Manufacturers'
    };
  }

  async getManufacturerNavigationItems() {
    const manufacturerLinksSelector = '.block-manufacturer-navigation .list li a';
    const manufacturerLinks = await this.page.$$(manufacturerLinksSelector);

    const manufacturers = [];
    for (const link of manufacturerLinks) {
      const text = await link.textContent();
      const href = await link.getAttribute('href');
      manufacturers.push({
        name: text ? text.trim() : '',
        href: href || ''
      });
    }

    return manufacturers;
  }

  async verifyManufacturerNavigationItems(expectedManufacturers) {
    const actualManufacturers = await this.getManufacturerNavigationItems();
    const actualManufacturerNames = actualManufacturers.map(mfr => mfr.name);

    return {
      expectedCount: expectedManufacturers.length,
      actualCount: actualManufacturers.length,
      countMatches: expectedManufacturers.length === actualManufacturers.length,
      manufacturers: actualManufacturers,
      manufacturerNames: actualManufacturerNames,
      allManufacturersPresent: expectedManufacturers.every(exp => actualManufacturerNames.includes(exp))
    };
  }

  async verifyPopularTagsBlock() {
    const tagsBlockSelector = '.block-popular-tags';
    const tagsTitleSelector = '.block-popular-tags .title strong';

    const blockVisible = await this.isElementVisible(tagsBlockSelector);
    const titleVisible = await this.isElementVisible(tagsTitleSelector);

    let titleText = '';
    if (titleVisible) {
      titleText = await this.getText(tagsTitleSelector);
    }

    return {
      blockVisible,
      titleVisible,
      titleText: titleText ? titleText.trim() : '',
      isValid: blockVisible && titleVisible && titleText?.trim() === 'Popular tags'
    };
  }

  async getPopularTags() {
    const tagsLinksSelector = '.block-popular-tags .tags ul li a';
    const tagLinks = await this.page.$$(tagsLinksSelector);

    const tags = [];
    for (const link of tagLinks) {
      const text = await link.textContent();
      const href = await link.getAttribute('href');
      tags.push({
        name: text ? text.trim() : '',
        href: href || ''
      });
    }

    return tags;
  }

  async verifyPopularTags(expectedTags) {
    const actualTags = await this.getPopularTags();
    const actualTagNames = actualTags.map(tag => tag.name);

    return {
      expectedCount: expectedTags.length,
      actualCount: actualTags.length,
      countMatches: expectedTags.length === actualTags.length,
      tags: actualTags,
      tagNames: actualTagNames,
      allTagsPresent: expectedTags.every(exp => actualTagNames.includes(exp))
    };
  }
}

module.exports = BasePage;
