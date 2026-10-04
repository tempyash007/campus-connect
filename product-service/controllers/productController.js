const mongoose = require('mongoose');
const { Product, inMemoryProducts } = require('../models/Product');

exports.getAllProducts = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const dbProducts = await Product.find();
      if (dbProducts.length > 0) return res.status(200).json(dbProducts);
    }
    return res.status(200).json(inMemoryProducts);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving products', error: err.message });
  }
};

exports.getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    if (mongoose.connection.readyState === 1) {
      const dbProduct = await Product.findOne({ $or: [{ id }, { _id: mongoose.Types.ObjectId.isValid(id) ? id : null }] });
      if (dbProduct) return res.status(200).json(dbProduct);
    }
    const memProduct = inMemoryProducts.find(p => p.id === id);
    if (memProduct) return res.status(200).json(memProduct);

    return res.status(404).json({ message: `Product with ID '${id}' not found` });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching product', error: err.message });
  }
};

exports.createProduct = async (req, res) => {
  const { id, name, price, category, stock } = req.body;
  if (!name || price === undefined) {
    return res.status(400).json({ message: 'Name and price are required fields' });
  }

  const newId = id || String(Date.now());
  const newProductObj = { id: newId, name, price: Number(price), category: category || 'General', stock: Number(stock || 0) };

  try {
    if (mongoose.connection.readyState === 1) {
      const created = await Product.create(newProductObj);
      return res.status(201).json(created);
    }
    inMemoryProducts.push(newProductObj);
    return res.status(201).json(newProductObj);
  } catch (err) {
    res.status(500).json({ message: 'Error creating product', error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  const { id } = req.params;

  try {
    if (mongoose.connection.readyState === 1) {
      const updated = await Product.findOneAndUpdate({ id }, req.body, { new: true });
      if (updated) return res.status(200).json(updated);
    }

    const index = inMemoryProducts.findIndex(p => p.id === id);
    if (index !== -1) {
      inMemoryProducts[index] = { ...inMemoryProducts[index], ...req.body };
      return res.status(200).json(inMemoryProducts[index]);
    }

    return res.status(404).json({ message: `Product with ID '${id}' not found` });
  } catch (err) {
    res.status(500).json({ message: 'Error updating product', error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    if (mongoose.connection.readyState === 1) {
      const deleted = await Product.findOneAndDelete({ id });
      if (deleted) return res.status(200).json({ message: 'Product deleted successfully', product: deleted });
    }

    const index = inMemoryProducts.findIndex(p => p.id === id);
    if (index !== -1) {
      const removed = inMemoryProducts.splice(index, 1);
      return res.status(200).json({ message: 'Product deleted successfully', product: removed[0] });
    }

    return res.status(404).json({ message: `Product with ID '${id}' not found` });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting product', error: err.message });
  }
};
