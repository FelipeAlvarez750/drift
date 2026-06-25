"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteColumn = exports.updateColumn = exports.createColumn = void 0;
const prisma_1 = require("../lib/prisma");
const createColumn = async (req, res) => {
    const { name, boardId } = req.body;
    try {
        const columnCount = await prisma_1.prisma.column.count({ where: { boardId: Number(boardId) } });
        const column = await prisma_1.prisma.column.create({
            data: {
                name,
                boardId: Number(boardId),
                order: columnCount
            },
            include: { tasks: true }
        });
        res.status(201).json(column);
    }
    catch {
        res.status(500).json({ message: 'Error al crear columna' });
    }
};
exports.createColumn = createColumn;
const updateColumn = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        const column = await prisma_1.prisma.column.update({
            where: { id: Number(id) },
            data: { name }
        });
        res.json(column);
    }
    catch {
        res.status(500).json({ message: 'Error al actualizar columna' });
    }
};
exports.updateColumn = updateColumn;
const deleteColumn = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma_1.prisma.column.delete({ where: { id: Number(id) } });
        res.json({ message: 'Columna eliminada' });
    }
    catch {
        res.status(500).json({ message: 'Error al eliminar columna' });
    }
};
exports.deleteColumn = deleteColumn;
