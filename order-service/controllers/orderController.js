const mongoose = require('mongoose');
const { Order, inMemoryOrders } = require('../models/Order');
const { fetchUser, fetchProduct } = require('../utils/client');

exports.getAllOrders = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const dbOrders = await Order.find();
      if (dbOrders.length > 0) return res.status(200).json(dbOrders);
    }
    return res.status(200).json(inMemoryOrders);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving orders', error: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  const { id } = req.params;
  try {
    if (mongoose.connection.readyState === 1) {
      const dbOrder = await Order.findOne({ $or: [{ id }, { _id: mongoose.Types.ObjectId.isValid(id) ? id : null }] });
      if (dbOrder) return res.status(200).json(dbOrder);
    }
    const memOrder = inMemoryOrders.find(o => o.id === id);
    if (memOrder) return res.status(200).json(memOrder);

    return res.status(404).json({ message: `Order with ID '${id}' not found` });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching order', error: err.message });
  }
};

exports.createOrder = async (req, res) => {
  const userId = req.body.userId || req.body.user_id;
  const productId = req.body.productId || req.body.product_id;
  const quantity = Number(req.body.quantity || 1);

  if (!userId || !productId) {
    return res.status(400).json({ message: 'userId and productId are required fields' });
  }

  // 1. Inter-service call: Validate User via User Service
  const userResult = await fetchUser(userId);
  if (!userResult.success) {
    return res.status(userResult.status).json({
      error: userResult.status === 404 ? 'Resource Not Found' : 'Service Unavailable',
      message: userResult.message,
      targetService: 'User Service'
    });
  }

  // 2. Inter-service call: Validate Product via Product Service
  const productResult = await fetchProduct(productId);
  if (!productResult.success) {
    return res.status(productResult.status).json({
      error: productResult.status === 404 ? 'Resource Not Found' : 'Service Unavailable',
      message: productResult.message,
      targetService: 'Product Service'
    });
  }

  const user = userResult.data;
  const product = productResult.data;
  const totalAmount = Number(product.price || 0) * quantity;
  const newId = req.body.id || `ORD-${Date.now()}`;

  const newOrderObj = {
    id: newId,
    userId: String(userId),
    userName: user.name || 'Unknown User',
    userEmail: user.email || '',
    productId: String(productId),
    productName: product.name || 'Unknown Product',
    unitPrice: product.price || 0,
    quantity,
    totalAmount,
    status: 'Created',
    createdAt: new Date().toISOString()
  };

  try {
    if (mongoose.connection.readyState === 1) {
      const created = await Order.create(newOrderObj);
      return res.status(201).json(created);
    }
    inMemoryOrders.push(newOrderObj);
    return res.status(201).json(newOrderObj);
  } catch (err) {
    res.status(500).json({ message: 'Error creating order', error: err.message });
  }
};
