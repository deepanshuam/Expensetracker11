import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  // refreshAccessToken,
  // changePassword,
} from "../controller/user.Controller.js";
import {authMiddleware} from "../middleware/authmiddleware.js";
const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", authMiddleware, logoutUser);
// router.post("/refresh-token", refreshAccessToken);
// router.post("/change-password", authMiddleware, changePassword);

export default router;
