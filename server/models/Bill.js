const mongoose = require("mongoose");

const billSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    provider: {
      type: String,
      required: [true, "Furnizorul este obligatoriu"],
      trim: true,
    },

    invoiceNumber: {
      type: String,
      default: "",
      trim: true,
    },

    issueDate: {
      type: Date,
      default: null,
    },

    amount: {
      type: Number,
      required: [true, "Suma este obligatorie"],
      min: 0,
    },

    dueDate: {
      type: Date,
      required: [true, "Data scadenței este obligatorie"],
    },

    status: {
      type: String,
      enum: ["unpaid", "paid"],
      default: "unpaid",
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    
    reminderSentAt: {
      type: Date,
      default: null,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Bill", billSchema);