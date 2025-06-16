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

/**
 * @openapi
 * /products:
 *   get:
 *     tags:
 *       - Products
 *     summary: Retrieve a list of products
 *     description: >
 *       Fetches a paginated list of all products.
 *       Supports searching by keyword, and filtering by category, price, etc.
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Keyword to search in product name and description.
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter products by a specific category.
 *       - in: query
 *         name: price[gte]
 *         schema:
 *           type: number
 *         description: Filter for a price greater than or equal to this value.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: The number of items to return per page.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number to retrieve.
 *     responses:
 *       '200':
 *         description: A successful response with a list of products and pagination metadata.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *       '500':
 *         description: Internal Server Error.
 *   post:
 *     tags:
 *       - Products
 *     summary: Create a new product
 *     description: >
 *       Allows authenticated sellers or admins to add a new product.
 *       Requires a `multipart/form-data` request body for image uploads.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, description, price, category, stock, images]
 *             properties:
 *               name:
 *                 type: string
 *                 example: 'Toyota Camry'
 *               description:
 *                 type: string
 *                 example: 'A reliable and fuel-efficient family sedan.'
 *               price:
 *                 type: number
 *                 example: 25000
 *               category:
 *                 type: string
 *                 example: 'Sedan'
 *               brand:
 *                 type: string
 *                 example: 'Toyota'
 *               stock:
 *                 type: number
 *                 example: 10
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: 'Up to 5 image files for the product.'
 *     responses:
 *       '201':
 *         description: Product created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       '400':
 *         description: Bad request (e.g., missing required fields).
 *       '401':
 *         description: Unauthorized (user is not logged in).
 *       '403':
 *         description: Forbidden (user is not a seller or admin).
 */
router
  .route('/')
  .get(getProducts)
  .post(
    protect,
    authorizeRoles('seller', 'admin'),
    upload.array('images', 5),
    createProduct
  );

/**
 * @openapi
 * /products/{id}:
 *   get:
 *     tags:
 *      - Products
 *     summary: Get a single product by ID
 *     description: Retrieves the details of a single product using its unique ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product to retrieve.
 *     responses:
 *       '200':
 *         description: The requested product details.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       '404':
 *         description: Product not found.
 *   put:
 *     tags:
 *       - Products
 *     summary: Update an existing product
 *     description: >
 *       Allows the original seller or an admin to update a product's details.
 *       Can be used to update text fields, add new images, or delete existing images.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product to update.
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: 'New image files to add to the product.'
 *               imagesToDelete:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 'An array of public_ids of images to delete.'
 *                 example: ["autoheaven_cars/abc", "autoheaven_cars/def"]
 *     responses:
 *       '200':
 *         description: Product updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       '400':
 *         description: Bad request.
 *       '401':
 *         description: Unauthorized.
 *       '403':
 *         description: Forbidden.
 *       '404':
 *         description: Product not found.
 *   delete:
 *     tags:
 *       - Products
 *     summary: Delete a product
 *     description: >
 *       Allows the original seller or an admin to permanently delete a product.
 *       This also deletes all associated images from Cloudinary.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product to delete.
 *     responses:
 *       '200':
 *         description: Product deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Product and associated images removed'
 *       '401':
 *         description: Unauthorized.
 *       '403':
 *         description: Forbidden.
 *       '404':
 *         description: Product not found.
 */
router
  .route('/:id')
  .get(getProductById)
  .put(
    protect,
    authorizeRoles('seller', 'admin'),
    upload.array('images', 5),
    updateProduct
  )
  .delete(protect, authorizeRoles('seller', 'admin'), deleteProduct);

export default router;