import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createColumn = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, boardId } = req.body;
  try {
    const columnCount = await prisma.column.count({ where: { boardId: Number(boardId) } });
    const column = await prisma.column.create({
      data: {
        name,
        boardId: Number(boardId),
        order: columnCount
      },
      include: { tasks: true }
    });
    res.status(201).json(column);
  } catch {
    res.status(500).json({ message: 'Error al crear columna' });
  }
};

export const updateColumn = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const column = await prisma.column.update({
      where: { id: Number(id) },
      data: { name }
    });
    res.json(column);
  } catch {
    res.status(500).json({ message: 'Error al actualizar columna' });
  }
};

export const deleteColumn = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    await prisma.column.delete({ where: { id: Number(id) } });
    res.json({ message: 'Columna eliminada' });
  } catch {
    res.status(500).json({ message: 'Error al eliminar columna' });
  }
};