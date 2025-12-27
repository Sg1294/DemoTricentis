const BasePage = require('./BasePage');

/**
 * CheckoutPage - Page object for the checkout process
 */
class CheckoutPage extends BasePage {
  // Shipping method constants
  static SHIPPING_METHODS = {
    GROUND: 'ground',
    NEXT_DAY: 'nextday',
    SECOND_DAY: 'secondday',
  };

  // Payment method constants
  static PAYMENT_METHODS = {
    COD: 'cod',
    CHECK: 'check',
    CREDIT_CARD: 'creditcard',
    PURCHASE_ORDER: 'purchaseorder',
  };

  constructor(page) {
    super(page);

    this.selectors = {
      billingAddressStep: '#opc-billing',
      shippingAddressStep: '#opc-shipping',
      shippingMethodStep: '#opc-shipping_method',
      paymentMethodStep: '#opc-payment_method',
      paymentInfoStep: '#opc-payment_info',
      confirmOrderStep: '#opc-confirm_order',
      billingAddressDropdown: '#billing-address-select',
      billingFirstName: '#BillingNewAddress_FirstName',
      billingLastName: '#BillingNewAddress_LastName',
      billingEmail: '#BillingNewAddress_Email',
      billingCountry: '#BillingNewAddress_CountryId',
      billingState: '#BillingNewAddress_StateProvinceId',
      billingCity: '#BillingNewAddress_City',
      billingAddress1: '#BillingNewAddress_Address1',
      billingZip: '#BillingNewAddress_ZipPostalCode',
      billingPhone: '#BillingNewAddress_PhoneNumber',
      billingContinueButton: '#billing-buttons-container input.button-1.new-address-next-step-button',
      shipToSameAddress: '#ShipToSameAddress',
      shippingAddressDropdown: '#shipping-address-select',
      shippingFirstName: '#ShippingNewAddress_FirstName',
      shippingLastName: '#ShippingNewAddress_LastName',
      shippingCountry: '#ShippingNewAddress_CountryId',
      shippingState: '#ShippingNewAddress_StateProvinceId',
      shippingCity: '#ShippingNewAddress_City',
      shippingAddress1: '#ShippingNewAddress_Address1',
      shippingZip: '#ShippingNewAddress_ZipPostalCode',
      shippingPhone: '#ShippingNewAddress_PhoneNumber',
      shippingContinueButton: '#shipping-buttons-container input.button-1.new-address-next-step-button',
      inStorePickupCheckbox: '#PickUpInStore',
      shippingMethodRadio: 'input[name="shippingmethod"]',
      groundShipping: 'input[id="shippingoption_0"]',
      nextDayAir: 'input[id="shippingoption_1"]',
      secondDayAir: 'input[id="shippingoption_2"]',
      shippingMethodContinue: 'input.button-1.shipping-method-next-step-button',
      paymentMethodRadio: 'input[name="paymentmethod"]',
      cashOnDelivery: '#paymentmethod_0',
      checkMoneyOrder: '#paymentmethod_1',
      creditCard: '#paymentmethod_2',
      purchaseOrder: '#paymentmethod_3',
      paymentMethodContinue: 'input.button-1.payment-method-next-step-button',
      creditCardType: '#CreditCardType',
      cardholderName: '#CardholderName',
      cardNumber: '#CardNumber',
      expireMonth: '#ExpireMonth',
      expireYear: '#ExpireYear',
      cardCode: '#CardCode',
      paymentInfoContinue: 'input.button-1.payment-info-next-step-button',
      purchaseOrderNumber: '#PurchaseOrderNumber',
      confirmOrderButton: 'input.button-1.confirm-order-next-step-button',
      orderConfirmationTitle: '.order-completed .title',
      orderNumber: '.order-number strong',
      orderDetails: '.details',
      continueButton: 'input.button-2.order-completed-continue-button',
      cartItems: '.cart tbody tr',
      orderSubtotal: '.order-subtotal .value-summary',
      shippingCost: '.shipping-cost .value-summary',
      tax: '.tax-value .value-summary',
      orderTotal: '.order-total .value-summary',
      messageError: '.message-error',
      messageWarning: '.message-warning',
    };
  }

  /**
   * Navigate to the checkout page
   */
  async goToCheckout() {
    await this.navigate('/onepagecheckout');
    await this.waitForPageLoad();
  }

