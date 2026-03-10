const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userType: {
        type: String,
        enum: ['admin', 'customer', 'system'],
        default: 'system'
    },
    action: {
        type: String,
        required: true,
        enum: [
            'order_created',
            'status_changed',
            'payment_updated',
            'note_added',
            'note_edited',
            'refund_processed',
            'tags_updated',
            'priority_updated',
            'shipping_updated',
            'tracking_updated',
            'address_updated',
            'item_added',
            'item_removed',
            'quantity_changed',
            'price_adjusted',
            'coupon_applied',
            'coupon_removed',
            'customer_notified',
            'fraud_reviewed',
            'order_merged',
            'order_split'
        ]
    },
    description: {
        type: String,
        required: true
    },
    details: {
        type: String
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    },
    isSystem: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes for better query performance
activityLogSchema.index({ orderId: 1, createdAt: -1 });
activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });
activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ orderId: 1, action: 1 });

// Pre-save middleware to format description
activityLogSchema.pre('save', function (next) {
    if (!this.description && this.action) {
        const actionDescriptions = {
            'order_created': 'Order was created',
            'status_changed': 'Order status was changed',
            'payment_updated': 'Payment status was updated',
            'note_added': 'Note was added',
            'note_edited': 'Note was edited',
            'refund_processed': 'Refund was processed',
            'tags_updated': 'Tags were updated',
            'priority_updated': 'Priority status was updated',
            'shipping_updated': 'Shipping information was updated',
            'tracking_updated': 'Tracking information was updated',
            'address_updated': 'Address was updated',
            'item_added': 'Item was added to order',
            'item_removed': 'Item was removed from order',
            'quantity_changed': 'Item quantity was changed',
            'price_adjusted': 'Price was adjusted',
            'coupon_applied': 'Coupon was applied',
            'coupon_removed': 'Coupon was removed',
            'customer_notified': 'Customer was notified',
            'fraud_reviewed': 'Order was reviewed for fraud',
            'order_merged': 'Order was merged',
            'order_split': 'Order was split'
        };

        this.description = actionDescriptions[this.action] || 'Action performed';
    }
    next();
});

// Static methods
activityLogSchema.statics.logActivity = async function (data) {
    try {
        const activity = new this(data);
        await activity.save();
        return activity;
    } catch (error) {
        console.error('Error logging activity:', error);
    }
};

activityLogSchema.statics.getOrderActivities = async function (orderId, options = {}) {
    const { limit = 50, skip = 0, sort = { createdAt: -1 } } = options;

    return await this.find({ orderId })
        .populate('userId', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limit);
};

// Method to format log for display
activityLogSchema.methods.formatForDisplay = function () {
    return {
        id: this._id,
        action: this.action,
        description: this.description,
        details: this.details,
        user: this.userId ? {
            id: this.userId._id,
            name: this.userId.name,
            email: this.userId.email
        } : null,
        timestamp: this.createdAt,
        metadata: this.metadata,
        isSystem: this.isSystem
    };
};

module.exports = mongoose.model('ActivityLog', activityLogSchema);