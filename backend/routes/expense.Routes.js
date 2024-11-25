import { Router } from 'express';
import { createExpense, getExpenses, updateExpense, deleteExpense } from '../controller/expense.Controller.js';
import{authMiddleware} from '../middleware/authmiddleware.js'; // Middleware to verify user token

const router = Router();

// Route to create a new expense
router.post('/add', authMiddleware, createExpense);

// Route to get all expenses for the logged-in user
router.get('/', authMiddleware, getExpenses);

// Route to update an existing expense
router.put('/:expenseId', authMiddleware, updateExpense);

// Route to delete an expense
router.delete('/:expenseId', authMiddleware, deleteExpense);

export default router;