  /**
   * Generic helper to fill address forms (billing or shipping)
   * @private
   */
  async _fillAddressForm(address, selectors, includeEmail = false) {
    // Handle address dropdown if it exists
    const dropdown = await this.page.$(selectors.dropdown);
    if (dropdown) {
      const options = await dropdown.$$('option');
      if (options.length > 1) {
        await this.page.selectOption(selectors.dropdown, '');
      }
    }

    await this.fillInput(selectors.firstName, address.firstName);
    await this.fillInput(selectors.lastName, address.lastName);

    // Email is only required for billing address
    if (includeEmail && address.email) {
      await this.fillInput(selectors.email, address.email);
    }

    await this.page.selectOption(selectors.country, address.country);

    // Wait for state dropdown to be populated after country selection
    if (address.state) {
      await this.page.waitForSelector(selectors.state, { state: 'visible' });
      await this.page.selectOption(selectors.state, address.state);
    }

    await this.fillInput(selectors.city, address.city);
    await this.fillInput(selectors.address1, address.address1);
    await this.fillInput(selectors.zip, address.zip);
    await this.fillInput(selectors.phone, address.phone);
  }

  /**
   * Fill billing address form
   * @param {Object} address - Address object containing firstName, lastName, email, country, state, city, address1, zip, phone
   */
  async fillBillingAddress(address) {
    const billingSelectors = {
      dropdown: this.selectors.billingAddressDropdown,
      firstName: this.selectors.billingFirstName,
      lastName: this.selectors.billingLastName,
      email: this.selectors.billingEmail,
      country: this.selectors.billingCountry,
      state: this.selectors.billingState,
      city: this.selectors.billingCity,
      address1: this.selectors.billingAddress1,
      zip: this.selectors.billingZip,
      phone: this.selectors.billingPhone,
    };

    await this._fillAddressForm(address, billingSelectors, true);
  }

  async continueBillingAddress() {
    await this.clickElement(this.selectors.billingContinueButton);
    // Wait for one of the possible next steps to load
    await Promise.race([
      this.page.waitForSelector(this.selectors.shippingContinueButton, { state: 'visible', timeout: 10000 }),
      this.page.waitForSelector(this.selectors.shippingMethodRadio, { state: 'visible', timeout: 10000 }),
      this.page.waitForSelector(this.selectors.paymentMethodRadio, { state: 'visible', timeout: 10000 }),
    ]).catch(() => {
      // If none of the expected elements appear, continue anyway
      console.warn('No expected checkout step became visible after continuing billing address');
    });
  }

  async setShipToSameAddress(sameAddress) {
    if (sameAddress) {
      await this.page.check(this.selectors.shipToSameAddress);
    } else {
      await this.page.uncheck(this.selectors.shipToSameAddress);
    }
  }

  /**
   * Fill shipping address form
   * @param {Object} address - Address object containing firstName, lastName, country, state, city, address1, zip, phone
   */
  async fillShippingAddress(address) {
    const shippingSelectors = {
      dropdown: this.selectors.shippingAddressDropdown,
      firstName: this.selectors.shippingFirstName,
      lastName: this.selectors.shippingLastName,
      country: this.selectors.shippingCountry,
      state: this.selectors.shippingState,
      city: this.selectors.shippingCity,
      address1: this.selectors.shippingAddress1,
      zip: this.selectors.shippingZip,
      phone: this.selectors.shippingPhone,
    };

    await this._fillAddressForm(address, shippingSelectors, false);
  }

  async continueShippingAddress() {
    await this.clickElement(this.selectors.shippingContinueButton);
    // Wait for one of the possible next steps
    await Promise.race([
      this.page.waitForSelector(this.selectors.shippingMethodRadio, { state: 'visible', timeout: 10000 }),
      this.page.waitForSelector(this.selectors.paymentMethodRadio, { state: 'visible', timeout: 10000 }),
    ]).catch(() => {
      console.warn('No expected checkout step became visible after continuing shipping address');
    });
  }

