const verifyEmailTemplate = (name, url) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: -apple-system, sans-serif; background: #f4f4f5; margin: 0; padding: 20px; }
    .container { max-width: 560px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 24px; }
    .body { padding: 32px; }
    .body p { color: #374151; line-height: 1.6; }
    .btn { display: inline-block; background: #6366f1; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0; }
    .footer { padding: 16px 32px; background: #f9fafb; color: #9ca3af; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>FinFlow</h1></div>
    <div class="body">
      <p>Hi <strong>${name}</strong>,</p>
      <p>Thanks for signing up for FinFlow! Please verify your email address to get started.</p>
      <a href="${url}" class="btn">Verify Email</a>
      <p>This link expires in 24 hours. If you didn't create an account, you can ignore this email.</p>
    </div>
    <div class="footer">© 2026 FinFlow. All rights reserved.</div>
  </div>
</body>
</html>
`;

const resetPasswordTemplate = (name, url) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: -apple-system, sans-serif; background: #f4f4f5; margin: 0; padding: 20px; }
    .container { max-width: 560px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 24px; }
    .body { padding: 32px; }
    .body p { color: #374151; line-height: 1.6; }
    .btn { display: inline-block; background: #6366f1; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0; }
    .footer { padding: 16px 32px; background: #f9fafb; color: #9ca3af; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>FinFlow</h1></div>
    <div class="body">
      <p>Hi <strong>${name}</strong>,</p>
      <p>We received a request to reset your password. Click the button below to set a new password.</p>
      <a href="${url}" class="btn">Reset Password</a>
      <p>This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
    </div>
    <div class="footer">© 2026 FinFlow. All rights reserved.</div>
  </div>
</body>
</html>
`;

const billReminderTemplate = (name, bill, daysLeft) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: -apple-system, sans-serif; background: #f4f4f5; margin: 0; padding: 20px; }
    .container { max-width: 560px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #f59e0b, #ef4444); padding: 32px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 24px; }
    .body { padding: 32px; }
    .body p { color: #374151; line-height: 1.6; }
    .bill-card { background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin: 16px 0; }
    .bill-name { font-size: 18px; font-weight: 700; color: #92400e; }
    .bill-amount { font-size: 24px; font-weight: 700; color: #dc2626; }
    .footer { padding: 16px 32px; background: #f9fafb; color: #9ca3af; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>Bill Reminder</h1></div>
    <div class="body">
      <p>Hi <strong>${name}</strong>,</p>
      <p>Your bill is due in <strong>${daysLeft} day(s)</strong>. Don't forget to pay!</p>
      <div class="bill-card">
        <div class="bill-name">${bill.name}</div>
        <div class="bill-amount">$${bill.amount.toFixed(2)}</div>
      </div>
      <p>Log in to FinFlow to mark it as paid.</p>
    </div>
    <div class="footer">© 2026 FinFlow. All rights reserved.</div>
  </div>
</body>
</html>
`;

module.exports = { verifyEmailTemplate, resetPasswordTemplate, billReminderTemplate };
