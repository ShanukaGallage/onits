import nodemailer from 'nodemailer';

// Configure transporter from environment variables
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Sends a welcome email to a new user with their temporary password.
 */
export async function sendWelcomeEmail(to: string, name: string, username: string, tempPassword: string): Promise<void> {
  const mailOptions = {
    from: `"OnIts Support" <${process.env.SMTP_USER || 'no-reply@onits.com'}>`,
    to,
    subject: 'Welcome to OnIts! Set Up Your Account',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
        <div style="text-align: center; border-bottom: 2px solid #6366f1; padding-bottom: 15px; margin-bottom: 20px;">
          <h1 style="color: #4f46e5; margin: 0; font-size: 24px;">Welcome to OnIts</h1>
          <p style="color: #64748b; margin: 5px 0 0 0; font-size: 14px;">Your Task Management SaaS Workspace</p>
        </div>
        <div style="color: #334155; line-height: 1.6; font-size: 16px;">
          <p>Hello ${name},</p>
          <p>Your OnIts account has been created by an administrator.</p>
          <p><strong>Username:</strong> ${username}</p>
          <p><strong>Temporary Password:</strong> ${tempPassword}</p>
          <p>Log in at <a href="https://onits.app">onits.app</a> using your username or email address.</p>
          <p>You will be required to change your password on first login.</p>
          <p>Your username is permanent and cannot be changed.</p>
        </div>
        <div style="text-align: center; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px; color: #94a3b8; font-size: 12px;">
          <p style="margin: 0;">&copy; ${new Date().getFullYear()} OnIts Task Management. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Welcome email successfully sent to ${to}: ${info.messageId}`);
  } catch (error) {
    console.error(`Error sending welcome email to ${to}:`, error);
  }
}

/**
 * Sends a deadline warning email with the task name and its due date.
 */
export async function sendDeadlineWarningEmail(to: string, name: string, taskTitle: string, dueDate: Date): Promise<void> {
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(dueDate);

  const mailOptions = {
    from: `"OnIts Notifications" <${process.env.SMTP_USER || 'no-reply@onits.com'}>`,
    to,
    subject: `⚠️ Deadline Approaching: ${taskTitle}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
        <div style="text-align: center; border-bottom: 2px solid #ef4444; padding-bottom: 15px; margin-bottom: 20px;">
          <h1 style="color: #dc2626; margin: 0; font-size: 24px;">Task Deadline Warning</h1>
          <p style="color: #64748b; margin: 5px 0 0 0; font-size: 14px;">OnIts Notification Center</p>
        </div>
        <div style="color: #334155; line-height: 1.6; font-size: 16px;">
          <p>Hi <strong>${name}</strong>,</p>
          <p>This is a friendly reminder that a task assigned to you has an upcoming deadline.</p>
          
          <div style="background-color: #fff5f5; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0 0 8px 0; font-weight: 600; color: #991b1b;">Task Information</p>
            <p style="margin: 0; color: #7f1d1d;">
              <strong>Title:</strong> ${taskTitle}<br/>
              <strong>Due Date:</strong> ${formattedDate}
            </p>
          </div>
          
          <p>Please review the task progress and update its status accordingly.</p>
        </div>
        <div style="text-align: center; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px; color: #94a3b8; font-size: 12px;">
          <p style="margin: 0;">&copy; ${new Date().getFullYear()} OnIts Task Management. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Deadline warning email successfully sent to ${to}: ${info.messageId}`);
  } catch (error) {
    console.error(`Error sending deadline warning email to ${to}:`, error);
  }
}
