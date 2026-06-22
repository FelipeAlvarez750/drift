import { Router } from 'express';
import { createTask, updateTask, moveTask, deleteTask, toggleTask } from '../controllers/task.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', verifyToken, createTask);
router.put('/:id', verifyToken, updateTask);
router.patch('/:id/move', verifyToken, moveTask);
router.patch('/:id/complete', verifyToken, toggleTask);
router.delete('/:id', verifyToken, deleteTask);

export default router;