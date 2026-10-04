const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, default: 'General' },
  stock: { type: Number, default: 0 }
}, { timestamps: true });

let Product;
try {
  Product = mongoose.model('Product', productSchema);
} catch (e) {
  Product = mongoose.model('Product');
}

const inMemoryProducts = [
  { id: '501', name: 'Laptop', price: 1200, category: 'Electronics', stock: 15 },
  { id: '502', name: 'Wireless Mouse', price: 25, category: 'Electronics', stock: 50 },
  { id: '503', name: 'Textbook - Web Services', price: 65, category: 'Books', stock: 30 }
];

module.exports = { Product, inMemoryProducts };
