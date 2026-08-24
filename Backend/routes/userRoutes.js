import express from 'express';
import { checkSchema } from 'express-validator';
import { registerUser, loginUser } from '../controllers/userController.js';
import { userRegisterSchema, userLoginSchema } from '../validators/userValidation.js';
import { validate } from '../validators/validationMiddleware.js';

const router = express.Router();

// @route   POST /api/users/register
router.post('/register', checkSchema(userRegisterSchema), validate, registerUser);

// @route   POST /api/users/login
router.post('/login', checkSchema(userLoginSchema), validate, loginUser);

export default router;
