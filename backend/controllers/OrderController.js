const Order = require('../model/Order');
const User = require('../model/User');

const addOrderItems = async (req, res) => {
    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice
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
            taxPrice,
            shippingPrice,
            totalPrice
        });

        const createdOrder = await order.save();

        res.status(201).json(createdOrder);
    }
};

const getMyOrders = async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
};

const getOrderStats = async (req, res) => {
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

const getOrderDetails = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        const user = await User.findById(order.user);
        console.log(user)
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json({
            order,
            user
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addOrderItems,
    getMyOrders,
    getOrderStats,
    getOrderDetails
};
