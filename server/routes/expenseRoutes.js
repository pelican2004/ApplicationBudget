const express = require("express");

const router = express.Router();

const {
  createExpense,
  getExpenses,
  deleteExpense,
} = require("../controllers/expenseController");

const {
  analyzeExpenseReceipt,
} = require("../controllers/expenseAIController");

const authMiddleware = require(
  "../middleware/authMiddleware"
);

const receiptUpload = require(
  "../middleware/receiptUpload"
);
router.post(
  "/analyze",
  authMiddleware,
  receiptUpload.single("file"),
  analyzeExpenseReceipt
);
router.post(
  "/",
  authMiddleware,
  createExpense
);
router.get(
  "/:user",
  authMiddleware,
  getExpenses
);
router.delete(
  "/:id",
  authMiddleware,
  deleteExpense
);

module.exports = router;
