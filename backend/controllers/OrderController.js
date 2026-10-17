const Order = require('../model/Order');
const User = require('../model/User');
const Coupon = require('../model/Coupon');
const ActivityLog = require('../model/ActivityLog');

class OrderController {
    static addOrderItems = async (req, res) => {
        const {
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            isPaid,
            paidAt,
            paymentStatus,
            couponCode,
            discountPrice,
            subtotalPrice
        } = req.body;

        if (orderItems && orderItems.length === 0) {
            res.status(400).json({ message: 'No order items' });
            return;
        } else {
            const order = new Order({
                orderItems,
                user: req.user._id,
                shippingAddress,
                paymentMethod,
                itemsPrice,
                taxPrice: taxPrice || 0,
                shippingPrice,
                totalPrice,
                subtotalPrice: subtotalPrice || itemsPrice,
                discountPrice: discountPrice || 0,
                couponCode: couponCode ? couponCode.trim().toUpperCase() : undefined,
                isPaid,
                paidAt,
                paymentStatus
            });

            const createdOrder = await order.save();

            // If a coupon was applied, record usage in Coupon model
            if (couponCode) {
                try {
                    const formattedCode = couponCode.trim().toUpperCase();
                    const coupon = await Coupon.findOne({ code: formattedCode });
                    if (coupon) {
                        coupon.usedCount = (coupon.usedCount || 0) + 1;
                        coupon.usersUsed.push({
                            user: req.user._id,
                            orderId: createdOrder._id,
                            usedAt: new Date(),
                            discountGiven: discountPrice || 0
                        });
                        // Remove from saved list if user had it saved
                        coupon.savedByUsers = coupon.savedByUsers.filter(
                            (s) => s.user.toString() !== req.user._id.toString()
                        );
                        await coupon.save();

                        // Log activity
                        await ActivityLog.create({
                            orderId: createdOrder._id,
                            userId: req.user._id,
                            userType: 'customer',
                            action: 'coupon_applied',
                            description: `Coupon ${formattedCode} applied with ₹${discountPrice || 0} discount`,
                            details: `Coupon ${formattedCode} successfully redeemed for order ${createdOrder._id}`,
                            metadata: { couponCode: formattedCode, discountPrice }
                        }).catch(() => {});
                    }
                } catch (couponErr) {
                    console.error('Error recording coupon redemption:', couponErr);
                }
            }

            res.status(201).json(createdOrder);
        }
    };

    static getMyOrders = async (req, res) => {
        const orders = await Order.find({ user: req.user._id });
        res.json(orders);
    };

    static getOrderStats = async (req, res) => {
        try {
            const orders = await Order.find({ user: req.user._id });
            const totalOrders = orders.length;
            const completedOrders = orders.filter(order => order.status === 'Delivered').length;
            const pendingOrders = orders.filter(order => order.status === 'Processing' || order.status === 'Shipped').length;

            res.json({
                totalOrders,
                completedOrders,
                pendingOrders
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };

    static getOrderDetails = async (req, res) => {
        try {
            const order = await Order.findById(req.params.id);
            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }

            if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Not authorized to view this order' });
            }

            const user = await User.findById(order.user).select('-password');

            res.json({
                order,
                user
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };
}

module.exports = OrderController;
