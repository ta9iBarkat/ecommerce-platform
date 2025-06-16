// routes/orderRoutes.js
import express from 'express';
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';

// Assuming you have these middleware
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All order routes are protected
router.use(protect);

// Place a new order
router.route('/').post(createOrder);

// Get logged-in user's orders
router.route('/my').get(getMyOrders);

// --- Admin Only Routes ---

// Get all orders
router.route('/').get(authorizeRoles('admin'), getAllOrders);

// Update order status
router.route('/:id').put(authorizeRoles('admin'), updateOrderStatus);

export default router;