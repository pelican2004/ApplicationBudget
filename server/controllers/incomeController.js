const Income = require("../models/Income");

exports.createIncome = async (req, res) => {
  try {
    const {
      amount,
      category,
      description,
      date,
    } = req.body;
    const userId = req.user._id;

    if (!amount || !category) {
      return res.status(400).json({
        success: false,
        message:
          "Suma și categoria sunt obligatorii.",
      });
    }

    const income = await Income.create({
      user: userId,
      amount,
      category,
      description,
      date,
    });

    return res.status(201).json({
      success: true,
      message:
        "Venit adăugat cu succes!",
      income,
    });
  } catch (error) {
    console.error(
      "Eroare createIncome:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Eroare la adăugarea venitului.",
    });
  }
};
exports.getIncomes = async (req, res) => {
  try {
    const userId = req.user._id;

    const incomes = await Income.find({
      user: userId,
    }).sort({
      date: -1,
    });
    return res.json({
      success: true,
      incomes,
    });
  } catch (error) {
    console.error(
      "Eroare getIncomes:",
      error
    );
    return res.status(500).json({
      success: false,
      message:
        "Eroare la încărcarea veniturilor.",
    });
  }
};
exports.deleteIncome = async (req, res) => {
  try {
    const userId = req.user._id;

    const income = await Income.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!income) {
      return res.status(404).json({
        success: false,
        message:
          "Venitul nu a fost găsit sau nu îți aparține.",
      });
    }

    await Income.findByIdAndDelete(
      income._id
    );

    return res.json({
      success: true,
      message:
        "Venitul a fost șters.",
    });
  } catch (error) {
    console.error(
      "Eroare deleteIncome:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Eroare la ștergere.",
    });
  }
};
