import { Schema, model } from 'mongoose';

const expenseSchema = new Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['Food', 'Petrol', 'Salary'],
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const Expense = model('Expense', expenseSchema);
export default Expense;
