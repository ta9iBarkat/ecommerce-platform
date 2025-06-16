// controllers/cartController.js
import asyncHandler from 'express-async-handler';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

/**
 * @desc    Get user's cart
 * @route   GET /api/cart
 * @access  Private
 */
export const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ userId: req.user.id }).populate(
    'items.productId',
    'name price images stock' // Select which product fields to return
  );

  if (cart) {
    // Calculate total price on the fly
    const totalPrice = cart.items.reduce((acc, item) => {
      // Ensure product exists before calculating
      if (item.productId) {
        return acc + item.quantity * item.productId.price;
      }
      return acc;
    }, 0);

    res.json({
      cart,
      totalPrice: totalPrice.toFixed(2),
    });
  } else {
    // If no cart, return an empty structure
    res.json({ cart: { items: [] }, totalPrice: 0 });
  }
});

/**
 * @desc    Add or update item in cart
 * @route   POST /api/cart
 * @access  Private
 */
export const addItemToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id;

  // Validate product
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Find user's cart, or create a new one
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = new Cart({ userId, items: [] });
  }

  // Check if item already exists in the cart
  const itemIndex = cart.items.findIndex(
    (item) => item.productId.toString() === productId
  );

  if (itemIndex > -1) {
    // If item exists, update its quantity
    cart.items[itemIndex].quantity += quantity;
  } else {
    // If item doesn't exist, add it to the cart
    cart.items.push({ productId, quantity });
  }

  await cart.save();
  res.status(201).json(cart);
});

/**
 * @desc    Update item quantity in cart
 * @route   PUT /api/cart/item/:productId
 * @access  Private
 */
export const updateCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;
  const userId = req.user.id;

  if (quantity <= 0) {
    res.status(400);
    throw new Error('Quantity must be a positive number. To remove, use the delete endpoint.');
  }

  const cart = await Cart.findOne({ userId });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.productId.toString() === productId
  );

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    res.json(cart);
  } else {
    res.status(404);
    throw new Error('Item not found in cart');
  }
});


/**
 * @desc    Remove an item from the cart
 * @route   DELETE /api/cart/item/:productId
 * @access  Private
 */
export const removeItemFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;

  // Use MongoDB's $pull operator to efficiently remove the item from the array
  const updatedCart = await Cart.findOneAndUpdate(
    { userId },
    { $pull: { items: { productId } } },
    { new: true } // Return the updated document
  );

  if (!updatedCart) {
    res.status(404);
    throw new Error('Cart not found or item not in cart.');
  }

  res.json(updatedCart);
});