const express = require("express");

const router = express.Router();

const {
  createBill,
  getBills,
  toggleBillStatus,
  deleteBill,
} = require("../controllers/billController");
const {
  analyzeBill,
} = require("../controllers/billAIController");
const upload = require("../middleware/upload");
const authMiddleware = require(
  "../middleware/authMiddleware"
);
console.log("createBill:", typeof createBill);
console.log("getBills:", typeof getBills);
console.log("toggleBillStatus:", typeof toggleBillStatus);
console.log("deleteBill:", typeof deleteBill);
console.log("analyzeBill:", typeof analyzeBill);
console.log("authMiddleware:", typeof authMiddleware);
console.log("upload:", typeof upload);
console.log("upload.single:", typeof upload?.single);
router.post(
  "/",
  authMiddleware,
  createBill
);
router.post(
  "/analyze",
  authMiddleware,
  upload.single("file"),
  analyzeBill
);
router.get(
  "/:user",
  authMiddleware,
  getBills
);
router.put(
  "/:id/status",
  authMiddleware,
  toggleBillStatus
);
router.delete(
  "/:id",
  authMiddleware,
  deleteBill
);

module.exports = router;
