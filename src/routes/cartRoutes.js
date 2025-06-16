import express from 'express';
import {
  getCart,
  addItemToCart,
  updateCartItem,
  removeItemFromCart,
} from '../controllers/cartController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All cart routes are protected, so security is defined at the top-level for this tag
router.use(protect);

/**
 * @openapi
 * /cart:
 *   get:
 *     tags:
 *       - Cart
 *     summary: Get the user's shopping cart
 *     description: Retrieves the contents of the currently logged-in user's shopping cart.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: A successful response with the cart details.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       '401':
 *         description: Unauthorized.
 *   post:
 *     tags:
 *       - Cart
 *     summary: Add an item to the cart
 *     description: Adds a product to the cart or updates its quantity if it already exists.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, quantity]
 *             properties:
 *               productId:
 *                 type: string
 *                 example: '60d0fe4f5311236168a109ca'
 *               quantity:
 *                 type: number
 *                 example: 2
 *     responses:
 *       '201':
 *         description: Item added/updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       '401':
 *         description: Unauthorized.
 *       '404':
 *         description: Product not found.
 */
router.route('/').get(getCart).post(addItemToCart);

/**
 * @openapi
 * /cart/item/{productId}:
 *   put:
 *     tags:
 *       - Cart
 *     summary: Update an item's quantity in the cart
 *     description: Sets the quantity for a specific item in the user's cart.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product to update in the cart.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantity]
 *             properties:
 *               quantity:
 *                 type: number
 *                 example: 5
 *     responses:
 *       '200':
 *         description: Quantity updated successfully.
 *       '401':
 *         description: Unauthorized.
 *       '404':
 *         description: Item or cart not found.
 *   delete:
 *     tags:
 *       - Cart
 *     summary: Remove an item from the cart
 *     description: Removes a product entirely from the user's shopping cart.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product to remove from the cart.
 *     responses:
 *       '200':
 *         description: Item removed successfully.
 *       '401':
 *         description: Unauthorized.
 *       '404':
 *         description: Item or cart not found.
 */
router.route('/item/:productId').put(updateCartItem).delete(removeItemFromCart);

export default router;