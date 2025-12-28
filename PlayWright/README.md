# Tricentis Demo Web Shop - Playwright Test Automation Framework

A comprehensive end-to-end test automation framework for the Tricentis Demo Web Shop, built with Playwright and following industry best practices.

## 🎯 Project Overview

This framework provides automated testing for an e-commerce application, covering critical user journeys including registration, product browsing, cart operations, and checkout processes. Built with maintainability, scalability, and reliability in mind.

## ✨ Key Features

- **Page Object Model (POM)** - Organized, maintainable test architecture
- **Data-Driven Testing** - Externalized test data for flexibility
- **Cross-Browser Testing** - Automated tests across Chromium, Firefox, and WebKit
- **User-Facing Locators** - Playwright's recommended accessibility-first approach
- **Comprehensive Reporting** - HTML and Allure reports with detailed test results
- **CI/CD Integration** - GitHub Actions workflow for automated testing
- **Environment Management** - Secure credential handling via environment variables
- **Parallel Execution** - Fast test execution with configurable workers

## 🛠️ Tech Stack

- **Test Framework**: Playwright v1.40+
- **Language**: JavaScript (Node.js)
- **Reporting**: Playwright HTML Reporter, Allure
- **CI/CD**: GitHub Actions
- **Version Control**: Git/GitHub

## 📁 Project Structure

