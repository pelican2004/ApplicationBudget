require("dotenv").config();

const {
  startBillReminderJob,
} = require(
  "./jobs/billReminderJob"
);

const {
  checkBillReminders,
} = require(
  "./services/billReminderService"
);

const mongoose = require("mongoose");
const app = require("./app");

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Conectat la MongoDB");

    app.listen(PORT, async () => {
      console.log(
        `🚀 Server pornit pe portul ${PORT}`
      );

      startBillReminderJob();

      // TEST TEMPORAR
      //await checkBillReminders();
    });
  })
  .catch((err) => {
    console.error("❌ Eroare MongoDB");
    console.error(err.message);
  });