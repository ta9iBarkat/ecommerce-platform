import express from 'express';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/multer.js';
import {
  createProduct,
  getProducts,
  getProductById,
  deleteProduct,
  updateProduct,
} from '../controllers/productController.js';

const router = express.Router();

// Routes for /api/products
router
  .route('/')
  .get(getProducts)
  .post(
    protect,
    authorizeRoles('seller', 'admin'),
    upload.array('images', 5), // 'images' is the field name, max 5 files
    createProduct
  );

// Routes for /api/products/:id
router
  .route('/:id')
  .get(getProductById)
  .put(
    protect,
    authorizeRoles('seller', 'admin'),
    upload.array('images', 5), // Switched to array to allow adding new images
    updateProduct
  )
  .delete(
    protect,
    authorizeRoles('seller', 'admin'),
    deleteProduct
  );

export default router;