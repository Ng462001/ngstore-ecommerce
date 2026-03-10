const express = require('express');
const router = express.Router();
const {
    requestReturnExchange,
    getUserRequests,
    getRequestById,
    getRequestsByOrderId,
    getAllRequests,
    updateRequestStatus
} = require('../controllers/returnExchangeController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/', protect, upload.array('images', 5), requestReturnExchange);
router.get('/my-requests', protect, getUserRequests);
router.get('/order/:orderId', protect, getRequestsByOrderId);
router.get('/:id', protect, getRequestById);

// Admin routes
router.get('/admin/all', protect, admin, getAllRequests);
router.put('/admin/:id/status', protect, admin, updateRequestStatus);

module.exports = router;
