const Expense = require("../models/Expense");

// =====================================================
// ADAUGĂ CHELTUIALĂ
// =====================================================

exports.createExpense = async (req, res) => {
  try {
    const {
      amount,
      category,
      store,
      description,
      date,
    } = req.body;
    // Utilizatorul vine din JWT
    const userId = req.user._id;

    if (!amount || !category) {
      return res.status(400).json({
        success: false,
        message:
          "Suma și categoria sunt obligatorii.",
      });
    }

    const expense = await Expense.create({
      user: userId,
      amount,
      category,
      description,
      date,
      store,
    });

    return res.status(201).json({
      success: true,
      message:
        "Cheltuiala a fost adăugată cu succes!",
      expense,
    });
  } catch (error) {
    console.error(
      "Eroare createExpense:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Eroare la adăugarea cheltuielii.",
    });
  }
};

// =====================================================
// CHELTUIELILE UTILIZATORULUI AUTENTIFICAT
// =====================================================

exports.getExpenses = async (req, res) => {
  try {
    // Ignorăm req.params.user
    // și folosim utilizatorul din JWT
    const userId = req.user._id;

    const expenses = await Expense.find({
      user: userId,
    }).sort({
      date: -1,
    });

    return res.json({
      success: true,
      expenses,
    });
  } catch (error) {
    console.error(
      "Eroare getExpenses:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Eroare la încărcarea cheltuielilor.",
    });
  }
};

// =====================================================
// ȘTERGE CHELTUIALĂ
// =====================================================

exports.deleteExpense = async (req, res) => {
  try {
    const userId = req.user._id;

    const expense = await Expense.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message:
          "Cheltuiala nu a fost găsită sau nu îți aparține.",
      });
    }

    await Expense.findByIdAndDelete(
      expense._id
    );

    return res.json({
      success: true,
      message:
        "Cheltuiala a fost ștearsă.",
    });
  } catch (error) {
    console.error(
      "Eroare deleteExpense:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Eroare la ștergere.",
    });
  }
};