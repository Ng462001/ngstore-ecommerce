const Order = require('../model/Order');
const User = require('../model/User');
const Product = require('../model/Product');
const ActivityLog = require('../model/ActivityLog');
const mongoose = require('mongoose');

class AdminController {

    //Get all orders
    static getAllOrders = async (req, res) => {
        try {
            const orders = await Order.find({})
                .populate('user', 'name email phone')
                .sort({ createdAt: -1 })
            res.json({
                orders,
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Error fetching orders', error: error.message });
        }
    };

    //Get order by id
    static getOrderById = async (req, res) => {
        try {
            const order = await Order.findById(req.params.id)

            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }

            const customerOrders = await Order.find({ user: order.user._id });
            const customer = await User.findById(order.user._id);
            const customerStats = {
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                totalOrders: customerOrders.length,
                totalSpent: customerOrders.reduce((sum, o) => sum + o.totalPrice, 0)
            };
            res.json({
                ...order.toObject(),
                customerStats
            });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching order', error: error.message });
        }
    };

    //Update order status
    static updateOrderStatus = async (req, res) => {
        try {
            const { status, notes, notifyCustomer } = req.body;
            const order = await Order.findById(req.params.id);

            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }

            const oldStatus = order.status;
            order.status = status || order.status;

            // Update timestamps based on status
            const statusTimestamps = {
                'Processing': { processingAt: Date.now() },
                'Shipped': { shippedAt: Date.now() },
                'Out for delivery': { outForDeliveryAt: Date.now() },
                'Delivered': {
                    deliveredAt: Date.now(),
                    isDelivered: true,
                    isPaid: true
                },
                'Cancelled': {
                    cancelledAt: Date.now(),
                    paymentStatus: 'Failed'
                },
                'Returned': { returnedAt: Date.now() },
                'Refunded': { refundedAt: Date.now() }
            };

            const timestampUpdates = statusTimestamps[status] || {};
            Object.assign(order, timestampUpdates);

            // Update inventory for delivered orders
            if (status === 'Delivered') {
                for (const item of order.orderItems) {
                    const product = await Product.findById(item.product);
                    if (product) {
                        product.quantity -= item.quantity;
                        product.sold += item.quantity;
                        await product.save();
                    }
                }
            }

            // Handle refund - restore inventory
            if (status === 'Refunded') {
                for (const item of order.orderItems) {
                    const product = await Product.findById(item.product);
                    if (product) {
                        product.quantity += item.quantity;
                        product.sold -= item.quantity;
                        await product.save();
                    }
                }
                order.paymentStatus = 'Refunded';
            }

            // Save admin notes if provided
            if (notes) {
                order.adminNotes = notes;
            }

            const updatedOrder = await order.save();

            // Log the activity
            await ActivityLog.create({
                orderId: order._id,
                userId: req.user.id,
                action: 'status_changed',
                description: `Order status changed from ${oldStatus} to ${status}`,
                metadata: {
                    oldStatus,
                    newStatus: status,
                    notes,
                    notifyCustomer
                },
                timestamp: Date.now()
            });

            // TODO: Implement email notification if notifyCustomer is true
            // if (notifyCustomer) {
            //     sendStatusUpdateEmail(order.user.email, order._id, status, notes);
            // }

            res.json(updatedOrder);
        } catch (error) {
            res.status(500).json({ message: 'Error updating order status', error: error.message });
        }
    };

