// razorpay.Controller.js
import Razorpay from 'razorpay';
import Order from '../models/order.model.js';
import { asyncHandler } from '../utiles/asyncHandler.js';

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: 'YOUR_RAZORPAY_KEY_ID',
  key_secret: 'YOUR_RAZORPAY_KEY_SECRET',
});

// Create a new Razorpay order
const createOrder = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  const razorpayOrder = await razorpay.orders.create({
    amount: amount * 100, // Amount in paise
    currency: 'INR',
    receipt: `order_rcpt_${Date.now()}`,
  });

  const newOrder = await Order.create({
    userId: req.user._id,
    orderId: razorpayOrder.id,
    amount,
    status: 'PENDING',
  });

  res.status(201).json({
    success: true,
    orderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
  });
});

// Update the order status
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId, status } = req.body;

  const order = await Order.findOne({ orderId });
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.status = status;
  if (status === 'SUCCESSFUL') {
    req.user.isPremium = true;
    await req.user.save();
  }

  await order.save();

  res.status(200).json({ success: true, message: 'Order status updated' });
});

export { createOrder, updateOrderStatus };
