const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const incomeRoutes = require("./routes/incomeRoutes");
const expenseRoutes=require("./routes/expenseRoutes");
const savingRoutes = require("./routes/savingRoutes");
const savingTransactionRoutes = require("./routes/savingTransactionRoutes");
const billRoutes = require("./routes/billRoutes");
const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Application Budget API funcționează!",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/income", incomeRoutes);
app.use("/api/expense", expenseRoutes);
app.use("/api/saving", savingRoutes);
app.use("/api/saving-transaction", savingTransactionRoutes);
app.use("/api/bill", billRoutes);
module.exports = app;