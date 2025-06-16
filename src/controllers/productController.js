import Product from '../models/Product.js';
import { cloudinaryUpload, cloudinary } from '../config/cloudinary.js';
import asyncHandler from 'express-async-handler';
import ApiFeatures from '../utils/apiFeatures.js';

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Seller/Admin
const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, brand, stock } = req.body;

  // 1. Check for uploaded files
  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error('No image files uploaded. At least one image is required.');
  }

  // 2. Upload all images to Cloudinary in parallel
  const imageUploadPromises = req.files.map(file => 
    cloudinaryUpload(file.buffer, file.mimetype)
  );
  
  const uploadResults = await Promise.all(imageUploadPromises);
  
  const images = uploadResults.map(result => ({
    public_id: result.public_id,
    url: result.secure_url,
  }));

  // 3. Create the product with the data
  const product = new Product({
    name,
    description,
    price,
    category,
    brand,
    stock,
    images,
    seller: req.user.id, // Get seller ID from authenticated user
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});


// @desc    Get all products with filtering, searching, and pagination
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const resultsPerPage = Number(req.query.limit) || 10;
  
  // First, get the total count of products that match the initial filters (search and filter)
  // This is needed for the frontend to calculate the total number of pages
  const productCountFeatures = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter();
  const totalProducts = await productCountFeatures.query.countDocuments();

  // Now, apply pagination to get the actual products for the current page
  const apiFeatures = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter()
    .paginate();

  // Execute the query
  const products = await apiFeatures.query.populate('seller', 'name email');

  const totalPages = Math.ceil(totalProducts / resultsPerPage);

  res.status(200).json({
    success: true,
    count: products.length, // Number of products returned in this response
    totalProducts,         // Total products matching the filter
    totalPages,            // Total pages available
    currentPage: Number(req.query.page) || 1,
    products,
  });
});

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate(
    'seller',
    'name email'
  );

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Seller/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Authorization: Only the original seller or an admin can update
  if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('User not authorized to update this product');
  }

  // Update text fields from req.body
  product.name = req.body.name || product.name;
  product.description = req.body.description || product.description;
  product.price = req.body.price || product.price;
  product.category = req.body.category || product.category;
  product.brand = req.body.brand || product.brand;
  product.stock = req.body.stock || product.stock;

  // Handle Image Updates
  // 1. Delete images if public_ids are provided in the body
  if (req.body.imagesToDelete) {
    const idsToDelete = Array.isArray(req.body.imagesToDelete) 
      ? req.body.imagesToDelete 
      : [req.body.imagesToDelete];
      
    // Destroy from Cloudinary
    await Promise.all(idsToDelete.map(id => cloudinary.uploader.destroy(id)));
    // Remove from product's images array
    product.images = product.images.filter(
      (img) => !idsToDelete.includes(img.public_id)
    );
  }

  // 2. Add new images if files are uploaded
  if (req.files && req.files.length > 0) {
    const imageUploadPromises = req.files.map(file => 
      cloudinaryUpload(file.buffer, file.mimetype)
    );
    const newUploadResults = await Promise.all(imageUploadPromises);
    const newImages = newUploadResults.map(result => ({
      public_id: result.public_id,
      url: result.secure_url,
    }));
    product.images.push(...newImages);
  }

  const updatedProduct = await product.save();
  res.json(updatedProduct);
});


// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Seller/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  // Authorization: Only the original seller or an admin can delete
  if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('User not authorized to delete this product');
  }

  // Delete all associated images from Cloudinary
  if (product.images && product.images.length > 0) {
    const publicIds = product.images.map((image) => image.public_id);
    await Promise.all(publicIds.map(id => cloudinary.uploader.destroy(id)));
  }

  // Delete product from DB
  await product.deleteOne();
  res.json({ message: 'Product and associated images removed' });
});

export {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};