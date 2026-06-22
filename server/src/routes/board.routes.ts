import { Router } from 'express';
import { getBoards, createBoard, deleteBoard } from '../controllers/board.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', verifyToken, getBoards);
router.post('/', verifyToken, createBoard);
router.delete('/:id', verifyToken, deleteBoard);

export default router;