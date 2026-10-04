require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const PORT = process.env.PORT || 3003;

connectDB();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({
    service: 'Order Service',
    status: 'Running',
    port: PORT,
    dependencies: {
      userService: process.env.USER_SERVICE_URL || 'http://localhost:3001',
      productService: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002'
    },
    endpoints: {
      orders: `http://localhost:${PORT}/orders`
    }
  });
});

app.use('/orders', orderRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found on Order Service' });
});

app.listen(PORT, () => {
  console.log(`🛒 Order Service running on port ${PORT}`);
  console.log(`🔗 Target User Service URL: ${process.env.USER_SERVICE_URL || 'http://localhost:3001'}`);
  console.log(`🔗 Target Product Service URL: ${process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002'}`);
});

module.exports = app;