    //Update order notes
    static updateOrderNotes = async (req, res) => {
        try {
            const { adminNotes } = req.body;
            const order = await Order.findById(req.params.id);

            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }

            order.adminNotes = adminNotes;
            const updatedOrder = await order.save();

            // Log the activity
            await ActivityLog.create({
                orderId: order._id,
                userId: req.user.id,
                action: 'note_added',
                description: 'Admin updated order notes',
                metadata: { notes: adminNotes },
                timestamp: Date.now()
            });

            res.json(updatedOrder);
        } catch (error) {
            res.status(500).json({ message: 'Error updating order notes', error: error.message });
        }
    };

    //Update payment status
    static updatePaymentStatus = async (req, res) => {
        try {
            console.log(req.body);
            const { paymentStatus, paymentDetails } = req.body;
            const order = await Order.findById(req.params.id);

            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }

            const oldPaymentStatus = order.paymentStatus;
            order.paymentStatus = paymentStatus;

            if (paymentDetails) {
                order.paymentDetails = {
                    ...order.paymentDetails,
                    ...paymentDetails
                };
            }

            // Update paid status
            if (paymentStatus === 'Paid') {
                order.isPaid = true;
                order.paidAt = Date.now();
            } else if (paymentStatus === 'Refunded') {
                order.isPaid = false;
                order.refundedAt = Date.now();
            }

            const updatedOrder = await order.save();

            // Log the activity
            await ActivityLog.create({
                orderId: order._id,
                userId: req.user.id,
                action: 'payment_updated',
                description: `Payment status changed from ${oldPaymentStatus} to ${paymentStatus}`,
                metadata: { oldPaymentStatus, newPaymentStatus: paymentStatus, paymentDetails },
                timestamp: Date.now()
            });

            res.json(updatedOrder);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Error updating payment status', error: error.message });
        }
    };

    //Process refund
    static processRefund = async (req, res) => {
        try {
            const order = await Order.findById(req.params.id);

            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }

            if (!order.isPaid) {
                return res.status(400).json({ message: 'Order is not paid' });
            }

            // Update order status
            order.status = 'Refunded';
            order.paymentStatus = 'Refunded';
            order.refundedAt = Date.now();
            order.isPaid = false;

            // Restore inventory
            for (const item of order.orderItems) {
                const product = await Product.findById(item.product);
                if (product) {
                    product.quantity += item.quantity;
                    product.sold -= item.quantity;
                    await product.save();
                }
            }

            const updatedOrder = await order.save();

            // Log the activity
            await ActivityLog.create({
                orderId: order._id,
                userId: req.user.id,
                action: 'refund_processed',
                description: `Order refund processed for amount ₹${order.totalPrice}`,
                metadata: {
                    amount: order.totalPrice,
                    itemsRefunded: order.orderItems.length
                },
                timestamp: Date.now()
            });

            // TODO: Integrate with payment gateway for actual refund
            // await processRefund(order.paymentDetails.transactionId, order.totalPrice);

            res.json(updatedOrder);
        } catch (error) {
            res.status(500).json({ message: 'Error processing refund', error: error.message });
        }
    };

    //Get order activity
    static getOrderActivity = async (req, res) => {
        try {
            const activities = await ActivityLog.find({ orderId: req.params.id })
                .populate('userId', 'name email')
                .sort({ timestamp: -1 })
                .limit(50);

            res.json(activities);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching activity log', error: error.message });
        }
    };

    //Get all users
    static getAllUsers = async (req, res) => {
        try {
            const users = await User.find({}).select('-password');
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const skip = (page - 1) * limit;

            const usersWithStats = await Promise.all(
                users.slice(skip, skip + limit).map(async (user) => {
                    const orders = await Order.find({ user: user._id });
                    const totalSpent = orders.reduce((sum, order) => sum + order.totalPrice, 0);
                    const lastOrder = orders.sort((a, b) => b.createdAt - a.createdAt)[0];

                    return {
                        ...user.toObject(),
                        orderCount: orders.length,
                        totalSpent: totalSpent.toFixed(2),
                        lastOrderDate: lastOrder ? lastOrder.createdAt : null,
                        status: user.status,
                        userType: user.role
                    };
                })
            );

            res.json({
                users: usersWithStats,
                totalUsers: users.length,
                page,
                totalPages: Math.ceil(users.length / limit)
            });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching users', error: error.message });
        }
    };

    //Get dashboard stats
    static getDashboardStats = async (req, res) => {
        try {
            const today = new Date();
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const startOfDay = new Date(today.setHours(0, 0, 0, 0));

            // Basic counts
            const totalProducts = await Product.countDocuments({ status: 'active' });
            const totalOrders = await Order.countDocuments();
            const totalUsers = await User.countDocuments();

            // Revenue calculations
            const orders = await Order.find({});
            const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);

            const monthlyOrders = await Order.find({
                createdAt: { $gte: startOfMonth }
            });
            const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + order.totalPrice, 0);

            const todayOrders = await Order.find({
                createdAt: { $gte: startOfDay }
            });
            const todayRevenue = todayOrders.reduce((sum, order) => sum + order.totalPrice, 0);

            // Status breakdown
            const statusBreakdown = await Order.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                        revenue: { $sum: '$totalPrice' }
                    }
                }
            ]);

            // Recent orders
            const recentOrders = await Order.find({})
                .sort({ createdAt: -1 })
                .limit(10);

            // Top selling products
            const topProducts = await Product.aggregate([
                { $match: { status: 'active' } },
                { $sort: { sold: -1 } },
                { $limit: 5 },
                { $project: { name: 1, sold: 1, image: 1, price: 1 } }
            ]);

            res.json({
                overview: {
                    totalProducts,
                    totalOrders,
                    totalUsers,
                    totalRevenue: totalRevenue.toFixed(2),
                    monthlyRevenue: monthlyRevenue.toFixed(2),
                    todayRevenue: todayRevenue.toFixed(2)
                },
                statusBreakdown,
                recentOrders,
                topProducts,
                chartData: {
                    dailyRevenue: await getDailyRevenueLast7Days(),
                    monthlyOrders: await getMonthlyOrders()
                }
            });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching statistics', error: error.message });
        }
    };

    //Search orders
    static searchOrders = async (req, res) => {
        try {
            const { query, status, startDate, endDate } = req.query;
            let filter = {};

            // Search by order ID or customer email/name
            if (query) {
                const users = await User.find({
                    $or: [
                        { email: { $regex: query, $options: 'i' } },
                        { name: { $regex: query, $options: 'i' } }
                    ]
                }).select('_id');

                const userIds = users.map(user => user._id);

                filter.$or = [
                    { _id: { $regex: query, $options: 'i' } },
                    { user: { $in: userIds } }
                ];
            }

            // Filter by status
            if (status) {
                filter.status = status;
            }

            // Filter by date range
            if (startDate || endDate) {
                filter.createdAt = {};
                if (startDate) {
                    filter.createdAt.$gte = new Date(startDate);
                }
                if (endDate) {
                    filter.createdAt.$lte = new Date(endDate);
                }
            }

            const orders = await Order.find(filter)
                .populate('user', 'name email')
                .sort({ createdAt: -1 })
                .limit(50);

            res.json(orders);
        } catch (error) {
            res.status(500).json({ message: 'Error searching orders', error: error.message });
        }
    };

    //Add order tags
    static addOrderTags = async (req, res) => {
        try {
            const { tags } = req.body;
            const order = await Order.findById(req.params.id);

            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }

            // Merge tags, avoid duplicates
            const uniqueTags = [...new Set([...(order.tags || []), ...tags])];
            order.tags = uniqueTags;

            const updatedOrder = await order.save();

            await ActivityLog.create({
                orderId: order._id,
                userId: req.user.id,
                action: 'tags_updated',
                description: `Tags added to order: ${tags.join(', ')}`,
                metadata: { tags },
                timestamp: Date.now()
            });

            res.json(updatedOrder);
        } catch (error) {
            res.status(500).json({ message: 'Error adding tags', error: error.message });
        }
    };

    //Update order priority
    static updateOrderPriority = async (req, res) => {
        try {
            const { isPriority } = req.body;
            const order = await Order.findById(req.params.id);

            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }

            order.isPriority = isPriority;
            const updatedOrder = await order.save();

            await ActivityLog.create({
                orderId: order._id,
                userId: req.user.id,
                action: 'priority_updated',
                description: `Order priority ${isPriority ? 'enabled' : 'disabled'}`,
                metadata: { isPriority },
                timestamp: Date.now()
            });

            res.json(updatedOrder);
        } catch (error) {
            res.status(500).json({ message: 'Error updating priority', error: error.message });
        }
    };

    //Get review stats
    static getReviewStats = async (req, res) => {
        try {
            const stats = await calculateReviewStats();
            res.json({
                success: true,
                ...stats
            });
        } catch (error) {
            console.error('Error fetching review stats:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching review statistics',
                error: error.message
            });
        }
    };

    //Get all reviews
    static getAllReviews = async (req, res) => {
        try {
            const {
                page = 1,
                limit = 10,
                search,
                rating,
                productId,
                sortBy = 'date',
                sortOrder = 'desc'
            } = req.query;

            const skip = (page - 1) * limit;

            // Build aggregation pipeline with lean() to avoid virtual property issues
            let query = { 'reviews.0': { $exists: true } };

            // Filter by product ID
            if (productId && mongoose.Types.ObjectId.isValid(productId)) {
                query._id = new mongoose.Types.ObjectId(productId);
            }

            // First, get products with reviews
            let products = await Product.find(query)
                .select('_id name image category price reviews rating status')
                .lean(); // Use lean() to get plain JavaScript objects

            // Filter reviews based on criteria
            let allReviews = [];

            products.forEach(product => {
                if (!product.reviews || !Array.isArray(product.reviews)) {
                    return;
                }

                product.reviews.forEach(review => {
                    // Check if review meets criteria
                    let includeReview = true;

                    // Filter by rating
                    if (rating && rating !== 'all') {
                        if (review.rating !== parseInt(rating)) {
                            includeReview = false;
                        }
                    }

                    // Filter by search term
                    if (search) {
                        const searchRegex = new RegExp(search, 'i');
                        const matchesName = review.name && review.name.match(searchRegex);
                        const matchesComment = review.comment && review.comment.match(searchRegex);
                        const matchesProductName = product.name && product.name.match(searchRegex);

                        if (!matchesName && !matchesComment && !matchesProductName) {
                            includeReview = false;
                        }
                    }

                    if (includeReview) {
                        allReviews.push({
                            _id: review._id,
                            name: review.name,
                            rating: review.rating,
                            comment: review.comment,
                            date: review.date,
                            productId: product._id,
                            productName: product.name,
                            productImage: product.image,
                            productCategory: product.category,
                            productPrice: product.price,
                            productStatus: product.status,
                            productRating: product.rating
                        });
                    }
                });
            });

            // Sort reviews
            const sortField = sortBy === 'rating' ? 'rating' : 'date';
            allReviews.sort((a, b) => {
                const aValue = a[sortField] || 0;
                const bValue = b[sortField] || 0;

                if (sortOrder === 'asc') {
                    return aValue > bValue ? 1 : -1;
                } else {
                    return aValue < bValue ? 1 : -1;
                }
            });

            // Paginate
            const total = allReviews.length;
            const paginatedReviews = allReviews.slice(skip, skip + parseInt(limit));

            // Get review statistics
            const stats = await calculateReviewStats();

            // Get products for filter dropdown (without virtual properties issue)
            const productsWithReviews = await Product.find({ 'reviews.0': { $exists: true } })
                .select('name _id')
                .limit(50)
                .lean();

            res.json({
                success: true,
                reviews: paginatedReviews,
                total,
                page: parseInt(page),
                totalPages: Math.ceil(total / limit),
                stats,
                products: productsWithReviews
            });
        } catch (error) {
            console.error('Error fetching reviews:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching reviews',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    };

    //Get review products
    static getReviewProducts = async (req, res) => {
        try {
            const products = await Product.find({
                'reviews.0': { $exists: true }
            })
                .select('name _id image category')
                .sort({ name: 1 })
                .limit(100)
                .lean();

            res.json({
                success: true,
                products
            });
        } catch (error) {
            console.error('Error fetching products with reviews:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching products',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    };

    //Get review by id
    static getReviewById = async (req, res) => {
        try {
            const reviewId = req.params.id;

            // Validate review ID format
            if (!mongoose.Types.ObjectId.isValid(reviewId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid review ID format'
                });
            }

            // Find product that contains this review
            const product = await Product.findOne({
                'reviews._id': reviewId
            }).lean();

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Review not found'
                });
            }

            // Find the specific review
            const review = product.reviews.find(r =>
                r._id && r._id.toString() === reviewId
            );

            if (!review) {
                return res.status(404).json({
                    success: false,
                    message: 'Review not found'
                });
            }

            // Create response without virtual properties
            const reviewWithProductInfo = {
                ...review,
                productId: product._id,
                productName: product.name,
                productImage: product.image,
                productCategory: product.category,
                productPrice: product.price,
                productStatus: product.status
            };

            res.json({
                success: true,
                review: reviewWithProductInfo
            });
        } catch (error) {
            console.error('Error fetching review:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching review',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    };

    //Update review
    static updateReview = async (req, res) => {
        try {
            const reviewId = req.params.id;

            // Validate review ID format
            if (!mongoose.Types.ObjectId.isValid(reviewId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid review ID format'
                });
            }

            const { name, rating, comment } = req.body;

            if (!name || !rating || !comment) {
                return res.status(400).json({
                    success: false,
                    message: 'Name, rating, and comment are required'
                });
            }

            if (rating < 1 || rating > 5) {
                return res.status(400).json({
                    success: false,
                    message: 'Rating must be between 1 and 5'
                });
            }

            if (comment.length < 5) {
                return res.status(400).json({
                    success: false,
                    message: 'Comment must be at least 5 characters long'
                });
            }

            // Find product that contains this review
            const product = await Product.findOne({
                'reviews._id': reviewId
            });

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Review not found'
                });
            }

            // Find the specific review
            const review = product.reviews.id(reviewId);

            if (!review) {
                return res.status(404).json({
                    success: false,
                    message: 'Review not found'
                });
            }

            // Store old rating for stats update
            const oldRating = review.rating;

            // Update review
            review.name = name;
            review.rating = parseInt(rating);
            review.comment = comment;
            review.date = new Date();

            // Update product rating stats if rating changed
            if (oldRating !== parseInt(rating)) {
                // Update rating breakdown
                if (product.rating.breakdown[oldRating] > 0) {
                    product.rating.breakdown[oldRating]--;
                }
                product.rating.breakdown[rating]++;

                // Recalculate average rating
                const totalRatings = Object.entries(product.rating.breakdown).reduce((sum, [star, count]) => {
                    return sum + (parseInt(star) * count);
                }, 0);

                product.rating.average = totalRatings / product.rating.count;
            }

            await product.save();
            res.json({
                success: true,
                message: 'Review updated successfully',
                review: {
                    ...review.toObject(),
                    productName: product.name,
                    productId: product._id
                }
            });
        } catch (error) {
            console.error('Error updating review:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating review',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    };

    //Delete review
    static deleteReview = async (req, res) => {
        try {
            const reviewId = req.params.id;

            // Validate review ID format
            if (!mongoose.Types.ObjectId.isValid(reviewId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid review ID format'
                });
            }

            // Find product that contains this review
            const product = await Product.findOne({
                'reviews._id': reviewId
            });

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Review not found'
                });
            }

            // Find the specific review
            const review = product.reviews.id(reviewId);

            if (!review) {
                return res.status(404).json({
                    success: false,
                    message: 'Review not found'
                });
            }

            // Store review info for logging
            const reviewInfo = {
                rating: review.rating,
                customerName: review.name,
                productName: product.name
            };

            // Remove review from array
            product.reviews.pull({ _id: reviewId });

            // Update product rating stats
            product.rating.count--;
            if (product.rating.breakdown[reviewInfo.rating] > 0) {
                product.rating.breakdown[reviewInfo.rating]--;
            }

            // Recalculate average if there are still reviews
            if (product.rating.count > 0) {
                const totalRatings = Object.entries(product.rating.breakdown).reduce((sum, [star, count]) => {
                    return sum + (parseInt(star) * count);
                }, 0);
                product.rating.average = totalRatings / product.rating.count;
            } else {
                product.rating.average = 0;
            }

            await product.save();
            res.json({
                success: true,
                message: 'Review deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting review:', error);
            res.status(500).json({
                success: false,
                message: 'Error deleting review',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    };

    //Get user details
    static getUserDetails = async (req, res) => {
        try {
            const user = await User.findById(req.params.id).select('-password');

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Get user statistics
            const orders = await Order.find({ user: user._id });
            const totalSpent = orders.reduce((sum, order) => sum + order.totalPrice, 0);

            // Find most recent order for shipping info if user has no address
            let shippingAddress = null;
            if (user.addresses && user.addresses.length > 0) {
                shippingAddress = {
                    fullName: user.name,
                    address: user.addresses[0].street,
                    city: user.addresses[0].city,
                    state: user.addresses[0].state,
                    pinCode: user.addresses[0].zipCode,
                    country: user.addresses[0].country,
                    phone: user.addresses[0].mobile
                };
            } else if (orders.length > 0) {
                // Use last order's shipping address
                const lastOrder = orders.sort((a, b) => b.createdAt - a.createdAt)[0];
                if (lastOrder && lastOrder.shippingAddress) {
                    // Map order address structure to display structure
                    shippingAddress = {
                        fullName: user.name, // Order address might not have name, use user name
                        address: lastOrder.shippingAddress.street,
                        city: lastOrder.shippingAddress.city,
                        state: lastOrder.shippingAddress.state,
                        pinCode: lastOrder.shippingAddress.zipCode,
                        country: lastOrder.shippingAddress.country,
                        phone: lastOrder.shippingAddress.mobile
                    };
                }
            }

            res.json({
                ...user.toObject(),
                shippingAddress,
                orderCount: orders.length,
                totalSpent,
                lastOrderDate: orders.length > 0 ?
                    orders.sort((a, b) => b.createdAt - a.createdAt)[0].createdAt : null
            });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching user details', error: error.message });
        }
    };

    //Get user activity
    static getUserActivity = async (req, res) => {
        try {
            // Find activities where user is the actor OR target
            const activities = await ActivityLog.find({ userId: req.params.id })
                .sort({ createdAt: -1 })
                .limit(50);

            res.json(activities);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching user activity', error: error.message });
        }
    };

    //Update user
    static updateUser = async (req, res) => {
        try {
            const user = await User.findById(req.params.id);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const { name, email, phone, role, status, adminNotes } = req.body;

            if (name) user.name = name;
            if (email) user.email = email;
            if (phone) user.phone = phone;
            if (role) user.role = role;
            if (status) user.status = status;
            if (adminNotes !== undefined) user.adminNotes = adminNotes;

            const updatedUser = await user.save();

            res.json(updatedUser);
        } catch (error) {
            res.status(500).json({ message: 'Error updating user', error: error.message });
        }
    };

    //Get user orders
    static getUserOrders = async (req, res) => {
        try {
            const orders = await Order.find({ user: req.params.id })
                .populate('user', 'name email')
                .sort({ createdAt: -1 });
            res.json(orders);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching user orders', error: error.message });
        }
    };
}

// Helper function for statistics
const calculateReviewStats = async () => {
    try {
        // Use aggregate to avoid virtual properties
        const statsResult = await Product.aggregate([
            { $match: { 'reviews.0': { $exists: true } } },
            { $unwind: '$reviews' },
            {
                $group: {
                    _id: null,
                    totalReviews: { $sum: 1 },
                    averageRating: { $avg: '$reviews.rating' },
                    ratingBreakdown: {
                        $push: '$reviews.rating'
                    }
                }
            }
        ]);

        // Get recent reviews (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentStats = await Product.aggregate([
            { $match: { 'reviews.0': { $exists: true } } },
            { $unwind: '$reviews' },
            { $match: { 'reviews.date': { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: null,
                    recentReviews: { $sum: 1 },
                    recentAverage: { $avg: '$reviews.rating' }
                }
            }
        ]);

        // Get products with most reviews
        const topProducts = await Product.aggregate([
            { $match: { 'reviews.0': { $exists: true } } },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    image: 1,
                    reviewCount: { $size: '$reviews' },
                    averageRating: { $ifNull: ['$rating.average', 0] }
                }
            },
            { $sort: { reviewCount: -1 } },
            { $limit: 5 }
        ]);

        const result = statsResult[0] || { totalReviews: 0, averageRating: 0, ratingBreakdown: [] };

        // Calculate rating breakdown
        const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        if (result.ratingBreakdown && Array.isArray(result.ratingBreakdown)) {
            result.ratingBreakdown.forEach(rating => {
                breakdown[rating] = (breakdown[rating] || 0) + 1;
            });
        }

        return {
            totalReviews: result.totalReviews || 0,
            averageRating: result.averageRating ? Number(result.averageRating.toFixed(1)) : 0,
            ratingBreakdown: breakdown,
            recentReviews: recentStats[0]?.recentReviews || 0,
            recentAverage: recentStats[0]?.recentAverage ? Number(recentStats[0].recentAverage.toFixed(1)) : 0,
            topProducts: topProducts.map(p => ({
                _id: p._id,
                name: p.name,
                image: p.image,
                reviewCount: p.reviewCount,
                averageRating: p.averageRating
            }))
        };
    } catch (error) {
        console.error('Error calculating review stats:', error);
        return {
            totalReviews: 0,
            averageRating: 0,
            ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            recentReviews: 0,
            recentAverage: 0,
            topProducts: []
        };
    }
};

// Helper functions for stats
const getDailyRevenueLast7Days = async () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const result = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: sevenDaysAgo }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                revenue: { $sum: '$totalPrice' },
                orders: { $sum: 1 }
            }
        },
        { $sort: { '_id': 1 } }
    ]);

    return result;
};

//Get monthly orders
const getMonthlyOrders = async () => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const result = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: sixMonthsAgo }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
                orders: { $sum: 1 },
                revenue: { $sum: '$totalPrice' }
            }
        },
        { $sort: { '_id': 1 } }
    ]);

    return result;
};

// Export all controllers
module.exports = AdminController;