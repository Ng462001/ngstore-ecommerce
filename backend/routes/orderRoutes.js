const express = require('express');
const router = express.Router();
const { addOrderItems, getMyOrders, getOrderStats, getOrderDetails } = require('../controllers/OrderController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addOrderItems);
router.get('/myorders', protect, getMyOrders);
router.get('/order-details/:id', protect, getOrderDetails);
router.get('/stats', protect, getOrderStats);

module.exports = router;
