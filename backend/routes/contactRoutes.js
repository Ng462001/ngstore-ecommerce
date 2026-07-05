const express = require('express');
const router = express.Router();
const ContactController = require('../controllers/ContactController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public route - Create contact message
router.post('/', ContactController.createContact);

// Admin routes - Protected
router.get('/', protect, admin, ContactController.getAllContacts);
router.get('/stats', protect, admin, ContactController.getContactStats);
router.get('/:id', protect, admin, ContactController.getContactById);
router.patch('/:id/status', protect, admin, ContactController.updateContactStatus);
router.post('/:id/reply', protect, admin, ContactController.replyToContact);
router.delete('/:id', protect, admin, ContactController.deleteContact);

module.exports = router;