  /**
   * Select shipping method
   * @param {string} method - Shipping method (use CheckoutPage.SHIPPING_METHODS constants)
   */
  async selectShippingMethod(method = CheckoutPage.SHIPPING_METHODS.GROUND) {
    const methodMap = {
      [CheckoutPage.SHIPPING_METHODS.GROUND]: this.selectors.groundShipping,
      [CheckoutPage.SHIPPING_METHODS.NEXT_DAY]: this.selectors.nextDayAir,
      [CheckoutPage.SHIPPING_METHODS.SECOND_DAY]: this.selectors.secondDayAir,
    };

    const selector = methodMap[method.toLowerCase()] || this.selectors.groundShipping;

    try {
      await this.page.waitForSelector(selector, { state: 'visible', timeout: 5000 });
      await this.page.click(selector);
    } catch (e) {
      console.warn(`Failed to select shipping method '${method}' using specific selector. Falling back to first available option. Error: ${e.message}`);
      await this.page.click(this.selectors.shippingMethodRadio);
    }
  }

  async continueShippingMethod() {
    await this.clickElement(this.selectors.shippingMethodContinue);
    // Wait for payment method step to become visible
    await this.page.waitForSelector(this.selectors.paymentMethodStep, { state: 'visible', timeout: 10000 });
  }

  /**
   * Select payment method
   * @param {string} method - Payment method (use CheckoutPage.PAYMENT_METHODS constants)
   */
  async selectPaymentMethod(method = CheckoutPage.PAYMENT_METHODS.COD) {
    const methodMap = {
      [CheckoutPage.PAYMENT_METHODS.COD]: this.selectors.cashOnDelivery,
      [CheckoutPage.PAYMENT_METHODS.CHECK]: this.selectors.checkMoneyOrder,
      [CheckoutPage.PAYMENT_METHODS.CREDIT_CARD]: this.selectors.creditCard,
      [CheckoutPage.PAYMENT_METHODS.PURCHASE_ORDER]: this.selectors.purchaseOrder,
    };

    const selector = methodMap[method.toLowerCase()] || this.selectors.cashOnDelivery;

    try {
      await this.page.waitForSelector(selector, { state: 'visible', timeout: 5000 });
      await this.page.click(selector);
    } catch (e) {
      console.warn(`Failed to select payment method '${method}' using specific selector. Falling back to first available option. Error: ${e.message}`);
      await this.page.click(this.selectors.paymentMethodRadio);
    }
  }

  async continuePaymentMethod() {
    await this.clickElement(this.selectors.paymentMethodContinue);
    // Wait for payment info step to become visible
    await this.page.waitForSelector(this.selectors.paymentInfoStep, { state: 'visible', timeout: 10000 });
  }

  /**
   * Fill credit card information
   * @param {Object} cardInfo - Card information object containing type, name, number, expMonth, expYear, cvv
   */
  async fillCreditCardInfo(cardInfo) {
    await this.page.selectOption(this.selectors.creditCardType, cardInfo.type);
    await this.fillInput(this.selectors.cardholderName, cardInfo.name);
    await this.fillInput(this.selectors.cardNumber, cardInfo.number);
    await this.page.selectOption(this.selectors.expireMonth, cardInfo.expMonth);
    await this.page.selectOption(this.selectors.expireYear, cardInfo.expYear);
    await this.fillInput(this.selectors.cardCode, cardInfo.cvv);
  }

  /**
   * Fill purchase order number
   * @param {string} poNumber - Purchase order number
   */
  async fillPurchaseOrderNumber(poNumber) {
    await this.fillInput(this.selectors.purchaseOrderNumber, poNumber);
  }

  async continuePaymentInfo() {
    await this.clickElement(this.selectors.paymentInfoContinue);
    // Wait for confirm order step to become visible
    await this.page.waitForSelector(this.selectors.confirmOrderStep, { state: 'visible', timeout: 10000 });
  }

  async confirmOrder() {
    await this.clickElement(this.selectors.confirmOrderButton);
    await this.waitForPageLoad();
  }

  /**
   * Check if order was successfully confirmed
   * @returns {Promise<boolean>} True if order confirmation message is displayed
   */
  async isOrderConfirmed() {
    try {
      await this.page.waitForSelector(this.selectors.orderConfirmationTitle, {
        state: 'visible',
        timeout: 10000,
      });
      const title = await this.getText(this.selectors.orderConfirmationTitle);
      return title.toLowerCase().includes('your order has been successfully processed');
    } catch (e) {
      return false;
    }
  }

  /**
   * Get the order number from the confirmation page
   * @returns {Promise<string>} Order number
   */
  async getOrderNumber() {
    const orderText = await this.getText(this.selectors.orderNumber);
    return orderText.trim();
  }

