const BasePage = require('./BasePage');

/**
 * CartPage - Page object for the shopping cart page
 */
class CartPage extends BasePage {
  constructor(page) {
    super(page);

    this.selectors = {
      cartTable: '.cart',
      cartItems: '.cart tbody tr',
      productName: '.product-name',
      productPrice: '.product-unit-price',
      productQuantity: '.qty-input',
      productSubtotal: '.product-subtotal',
      removeCheckbox: 'input[name="removefromcart"]',
      updateCartButton: 'input[name="updatecart"]',
      orderSubtotal: 'text=Sub-Total:',
      shippingCost: 'text=Shipping:',
      tax: 'text=Tax:',
      orderTotal: 'text=Total:',
      discountCouponInput: '#discountcouponcode',
      applyCouponButton: 'input[name="applydiscountcouponcode"]',
      discountMessage: '.message-success, .message-error',
      discountAmount: '.discount .value-summary',
      giftCardInput: '#giftcardcouponcode',
      applyGiftCardButton: 'input[name="applygiftcardcouponcode"]',
      continueShoppingButton: 'input[name="continueshopping"]',
      checkoutButton: '#checkout',
      termsOfServiceCheckbox: '#termsofservice',
      emptyCartMessage: '.order-summary-content',
      countrySelect: '#CountryId',
      stateSelect: '#StateProvinceId',
      zipInput: '#ZipPostalCode',
      estimateShippingButton: 'input[name="estimateshipping"]',
    };
  }

  async goToCart() {
    await this.navigate('/cart');
    await this.waitForPageLoad();
  }

  async isCartEmpty() {
    const content = await this.getText(this.selectors.emptyCartMessage);
    return content.includes('Your Shopping Cart is empty');
  }

  async getCartItems() {
    const items = [];
    const rows = await this.page.$$(this.selectors.cartItems);

    for (const row of rows) {
      const nameEl = await row.$(this.selectors.productName);
      const priceEl = await row.$(this.selectors.productPrice);
      const qtyEl = await row.$(this.selectors.productQuantity);
      const subtotalEl = await row.$(this.selectors.productSubtotal);

      if (nameEl && priceEl && qtyEl && subtotalEl) {
        const name = await nameEl.textContent();
        const price = await priceEl.textContent();
        const quantity = await qtyEl.inputValue();
        const subtotal = await subtotalEl.textContent();

        items.push({
          name: name.trim(),
          unitPrice: this.parsePrice(price),
          quantity: parseInt(quantity, 10),
          subtotal: this.parsePrice(subtotal),
        });
      }
    }

    return items;
  }

  async getCartItemCount() {
    const items = await this.getCartItems();
    return items.length;
  }

  async updateItemQuantity(itemIndex, newQuantity) {
    const quantityInputs = await this.page.$$(this.selectors.productQuantity);
    if (quantityInputs[itemIndex]) {
      await quantityInputs[itemIndex].fill(newQuantity.toString());
      await this.clickElement(this.selectors.updateCartButton);
      await this.waitForPageLoad();
      // Wait for cart to update (especially important for Webkit)
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(500); // Additional buffer for DOM updates
    } else {
      throw new Error(`Item at index ${itemIndex} not found`);
    }
  }

  async removeItem(itemIndex) {
    const removeCheckboxes = await this.page.$$(this.selectors.removeCheckbox);
    if (removeCheckboxes[itemIndex]) {
      await removeCheckboxes[itemIndex].check();
      await this.clickElement(this.selectors.updateCartButton);
      await this.waitForPageLoad();
      // Wait for cart to update (especially important for Webkit)
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(500); // Additional buffer for DOM updates
    } else {
      throw new Error(`Item at index ${itemIndex} not found`);
    }
  }

  async getOrderSubtotal() {
    try {
      await this.page.waitForLoadState('networkidle');
      const subtotalText = await this.getText(this.selectors.orderSubtotal, 5000);
      if (subtotalText) {
        // Extract price from "Sub-Total: 3310.00" format
        const match = subtotalText.match(/[\d.]+/);
        return match ? parseFloat(match[0]) : 0;
      }
      return 0;
    } catch (e) {
      console.log('Error getting order subtotal:', e.message);
      return 0;
    }
  }

