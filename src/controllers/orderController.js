// controllers/orderController.js
import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import ErrorHandler from '../utils/errorHandler.js';

/**
 * @desc    Create a new order
 * @route   POST /api/orders
 * @access  Private
 */
export const createOrder = asyncHandler(async (req, res, next) => {
  const { shippingInfo, paymentInfo } = req.body;
  const userId = req.user.id;

  // 1. Get the user's cart
  const cart = await Cart.findOne({ userId }).populate('items.productId');
  if (!cart || cart.items.length === 0) {
    return next(new ErrorHandler('Your cart is empty', 400));
  }

  // 2. Create order items from cart items
  const orderItems = cart.items.map((item) => {
    // Check if product still exists
    if (!item.productId) {
      throw new ErrorHandler(`A product in your cart is no longer available.`, 404);
    }
    return {
      name: item.productId.name,
      quantity: item.quantity,
      image: item.productId.images[0]?.url || '', // Get first image
      price: item.productId.price,
      product: item.productId._id,
    };
  });
  
  // 3. Calculate prices
  const itemsPrice = cart.items.reduce((acc, item) => acc + item.quantity * item.productId.price, 0);
  const taxPrice = Number((0.15 * itemsPrice).toFixed(2)); // Example 15% tax
  const shippingPrice = itemsPrice > 200 ? 0 : 25; // Example free shipping over $200
  const totalPrice = (itemsPrice + taxPrice + shippingPrice).toFixed(2);

  // 4. Create the order
  const order = await Order.create({
    shippingInfo,
    user: userId,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paidAt: Date.now(), // Assuming payment is instant for this example
  });

  // 5. Update stock for each ordered item
  for (const item of cart.items) {
    await Product.findByIdAndUpdate(item.productId._id, {
      $inc: { stock: -item.quantity },
    });
  }

  // 6. Clear the user's cart
  await Cart.findByIdAndDelete(cart._id);

  res.status(201).json({
    success: true,
    order,
  });
});

/**
 * @desc    Get logged in user's orders
 * @route   GET /api/orders/my
 * @access  Private
 */
export const getMyOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    orders,
  });
});

/**
 * @desc    Get all orders (Admin)
 * @route   GET /api/orders
 * @access  Private/Admin
 */
export const getAllOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });

  let totalAmount = 0;
  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });

  res.status(200).json({
    success: true,
    totalAmount: totalAmount.toFixed(2),
    count: orders.length,
    orders,
  });
});


/**
 * @desc    Update order status (Admin)
 * @route   PUT /api/orders/:id
 * @access  Private/Admin
 */
export const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler('Order not found with this ID', 404));
  }

  if (order.orderStatus === 'Delivered') {
    return next(new ErrorHandler('This order has already been delivered', 400));
  }

  const { status } = req.body;
  if (!status) {
      return next(new ErrorHandler('Status is required', 400));
  }

  // Business logic: Update stock if order is cancelled
  if (status === 'Cancelled' && order.orderStatus !== 'Cancelled') {
      for (const item of order.orderItems) {
          await Product.findByIdAndUpdate(item.product, {
              $inc: { stock: item.quantity }
          });
      }
  }

  order.orderStatus = status;

  if (status === 'Delivered') {
    order.deliveredAt = Date.now();
  }

  await order.save({ validateBeforeSave: true });

  res.status(200).json({
    success: true,
    order,
  });
});