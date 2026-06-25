"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBoard = exports.deleteBoard = exports.createBoard = exports.getBoards = void 0;
const prisma_1 = require("../lib/prisma");
const getBoards = async (req, res) => {
    try {
        const boards = await prisma_1.prisma.board.findMany({
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
    }
    catch {
        res.status(500).json({ message: 'Error al obtener tableros' });
    }
};
exports.getBoards = getBoards;
const createBoard = async (req, res) => {
    const { name } = req.body;
    try {
        const board = await prisma_1.prisma.board.create({
            data: {
                name,
                userId: req.userId,
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
    }
    catch {
        res.status(500).json({ message: 'Error al crear tablero' });
    }
};
exports.createBoard = createBoard;
const deleteBoard = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma_1.prisma.board.delete({ where: { id: Number(id) } });
        res.json({ message: 'Tablero eliminado' });
    }
    catch {
        res.status(500).json({ message: 'Error al eliminar tablero' });
    }
};
exports.deleteBoard = deleteBoard;
const updateBoard = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        const board = await prisma_1.prisma.board.update({
            where: { id: Number(id) },
            data: { name }
        });
        res.json(board);
    }
    catch {
        res.status(500).json({ message: 'Error al actualizar tablero' });
    }
};
exports.updateBoard = updateBoard;
