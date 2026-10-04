const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  userName: { type: String },
  userEmail: { type: String },
  productId: { type: String, required: true },
  productName: { type: String },
  unitPrice: { type: Number },
  quantity: { type: Number, required: true, default: 1 },
  totalAmount: { type: Number, required: true },
  status: { type: String, default: 'Created' }
}, { timestamps: true });

let Order;
try {
  Order = mongoose.model('Order', orderSchema);
} catch (e) {
  Order = mongoose.model('Order');
}

const inMemoryOrders = [
  {
    id: '701',
    userId: '101',
    userName: 'Alice Smith',
    userEmail: 'alice@daiict.ac.in',
    productId: '501',
    productName: 'Laptop',
    unitPrice: 1200,
    quantity: 1,
    totalAmount: 1200,
    status: 'Created',
    createdAt: new Date().toISOString()
  }
];

module.exports = { Order, inMemoryOrders };
