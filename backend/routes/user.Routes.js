import { Router } from 'express';
import { registerUser,loginUser } from '../controller/user.Controller.js';
// import authMiddleware from '../middleware/auth.Middleware.js'; // Import middleware

const router = Router();

// Register a User
router.post('/register', registerUser);

// Login a User
router.post('/login', loginUser);

// Logout a User (Protected Route)
// router.post('/logout', authMiddleware, logoutUser);

export default router;