  async clickContinueAfterOrder() {
    await this.clickElement(this.selectors.continueButton);
    await this.waitForPageLoad();
  }

  /**
   * Complete the entire checkout process
   * @param {Object} billingAddress - Billing address object (required)
   * @param {string} shippingMethod - Shipping method (use CheckoutPage.SHIPPING_METHODS constants)
   * @param {string} paymentMethod - Payment method (use CheckoutPage.PAYMENT_METHODS constants)
   * @param {Object|null} paymentDetails - Payment details object (required for credit card and purchase order)
   * @param {string} paymentDetails.type - Credit card type (for credit card payment)
   * @param {string} paymentDetails.name - Cardholder name (for credit card payment)
   * @param {string} paymentDetails.number - Card number (for credit card payment)
   * @param {string} paymentDetails.expMonth - Expiration month (for credit card payment)
   * @param {string} paymentDetails.expYear - Expiration year (for credit card payment)
   * @param {string} paymentDetails.cvv - CVV code (for credit card payment)
   * @param {string} paymentDetails.poNumber - Purchase order number (for purchase order payment)
   * @throws {Error} If billing address is not provided or required payment details are missing
   * @example
   * await checkoutPage.completeCheckout(
   *   billingAddress,
   *   CheckoutPage.SHIPPING_METHODS.GROUND,
   *   CheckoutPage.PAYMENT_METHODS.COD
   * );
   */
  async completeCheckout(
    billingAddress,
    shippingMethod = CheckoutPage.SHIPPING_METHODS.GROUND,
    paymentMethod = CheckoutPage.PAYMENT_METHODS.COD,
    paymentDetails = null
  ) {
    // Validate required parameters
    if (!billingAddress) {
      throw new Error('Billing address is required for checkout');
    }

    try {
      await this.fillBillingAddress(billingAddress);
      await this.continueBillingAddress();

      // Check if shipping address step is showing with in-store pickup option
      const inStorePickupVisible = await this.page.isVisible(this.selectors.inStorePickupCheckbox);
      if (inStorePickupVisible) {
        await this.page.check(this.selectors.inStorePickupCheckbox);
        await this.page.waitForTimeout(500); // Brief wait for UI to update
      }

      // Check if shipping address continue button is still visible
      const shippingAddressContinueVisible = await this.page.isVisible(this.selectors.shippingContinueButton);
      if (shippingAddressContinueVisible) {
        await this.continueShippingAddress();
      }

      // Check if we're on the shipping method step (won't show if in-store pickup was selected)
      const isOnShippingMethodStep = await this.page.isVisible(this.selectors.shippingMethodRadio);
      if (isOnShippingMethodStep) {
        await this.selectShippingMethod(shippingMethod);
        await this.continueShippingMethod();
      }

      await this.selectPaymentMethod(paymentMethod);
      await this.continuePaymentMethod();

      // Handle payment info based on payment method
      const paymentMethodLower = paymentMethod.toLowerCase();

      if (paymentMethodLower === CheckoutPage.PAYMENT_METHODS.CREDIT_CARD) {
        if (!paymentDetails) {
          throw new Error('Credit card details are required when using credit card payment method');
        }
        await this.fillCreditCardInfo(paymentDetails);
        await this.continuePaymentInfo();
      } else if (paymentMethodLower === CheckoutPage.PAYMENT_METHODS.PURCHASE_ORDER) {
        if (!paymentDetails || !paymentDetails.poNumber) {
          throw new Error('Purchase order number is required when using purchase order payment method');
        }
        await this.fillPurchaseOrderNumber(paymentDetails.poNumber);
        await this.continuePaymentInfo();
      } else if (
        paymentMethodLower === CheckoutPage.PAYMENT_METHODS.COD ||
        paymentMethodLower === CheckoutPage.PAYMENT_METHODS.CHECK
      ) {
        // COD and Check/Money Order don't require additional payment info
        await this.continuePaymentInfo();
      } else {
        console.warn(`Unknown payment method '${paymentMethod}'. Attempting to continue...`);
        await this.continuePaymentInfo();
      }

      await this.confirmOrder();
    } catch (error) {
      console.error(`Checkout failed: ${error.message}`);
      throw error;
    }
  }

  async getErrorMessage() {
    try {
      return await this.getText(this.selectors.messageError);
    } catch (e) {
      return null;
    }
  }
}

module.exports = CheckoutPage;
