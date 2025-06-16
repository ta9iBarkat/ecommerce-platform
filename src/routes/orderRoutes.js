import express from 'express';
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.use(protect);

/**
 * @openapi
 * /orders:
 *   post:
 *     tags:
 *       - Orders
 *     summary: Place a new order
 *     description: Creates a new order from the user's cart, updates stock, and clears the cart.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shippingInfo:
 *                 type: object
 *                 properties:
 *                   address: { type: string, example: "123 Main St" }
 *                   city: { type: string, example: "Anytown" }
 *                   postalCode: { type: string, example: "12345" }
 *                   country: { type: string, example: "USA" }
 *               paymentInfo:
 *                 type: object
 *                 properties:
 *                   id: { type: string, example: "pi_123abc" }
 *                   status: { type: string, example: "succeeded" }
 *     responses:
 *       '201':
 *         description: Order created successfully.
 *       '400':
 *         description: Bad request (e.g., cart is empty).
 *       '401':
 *         description: Unauthorized.
 *   get:
 *     tags:
 *       - Orders (Admin)
 *     summary: Get all orders (Admin)
 *     description: Retrieves a list of all orders in the system. Requires admin privileges.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: A list of all orders.
 *       '401':
 *         description: Unauthorized.
 *       '403':
 *         description: Forbidden.
 */
router.route('/').post(createOrder).get(authorizeRoles('admin'), getAllOrders);

/**
 * @openapi
 * /orders/my:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Get my orders
 *     description: Retrieves all orders placed by the currently logged-in user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: A list of the user's orders.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       '401':
 *         description: Unauthorized.
 */
router.route('/my').get(getMyOrders);

/**
 * @openapi
 * /orders/{id}:
 *   put:
 *     tags:
 *       - Orders (Admin)
 *     summary: Update order status (Admin)
 *     description: Updates the status of an order (e.g., to 'Shipped' or 'Delivered'). Requires admin privileges.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the order to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Processing, Shipped, Delivered, Cancelled]
 *                 example: Shipped
 *     responses:
 *       '200':
 *         description: Order status updated successfully.
 *       '401':
 *         description: Unauthorized.
 *       '403':
 *         description: Forbidden.
 *       '404':
 *         description: Order not found.
 */
router.route('/:id').put(authorizeRoles('admin'), updateOrderStatus);

export default router;