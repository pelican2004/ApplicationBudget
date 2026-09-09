const Bill = require("../models/Bill");
const Expense = require("../models/Expense");
exports.createBill = async (req, res) => {
  try {
    const {
      provider,
      invoiceNumber,
      issueDate,
      amount,
      dueDate,
      description,
    } = req.body;

    const userId = req.user._id;

    if (!provider || !amount || !dueDate) {
      return res.status(400).json({
        success: false,
        message:
          "Furnizorul, suma și data scadenței sunt obligatorii.",
      });
    }

    const bill = await Bill.create({
      user: userId,
      provider,
      invoiceNumber,
      issueDate,
      amount,
      dueDate,
      description,
    });

    return res.status(201).json({
      success: true,
      message:
        "Factura a fost adăugată cu succes!",
      bill,
    });
  } catch (error) {
    console.error(
      "Eroare createBill:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Eroare la adăugarea facturii.",
    });
  }
};

exports.getBills = async (req, res) => {
  try {
    const userId = req.user._id;

    const bills = await Bill.find({
      user: userId,
    }).sort({
      dueDate: 1,
    });

    return res.json({
      success: true,
      bills,
    });
  } catch (error) {
    console.error(
      "Eroare getBills:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Eroare la încărcarea facturilor.",
    });
  }
};

exports.toggleBillStatus = async (req, res) => {
  try {
    const userId = req.user._id;

    const bill = await Bill.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!bill) {
      return res.status(404).json({
        success: false,
        message:
          "Factura nu a fost găsită sau nu îți aparține.",
      });
    }
    if (bill.status === "paid") {
      bill.status = "unpaid";

      await bill.save();
      await Expense.findOneAndDelete({
        bill: bill._id,
        user: userId,
      });

      return res.json({
        success: true,
        message:
          "Factura a fost marcată ca neplătită.",
        bill,
      });
    }
    bill.status = "paid";

    await bill.save();
    const existingExpense =
      await Expense.findOne({
        bill: bill._id,
        user: userId,
      });

    let expense = existingExpense;
    if (!expense) {
      expense = await Expense.create({
        user: userId,
        amount: bill.amount,
        category: "Facturi",
        description:
          `Factura ${bill.provider}`,
        date: new Date(),
        bill: bill._id,
      });
    }

    return res.json({
      success: true,
      message:
        "Factura a fost plătită și adăugată la cheltuieli.",
      bill,
      expense,
    });
  } catch (error) {
    console.error(
      "Eroare toggleBillStatus:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Eroare la modificarea statusului facturii.",
    });
  }
};
exports.deleteBill = async (req, res) => {
  try {
    const userId = req.user._id;

    const bill = await Bill.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!bill) {
      return res.status(404).json({
        success: false,
        message:
          "Factura nu a fost găsită sau nu îți aparține.",
      });
    }
    await Expense.findOneAndDelete({
      bill: bill._id,
      user: userId,
    });
    await Bill.findByIdAndDelete(
      bill._id
    );

    return res.json({
      success: true,
      message:
        "Factura a fost ștearsă.",
    });
  } catch (error) {
    console.error(
      "Eroare deleteBill:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Eroare la ștergerea facturii.",
    });
  }
};
