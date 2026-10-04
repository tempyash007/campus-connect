const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, default: 'Student' }
}, { timestamps: true });

let User;
try {
  User = mongoose.model('User', userSchema);
} catch (e) {
  User = mongoose.model('User');
}

// In-memory initial seed data
const inMemoryUsers = [
  { id: '101', name: 'Alice Smith', email: 'alice@daiict.ac.in', role: 'Student' },
  { id: '102', name: 'Bob Jones', email: 'bob@daiict.ac.in', role: 'Student' },
  { id: '103', name: 'Charlie Brown', email: 'charlie@daiict.ac.in', role: 'Faculty' }
];

module.exports = { User, inMemoryUsers };
