const { test, expect } = require('@playwright/test');
const { HomePage, LoginPage, RegisterPage, ProductPage, CartPage, CheckoutPage } = require('../Pages');
const { loadTestData, generateUniqueEmail, comparePrices, roundToTwoDecimals, logStep, logAction, logAssertion } = require('../Utils/helpers');

// Load test data
const testData = loadTestData();

/**
 * Test Suite: Place Order with Multiple Products
 * Covers end-to-end order placement flow with price calculation verification
 */
test.describe('Place Order with Multiple Products', () => {
  let homePage;
  let loginPage;
  let registerPage;
  let productPage;
  let cartPage;
  let checkoutPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    loginPage = new LoginPage(page);
    registerPage = new RegisterPage(page);
    productPage = new ProductPage(page);
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);

    await homePage.goToHomePage();

    // Verify complete header UI is stable and visible
    const headerUI = await homePage.verifyCompleteHeaderUI();
    expect(headerUI.logo).toBeTruthy();
    expect(headerUI.searchBox.allVisible).toBeTruthy();
    expect(headerUI.shoppingCart).toBeTruthy();
    expect(headerUI.headerLinks).toBeTruthy();
    expect(headerUI.allHeaderElementsVisible).toBeTruthy();

    // Verify header menu is visible on homepage
    const headerMenuExists = await homePage.verifyHeaderMenuExists();
    expect(headerMenuExists).toBeTruthy();
  });

  test('TC001 - Register new user and place order with multiple products', async ({ page }) => {
    const uniqueEmail = generateUniqueEmail();
    const userData = {
      ...testData.users.newUser,
      email: uniqueEmail,
    };

    // Step 1: Register new user
    await test.step('Register new user', async () => {
      logAction('Clicking Register button');
      await homePage.clickRegister();
      logAction('Filling registration form', `Email: ${uniqueEmail}`);
      await registerPage.registerUser(userData);
      logAction('Verifying registration success');
      const isRegistered = await registerPage.isRegistrationSuccessful();
      expect(isRegistered).toBeTruthy();
      logAssertion('User registration successful', isRegistered);
      logAction('Clicking Continue button');
      await registerPage.clickContinue();
      logStep('Register new user');
    });

    // Step 2: Add multiple products to cart
    const productsToAdd = testData.testProducts.multipleProducts;
    let expectedCartTotal = 0;

    await test.step('Add multiple products to cart', async () => {
      for (const product of productsToAdd) {
        logAction('Navigating to product', `URL: ${product.url}`);
        await productPage.goToProductDetail(product.url);

        // Verify header UI is stable on product page
        const headerUI = await productPage.verifyCompleteHeaderUI();
        expect(headerUI.allHeaderElementsVisible).toBeTruthy();

        // Verify header menu is visible on product page
        const headerMenuOnProduct = await productPage.verifyHeaderMenuExists();
        expect(headerMenuOnProduct).toBeTruthy();

        logAction('Fetching product price');
        const actualPrice = await productPage.getProductDetailPrice();
        expect(comparePrices(actualPrice, product.price)).toBeTruthy();
        logAssertion(`Product price match (Expected: ${product.price}, Actual: ${actualPrice})`, comparePrices(actualPrice, product.price));

        logAction('Setting quantity', `Quantity: ${product.quantity}`);
        await productPage.setQuantity(product.quantity);
        logAction('Adding product to cart');
        await productPage.addToCartFromDetailPage();
        logAction('Closing notification');
        await productPage.closeNotification();

        expectedCartTotal += product.price * product.quantity;
      }
      logStep('Add multiple products to cart');
    });

    // Step 3: Verify cart contents and price calculations
    await test.step('Verify cart contents and calculations', async () => {
      logAction('Navigating to cart page');
      await cartPage.goToCart();

      // Verify header UI is stable on cart page
      const headerUI = await cartPage.verifyCompleteHeaderUI();
      expect(headerUI.allHeaderElementsVisible).toBeTruthy();

      // Verify header menu is visible on cart page
      const headerMenuOnCart = await cartPage.verifyHeaderMenuExists();
      expect(headerMenuOnCart).toBeTruthy();

      logAction('Fetching cart items');
      const cartItems = await cartPage.getCartItems();
      expect(cartItems.length).toBe(productsToAdd.length);
      logAssertion(`Cart contains expected items (Count: ${cartItems.length})`, cartItems.length === productsToAdd.length);

      for (let i = 0; i < cartItems.length; i++) {
        const item = cartItems[i];
        const expectedSubtotal = roundToTwoDecimals(item.unitPrice * item.quantity);
        expect(comparePrices(item.subtotal, expectedSubtotal)).toBeTruthy();
        logAssertion(`Item ${i + 1} subtotal calculation`, comparePrices(item.subtotal, expectedSubtotal), `Expected: ${expectedSubtotal}, Actual: ${item.subtotal}`);
      }

      logAction('Fetching order subtotal');
      const orderSubtotal = await cartPage.getOrderSubtotal();
      expect(comparePrices(orderSubtotal, expectedCartTotal)).toBeTruthy();
      logAssertion(`Order subtotal verification`, comparePrices(orderSubtotal, expectedCartTotal), `Expected: ${expectedCartTotal}, Actual: ${orderSubtotal}`);

      logAction('Verifying price calculations');
      const priceVerification = await cartPage.verifyPriceCalculations();
      expect(priceVerification.subtotalMatch).toBeTruthy();
      logAssertion('Price calculations verified', priceVerification.subtotalMatch);
      logStep('Verify cart contents and calculations');
    });

    // Step 4: Complete checkout
    await test.step('Complete checkout process', async () => {
      logAction('Proceeding to checkout');
      await cartPage.proceedToCheckout();

      const billingAddress = {
        ...testData.addresses.billing,
        email: uniqueEmail,
      };

      try {
        logAction('Completing checkout', 'Ground shipping, COD payment');
        await checkoutPage.completeCheckout(billingAddress, 'ground', 'cod');

        logAction('Verifying order confirmation');
        const isOrderConfirmed = await checkoutPage.isOrderConfirmed();
        expect(isOrderConfirmed).toBeTruthy();
        logAssertion('Order confirmed successfully', isOrderConfirmed);
        logStep('Complete checkout process');
      } catch (error) {
        logAssertion('Checkout process', false, error.message);
        throw error;
      }
    });
  });

  test('TC002 - Verify individual product price calculations in cart', async ({ page }) => {
    const products = testData.testProducts.simpleProducts;

    await test.step('Add products and verify prices', async () => {
      for (const product of products) {
        
        await productPage.goToProductDetail(product.url);

        const displayedPrice = await productPage.getProductDetailPrice();
        expect(comparePrices(displayedPrice, product.price)).toBeTruthy();

        await productPage.setQuantity(product.quantity);
        await productPage.addToCartFromDetailPage();
        await productPage.closeNotification();
      }
    });

    await test.step('Verify cart price calculations', async () => {
      await cartPage.goToCart();

      const verification = await cartPage.verifyPriceCalculations();

      console.log('Price Verification Results:');
      console.log('===========================');

      verification.items.forEach((item, index) => {
        console.log(`Product ${index + 1}: ${item.name}`);
        console.log(`  Unit Price: $${item.unitPrice}`);
        console.log(`  Quantity: ${item.quantity}`);
        console.log(`  Expected Subtotal: $${item.expectedSubtotal}`);
        console.log(`  Actual Subtotal: $${item.actualSubtotal}`);
        console.log(`  Correct: ${item.isCorrect}`);
      });

      console.log(`\nOrder Subtotal: $${verification.orderSubtotal}`);
      console.log(`Calculated Subtotal: $${verification.calculatedSubtotal}`);
      console.log(`Subtotal Match: ${verification.subtotalMatch}`);

      expect(verification.allCalculationsCorrect).toBeTruthy();
    });
  });

  test('TC003 - Update quantity and verify recalculation', async ({ page }) => {
    const product = testData.testProducts.simpleProducts[0];

    await test.step('Add product to cart', async () => {
      await productPage.goToProductDetail(product.url);
      await productPage.setQuantity(1);
      await productPage.addToCartFromDetailPage();
      await productPage.closeNotification();
    });

    await test.step('Update quantity and verify recalculation', async () => {
      await cartPage.goToCart();

      let items = await cartPage.getCartItems();
      expect(items[0].quantity).toBe(1);
      expect(comparePrices(items[0].subtotal, product.price)).toBeTruthy();

      await cartPage.updateItemQuantity(0, 5);

      items = await cartPage.getCartItems();
      expect(items[0].quantity).toBe(5);

      const expectedSubtotal = roundToTwoDecimals(product.price * 5);
      expect(comparePrices(items[0].subtotal, expectedSubtotal)).toBeTruthy();

      const orderSubtotal = await cartPage.getOrderSubtotal();
      expect(comparePrices(orderSubtotal, expectedSubtotal)).toBeTruthy();
    });
  });

  test('TC004 - Remove item from cart and verify total updates', async ({ page }) => {
    const products = testData.testProducts.simpleProducts.slice(0, 2);

    await test.step('Add multiple products', async () => {
      for (const product of products) {
        await productPage.goToProductDetail(product.url);
        await productPage.setQuantity(product.quantity);
        await productPage.addToCartFromDetailPage();
        await productPage.closeNotification();
      }
    });

    await test.step('Remove item and verify total', async () => {
      await cartPage.goToCart();

      const initialItems = await cartPage.getCartItems();
      expect(initialItems.length).toBe(2);

      await cartPage.removeItem(0);

      const remainingItems = await cartPage.getCartItems();
      expect(remainingItems.length).toBe(1);

      const newSubtotal = await cartPage.getOrderSubtotal();
      const secondProduct = products[1];
      const expectedNewSubtotal = roundToTwoDecimals(secondProduct.price * secondProduct.quantity);

      expect(comparePrices(newSubtotal, expectedNewSubtotal)).toBeTruthy();
    });
  });

  test('TC005 - Complete order with existing user login', async ({ page }) => {
    const email = process.env.TEST_USER_EMAIL;
    const password = process.env.TEST_USER_PASSWORD;

    console.log('=== TC005 Credential Debug ===');
    console.log('Email type:', typeof email, '| Value:', email);
    console.log('Password type:', typeof password, '| Value:', password ? '[SET]' : '[NOT SET]');
    console.log('Email check: !email =', !email, '| trim check =', email ? (email.trim() === '') : 'N/A');
    console.log('Password check: !password =', !password, '| trim check =', password ? (password.trim() === '') : 'N/A');
    console.log('Skip condition:', !email || !password || (email && email.trim() === '') || (password && password.trim() === ''));
    console.log('==============================');

    test.skip(!email || !password || (email && email.trim() === '') || (password && password.trim() === ''), 'Test credentials not provided in environment variables');

    await test.step('Login with existing user', async () => {
      await homePage.clickLogin();
      await loginPage.login(email, password);

      const isLoggedIn = await loginPage.isLoginSuccessful();
      expect(isLoggedIn).toBeTruthy();
    });

    const products = testData.testProducts.multipleProducts;

    await test.step('Add products to cart', async () => {
      for (const product of products) {
        await productPage.goToProductDetail(product.url);
        await productPage.setQuantity(product.quantity);
        await productPage.addToCartFromDetailPage();
        await productPage.closeNotification();
      }
    });

    await test.step('Verify cart and checkout', async () => {
      await cartPage.goToCart();

      const isEmpty = await cartPage.isCartEmpty();
      expect(isEmpty).toBeFalsy();

      const verification = await cartPage.verifyPriceCalculations();
      expect(verification.subtotalMatch).toBeTruthy();

      await cartPage.proceedToCheckout();

      // Handle flexible checkout flow for existing user
      // Check if billing address continue button is visible (existing user with saved address)
      const billingAddressContinueVisible = await page.isVisible('#billing-buttons-container input.button-1.new-address-next-step-button');
      if (billingAddressContinueVisible) {
        await page.click('#billing-buttons-container input.button-1.new-address-next-step-button');
        await page.waitForTimeout(1000);
      }

      // Check if in-store pickup is available and select it
      const inStorePickupVisible = await page.isVisible('#PickUpInStore');
      if (inStorePickupVisible) {
        await page.check('#PickUpInStore');
        await page.waitForTimeout(500);
      }

      // Check if shipping address continue button is visible
      const shippingAddressContinueVisible = await page.isVisible('#shipping-buttons-container input.button-1.new-address-next-step-button');
      if (shippingAddressContinueVisible) {
        await page.click('#shipping-buttons-container input.button-1.new-address-next-step-button');
        await page.waitForTimeout(1000);
      }

      // Check if shipping method step is visible
      const isOnShippingMethodStep = await page.isVisible('input[name="shippingmethod"]');
      if (isOnShippingMethodStep) {
        await checkoutPage.selectShippingMethod('ground');
        await checkoutPage.continueShippingMethod();
      }

      await checkoutPage.selectPaymentMethod('cod');
      await checkoutPage.continuePaymentMethod();

      await checkoutPage.continuePaymentInfo();
      await checkoutPage.confirmOrder();

      const isConfirmed = await checkoutPage.isOrderConfirmed();
      expect(isConfirmed).toBeTruthy();
    });
  });

  test('TC006 - Verify order total includes shipping and tax', async ({ page }) => {
    const product = testData.testProducts.simpleProducts[0];

    await test.step('Add product to cart', async () => {
      await productPage.goToProductDetail(product.url);
      await productPage.setQuantity(2);
      await productPage.addToCartFromDetailPage();
      await productPage.closeNotification();
    });

    await test.step('Verify total calculation', async () => {
      await cartPage.goToCart();

      const verification = await cartPage.verifyPriceCalculations();

      console.log('Order Summary:');
      console.log(`  Subtotal: $${verification.orderSubtotal}`);
      console.log(`  Shipping: $${verification.shipping}`);
      console.log(`  Tax: $${verification.tax}`);
      console.log(`  Discount: $${verification.discount}`);
      console.log(`  Expected Total: $${verification.expectedTotal}`);
      console.log(`  Actual Total: $${verification.orderTotal}`);
      console.log(`  Total Match: ${verification.totalMatch}`);

      if (verification.shipping > 0 || verification.tax > 0) {
        expect(verification.totalMatch).toBeTruthy();
      }
    });
  });
});

