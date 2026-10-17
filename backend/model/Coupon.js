const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: [3, "Coupon code must be at least 3 characters"],
      maxlength: [20, "Coupon code cannot exceed 20 characters"],
    },
    description: {
      type: String,
      required: [true, "Coupon description is required"],
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage",
      required: true,
    },
    discountAmount: {
      type: Number,
      required: [true, "Discount amount is required"],
      min: [1, "Discount amount must be at least 1"],
    },
    maxDiscountAmount: {
      type: Number,
      default: null, // Cap for percentage discounts (in INR)
      min: [0, "Max discount amount cannot be negative"],
    },
    minPurchaseAmount: {
      type: Number,
      default: 0,
      min: [0, "Minimum purchase amount cannot be negative"],
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      required: [true, "Expiry date is required"],
    },
    usageLimit: {
      type: Number,
      default: null, // Overall max redemptions; null = unlimited
      min: [1, "Usage limit must be at least 1"],
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    userUsageLimit: {
      type: Number,
      default: 1, // Max redemptions per user
      min: [1, "Per user usage limit must be at least 1"],
    },
    applicableType: {
      type: String,
      enum: ["all", "product"],
      default: "all",
    },
    applicableProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    usersUsed: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        orderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Order",
        },
        usedAt: {
          type: Date,
          default: Date.now,
        },
        discountGiven: {
          type: Number,
          default: 0,
        },
      },
    ],
    savedByUsers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        savedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
couponSchema.index({ isActive: 1, expiryDate: 1 });
couponSchema.index({ "savedByUsers.user": 1 });
couponSchema.index({ "usersUsed.user": 1 });

// Helper method to check if coupon is currently valid
couponSchema.methods.isValidNow = function () {
  const now = new Date();
  if (!this.isActive) return { valid: false, reason: "Coupon is inactive" };
  if (this.startDate && now < new Date(this.startDate)) {
    return { valid: false, reason: "Coupon is not yet active" };
  }
  if (this.expiryDate && now > new Date(this.expiryDate)) {
    return { valid: false, reason: "Coupon has expired" };
  }
  if (this.usageLimit !== null && this.usedCount >= this.usageLimit) {
    return { valid: false, reason: "Coupon total usage limit reached" };
  }
  return { valid: true };
};

module.exports = mongoose.model("Coupon", couponSchema);
