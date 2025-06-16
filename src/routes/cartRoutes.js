import express from 'express';
import {
  getCart,
  addItemToCart,
  updateCartItem,
  removeItemFromCart,
} from '../controllers/cartController.js';
import { protect } from '../middlewares/authMiddleware.js'; // Assuming you have this

const router = express.Router();

// All cart routes are protected
router.use(protect);

router.route('/')
  .get(getCart)
  .post(addItemToCart);

router.route('/item/:productId')
  .put(updateCartItem)
  .delete(removeItemFromCart);

export default router;