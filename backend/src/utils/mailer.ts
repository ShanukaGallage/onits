import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.resend.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'resend',
    pass: process.env.SMTP_PASS || process.env.RESEND_API_KEY,
  },
});

/**
 * In development, Resend's onboarding@resend.dev sender can only deliver to
 * the verified account owner's address. Set DEV_EMAIL_OVERRIDE in .env to
 * your own email to receive all test emails regardless of the real recipient.
 * In production (NODE_ENV=production), emails go to the real recipient.
 */
function resolveRecipient(realTo: string): string {
  if (process.env.NODE_ENV !== 'production' && process.env.DEV_EMAIL_OVERRIDE) {
    return process.env.DEV_EMAIL_OVERRIDE;
  }
  return realTo;
}

/**
 * Sends a welcome email to a newly created user with their temporary credentials.
 */
export async function sendWelcomeEmail(
  to: string,
  name: string,
  username: string,
  tempPassword: string
): Promise<void> {
  const recipient = resolveRecipient(to);
  const mailOptions = {
    from: process.env.SMTP_FROM || `"OnIts" <noreply@onits.app>`,
    to: recipient,
    subject: recipient !== to
      ? `[DEV → ${to}] Welcome to OnIts — Your Account is Ready`
      : 'Welcome to OnIts — Your Account is Ready',
    html: `
<div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;background:#0F172A;color:#E2E8F0;border-radius:12px">
  <h1 style="color:#4FACFE;font-size:24px;margin:0 0 8px">Welcome to OnIts</h1>
  <p style="color:#94A3B8;margin:0 0 24px">Your account has been created by an administrator.</p>
  <div style="background:#1E293B;border-radius:8px;padding:20px;margin-bottom:24px">
    <p style="margin:0 0 12px"><span style="color:#64748B;font-size:12px;text-transform:uppercase;letter-spacing:.08em">Name</span><br><strong>${name}</strong></p>
    <p style="margin:0 0 12px"><span style="color:#64748B;font-size:12px;text-transform:uppercase;letter-spacing:.08em">Username</span><br><strong style="color:#4FACFE">${username}</strong></p>
    <p style="margin:0"><span style="color:#64748B;font-size:12px;text-transform:uppercase;letter-spacing:.08em">Temporary Password</span><br><strong style="color:#FBBF24">${tempPassword}</strong></p>
  </div>
  <p style="color:#94A3B8;font-size:14px">You can log in using your <strong>username or email address</strong>.</p>
  <p style="color:#EF4444;font-size:13px">You will be required to change your password on first login. Your username is permanent and cannot be changed.</p>
  <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="display:inline-block;background:#3B82F6;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:16px">Sign In to OnIts →</a>
  <p style="color:#334155;font-size:12px;margin-top:32px">© 2026 OnIts. This is an automated message.</p>
</div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Mailer] Welcome email sent to ${to} — messageId: ${info.messageId}`);
  } catch (error) {
    console.error(`[Mailer] Failed to send welcome email to ${to}:`, error);
  }
}

/**
 * Sends a deadline warning email notifying the user that a task is due within 24 hours.
 */
export async function sendDeadlineWarningEmail(
  to: string,
  name: string,
  taskTitle: string,
  dueDate: Date
): Promise<void> {
  const formattedDate = dueDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const recipient = resolveRecipient(to);
  const mailOptions = {
    from: process.env.SMTP_FROM || `"OnIts" <noreply@onits.app>`,
    to: recipient,
    subject: recipient !== to
      ? `[DEV → ${to}] ⚠️ Task Due Tomorrow — ${taskTitle}`
      : `⚠️ Task Due Tomorrow — ${taskTitle}`,
    html: `
<div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;background:#0F172A;color:#E2E8F0;border-radius:12px">
  <h1 style="color:#FBBF24;font-size:24px;margin:0 0 8px">⚠️ Task Due Tomorrow</h1>
  <p style="color:#94A3B8;margin:0 0 24px">Hi <strong>${name}</strong>, a task assigned to you is due within 24 hours.</p>
  <div style="background:#1E293B;border-radius:8px;padding:20px;margin-bottom:24px;border-left:4px solid #FBBF24">
    <p style="margin:0 0 12px">
      <span style="color:#64748B;font-size:12px;text-transform:uppercase;letter-spacing:.08em">Task</span><br>
      <strong style="font-size:18px;color:#E2E8F0">${taskTitle}</strong>
    </p>
    <p style="margin:0">
      <span style="color:#64748B;font-size:12px;text-transform:uppercase;letter-spacing:.08em">Due Date</span><br>
      <strong style="color:#EF4444">${formattedDate}</strong>
    </p>
  </div>
  <p style="color:#94A3B8;font-size:14px">Please ensure this task is completed on time to keep the project on track.</p>
  <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/tasks" style="display:inline-block;background:#FBBF24;color:#0F172A;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;margin-top:16px">View Task →</a>
  <p style="color:#334155;font-size:12px;margin-top:32px">© 2026 OnIts. This is an automated message.</p>
</div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Mailer] Deadline warning email sent to ${to} — messageId: ${info.messageId}`);
  } catch (error) {
    console.error(`[Mailer] Failed to send deadline warning email to ${to}:`, error);
  }
}

