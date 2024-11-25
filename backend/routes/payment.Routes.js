// router.js
import { Router } from 'express';
import { createOrder, updateOrderStatus } from '../controller/razorpay.Controller.js';
import { authMiddleware } from '../middleware/authmiddleware.js';

const router = Router();

router.post('/create-order', authMiddleware, createOrder);
router.post('/update-order-status', authMiddleware, updateOrderStatus);

export default router;
