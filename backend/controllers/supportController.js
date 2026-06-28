const Support = require('../model/Support');
const mongoose = require('mongoose');
const { uploadToCloudinary } = require('../services/cloudinaryService');

// Create a new support ticket
exports.createTicket = async (req, res) => {
    try {
        const { subject, message, category, order, priority } = req.body;

        // Validate required fields
        if (!subject || !message || !category) {
            return res.status(400).json({
                success: false,
                message: 'Subject, message, and category are required'
            });
        }

        let files = [];
        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map(file => uploadToCloudinary(file.path, 'support'));
            const uploadResults = await Promise.all(uploadPromises);
            files = uploadResults.map(result => result.secure_url);
        }

        const ticket = await Support.create({
            user: req.user._id,
            subject,
            message,
            category,
            order: order || null,
            priority: priority || 'Medium',
            files
        });

        res.status(201).json({
            success: true,
            ticket: await ticket.populate('user', 'name email')
        });
    } catch (error) {
        console.error('Create ticket error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error creating ticket'
        });
    }
};

// Get all tickets for current user
exports.getUserTickets = async (req, res) => {
    try {
        const tickets = await Support.find({ user: req.user._id })
            .populate('user', 'name email')
            .populate('order', '_id totalPrice status')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            tickets,
            count: tickets.length
        });
    } catch (error) {
        console.error('Get user tickets error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error fetching tickets'
        });
    }
};

// Get ticket details
exports.getTicketById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ticket ID format'
            });
        }

        const ticket = await Support.findById(id)
            .populate('user', 'name email')
            .populate('order', '_id totalPrice status createdAt')
            .populate('responses.sender', 'name email');

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }

        // Ensure user owns ticket or is admin
        if (ticket.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this ticket'
            });
        }

        // Mark unread admin responses as read if user is viewing
        if (req.user.role !== 'admin') {
            let hasUnread = false;
            ticket.responses.forEach(response => {
                if (response.senderRole === 'Admin' && !response.read) {
                    response.read = true;
                    hasUnread = true;
                }
            });

            if (hasUnread) {
                await ticket.save();
            }
        }

        res.status(200).json({
            success: true,
            ticket
        });
    } catch (error) {
        console.error('Get ticket error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error fetching ticket'
        });
    }
};

// Add response (User or Admin)
exports.addResponse = async (req, res) => {
    try {
        const { id } = req.params;
        const { message } = req.body;

        // Validate required field
        if (!message || message.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        // Validate ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ticket ID format'
            });
        }

        const ticket = await Support.findById(id);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }

        // Authorization check
        if (req.user.role !== 'admin' && ticket.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to respond to this ticket'
            });
        }

        const senderRole = req.user.role === 'admin' ? 'Admin' : 'User';

        ticket.responses.push({
            sender: req.user._id,
            senderRole,
            message: message.trim()
        });

        // Update status based on who's responding
        if (senderRole === 'User') {
            ticket.status = 'Open'; // Reopen if user replies
        } else if (ticket.status === 'Open') {
            ticket.status = 'In Progress'; // Admin takes over
        }

        await ticket.save();

        // Populate sender info in response
        const populatedTicket = await Support.findById(id)
            .populate('responses.sender', 'name email');

        res.status(200).json({
            success: true,
            ticket: populatedTicket,
            newResponse: populatedTicket.responses[populatedTicket.responses.length - 1]
        });
    } catch (error) {
        console.error('Add response error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error adding response'
        });
    }
};

// Admin: Get all tickets with filtering
exports.getAllTickets = async (req, res) => {
    try {
        // Check admin authorization
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const { status, category, priority, page = 1, limit = 20 } = req.query;

        // Build filter object
        const filter = {};
        if (status) filter.status = status;
        if (category) filter.category = category;
        if (priority) filter.priority = priority;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const tickets = await Support.find(filter)
            .populate('user', 'name email')
            .populate('order', '_id totalPrice')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Support.countDocuments(filter);

        res.status(200).json({
            success: true,
            tickets,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get all tickets error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error fetching tickets'
        });
    }
};

// Admin: Update status
exports.updateTicketStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Check admin authorization
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        // Validate status
        const validStatuses = ['Open', 'In Progress', 'Resolved', 'Closed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        // Validate ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ticket ID format'
            });
        }

        const ticket = await Support.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        ).populate('user', 'name email');

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }

        res.status(200).json({
            success: true,
            ticket,
            message: `Ticket status updated to ${status}`
        });
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error updating ticket status'
        });
    }
};

// Additional useful endpoints:

// Get ticket statistics (for admin dashboard)
exports.getTicketStats = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const stats = await Support.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$count' },
                    statusCounts: {
                        $push: {
                            status: '$_id',
                            count: '$count'
                        }
                    }
                }
            }
        ]);

        const categoryStats = await Support.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            }
        ]);

        const priorityStats = await Support.aggregate([
            {
                $group: {
                    _id: '$priority',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            stats: stats[0] || { total: 0, statusCounts: [] },
            categoryStats,
            priorityStats
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error fetching statistics'
        });
    }
};

// Get unread messages count for user
exports.getUnreadCount = async (req, res) => {
    try {
        const tickets = await Support.find({ user: req.user._id })
            .select('responses');

        let unreadCount = 0;
        tickets.forEach(ticket => {
            ticket.responses.forEach(response => {
                if (response.senderRole === 'Admin' && !response.read) {
                    unreadCount++;
                }
            });
        });

        res.status(200).json({
            success: true,
            unreadCount
        });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error fetching unread count'
        });
    }
};