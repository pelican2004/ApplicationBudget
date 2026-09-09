const express = require("express");
const router = express.Router();
const {
  createSaving,
  getSavings,
  deleteSaving,
} = require("../controllers/savingController");
const authMiddleware = require(
  "../middleware/authMiddleware"
);
router.post(
  "/",
  authMiddleware,
  createSaving
);
router.get(
  "/:user",
  authMiddleware,
  getSavings
);
router.delete(
  "/:id",
  authMiddleware,
  deleteSaving
);
module.exports = router;
