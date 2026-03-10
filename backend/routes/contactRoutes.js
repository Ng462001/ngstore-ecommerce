const express = require('express');
const router = express.Router();
const ContactController = require('../controllers/ContactController');
// Uncomment when you have authentication middleware
// const { authenticateUser, isAdmin } = require('../middleware/authMiddleware');

// Public route - Create contact message
router.post('/', ContactController.createContact);

// Admin routes - Uncomment authentication when ready
// router.get('/', authenticateUser, isAdmin, ContactController.getAllContacts);
// router.get('/stats', authenticateUser, isAdmin, ContactController.getContactStats);
// router.get('/:id', authenticateUser, isAdmin, ContactController.getContactById);
// router.patch('/:id/status', authenticateUser, isAdmin, ContactController.updateContactStatus);
// router.post('/:id/reply', authenticateUser, isAdmin, ContactController.replyToContact);
// router.delete('/:id', authenticateUser, isAdmin, ContactController.deleteContact);

// Temporary routes without authentication (for testing)
router.get('/', ContactController.getAllContacts);
router.get('/stats', ContactController.getContactStats);
router.get('/:id', ContactController.getContactById);
router.patch('/:id/status', ContactController.updateContactStatus);
router.post('/:id/reply', ContactController.replyToContact);
router.delete('/:id', ContactController.deleteContact);

module.exports = router;
