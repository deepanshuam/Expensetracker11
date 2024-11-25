import { ApiError } from "../utiles/apiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utiles/asyncHandler.js";

export const authMiddleware = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '');
  console.log("Token received:", token);  // Log the token to debug

  if (!token) {
    console.error('Token is missing or malformed');
    throw new ApiError(401, "Unauthorized request: Token is missing");
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log("Decoded Token:", decodedToken); // Log decoded token for debugging
    const user = await User.findById(decodedToken?._id).select('-password -refreshToken');

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('JWT verification error:', err);
    throw new ApiError(401, "Unauthorized request: Invalid Token");
  }
});
