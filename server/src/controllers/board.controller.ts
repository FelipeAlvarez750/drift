import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getBoards = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const boards = await prisma.board.findMany({
      where: { userId: req.userId },
      include: {
        columns: {
          orderBy: { order: 'asc' },
          include: {
            tasks: { orderBy: { order: 'asc' } }
          }
        }
      }
    });
    res.json(boards);
  } catch {
    res.status(500).json({ message: 'Error al obtener tableros' });
  }
};

export const createBoard = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name } = req.body;
  try {
    const board = await prisma.board.create({
      data: {
        name,
        userId: req.userId!,
        columns: {
          create: [
            { name: 'Por hacer', order: 0 },
            { name: 'En progreso', order: 1 },
            { name: 'Hecho', order: 2 }
          ]
        }
      },
      include: {
        columns: {
          orderBy: { order: 'asc' },
          include: { tasks: true }
        }
      }
    });
    res.status(201).json(board);
  } catch {
    res.status(500).json({ message: 'Error al crear tablero' });
  }
};

export const deleteBoard = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    await prisma.board.delete({ where: { id: Number(id) } });
    res.json({ message: 'Tablero eliminado' });
  } catch {
    res.status(500).json({ message: 'Error al eliminar tablero' });
  }
};