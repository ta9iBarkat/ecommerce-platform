import Product from '../models/Product.js';
import { cloudinaryUpload, cloudinary } from '../config/cloudinary.js';
import asyncHandler from 'express-async-handler';
import ApiFeatures from '../utils/apiFeatures.js';
import ErrorHandler from '../utils/errorHandler.js'; // <-- Import

// createProduct, getProducts, and other functions need to be updated...
// Example for getProductById:
export const getProductById = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate(
    'seller',
    'name email'
  );

  if (!product) {
    return next(new ErrorHandler('Product not found', 404)); // <-- Use new handler
  }

  res.status(200).json(product);
});

// Let's apply this to all functions in the file:

export const createProduct = asyncHandler(async (req, res, next) => {
  const { name, description, price, category, brand, stock } = req.body;

  if (!req.files || req.files.length === 0) {
    return next(new ErrorHandler('No image files uploaded. At least one image is required.', 400));
  }

  const imageUploadPromises = req.files.map(file => cloudinaryUpload(file.buffer, file.mimetype));
  const uploadResults = await Promise.all(imageUploadPromises);
  const images = uploadResults.map(result => ({
    public_id: result.public_id,
    url: result.secure_url,
  }));

  const product = new Product({ name, description, price, category, brand, stock, images, seller: req.user.id });
  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

export const getProducts = asyncHandler(async (req, res, next) => {
  const resultsPerPage = Number(req.query.limit) || 10;
  const productCountFeatures = new ApiFeatures(Product.find(), req.query).search().filter();
  const totalProducts = await productCountFeatures.query.countDocuments();
  const apiFeatures = new ApiFeatures(Product.find(), req.query).search().filter().paginate();
  const products = await apiFeatures.query.populate('seller', 'name email');
  const totalPages = Math.ceil(totalProducts / resultsPerPage);

  res.status(200).json({
    success: true,
    count: products.length,
    totalProducts,
    totalPages,
    currentPage: Number(req.query.page) || 1,
    products,
  });
});

export const updateProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorHandler('User not authorized to update this product', 403));
  }

  // Update logic remains the same...
  product.name = req.body.name || product.name;
  product.description = req.body.description || product.description;
  // ... and so on for other fields

  if (req.body.imagesToDelete) {
    // ... delete logic ...
  }
  if (req.files && req.files.length > 0) {
    // ... add logic ...
  }

  const updatedProduct = await product.save();
  res.status(200).json(updatedProduct);
});

export const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorHandler('User not authorized to delete this product', 403));
  }

  if (product.images && product.images.length > 0) {
    const publicIds = product.images.map((image) => image.public_id);
    await Promise.all(publicIds.map(id => cloudinary.uploader.destroy(id)));
  }

  await product.deleteOne();
  res.status(200).json({ message: 'Product and associated images removed' });
});