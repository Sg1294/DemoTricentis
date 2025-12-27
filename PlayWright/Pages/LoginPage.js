const BasePage = require('./BasePage');

/**
 * LoginPage - Page object for the login page
 */
class LoginPage extends BasePage {
  constructor(page) {
    super(page);

    this.selectors = {
      emailInput: '#Email',
      passwordInput: '#Password',
      rememberMeCheckbox: '#RememberMe',
      loginButton: 'input.button-1.login-button',
      forgotPasswordLink: '.forgot-password a',
      registerButton: 'input.button-1.register-button',
      validationError: '.validation-summary-errors',
      fieldValidationError: '.field-validation-error',
      pageTitle: '.page-title h1',
    };
  }

  async goToLoginPage() {
    await this.navigate('/login');
    await this.waitForPageLoad();
  }

  async login(email, password, rememberMe = false) {
    await this.fillInput(this.selectors.emailInput, email);
    await this.fillInput(this.selectors.passwordInput, password);

    if (rememberMe) {
      await this.clickElement(this.selectors.rememberMeCheckbox);
    }

    await this.clickElement(this.selectors.loginButton);
    await this.waitForPageLoad();
  }

  async isLoginSuccessful() {
    try {
      await this.page.waitForSelector('a.ico-logout', { state: 'visible', timeout: 5000 });
      return true;
    } catch (e) {
      return false;
    }
  }

  async getValidationError() {
    try {
      await this.page.waitForSelector(this.selectors.validationError, { state: 'visible', timeout: 3000 });
      return await this.getText(this.selectors.validationError);
    } catch (e) {
      return null;
    }
  }

  async getFieldError() {
    try {
      await this.page.waitForSelector(this.selectors.fieldValidationError, { state: 'visible', timeout: 3000 });
      return await this.getText(this.selectors.fieldValidationError);
    } catch (e) {
      return null;
    }
  }

  async goToRegister() {
    await this.clickElement(this.selectors.registerButton);
    await this.waitForPageLoad();
  }

  async clickForgotPassword() {
    await this.clickElement(this.selectors.forgotPasswordLink);
    await this.waitForPageLoad();
  }
}

module.exports = LoginPage;
