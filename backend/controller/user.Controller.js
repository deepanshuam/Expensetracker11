import { User } from "../models/user.model.js";
import { ApiError } from "../utiles/apiError.js";
import { ApiResponse } from "../utiles/apiResponse.js";
import { asyncHandler } from "../utiles/asyncHandler.js";

// Generate access and refresh tokens
const generateTokens = async (user) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

// Register User
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email, and password are required");
  }

  const existingUser = await User.findOne({
    $or: [{ email }, { name }],
  });

  if (existingUser) {
    throw new ApiError(
      409,
      "User with the provided email or username already exists"
    );
  }

  const newUser = await User.create({ name, email, password });
  const createdUser = await User.findById(newUser._id).select(
    "-password -refreshToken"
  );

  res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

// Login User
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateTokens(user);
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  res
    .status(200)
    .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
    .cookie("refreshToken", refreshToken, { httpOnly: true, secure: true })
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "Login successful"
      )
    );
});

// Logout User
export const logoutUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.refreshToken = undefined;
  await user.save();

  res
    .status(200)
    .clearCookie("accessToken", { httpOnly: true, secure: true })
    .clearCookie("refreshToken", { httpOnly: true, secure: true })
    .json(new ApiResponse(200, {}, "Logout successful"));
});
