import { Schema, model } from 'mongoose';

const orderSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  orderId: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  status: {
    type: String,
    enum: ['PENDING', 'SUCCESSFUL', 'FAILED'],
    default: 'PENDING',
  },
});

const Order = model('Order', orderSchema);

export default Order;