  async getShippingCost() {
    try {
      const shippingText = await this.getText(this.selectors.shippingCost);
      if (shippingText) {
        const match = shippingText.match(/[\d.]+/);
        return match ? parseFloat(match[0]) : 0;
      }
      return 0;
    } catch (e) {
      return 0;
    }
  }

  async getTax() {
    try {
      const taxText = await this.getText(this.selectors.tax);
      if (taxText) {
        const match = taxText.match(/[\d.]+/);
        return match ? parseFloat(match[0]) : 0;
      }
      return 0;
    } catch (e) {
      return 0;
    }
  }

  async getOrderTotal() {
    try {
      const totalText = await this.getText(this.selectors.orderTotal);
      if (totalText) {
        const match = totalText.match(/[\d.]+/);
        return match ? parseFloat(match[0]) : 0;
      }
      return 0;
    } catch (e) {
      return 0;
    }
  }

  async getDiscountAmount() {
    try {
      const discountText = await this.getText(this.selectors.discountAmount);
      return this.parsePrice(discountText);
    } catch (e) {
      return 0;
    }
  }

  async applyCoupon(couponCode) {
    await this.fillInput(this.selectors.discountCouponInput, couponCode);
    await this.clickElement(this.selectors.applyCouponButton);
    await this.waitForPageLoad();

    try {
      return await this.getText(this.selectors.discountMessage);
    } catch (e) {
      return '';
    }
  }

  async applyGiftCard(giftCardCode) {
    await this.fillInput(this.selectors.giftCardInput, giftCardCode);
    await this.clickElement(this.selectors.applyGiftCardButton);
    await this.waitForPageLoad();
  }

  async verifyPriceCalculations() {
    const items = await this.getCartItems();
    const orderSubtotal = await this.getOrderSubtotal();
    const shipping = await this.getShippingCost();
    const tax = await this.getTax();
    const discount = await this.getDiscountAmount();
    const orderTotal = await this.getOrderTotal();

    let calculatedSubtotal = 0;
    const itemVerifications = [];

    for (const item of items) {
      const expectedItemSubtotal = item.unitPrice * item.quantity;
      const itemMatch = Math.abs(expectedItemSubtotal - item.subtotal) < 0.01;

      itemVerifications.push({
        name: item.name,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        expectedSubtotal: expectedItemSubtotal,
        actualSubtotal: item.subtotal,
        isCorrect: itemMatch,
      });

      calculatedSubtotal += item.subtotal;
    }

    const subtotalMatch = Math.abs(calculatedSubtotal - orderSubtotal) < 0.01;
    const expectedTotal = orderSubtotal + shipping + tax - discount;
    const totalMatch = Math.abs(expectedTotal - orderTotal) < 0.01;

    return {
      items: itemVerifications,
      calculatedSubtotal,
      orderSubtotal,
      subtotalMatch,
      shipping,
      tax,
      discount,
      expectedTotal,
      orderTotal,
      totalMatch,
      allCalculationsCorrect: subtotalMatch && totalMatch && itemVerifications.every((i) => i.isCorrect),
    };
  }

  async proceedToCheckout() {
    // NOTE: This checkbox lacks proper accessibility labels, so we use CSS selector
    // Best Practice: Would be to use getByRole('checkbox', { name: /terms/i })
    // but the application doesn't have proper ARIA labels for this element
    // Using CSS selector as fallback - acceptable when app has accessibility gaps
    await this.page.locator('#termsofservice').check();

    // Recommended: Using getByRole for button - best practice
    await this.page.getByRole('button', { name: 'Checkout' }).click();
    await this.waitForPageLoad();
  }

  async continueShopping() {
    await this.clickElement(this.selectors.continueShoppingButton);
    await this.waitForPageLoad();
  }

  async estimateShipping(country, state, zip) {
    await this.page.selectOption(this.selectors.countrySelect, country);
    await this.page.waitForTimeout(500);

    if (state) {
      await this.page.selectOption(this.selectors.stateSelect, state);
    }

    await this.fillInput(this.selectors.zipInput, zip);
    await this.clickElement(this.selectors.estimateShippingButton);
    await this.waitForPageLoad();
  }
}

module.exports = CartPage;