/**
 * Test Suite: Cart Operations
 */
test.describe('Cart Operations', () => {
  let homePage;
  let registerPage;
  let productPage;
  let cartPage;
  let checkoutPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    registerPage = new RegisterPage(page);
    productPage = new ProductPage(page);
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);

    await homePage.goToHomePage();

    // Verify complete header UI is stable and visible
    const headerUI = await homePage.verifyCompleteHeaderUI();
    expect(headerUI.logo).toBeTruthy();
    expect(headerUI.searchBox.allVisible).toBeTruthy();
    expect(headerUI.shoppingCart).toBeTruthy();
    expect(headerUI.headerLinks).toBeTruthy();
    expect(headerUI.allHeaderElementsVisible).toBeTruthy();

    // Verify header menu is visible on homepage
    const headerMenuExists = await homePage.verifyHeaderMenuExists();
    expect(headerMenuExists).toBeTruthy();
  });

  test('TC007 - Verify empty cart message', async ({ page }) => {
    await cartPage.goToCart();

    // Verify header UI is stable on cart page
    const headerUI = await cartPage.verifyCompleteHeaderUI();
    expect(headerUI.allHeaderElementsVisible).toBeTruthy();

    // Verify header menu is visible on cart page
    const headerMenuOnCart = await cartPage.verifyHeaderMenuExists();
    expect(headerMenuOnCart).toBeTruthy();

    const isEmpty = await cartPage.isCartEmpty();
    expect(isEmpty).toBeTruthy();
  });

  test('TC008 - Add same product multiple times', async ({ page }) => {
    const product = testData.testProducts.simpleProducts[0];

    await productPage.goToProductDetail(product.url);

    // Verify header UI is stable on product page
    const headerUIProduct = await productPage.verifyCompleteHeaderUI();
    expect(headerUIProduct.allHeaderElementsVisible).toBeTruthy();

    // Verify header menu is visible on product page
    const headerMenuOnProduct = await productPage.verifyHeaderMenuExists();
    expect(headerMenuOnProduct).toBeTruthy();

    await productPage.setQuantity(1);
    await productPage.addToCartFromDetailPage();
    await productPage.closeNotification();

    await productPage.setQuantity(2);
    await productPage.addToCartFromDetailPage();
    await productPage.closeNotification();

    await cartPage.goToCart();

    // Verify header UI is stable on cart page
    const headerUICart = await cartPage.verifyCompleteHeaderUI();
    expect(headerUICart.allHeaderElementsVisible).toBeTruthy();

    // Verify header menu is visible on cart page
    const headerMenuOnCart = await cartPage.verifyHeaderMenuExists();
    expect(headerMenuOnCart).toBeTruthy();

    const items = await cartPage.getCartItems();

    expect(items.length).toBe(1);
    expect(items[0].quantity).toBe(3);

    const expectedSubtotal = roundToTwoDecimals(product.price * 3);
    expect(comparePrices(items[0].subtotal, expectedSubtotal)).toBeTruthy();
  });

  test('TC009 - Verify footer menu appears on homepage', async ({ page }) => {
    await test.step('Navigate to homepage', async () => {
      logAction('Navigating to homepage');
      await homePage.goToHomePage();
      logStep('Navigate to homepage');
    });

    await test.step('Verify footer menu wrapper is visible', async () => {
      logAction('Checking footer menu wrapper visibility');
      const footerExists = await homePage.verifyFooterMenuExists();
      expect(footerExists).toBeTruthy();
      logAssertion('Footer menu wrapper is visible', footerExists);
      logStep('Verify footer menu wrapper is visible');
    });

    await test.step('Verify all footer sections are present', async () => {
      logAction('Verifying all footer sections');
      const sections = await homePage.verifyFooterSections();
      expect(sections.information).toBeTruthy();
      expect(sections.customerService).toBeTruthy();
      expect(sections.myAccount).toBeTruthy();
      expect(sections.followUs).toBeTruthy();
      logAssertion('Information section visible', sections.information);
      logAssertion('Customer Service section visible', sections.customerService);
      logAssertion('My Account section visible', sections.myAccount);
      logAssertion('Follow Us section visible', sections.followUs);
      logStep('Verify all footer sections are present');
    });

    await test.step('Verify footer links are accessible', async () => {
      logAction('Verifying footer links accessibility');
      const links = await homePage.verifyFooterLinks();
      expect(links.sitemap).toBeTruthy();
      expect(links.shippingReturns).toBeTruthy();
      expect(links.privacyPolicy).toBeTruthy();
      expect(links.contactUs).toBeTruthy();
      expect(links.search).toBeTruthy();
      expect(links.cart).toBeTruthy();
      logAssertion('Sitemap link visible', links.sitemap);
      logAssertion('Shipping & Returns link visible', links.shippingReturns);
      logAssertion('Privacy Policy link visible', links.privacyPolicy);
      logAssertion('Contact Us link visible', links.contactUs);
      logAssertion('Search link visible', links.search);
      logAssertion('Cart link visible', links.cart);
      logStep('Verify footer links are accessible');
    });
  });

  test('TC010 - Verify footer menu appears on checkout page', async ({ page }) => {
    const uniqueEmail = generateUniqueEmail();
    const userData = {
      ...testData.users.newUser,
      email: uniqueEmail,
    };

    // Register and login
    await test.step('Register new user', async () => {
      logAction('Clicking Register button');
      await homePage.clickRegister();
      logAction('Filling registration form', `Email: ${uniqueEmail}`);
      await registerPage.registerUser(userData);
      const isRegistered = await registerPage.isRegistrationSuccessful();
      expect(isRegistered).toBeTruthy();
      logAssertion('User registration successful', isRegistered);
      logAction('Clicking Continue button');
      await registerPage.clickContinue();
      logStep('Register new user');
    });

    // Add product to cart
    const product = testData.testProducts.multipleProducts[0];
    await test.step('Add product to cart', async () => {
      logAction('Navigating to product', `URL: ${product.url}`);
      await productPage.goToProductDetail(product.url);
      logAction('Setting quantity to 1');
      await productPage.setQuantity(1);
      logAction('Adding product to cart');
      await productPage.addToCartFromDetailPage();
      logAction('Closing notification');
      await productPage.closeNotification();
      logStep('Add product to cart');
    });

    // Navigate to cart to view subtotal and verify footer
    await test.step('Navigate to cart page and verify subtotal', async () => {
      logAction('Navigating to cart page');
      await cartPage.goToCart();
      logAction('Verifying cart has items');
      const isEmpty = await cartPage.isCartEmpty();
      expect(isEmpty).toBeFalsy();
      logStep('Navigate to cart page and verify subtotal');
    });

    await test.step('Verify footer menu wrapper is visible on cart page', async () => {
      logAction('Checking footer menu wrapper visibility on cart');
      const footerExists = await cartPage.verifyFooterMenuExists();
      expect(footerExists).toBeTruthy();
      logAssertion('Footer menu wrapper visible on cart', footerExists);
      logStep('Verify footer menu wrapper is visible on cart page');
    });

    await test.step('Verify all footer sections are present on cart page', async () => {
      logAction('Verifying all footer sections on cart');
      const sections = await cartPage.verifyFooterSections();
      expect(sections.information).toBeTruthy();
      expect(sections.customerService).toBeTruthy();
      expect(sections.myAccount).toBeTruthy();
      expect(sections.followUs).toBeTruthy();
      logAssertion('Information section visible on cart', sections.information);
      logAssertion('Customer Service section visible on cart', sections.customerService);
      logAssertion('My Account section visible on cart', sections.myAccount);
      logAssertion('Follow Us section visible on cart', sections.followUs);
      logStep('Verify all footer sections are present on cart page');
    });

    await test.step('Verify footer links are accessible on cart page', async () => {
      logAction('Verifying footer links accessibility on cart');
      const links = await cartPage.verifyFooterLinks();
      expect(links.sitemap).toBeTruthy();
      expect(links.privacyPolicy).toBeTruthy();
      expect(links.aboutUs).toBeTruthy();
      expect(links.myAccount).toBeTruthy();
      expect(links.orders).toBeTruthy();
      expect(links.cart).toBeTruthy();
      logAssertion('Sitemap link visible on cart', links.sitemap);
      logAssertion('Privacy Policy link visible on cart', links.privacyPolicy);
      logAssertion('About Us link visible on cart', links.aboutUs);
      logAssertion('My Account link visible on cart', links.myAccount);
      logAssertion('Orders link visible on cart', links.orders);
      logAssertion('Cart link visible on cart', links.cart);
      logStep('Verify footer links are accessible on cart page');
    });
  });
});

