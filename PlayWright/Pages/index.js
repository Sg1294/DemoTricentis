/**
 * Page Objects Index
 * Central export point for all page objects
 */

const BasePage = require('./BasePage');
const HomePage = require('./HomePage');
const LoginPage = require('./LoginPage');
const RegisterPage = require('./RegisterPage');
const ProductPage = require('./ProductPage');
const CartPage = require('./CartPage');
const CheckoutPage = require('./CheckoutPage');

module.exports = {
  BasePage,
  HomePage,
  LoginPage,
  RegisterPage,
  ProductPage,
  CartPage,
  CheckoutPage,
};
