import express from 'express';
import userControllers from '../controller/userController.js';
import { deleteUser } from '../controller/deleteUser.js';
import checkAuthtoken from '../middleware/AuthToken.js';
import updatePassWithToken from '../controller/updatePassWithToken.js';
import deleteUserWithToken from '../controller/deleteUserWithToken.js';


const router = express.Router();

// 🛡️ **Public Routes (No Authentication Required)**
router.post('/register', userControllers.userRegistration); // User Registration
router.post('/login', userControllers.userLogin); // User Login
router.put('/forgot-password', userControllers.userForgetPassword); // Password Reset Request
router.delete('/delete-account', deleteUser); // Account Deletion

// 🔒 **Protected Routes (Authentication Required)**

router.use('/update-password',checkAuthtoken); // Apply middleware for protected routes
router.post('/update-password', updatePassWithToken); // Update Password with Token
router.use('/delete-account-user/:id',checkAuthtoken);
router.delete('/delete-account-user/:id',deleteUserWithToken)

export default router;
