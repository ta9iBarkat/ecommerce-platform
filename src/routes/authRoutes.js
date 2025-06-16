import express from 'express';
import { register, login, logout, refreshToken } from '../controllers/authController.js';

const router = express.Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register a new user
 *     description: Creates a new user account.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: 'John Doe'
 *               email:
 *                 type: string
 *                 example: 'john.doe@example.com'
 *               password:
 *                 type: string
 *                 example: 'password123'
 *               role:
 *                 type: string
 *                 enum: [user, seller]
 *                 default: user
 *     responses:
 *       '201':
 *         description: User registered successfully.
 *       '400':
 *         description: Bad request (e.g., email already exists).
 */
router.post('/register', register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Authenticate a user
 *     description: Logs in a user and returns an access token and a refresh token in an httpOnly cookie.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: 'john.doe@example.com'
 *               password:
 *                 type: string
 *                 example: 'password123'
 *     responses:
 *       '200':
 *         description: Login successful.
 *       '401':
 *         description: Invalid email or password.
 */
router.post('/login', login);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Log out a user
 *     description: Clears the httpOnly refresh token cookie.
 *     responses:
 *       '200':
 *         description: Logged out successfully.
 */
router.post('/logout', logout);

/**
 * @openapi
 * /auth/refresh:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Refresh the access token
 *     description: Generates a new access token using the refresh token stored in the httpOnly cookie.
 *     responses:
 *       '200':
 *         description: New access token generated.
 *       '401':
 *         description: No refresh token provided.
 *       '403':
 *         description: Invalid refresh token.
 */
router.get('/refresh', refreshToken);

export default router;