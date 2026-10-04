require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

connectDB();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({
    service: 'User Service',
    status: 'Running',
    port: PORT,
    endpoints: {
      users: `http://localhost:${PORT}/users`
    }
  });
});

app.use('/users', userRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found on User Service' });
});

app.listen(PORT, () => {
  console.log(`👤 User Service running on port ${PORT}`);
});

module.exports = app;
