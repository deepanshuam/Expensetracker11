import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // to enable searching field
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    
    
    
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    
  },
  { timestamps: true }
);



export const User = mongoose.model("User", userSchema);