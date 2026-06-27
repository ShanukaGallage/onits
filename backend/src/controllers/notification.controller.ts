import { Request, Response } from 'express';
import * as notificationService from '../services/notification.service';

export const getUserNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const notifications = await notificationService.getUserNotifications(userId);
    res.json(notifications);
  } catch (err: any) {
    console.error('getUserNotifications Error:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    await notificationService.markAsRead(userId, id);
    res.json({ message: 'Notification marked as read' });
  } catch (err: any) {
    console.error('markAsRead Error:', err);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    await notificationService.markAllAsRead(userId);
    res.json({ message: 'All notifications marked as read' });
  } catch (err: any) {
    console.error('markAllAsRead Error:', err);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
};
