const express = require('express');
const router = express.Router();
const ReturnExchangeController = require('../controllers/returnExchangeController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/', protect, upload.array('images', 5), ReturnExchangeController.requestReturnExchange);
router.get('/my-requests', protect, ReturnExchangeController.getUserRequests);
router.get('/order/:orderId', protect, ReturnExchangeController.getRequestsByOrderId);

// Admin routes
router.get('/admin/all', protect, admin, ReturnExchangeController.getAllRequests);
router.put('/admin/:id/status', protect, admin, ReturnExchangeController.updateRequestStatus);

module.exports = router;
