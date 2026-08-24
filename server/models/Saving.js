const mongoose = require("mongoose");

const savingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    targetAmount: {
      type: Number,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    deadline: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Saving", savingSchema);