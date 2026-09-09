const cron = require("node-cron");

const {
  checkBillReminders,
} = require(
  "../services/billReminderService"
);

const startBillReminderJob = () => {
  console.log(
    "⏰ Sistemul de reminder pentru facturi este activ."
  );
  cron.schedule(
    "0 9 * * *",
    async () => {
      console.log(
        "🔎 Verific facturile apropiate de scadență..."
      );
      await checkBillReminders();
    }
  );
};

module.exports = {
  startBillReminderJob,
};
