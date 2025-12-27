const BasePage = require('./BasePage');

/**
 * RegisterPage - Page object for the registration page
 */
class RegisterPage extends BasePage {
  constructor(page) {
    super(page);

    this.selectors = {
      genderMale: '#gender-male',
      genderFemale: '#gender-female',
      firstNameInput: '#FirstName',
      lastNameInput: '#LastName',
      emailInput: '#Email',
      passwordInput: '#Password',
      confirmPasswordInput: '#ConfirmPassword',
      registerButton: '#register-button',
      pageTitle: '.page-title h1',
      resultMessage: '.result',
      continueButton: 'input.button-1.register-continue-button',
      validationError: '.validation-summary-errors',
      fieldValidationError: '.field-validation-error',
    };
  }

  async goToRegisterPage() {
    await this.navigate('/register');
    await this.waitForPageLoad();
  }

  async registerUser(userData) {
    if (userData.gender === 'male') {
      await this.clickElement(this.selectors.genderMale);
    } else if (userData.gender === 'female') {
      await this.clickElement(this.selectors.genderFemale);
    }

    await this.fillInput(this.selectors.firstNameInput, userData.firstName);
    await this.fillInput(this.selectors.lastNameInput, userData.lastName);
    await this.fillInput(this.selectors.emailInput, userData.email);
    await this.fillInput(this.selectors.passwordInput, userData.password);
    await this.fillInput(this.selectors.confirmPasswordInput, userData.password);

    await this.clickElement(this.selectors.registerButton);
    await this.waitForPageLoad();
  }

  async isRegistrationSuccessful() {
    try {
      await this.page.waitForSelector(this.selectors.resultMessage, { state: 'visible', timeout: 5000 });
      const message = await this.getText(this.selectors.resultMessage);
      return message.includes('Your registration completed');
    } catch (e) {
      return false;
    }
  }

  async getResultMessage() {
    return await this.getText(this.selectors.resultMessage);
  }

  async clickContinue() {
    await this.clickElement(this.selectors.continueButton);
    await this.waitForPageLoad();
  }

  async getValidationError() {
    try {
      await this.page.waitForSelector(this.selectors.validationError, { state: 'visible', timeout: 3000 });
      return await this.getText(this.selectors.validationError);
    } catch (e) {
      return null;
    }
  }

  generateUniqueEmail() {
    const timestamp = Date.now();
    return `testuser_${timestamp}@test.com`;
  }
}

module.exports = RegisterPage;
