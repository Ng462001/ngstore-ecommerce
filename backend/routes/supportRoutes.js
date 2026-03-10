const express = require('express');
const router = express.Router();
const {
    createTicket,
    getUserTickets,
    getTicketById,
    addResponse,
    getAllTickets,
    updateTicketStatus
} = require('../controllers/supportController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/', protect, upload.array('attachments', 3), createTicket);
router.get('/my-tickets', protect, getUserTickets);
router.get('/:id', protect, getTicketById);
router.post('/:id/response', protect, addResponse);

// Admin routes
router.get('/admin/all', protect, admin, getAllTickets);
router.put('/admin/:id/status', protect, admin, updateTicketStatus);

module.exports = router;
