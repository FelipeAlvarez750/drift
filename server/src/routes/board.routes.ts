import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import { getBoards, createBoard, deleteBoard, updateBoard } from '../controllers/board.controller';

const router = Router();

router.get('/', verifyToken, getBoards);
router.put('/:id', verifyToken, updateBoard);
router.post('/', verifyToken, createBoard);
router.delete('/:id', verifyToken, deleteBoard);

export default router;