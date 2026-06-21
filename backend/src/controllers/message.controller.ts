import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { channelId } = req.params;

    const messages = await prisma.message.findMany({
      where: { channelId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });

    res.json(messages);
  } catch (error) {
    next(error);
  }
};

export const createMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { channelId } = req.params;
    const { content } = req.body;
    const userId = req.user!.id;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
    });

    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    const message = await prisma.message.create({
      data: {
        content,
        channelId,
        senderId: userId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });

    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
};
