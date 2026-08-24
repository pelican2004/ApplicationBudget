const express = require("express");

const router = express.Router();

const {
  createTransaction,
  getTransactions,
  deleteTransaction,
} = require("../controllers/savingTransactionController");

const authMiddleware = require(
  "../middleware/authMiddleware"
);

router.post(
  "/",
  authMiddleware,
  createTransaction
);

router.get(
  "/:saving",
  authMiddleware,
  getTransactions
);

router.delete(
  "/:id",
  authMiddleware,
  deleteTransaction
);

module.exports = router;