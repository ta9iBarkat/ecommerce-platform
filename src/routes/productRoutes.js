import express from 'express';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/multer.js'; // your multer middleware file
import { createProduct } from '../controllers/productController.js';

const router = express.Router();

// Protect and allow only sellers and admins to create products
router.post(
  '/',
  protect,
  authorizeRoles('seller', 'admin'),
  upload.array('images', 5), // max 5 images
  createProduct
);

export default router;
