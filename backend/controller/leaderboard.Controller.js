// import {asyncHandler} from '../utiles/asyncHandler.js';
// import { User } from '../models/user.model.js'; // User model import remains the same
// import Expense from '../models/expense.Model.js'; // Correct way to import the Expense model

// // Get leaderboard based on total expenses
// const getLeaderboard = asyncHandler(async (req, res) => {
//   try {
//     // Aggregate expenses by user
//     const leaderboard = await Expense.aggregate([ // Use the aggregate method on the Expense model
//       {
//         $group: {
//           _id: "$user",
//           totalExpense: { $sum: "$amount" },
//         }
//       },
//       {
//         $sort: { totalExpense: -1 } // Sort by totalExpense in descending order
//       },
//       {
//         $lookup: {
//           from: "users", // Collection name for User model (make sure it's pluralized)
//           localField: "_id",
//           foreignField: "_id",
//           as: "userDetails"
//         }
//       },
//       {
//         $unwind: "$userDetails" // Unwind the userDetails array to flatten the structure
//       },
//       {
//         $project: {
//           userId: "$_id",
//           name: "$userDetails.name",
//           email: "$userDetails.email",
//           totalExpense: 1,
//         }
//       }
//     ]);

//     // Respond with the leaderboard data
//     res.status(200).json({
//       success: true,
//       message: "Leaderboard fetched successfully",
//       data: leaderboard,
//     });
//   } catch (error) {
//     // Handle errors and send error response
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching leaderboard',
//       error: error.message,
//     });
//   }
// });

// export { getLeaderboard };
import { asyncHandler } from '../utiles/asyncHandler.js';
import { User } from '../models/user.model.js'; // User model
import Expense from '../models/expense.Model.js'; // Correctly imported Expense model

// Get leaderboard based on total expenses
const getLeaderboard = asyncHandler(async (req, res) => {
  try {
    const leaderboard = await Expense.aggregate([
      {
        $group: {
          _id: "$user",
          totalExpense: { $sum: "$amount" },
        },
      },
      {
        $sort: { totalExpense: -1 },
      },
      {
        $lookup: {
          from: "users", // Make sure this matches the actual collection name for User
          localField: "_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $project: {
          userId: "$_id",
          name: "$userDetails.name",
          email: "$userDetails.email",
          totalExpense: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Leaderboard fetched successfully",
      data: leaderboard,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching leaderboard",
      error: error.message,
    });
  }
});

export { getLeaderboard };
