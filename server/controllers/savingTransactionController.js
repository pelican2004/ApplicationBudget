const SavingTransaction = require(
  "../models/SavingTransaction"
);
const Saving = require("../models/Saving");
const Income = require("../models/Income");
const Expense = require("../models/Expense");

// =====================================================
// ADAUGĂ BANI ÎNTR-UN OBIECTIV DE ECONOMII
// =====================================================

exports.createTransaction = async (req, res) => {
  try {
    const { saving, amount } = req.body;

    const userId = req.user._id;

    // Verificăm suma introdusă
    const requestedAmount = Number(amount);

    if (
      !Number.isFinite(requestedAmount) ||
      requestedAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Suma trebuie să fie mai mare decât 0.",
      });
    }

    // Căutăm obiectivul DOAR dacă aparține
    // utilizatorului autentificat
    const savingGoal = await Saving.findOne({
      _id: saving,
      user: userId,
    });

    if (!savingGoal) {
      return res.status(404).json({
        success: false,
        message:
          "Obiectivul de economii nu a fost găsit sau nu îți aparține.",
      });
    }

    // Calculăm cât s-a economisit deja
    const transactions =
      await SavingTransaction.find({
        saving: savingGoal._id,
      });

    const savedAmount = transactions.reduce(
      (sum, transaction) =>
        sum + Number(transaction.amount || 0),
      0
    );

    // Verificăm dacă obiectivul este deja atins
    if (
      savedAmount >=
      Number(savingGoal.targetAmount)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Acest obiectiv a fost deja atins. Nu mai poți adăuga bani.",
      });
    }

    const remainingAmount =
      Number(savingGoal.targetAmount) -
      savedAmount;

    const amountForSaving = Math.min(
      requestedAmount,
      remainingAmount
    );

    const surplus =
      requestedAmount - amountForSaving;

    // =====================================================
    // CREĂM TRANZACȚIA
    // =====================================================

    const transaction =
      await SavingTransaction.create({
        saving: savingGoal._id,
        amount: amountForSaving,
      });

    // =====================================================
    // CREĂM CHELTUIALA
    // =====================================================

    const expense = await Expense.create({
      // folosim utilizatorul autentificat
      user: userId,

      amount: amountForSaving,
      category: "Economii",
      description:
        `Depunere pentru obiectivul "${savingGoal.title}"`,
      date: new Date(),

      savingTransaction: transaction._id,
    });

    // =====================================================
    // SURPLUSUL SE ÎNTOARCE ÎN VENITURI
    // =====================================================

    let income = null;

    if (surplus > 0) {
      income = await Income.create({
        user: userId,
        amount: surplus,
        category: "Restituire economii",
        description:
          `Surplus returnat din obiectivul "${savingGoal.title}"`,
        date: new Date(),
      });
    }

    // =====================================================
    // VERIFICĂM DACĂ OBIECTIVUL A FOST ATINS
    // =====================================================

    const newSavedAmount =
      savedAmount + amountForSaving;

    const goalCompleted =
      newSavedAmount >=
      Number(savingGoal.targetAmount);

    // =====================================================
    // MESAJ
    // =====================================================

    let message;

    if (surplus > 0) {
      message =
        `Au fost adăugați ${amountForSaving} lei în obiectiv. ` +
        `${surplus} lei au fost returnați automat în Venituri.`;

      if (goalCompleted) {
        message +=
          " 🎉 Obiectivul a fost atins!";
      }
    } else if (goalCompleted) {
      message =
        "Depunerea a fost adăugată. Felicitări, obiectivul a fost atins! 🎉";
    } else {
      message =
        "Depunerea a fost adăugată.";
    }

    return res.status(201).json({
      success: true,
      message,
      transaction,
      expense,
      income,
      savedAmount: newSavedAmount,
      remainingAmount:
        Number(savingGoal.targetAmount) -
        newSavedAmount,
      surplus,
      goalCompleted,
    });
  } catch (error) {
    console.error(
      "Eroare createTransaction:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Eroare la adăugarea depunerii.",
    });
  }
};

// =====================================================
// ISTORICUL DEPUNERILOR
// =====================================================

exports.getTransactions = async (req, res) => {
  try {
    const userId = req.user._id;

    // Verificăm mai întâi dacă obiectivul
    // aparține utilizatorului autentificat
    const savingGoal = await Saving.findOne({
      _id: req.params.saving,
      user: userId,
    });

    if (!savingGoal) {
      return res.status(404).json({
        success: false,
        message:
          "Obiectivul de economii nu a fost găsit sau nu îți aparține.",
      });
    }

    const transactions =
      await SavingTransaction.find({
        saving: savingGoal._id,
      }).sort({
        date: -1,
      });

    return res.json({
      success: true,
      transactions,
    });
  } catch (error) {
    console.error(
      "Eroare getTransactions:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Eroare la încărcarea istoricului.",
    });
  }
};

// =====================================================
// ȘTERGE O DEPUNERE
// =====================================================

exports.deleteTransaction = async (
  req,
  res
) => {
  try {
    const userId = req.user._id;

    // Găsim tranzacția
    const transaction =
      await SavingTransaction.findById(
        req.params.id
      );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message:
          "Depunerea nu a fost găsită.",
      });
    }

    // Verificăm cui îi aparține obiectivul
    // asociat tranzacției
    const savingGoal = await Saving.findOne({
      _id: transaction.saving,
      user: userId,
    });

    if (!savingGoal) {
      return res.status(403).json({
        success: false,
        message:
          "Nu ai permisiunea să ștergi această depunere.",
      });
    }

    // Ștergem doar cheltuiala asociată
    // aceluiași utilizator
    await Expense.findOneAndDelete({
      savingTransaction: transaction._id,
      user: userId,
    });

    // Ștergem tranzacția
    await SavingTransaction.findByIdAndDelete(
      transaction._id
    );

    return res.json({
      success: true,
      message:
        "Depunerea și cheltuiala asociată au fost șterse.",
    });
  } catch (error) {
    console.error(
      "Eroare deleteTransaction:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Eroare la ștergere.",
    });
  }
};