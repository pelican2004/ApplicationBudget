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

// Adaugă factura
router.post(
  "/",
  authMiddleware,
  createBill
);

// Analizează factura PDF cu AI
router.post(
  "/analyze",
  authMiddleware,
  upload.single("file"),
  analyzeBill
);

// Obține facturile utilizatorului
router.get(
  "/:user",
  authMiddleware,
  getBills
);

// Marchează factura ca plătită/neplătită
router.put(
  "/:id/status",
  authMiddleware,
  toggleBillStatus
);

// Șterge factura
router.delete(
  "/:id",
  authMiddleware,
  deleteBill
);

module.exports = router;