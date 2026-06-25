"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleTask = exports.deleteTask = exports.moveTask = exports.updateTask = exports.createTask = void 0;
const prisma_1 = require("../lib/prisma");
const createTask = async (req, res) => {
    const { title, description, columnId } = req.body;
    try {
        const taskCount = await prisma_1.prisma.task.count({ where: { columnId: Number(columnId) } });
        const task = await prisma_1.prisma.task.create({
            data: {
                title,
                description,
                columnId: Number(columnId),
                order: taskCount
            }
        });
        res.status(201).json(task);
    }
    catch {
        res.status(500).json({ message: 'Error al crear tarea' });
    }
};
exports.createTask = createTask;
const updateTask = async (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;
    try {
        const task = await prisma_1.prisma.task.update({
            where: { id: Number(id) },
            data: { title, description }
        });
        res.json(task);
    }
    catch {
        res.status(500).json({ message: 'Error al actualizar tarea' });
    }
};
exports.updateTask = updateTask;
const moveTask = async (req, res) => {
    const { id } = req.params;
    const { columnId, order } = req.body;
    try {
        const task = await prisma_1.prisma.task.update({
            where: { id: Number(id) },
            data: { columnId: Number(columnId), order: Number(order) }
        });
        res.json(task);
    }
    catch {
        res.status(500).json({ message: 'Error al mover tarea' });
    }
};
exports.moveTask = moveTask;
const deleteTask = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma_1.prisma.task.delete({ where: { id: Number(id) } });
        res.json({ message: 'Tarea eliminada' });
    }
    catch {
        res.status(500).json({ message: 'Error al eliminar tarea' });
    }
};
exports.deleteTask = deleteTask;
const toggleTask = async (req, res) => {
    const { id } = req.params;
    try {
        const task = await prisma_1.prisma.task.findUnique({ where: { id: Number(id) } });
        if (!task) {
            res.status(404).json({ message: 'Tarea no encontrada' });
            return;
        }
        const updated = await prisma_1.prisma.task.update({
            where: { id: Number(id) },
            data: { completed: !task.completed }
        });
        res.json(updated);
    }
    catch {
        res.status(500).json({ message: 'Error al actualizar tarea' });
    }
};
exports.toggleTask = toggleTask;
