const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const AdminController = require('../controllers/AdminController');

// Order Routes
router.get('/orders', protect, admin, AdminController.getAllOrders);
router.get('/orders/:id', protect, admin, AdminController.getOrderById);
router.put('/orders/:id/status', protect, admin, AdminController.updateOrderStatus);
router.put('/orders/:id/notes', protect, admin, AdminController.updateOrderNotes);
router.put('/orders/:id/payment', protect, admin, AdminController.updatePaymentStatus);
router.post('/orders/:id/refund', protect, admin, AdminController.processRefund);
router.get('/orders/:id/activity', protect, admin, AdminController.getOrderActivity);
router.get('/orders/search', protect, admin, AdminController.searchOrders);
router.post('/orders/:id/tags', protect, admin, AdminController.addOrderTags);
router.put('/orders/:id/priority', protect, admin, AdminController.updateOrderPriority);
router.delete('/orders/:id', protect, admin, AdminController.deleteOrder);

// Review Management Routes
router.get('/reviews/stats', protect, admin, AdminController.getReviewStats);
router.get('/reviews', protect, admin, AdminController.getAllReviews);
router.get('/reviews/products', protect, admin, AdminController.getReviewProducts);
router.put('/reviews/:id', protect, admin, AdminController.updateReview);
router.delete('/reviews/:id', protect, admin, AdminController.deleteReview);

// User Management Routes
router.get('/users', protect, admin, AdminController.getAllUsers);
router.get('/users/:id', protect, admin, AdminController.getUserDetails);
router.put('/users/:id', protect, admin, AdminController.updateUser);
router.get('/users/:id/orders', protect, admin, AdminController.getUserOrders);
router.delete('/users/:id', protect, admin, AdminController.deleteUser);

// Dashboard Routes
router.get('/stats', protect, admin, AdminController.getDashboardStats);

module.exports = router;