const Saving = require("../models/Saving");
const SavingTransaction = require(
  "../models/SavingTransaction"
);
const Income = require("../models/Income");
const Expense = require("../models/Expense");
exports.createSaving = async (req, res) => {
  try {
    const {
      title,
      targetAmount,
      description,
      deadline,
    } = req.body;

    const userId = req.user._id;

    if (!title || !targetAmount) {
      return res.status(400).json({
        success: false,
        message:
          "Titlul și suma obiectivului sunt obligatorii.",
      });
    }

    const saving = await Saving.create({
      user: userId,
      title,
      targetAmount,
      description,
      deadline,
    });

    return res.status(201).json({
      success: true,
      message:
        "Obiectiv creat cu succes!",
      saving,
    });
  } catch (error) {
    console.error(
      "Eroare createSaving:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Eroare la crearea obiectivului.",
    });
  }
};
exports.getSavings = async (req, res) => {
  try {
    const userId = req.user._id;

    const savings = await Saving.find({
      user: userId,
    }).sort({
      createdAt: -1,
    });

    return res.json({
      success: true,
      savings,
    });
  } catch (error) {
    console.error(
      "Eroare getSavings:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Eroare la încărcarea obiectivelor.",
    });
  }
};
exports.deleteSaving = async (req, res) => {
  try {
    const userId = req.user._id;
    const saving = await Saving.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!saving) {
      return res.status(404).json({
        success: false,
        message:
          "Obiectivul nu a fost găsit sau nu îți aparține.",
      });
    }
    const transactions =
      await SavingTransaction.find({
        saving: saving._id,
      });
    const savedAmount = transactions.reduce(
      (sum, transaction) =>
        sum + Number(transaction.amount || 0),
      0
    );
    if (savedAmount > 0) {
      await Income.create({
        user: userId,
        amount: savedAmount,
        category: "Restituire economii",
        description:
          `Restituire la ștergerea obiectivului "${saving.title}"`,
        date: new Date(),
      });
    }
    const transactionIds = transactions.map(
      (transaction) => transaction._id
    );

    if (transactionIds.length > 0) {
      await Expense.deleteMany({
        user: userId,
        savingTransaction: {
          $in: transactionIds,
        },
      });
    }
    await SavingTransaction.deleteMany({
      saving: saving._id,
    });
    await Saving.findByIdAndDelete(
      saving._id
    );

    return res.json({
      success: true,

      message:
        savedAmount > 0
          ? `Obiectivul a fost șters, iar ${savedAmount} lei au fost restituiți în Venituri.`
          : "Obiectivul a fost șters.",

      refundedAmount: savedAmount,
    });
  } catch (error) {
    console.error(
      "Eroare deleteSaving:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Eroare la ștergerea obiectivului.",
    });
  }
};
