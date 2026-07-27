const express = require('express');
const router = express.Router();
const SupportController = require('../controllers/supportController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/', protect, upload.array('attachments', 3), SupportController.createTicket);
router.get('/my-tickets', protect, SupportController.getUserTickets);
router.post('/:id/response', protect, SupportController.addResponse);

// Admin routes
router.get('/admin/all', protect, admin, SupportController.getAllTickets);
router.put('/admin/:id/status', protect, admin, SupportController.updateTicketStatus);
router.delete('/admin/:id', protect, admin, SupportController.deleteTicket);

module.exports = router;
