const nodemailer = require("nodemailer");
const Bill = require("../models/Bill");
const User = require("../models/User");

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false,
    requireTLS: true,
  
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  
    //tls: {
      //rejectUnauthorized: false,
    //},
  });

const checkBillReminders = async () => {
  try {
    const now = new Date();

    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(
      threeDaysFromNow.getDate() + 3
    );

    const bills = await Bill.find({
      status: "unpaid",
      reminderSent: false,
      dueDate: {
        $gte: now,
        $lte: threeDaysFromNow,
      },
    });

    for (const bill of bills) {
      const user = await User.findById(
        bill.user
      );

      if (!user || !user.email) {
        continue;
      }

      const dueDate =
        new Date(
          bill.dueDate
        ).toLocaleDateString("ro-RO");

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: user.email,

        subject:
          `Reminder factură - ${bill.provider}`,

        text: `
Bună, ${user.firstName || ""}!

Factura de la ${bill.provider}, în valoare de ${bill.amount} lei, se apropie de data scadenței.

Data scadenței: ${dueDate}

Nu uita să verifici factura în Application Budget.

Application Budget
        `,
      };

      await transporter.sendMail(
        mailOptions
      );

      bill.reminderSent = true;
      bill.reminderSentAt = new Date();

      await bill.save();

      console.log(
        `Reminder trimis pentru factura ${bill._id}`
      );
    }
  } catch (error) {
    console.error(
      "Eroare la verificarea reminderelor:",
      error
    );
  }
};

module.exports = {
  checkBillReminders,
};