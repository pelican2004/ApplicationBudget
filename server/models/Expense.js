const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: [true, "Suma este obligatorie"],
    },

    category: {
      type: String,
      required: [true, "Categoria este obligatorie"],
    },
    store: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    date: {
      type: Date,
      default: Date.now,
    },

    // Depunerea de economii care a generat această cheltuială
    savingTransaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SavingTransaction",
      default: null,
    },

    // Factura care a generat această cheltuială
    bill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bill",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Expense", expenseSchema);