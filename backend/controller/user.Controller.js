import { User } from "../models/user.model.js";
import { ApiError } from "../utiles/apiError.js";
import { ApiResponse } from "../utiles/apiResponse.js";

import { asyncHandler } from "../utiles/asyncHandler.js";

// const generateAccessAndRefereshTokens = async (userId) => {
//     try {
//       const user = await User.findById(userId);
//       const accessToken = user.generateAccessToken();
//       const refreshToken = user.generateRefreshToken();
  
//       user.refreshToken = refreshToken;
//       await user.save({ validateBeforeSave: false });
  
//       return { accessToken, refreshToken };
//     } catch (error) {
//       console.log(error);  // Log the exact error
//       throw new ApiError(
//         500,
//         "Something went wrong while generating refresh and access token"
//       );
//     }
//   };
  

const registerUser = asyncHandler(async (req, res) => {
  const { email, name, password } = req.body;

  //check field is empty or not
  if (
    [email, name, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // check user already exist or not
  const existedUser = await User.findOne({
    $or: [{ name }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  




  const user = await User.create({
    
    
    email,
    password,
    name: name.toLowerCase(),
  });

  //
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken" 
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registring the user");
  }

  
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});


const loginUser = asyncHandler(async (req, res) => {
  

  const { email, password } = req.body;
  console.log(email);

  if (!password && !email) {
    throw new ApiError(400, "username or email is required");
  }

  // Here is an alternative of above code based on logic discussed in video:
  // if (!(username || email)) {
  //     throw new ApiError(400, "username or email is required")

  // }

  const user = await User.findOne({
    $or: [{ password}, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  // const isPasswordValid = await user.isPasswordCorrect(password);

  // if (!isPasswordValid) {
  //   throw new ApiError(401, "Invalid user credentials");
  // }

  

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          
        },
        "User logged In Successfully"
      )
    );
});





export {
  registerUser,
  loginUser
  
};