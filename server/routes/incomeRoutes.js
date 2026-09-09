const express = require("express");
const router = express.Router();
const {
  createIncome,
  getIncomes,
  deleteIncome,
} = require("../controllers/incomeController");

const authMiddleware = require("../middleware/authMiddleware");
router.post(
  "/",
  authMiddleware,
  createIncome
);
router.get(
  "/:user",
  authMiddleware,
  getIncomes
);
router.delete(
  "/:id",
  authMiddleware,
  deleteIncome
);
module.exports = router;
