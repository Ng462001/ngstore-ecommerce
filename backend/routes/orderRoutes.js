const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/OrderController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, OrderController.addOrderItems);
router.get('/myorders', protect, OrderController.getMyOrders);
router.get('/order-details/:id', protect, OrderController.getOrderDetails);
router.get('/stats', protect, OrderController.getOrderStats);

module.exports = router;
