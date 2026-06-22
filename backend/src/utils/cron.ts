import cron from 'node-cron';
import { prisma } from '../config/db';
import { sendDeadlineWarningEmail } from './mailer';
import { createNotification } from '../services/notification.service';

/**
 * Core logic for the deadline warning job.
 * Finds all non-completed tasks due within the next 24 hours,
 * sends an email to each assigned user, and creates an in-app notification.
 */
async function runDeadlineWarningJob(): Promise<void> {
  const now = new Date();
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const tasks = await prisma.task.findMany({
    where: {
      dueDate: {
        gte: now,
        lte: tomorrow,
      },
      status: {
        not: 'Completed',
      },
    },
    include: {
      assignments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  let count = 0;

  for (const task of tasks) {
    for (const assignment of task.assignments) {
      const { user } = assignment;

      await sendDeadlineWarningEmail(user.email, user.name, task.title, task.dueDate!);

      await createNotification(
        user.id,
        'DeadlineApproach',
        `Task "${task.title}" is due within 24 hours`,
        task.id,
      );
    }
    count++;
  }

  console.log(`[Cron] Deadline check complete. Notified for ${count} tasks.`);
}

/**
 * Registers all scheduled cron jobs.
 * Call this once from server.ts on startup.
 */
export function startCronJobs(): void {
  // Job 1 — Deadline Warning: runs every day at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('[Cron] Running deadline warning job...');
    try {
      await runDeadlineWarningJob();
    } catch (error) {
      console.error('[Cron] Deadline warning job failed:', error);
    }
  });

  console.log('[Cron] ✅ Scheduled jobs registered — deadline warnings fire daily at 09:00.');
}

/**
 * Manually triggers the deadline warning job immediately.
 * Use this for testing without waiting for 9 AM.
 */
export async function testDeadlineJob(): Promise<void> {
  console.log('[Cron] ⚡ Manually triggering deadline warning job...');
  try {
    await runDeadlineWarningJob();
  } catch (error) {
    console.error('[Cron] Manual deadline job run failed:', error);
  }
}
