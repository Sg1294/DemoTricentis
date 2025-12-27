# QA Automation Assignment - Demo Web Shop

Playwright UI automation tests for https://demowebshop.tricentis.com

## Project Structure

```
PlayWright/
├── .github/
├── node_modules/
├── tests/
│   └── orderPlacement.spec.js    # Main test file
├── pages/                         # Page Object Model
│   ├── BasePage.js
│   ├── HomePage.js
│   ├── LoginPage.js
│   ├── RegisterPage.js
│   ├── ProductPage.js
│   ├── CartPage.js
│   ├── CheckoutPage.js
│   └── index.js
├── data/
│   └── testData.json             # Test data
├── utils/
│   └── helpers.js                # Utility functions
├── postman/
│   └── PetStoreAPITests.postman_collection.json
├── manual-testcases/
│   └── ManualTestCases.xlsx
├── .gitignore
├── .env.example
├── package.json
├── playwright.config.js
└── README.md
```

## Installation

```bash
npm install
npx playwright install
```

## Environment Setup

```bash
cp .env.example .env
# Edit .env with your credentials
```

## Running Tests

```bash
# Run all tests
npm test

# Run with specific browser
npm run test:chromium
npm run test:firefox
npm run test:webkit

# Run in headed mode
npm run test:headed

# Run in debug mode
npm run test:debug

# Open UI mode
npm run test:ui
```

## Test Reports

```bash
# View HTML report
npm run report
```

## Test Cases

| ID | Description |
|----|-------------|
| TC001 | Register new user and place order with multiple products |
| TC002 | Verify individual product price calculations in cart |
| TC003 | Update quantity and verify recalculation |
| TC004 | Remove item from cart and verify total updates |
| TC005 | Complete order with existing user login |
| TC006 | Verify order total includes shipping and tax |
| TC007 | Verify empty cart message |
| TC008 | Add same product multiple times |

## Price Calculation Verification

✅ Unit prices match product pages  
✅ Item subtotal = Unit Price × Quantity  
✅ Cart subtotal = Sum of all item subtotals  
✅ Order total = Subtotal + Shipping + Tax - Discount
