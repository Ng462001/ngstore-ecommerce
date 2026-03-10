const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, addAddress, updateAddress, deleteAddress, updateUserProfile, changePassword, forgotPassword, resetPassword, verifyEmail } = require('../controllers/UserController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateUserProfile);
router.put('/change-password', protect, changePassword);
router.post('/address', protect, addAddress);
router.put('/address/:id', protect, updateAddress);
router.delete('/address/:id', protect, deleteAddress);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.put('/verifyemail/:token', verifyEmail);

module.exports = router;