/**
 * Sends a security notification email when a user's password has been changed.
 */
export async function sendPasswordChangedEmail(to: string, name: string): Promise<void> {
  const recipient = resolveRecipient(to);
  const mailOptions = {
    from: process.env.SMTP_FROM || `"OnIts" <noreply@onits.app>`,
    to: recipient,
    subject: recipient !== to
      ? `[DEV → ${to}] OnIts — Your Password Has Been Changed`
      : 'OnIts — Your Password Has Been Changed',
    html: `
<div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;background:#0F172A;color:#E2E8F0;border-radius:12px">
  <h1 style="color:#4FACFE;font-size:24px;margin:0 0 8px">Password Changed</h1>
  <p style="color:#94A3B8;margin:0 0 24px">Hi <strong>${name}</strong>,</p>
  <div style="background:#1E293B;border-radius:8px;padding:20px;margin-bottom:24px;border-left:4px solid #22C55E">
    <p style="margin:0;color:#E2E8F0;font-size:15px">
      ✅ &nbsp;Your OnIts account password has been <strong>successfully changed</strong>.
    </p>
  </div>
  <p style="color:#94A3B8;font-size:14px">
    If you made this change yourself, no further action is required.
  </p>
  <div style="background:#1E293B;border-radius:8px;padding:16px;margin-bottom:24px;border-left:4px solid #EF4444">
    <p style="margin:0;color:#EF4444;font-size:14px">
      🔒 &nbsp;<strong>If you did not make this change</strong>, please contact your administrator immediately as your account may be compromised.
    </p>
  </div>
  <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="display:inline-block;background:#3B82F6;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px">Sign In to OnIts →</a>
  <p style="color:#334155;font-size:12px;margin-top:32px">© 2026 OnIts. This is an automated message.</p>
</div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Mailer] Password changed email sent to ${to} — messageId: ${info.messageId}`);
  } catch (error) {
    console.error(`[Mailer] Failed to send password changed email to ${to}:`, error);
  }
}

/**
 * Sends a task assignment email.
 */
export async function sendTaskAssignedEmail(to: string, name: string, taskTitle: string): Promise<void> {
  const recipient = resolveRecipient(to);
  const mailOptions = {
    from: process.env.SMTP_FROM || `"OnIts" <noreply@onits.app>`,
    to: recipient,
    subject: recipient !== to
      ? `[DEV → ${to}] OnIts — You've been assigned to a new task`
      : 'OnIts — You\'ve been assigned to a new task',
    html: `
<div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;background:#0F172A;color:#E2E8F0;border-radius:12px">
  <h1 style="color:#4FACFE;font-size:24px;margin:0 0 8px">New Task Assignment</h1>
  <p style="color:#94A3B8;margin:0 0 24px">Hi <strong>${name}</strong>,</p>
  <div style="background:#1E293B;border-radius:8px;padding:20px;margin-bottom:24px;border-left:4px solid #3B82F6">
    <p style="margin:0;color:#E2E8F0;font-size:15px">
      You have been assigned to the following task:
    </p>
    <p style="margin:12px 0 0;font-size:18px;font-weight:bold;color:#4FACFE">
      ${taskTitle}
    </p>
  </div>
  <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/tasks" style="display:inline-block;background:#3B82F6;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px">View Task Details →</a>
  <p style="color:#334155;font-size:12px;margin-top:32px">© 2026 OnIts. This is an automated message.</p>
</div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Mailer] Task assigned email sent to ${to} — messageId: ${info.messageId}`);
  } catch (error) {
    console.error(`[Mailer] Failed to send task assigned email to ${to}:`, error);
  }
}

/**
 * Verifies the SMTP transporter connection. Call this on server startup.
 */
export async function verifyMailer(): Promise<void> {
  try {
    await transporter.verify();
    console.log('[Mailer] ✅ Mailer ready — SMTP connection verified.');
  } catch (error) {
    console.error('[Mailer] ❌ SMTP connection failed:', error);
  }
}
