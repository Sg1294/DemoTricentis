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
      await this.page.getByRole('radio', { name: 'Male', exact: true }).check();
    } else if (userData.gender === 'female') {
      await this.page.getByRole('radio', { name: 'Female' }).check();
    }

    await this.page.getByLabel('First name:').fill(userData.firstName);
    await this.page.getByLabel('Last name:').fill(userData.lastName);
    await this.page.getByLabel('Email:').fill(userData.email);
    await this.page.getByLabel('Password:', { exact: true }).fill(userData.password);
    await this.page.getByLabel('Confirm password:').fill(userData.password);

    await this.page.getByRole('button', { name: 'Register' }).click();
    await this.waitForPageLoad();
  }

  async isRegistrationSuccessful() {
    try {
      const successMessage = this.page.getByText(/your registration completed/i);
      await successMessage.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch (e) {
      return false;
    }
  }

  async getResultMessage() {
    // Keep CSS selector for data extraction as it's a specific div
    return await this.getText(this.selectors.resultMessage);
  }

  async clickContinue() {
    await this.page.getByRole('button', { name: 'Continue' }).click();
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
