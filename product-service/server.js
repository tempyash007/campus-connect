require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');

const app = express();
const PORT = process.env.PORT || 3002;

connectDB();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({
    service: 'Product Service',
    status: 'Running',
    port: PORT,
    endpoints: {
      products: `http://localhost:${PORT}/products`
    }
  });
});

app.use('/products', productRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found on Product Service' });
});

app.listen(PORT, () => {
  console.log(`📦 Product Service running on port ${PORT}`);
});

module.exports = app;
