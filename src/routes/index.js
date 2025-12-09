const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const categoryRoutes = require('./categoryRoutes');
const productRoutes = require('./productRoutes');
const tableRoutes = require('./tableRoutes');
const orderRoutes = require('./orderRoutes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/tables', tableRoutes);
router.use('/orders', orderRoutes);

router.get('/', (req, res) => {
  res.json({
    message: 'Cafe Lab API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      categories: '/api/v1/categories',
      products: '/api/v1/products',
      tables: '/api/v1/tables',
      orders: '/api/v1/orders'
    }
  });
});

module.exports = router;