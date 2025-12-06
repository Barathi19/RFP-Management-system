const { body, param } = require("express-validator");
const { REGEX } = require("../constant");

const createVendor = [
  body("name").notEmpty().withMessage("Name is required.").bail().isString(),
  body("contactName")
    .notEmpty()
    .withMessage("Contact Name is required.")
    .bail()
    .isString(),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("Invalid email address")
    .normalizeEmail(),
  body("mobile")
    .notEmpty()
    .withMessage("Mobile number is required.")
    .bail()
    .matches(REGEX.mobile)
    .withMessage("Invalid mobile number."),
  body("category").notEmpty().isString().withMessage("Category is required."),
  body("note").optional().isString(),
];

module.exports = { createVendor };
