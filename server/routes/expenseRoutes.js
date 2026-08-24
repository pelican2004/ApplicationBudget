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

// =====================================================
// ANALIZEAZĂ BONUL CU AI
// =====================================================

router.post(
  "/analyze",
  authMiddleware,
  receiptUpload.single("file"),
  analyzeExpenseReceipt
);

// =====================================================
// ADAUGĂ CHELTUIALĂ
// =====================================================

router.post(
  "/",
  authMiddleware,
  createExpense
);

// =====================================================
// OBȚINE CHELTUIELILE
// =====================================================

router.get(
  "/:user",
  authMiddleware,
  getExpenses
);

// =====================================================
// ȘTERGE CHELTUIALĂ
// =====================================================

router.delete(
  "/:id",
  authMiddleware,
  deleteExpense
);

module.exports = router;