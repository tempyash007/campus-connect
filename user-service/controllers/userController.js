const mongoose = require('mongoose');
const { User, inMemoryUsers } = require('../models/User');

exports.getAllUsers = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const dbUsers = await User.find();
      if (dbUsers.length > 0) return res.status(200).json(dbUsers);
    }
    return res.status(200).json(inMemoryUsers);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving users', error: err.message });
  }
};

exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    if (mongoose.connection.readyState === 1) {
      const dbUser = await User.findOne({ $or: [{ id }, { _id: mongoose.Types.ObjectId.isValid(id) ? id : null }] });
      if (dbUser) return res.status(200).json(dbUser);
    }
    const memUser = inMemoryUsers.find(u => u.id === id);
    if (memUser) return res.status(200).json(memUser);

    return res.status(404).json({ message: `User with ID '${id}' not found` });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user', error: err.message });
  }
};

exports.createUser = async (req, res) => {
  const { id, name, email, role } = req.body;
  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email are required fields' });
  }

  const newId = id || String(Date.now());
  const newUserObj = { id: newId, name, email, role: role || 'Student' };

  try {
    if (mongoose.connection.readyState === 1) {
      const created = await User.create(newUserObj);
      return res.status(201).json(created);
    }
    inMemoryUsers.push(newUserObj);
    return res.status(201).json(newUserObj);
  } catch (err) {
    res.status(500).json({ message: 'Error creating user', error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;

  try {
    if (mongoose.connection.readyState === 1) {
      const updated = await User.findOneAndUpdate({ id }, { name, email, role }, { new: true });
      if (updated) return res.status(200).json(updated);
    }

    const index = inMemoryUsers.findIndex(u => u.id === id);
    if (index !== -1) {
      inMemoryUsers[index] = { ...inMemoryUsers[index], ...req.body };
      return res.status(200).json(inMemoryUsers[index]);
    }

    return res.status(404).json({ message: `User with ID '${id}' not found` });
  } catch (err) {
    res.status(500).json({ message: 'Error updating user', error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    if (mongoose.connection.readyState === 1) {
      const deleted = await User.findOneAndDelete({ id });
      if (deleted) return res.status(200).json({ message: 'User deleted successfully', user: deleted });
    }

    const index = inMemoryUsers.findIndex(u => u.id === id);
    if (index !== -1) {
      const removed = inMemoryUsers.splice(index, 1);
      return res.status(200).json({ message: 'User deleted successfully', user: removed[0] });
    }

    return res.status(404).json({ message: `User with ID '${id}' not found` });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user', error: err.message });
  }
};