```
PlayWright/
├── .github/
│   └── workflows/
│       └── playwright.yml          # GitHub Actions CI/CD workflow
├── Data/
│   └── testData.json               # Test data (products, addresses, users)
├── Pages/
│   ├── BasePage.js                 # Base page with reusable methods
│   ├── HomePage.js                 # Home page object
│   ├── RegisterPage.js             # Registration page object
│   ├── LoginPage.js                # Login page object
│   ├── ProductPage.js              # Product listing & detail page object
│   ├── CartPage.js                 # Shopping cart page object
│   └── CheckoutPage.js             # Checkout process page object
├── tests/
│   └── orderPlacement.spec.js     # Test specifications
├── Utils/
│   └── helpers.js                  # Utility functions and helpers
├── playwright.config.js            # Playwright configuration
├── package.json                    # Dependencies and scripts
└── .env                            # Environment variables (not committed)
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Sg1294/DemoTricentis.git
   cd DemoTricentis/PlayWright
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Playwright browsers**
   ```bash
   npx playwright install
   ```

4. **Configure environment variables**

   Create a `.env` file in the root directory:
   ```env
   TEST_USER_EMAIL=your-email@example.com
   TEST_USER_PASSWORD=your-password
   ```

## 🧪 Running Tests

### Run all tests (all browsers)
```bash
npm test
```

### Run tests in specific browser
```bash
npm run test:chromium    # Chrome/Edge
npm run test:firefox     # Firefox
npm run test:webkit      # Safari
```

### Run in headed mode (see browser)
```bash
npm run test:headed
```

### Run in debug mode
```bash
npm run test:debug
```

### Run with UI mode
```bash
npm run test:ui
```

### Run specific test file
```bash
npx playwright test tests/orderPlacement.spec.js
```

### Run specific test case
```bash
npx playwright test --grep "TC001"
```

## 📊 Test Reports

### View HTML Report
```bash
npm run report
```

### Generate Allure Report
```bash
npm run allure:generate
npm run allure:open
```

Reports are automatically generated after each test run in:
- `playwright-report/` - HTML report
- `allure-results/` - Allure raw data
- `allure-report/` - Allure HTML report

## ⚙️ Configuration

### Playwright Configuration (`playwright.config.js`)

Key configurations:
- **Test Directory**: `./tests`
- **Parallel Execution**: Enabled
- **Retries**: 0 (for reliability)
- **Timeout**: 60 seconds per test
- **Browsers**: Chromium, Firefox, WebKit
- **Base URL**: https://demowebshop.tricentis.com
- **Screenshots**: On failure only
- **Videos**: On failure only
- **Trace**: On first retry

### Browser-Specific Settings

- **Chromium**: Default configuration
- **Firefox**: Headless mode with 100ms slowMo for stability
- **WebKit**: Default configuration

## 🧩 Test Scenarios

### Test Suite 1: Place Order with Multiple Products
- ✅ TC001 - Register new user and place order with multiple products
- ✅ TC002 - Verify individual product price calculations in cart
- ✅ TC003 - Update quantity and verify recalculation
- ✅ TC004 - Remove item from cart and verify total updates
- ✅ TC005 - Complete order with existing user login
- ✅ TC006 - Verify order total includes shipping and tax

### Test Suite 2: Cart Operations
- ✅ TC007 - Verify empty cart message
- ✅ TC008 - Add same product multiple times
- ✅ TC009 - Verify footer menu appears on homepage
- ✅ TC010 - Verify footer menu appears on checkout page

## 🎨 Design Patterns & Best Practices

### Page Object Model (POM)
- Separation of test logic from page interactions
- Reusable page methods
- Centralized element locators
- Inheritance from BasePage for common functionality

### User-Facing Locators
Following Playwright's recommended approach:
- `getByRole()` - Accessibility-first locator strategy
- `getByLabel()` - Form inputs based on visible labels
- `getByText()` - Content verification
- Scoped locators to avoid strict mode violations

### Data-Driven Testing
- Test data externalized in `testData.json`
- Environment-specific credentials via `.env`
- Reusable test data across multiple test cases

### Logging Strategy
- Post-action assertions logging
- Step completion tracking
- Detailed error context on failures

## 🔒 Security

- Credentials stored in `.env` file (gitignored)
- GitHub Actions uses repository secrets
- No sensitive data in version control
- Environment variables for different environments

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

Automatically runs on:
- Push to `main` branch
- Pull requests to `main` branch

**Workflow steps:**
1. Checkout code
2. Setup Node.js
3. Install dependencies
4. Install Playwright browsers
5. Run all tests
6. Upload test reports as artifacts

**Configuration:**
- Secrets configured in repository settings
- Test reports retained for 30 days
- Parallel execution disabled in CI for stability

## 📈 Test Results

Current Status: ✅ **100% Pass Rate**

- Total Tests: 10
- Browsers: 3 (Chromium, Firefox, WebKit)
- Total Executions: 30 (10 tests × 3 browsers)
- Pass Rate: 100%

## 🤝 Contributing

### Code Style Guidelines
- Use async/await for asynchronous operations
- Follow existing naming conventions
- Add comments for complex logic
- Keep methods focused and single-purpose

### Adding New Tests
1. Create test in appropriate spec file
2. Update test data in `testData.json` if needed
3. Follow AAA pattern (Arrange, Act, Assert)
4. Use descriptive test names
5. Add appropriate logging

### Adding New Page Objects
1. Extend from `BasePage`
2. Define selectors in constructor
3. Implement page-specific methods
4. Use user-facing locators when possible
5. Export in `Pages/index.js`

## 🐛 Troubleshooting

### Common Issues

**Tests failing locally but passing in CI:**
- Check Node.js version compatibility
- Ensure all dependencies are installed
- Verify `.env` file exists with correct credentials

**Timeout errors:**
- Increase timeout in `playwright.config.js`
- Check network connectivity
- Verify application is accessible

**Locator not found:**
- Inspect page to verify element exists
- Check if element is inside iframe
- Wait for element to be visible before interaction

## 📝 Environment Variables

Required in `.env` file:
```env
TEST_USER_EMAIL=your-email@example.com
TEST_USER_PASSWORD=your-secure-password
```

For GitHub Actions, configure as repository secrets:
- `USERNAME` → Maps to `TEST_USER_EMAIL`
- `PASSWORD` → Maps to `TEST_USER_PASSWORD`

## 📞 Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Review existing documentation
- Check Playwright official docs: https://playwright.dev

## 📄 License

This project is created for educational and demonstration purposes.

## 🙏 Acknowledgments

- Application Under Test: [Tricentis Demo Web Shop](https://demowebshop.tricentis.com)
- Testing Framework: [Playwright](https://playwright.dev)
- Reporting: [Allure Framework](https://docs.qameta.io/allure/)

---

**Built with ❤️ using Playwright**
