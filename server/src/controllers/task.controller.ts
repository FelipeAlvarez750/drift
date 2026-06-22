import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, description, columnId } = req.body;
  try {
    const taskCount = await prisma.task.count({ where: { columnId: Number(columnId) } });
    const task = await prisma.task.create({
      data: {
        title,
        description,
        columnId: Number(columnId),
        order: taskCount
      }
    });
    res.status(201).json(task);
  } catch {
    res.status(500).json({ message: 'Error al crear tarea' });
  }
};

export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { title, description } = req.body;
  try {
    const task = await prisma.task.update({
      where: { id: Number(id) },
      data: { title, description }
    });
    res.json(task);
  } catch {
    res.status(500).json({ message: 'Error al actualizar tarea' });
  }
};

export const moveTask = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { columnId, order } = req.body;
  try {
    const task = await prisma.task.update({
      where: { id: Number(id) },
      data: { columnId: Number(columnId), order: Number(order) }
    });
    res.json(task);
  } catch {
    res.status(500).json({ message: 'Error al mover tarea' });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    await prisma.task.delete({ where: { id: Number(id) } });
    res.json({ message: 'Tarea eliminada' });
  } catch {
    res.status(500).json({ message: 'Error al eliminar tarea' });
  }
};

export const toggleTask = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const task = await prisma.task.findUnique({ where: { id: Number(id) } });
    if (!task) {
      res.status(404).json({ message: 'Tarea no encontrada' });
      return;
    }
    const updated = await prisma.task.update({
      where: { id: Number(id) },
      data: { completed: !task.completed }
    });
    res.json(updated);
  } catch {
    res.status(500).json({ message: 'Error al actualizar tarea' });
  }
};