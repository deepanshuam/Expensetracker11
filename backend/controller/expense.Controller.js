import Expense from "../models/expense.Model.js"; // Importing the Expense model

// Utility imports
import { ApiError } from "../utiles/apiError.js"; // Keep the import if ApiError is external
import { ApiResponse } from "../utiles/apiResponse.js";
import { asyncHandler } from "../utiles/asyncHandler.js";

// ----------------- CRUD Operations ---------------------

// Create a new expense
const createExpense = asyncHandler(async (req, res) => {
  const { amount, description, category } = req.body;

  if (!amount || !description || !category) {
    throw new ApiError(400, "All fields are required");
  }

  const expense = new Expense({
    amount,
    description,
    category,
    user: req.user._id,
  });

  await expense.save();
  res
    .status(201)
    .json(new ApiResponse(201, expense, "Expense added successfully!"));
});

// Get all expenses for the logged-in user
const getExpenses = asyncHandler(async (req, res) => {
  const expenses = await Expense.find({ user: req.user._id });

  if (!expenses.length) {
    throw new ApiError(404, "No expenses found for the user");
  }

  res
    .status(200)
    .json(new ApiResponse(200, expenses, "Expenses fetched successfully"));
});

// Update an existing expense
const updateExpense = asyncHandler(async (req, res) => {
  const { expenseId } = req.params;
  const { amount, description, category } = req.body;

  const expense = await Expense.findById(expenseId);
  if (!expense) {
    throw new ApiError(404, "Expense not found");
  }

  if (expense.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized");
  }

  expense.amount = amount || expense.amount;
  expense.description = description || expense.description;
  expense.category = category || expense.category;

  await expense.save();
  res
    .status(200)
    .json(new ApiResponse(200, expense, "Expense updated successfully"));
});

// Delete an expense
const deleteExpense = asyncHandler(async (req, res) => {
  const { expenseId } = req.params;

  const expense = await Expense.findById(expenseId);
  if (!expense) {
    throw new ApiError(404, "Expense not found");
  }

  if (expense.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized");
  }

  await expense.deleteOne();
  res
    .status(200)
    .json(new ApiResponse(200, null, "Expense deleted successfully"));
});

// ----------------- Export Controller ---------------------
export { createExpense, getExpenses, updateExpense, deleteExpense };
