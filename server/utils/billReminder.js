const prisma = require('../config/db');
const sendEmail = require('./sendEmail');
const { billReminderTemplate } = require('./emailTemplates');

/**
 * Runs daily — sends reminder emails for bills due in 1, 3, or 7 days.
 */
const sendBillReminders = async () => {
  try {
    const today = new Date().getDate();
    const reminderDays = [1, 3, 7];

    const users = await prisma.user.findMany({
      where: { isVerified: true },
      include: {
        bills: {
          where: { isPaid: false, isRecurring: true },
        },
      },
    });

    for (const user of users) {
      for (const bill of user.bills) {
        const daysLeft = bill.dueDate >= today
          ? bill.dueDate - today
          : 31 - today + bill.dueDate; // wrap around month end

        if (reminderDays.includes(daysLeft)) {
          await sendEmail({
            to: user.email,
            subject: `Reminder: ${bill.name} is due in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`,
            html: billReminderTemplate(user.name, bill, daysLeft),
          });
          console.log(`Bill reminder sent to ${user.email} for "${bill.name}" (${daysLeft}d left)`);
        }
      }
    }
  } catch (err) {
    console.error('Bill reminder error:', err.message);
  }
};

module.exports = sendBillReminders;
