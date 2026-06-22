import { Router } from 'express';
import { createColumn, updateColumn, deleteColumn } from '../controllers/column.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', verifyToken, createColumn);
router.put('/:id', verifyToken, updateColumn);
router.delete('/:id', verifyToken, deleteColumn);

export default router;