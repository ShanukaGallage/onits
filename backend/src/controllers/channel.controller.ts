import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getChannels = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const channels = await prisma.channel.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { messages: true },
        },
      },
    });

    res.json(channels);
  } catch (error) {
    next(error);
  }
};

export const createChannel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, type, projectId } = req.body;
    const userId = req.user!.id;

    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }

    if (type === 'Project' && !projectId) {
      return res.status(400).json({ error: 'projectId is required for Project channels' });
    }

    const channel = await prisma.channel.create({
      data: {
        name,
        type,
        projectId: type === 'Project' ? projectId : null,
        createdById: userId,
      },
    });

    res.status(201).json(channel);
  } catch (error) {
    next(error);
  }
};

export const deleteChannel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const channel = await prisma.channel.findUnique({
      where: { id },
    });

    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    await prisma.channel.delete({
      where: { id },
    });

    res.json({ message: 'Channel deleted successfully' });
  } catch (error) {
    next(error);
  }
};
