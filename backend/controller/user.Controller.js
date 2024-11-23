import { User } from "../models/user.model.js";
import { ApiError } from "../utiles/apiError.js";
import { ApiResponse } from "../utiles/apiResponse.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utiles/asyncHandler.js";

const generateTokens = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

// Register User
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (![name, email, password].every((field) => field?.trim())) {
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = await User.findOne({
    $or: [{ email }, { name: name.toLowerCase() }],
  });

  if (existingUser) {
    throw new ApiError(409, "User with the provided email or username already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  const createdUser = await User.findById(newUser._id).select("-password -refreshToken");

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

// Login User
export const loginUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  console.log("Login Request Data:", { name, email, password }); // Log input data
  

  if (!email || !name || !password) {
    throw new ApiError(400, "Email, name, and password are required");
  }

  const user = await User.findOne({ $or: [{ name }, { email }] });
  console.log("User Found:", user); // Log user object from database

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  console.log("Password Validation Result:", isPasswordValid); // Log password validation result

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateTokens(user._id);

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
  console.log("Logged In User:", loggedInUser); // Log the final user data

  res
    .status(200)
    .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
    .cookie("refreshToken", refreshToken, { httpOnly: true, secure: true })
    .json(
      new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "Login successful")
    );
});


// Logout User
export const logoutUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } }, { new: true });

  res
    .status(200)
    .clearCookie("accessToken", { httpOnly: true, secure: true })
    .clearCookie("refreshToken", { httpOnly: true, secure: true })
    .json(new ApiResponse(200, {}, "Logout successful"));
});

// Refresh Token
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken: incomingRefreshToken } = req.cookies;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decodedToken._id);

    if (!user || user.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Invalid or expired refresh token");
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(user._id);

    res
      .status(200)
      .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
      .cookie("refreshToken", newRefreshToken, { httpOnly: true, secure: true })
      .json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Token refreshed"));
  } catch (error) {
    throw new ApiError(401, "Invalid refresh token");
  }
});

// Change Password
export const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save({ validateBeforeSave: false });

  res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
});
