import asyncHandler from 'express-async-handler';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import ErrorHandler from '../utils/errorHandler.js'; // <-- Import

// Applying the pattern to all functions:
export const getCart = asyncHandler(async (req, res, next) => {
  // ... (logic is mostly fine, but we can improve consistency)
  const cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId', 'name price images stock');
  
  if (!cart) {
    return res.status(200).json({ cart: { items: [] }, totalPrice: 0 });
  }
  
  const totalPrice = cart.items.reduce((acc, item) => {
      if (item.productId) return acc + item.quantity * item.productId.price;
      return acc;
  }, 0);

  res.status(200).json({ cart, totalPrice: totalPrice.toFixed(2) });
});

export const addItemToCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id;
  
  const product = await Product.findById(productId);
  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  // ... (rest of the logic is fine)
  let cart = await Cart.findOne({ userId });
  if (!cart) cart = new Cart({ userId, items: [] });
  
  const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity;
  } else {
    cart.items.push({ productId, quantity });
  }

  await cart.save();
  res.status(201).json(cart);
});

export const updateCartItem = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const { quantity } = req.body;
  const userId = req.user.id;

  if (quantity <= 0) {
    return next(new ErrorHandler('Quantity must be a positive number.', 400));
  }

  const cart = await Cart.findOne({ userId });
  if (!cart) {
    return next(new ErrorHandler('Cart not found', 404));
  }

  const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
  if (itemIndex > -1) {
    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    res.status(200).json(cart);
  } else {
    return next(new ErrorHandler('Item not found in cart', 404));
  }
});

export const removeItemFromCart = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const userId = req.user.id;
  
  const cart = await Cart.findOne({ userId });
  if (!cart) {
    return next(new ErrorHandler('Cart not found', 404));
  }

  const initialLength = cart.items.length;
  cart.items = cart.items.filter(item => item.productId.toString() !== productId);

  if (cart.items.length === initialLength) {
    return next(new ErrorHandler('Item not found in cart', 404));
  }

  await cart.save();
  res.status(200).json(cart);
});