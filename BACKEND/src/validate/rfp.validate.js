const { body, param } = require("express-validator");

const generateRFP = [body("text").notEmpty().withMessage("Text is required")];

const createRFP = [
  body("title").notEmpty().withMessage("Title is required"),
  body("budgetTotal").isNumeric().withMessage("Budget must be a number"),
  body("items").isArray({ min: 1 }).withMessage("Items must be a non-empty array"),
  body("items.*.name").notEmpty().withMessage("Item name is required"),
  body("items.*.quantity").isNumeric().withMessage("Item quantity must be a number"),
  body("deliveryDays").isNumeric().withMessage("Delivery days must be a number"),
  body("originalRequest").notEmpty().withMessage("Original request is required"),
  body("budgetTotal").isNumeric().withMessage("Budget must be a number"),
  body("description").notEmpty().withMessage("Description is required"),
  body("warrantyMonths").isNumeric().withMessage("Warranty months must be a number"),
  body("paymentTerms").optional(),
];

const getRFPDetail = [param("id").isMongoId().withMessage("Invalid ObjectId")];

const sendRFP = [
  body("vendorIds")
    .isArray({ min: 1 })
    .withMessage("vendorIds should not be an empty array"),
  body("vendorIds.*")
    .notEmpty()
    .isMongoId()
    .withMessage("Each item should be a valid ObjectId"),
  ...getRFPDetail,
];

module.exports = { generateRFP, createRFP, getRFPDetail, sendRFP };
