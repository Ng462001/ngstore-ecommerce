const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', UserController.registerUser);
router.post('/login', UserController.loginUser);
router.get('/me', protect, UserController.getMe);
router.put('/profile', protect, UserController.updateUserProfile);
router.put('/change-password', protect, UserController.changePassword);
router.post('/address', protect, UserController.addAddress);
router.put('/address/:id', protect, UserController.updateAddress);
router.delete('/address/:id', protect, UserController.deleteAddress);
router.post('/forgot-password', UserController.forgotPassword);
router.put('/reset-password/:token', UserController.resetPassword);
router.put('/verifyemail/:token', UserController.verifyEmail);

module.exports = router;
