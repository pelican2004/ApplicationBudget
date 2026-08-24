const mongoose = require("mongoose");

const savingTransactionSchema = new mongoose.Schema(
  {
    saving: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Saving",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "SavingTransaction",
  savingTransactionSchema
);