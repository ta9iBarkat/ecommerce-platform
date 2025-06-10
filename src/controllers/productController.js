import Product from '../models/Product.js';
import { cloudinaryUpload } from '../config/cloudinary.js'; // your cloudinaryUpload function

/**
 * @desc    Create a new product with image upload
 * @route   POST /api/products
 * @access  Private (seller/admin)
 */
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, brand, stock } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Please upload at least one image' });
    }

    // Upload all images to Cloudinary in parallel
    const uploadPromises = req.files.map(file =>
      cloudinaryUpload(file.buffer, file.mimetype)
    );
    const uploadResults = await Promise.all(uploadPromises);

    // Format images array for product model
    const images = uploadResults.map(result => ({
      url: result.secure_url,
      public_id: result.public_id,
    }));

    // Create product linked to logged-in user (seller)
    const product = await Product.create({
      name,
      description,
      price,
      category,
      brand,
      stock,
      images,
      seller: req.user._id,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
