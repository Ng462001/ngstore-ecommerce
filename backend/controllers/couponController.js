const Coupon = require("../model/Coupon");
const Product = require("../model/Product");
const crypto = require("crypto");

class CouponController {
  // ================= ADMIN METHODS ================= //

  /**
   * Create a new coupon (Admin)
   */
  static createCoupon = async (req, res) => {
    try {
      const {
        code,
        description,
        discountType,
        discountAmount,
        maxDiscountAmount,
        minPurchaseAmount,
        startDate,
        expiryDate,
        usageLimit,
        userUsageLimit,
        applicableType,
        applicableProducts,
        isActive,
      } = req.body;

      if (!code || !description || !discountAmount || !expiryDate) {
        return res.status(400).json({
          message: "Code, description, discount amount, and expiry date are required",
        });
      }

      const formattedCode = code.trim().toUpperCase();

      // Check if coupon code already exists
      const existing = await Coupon.findOne({ code: formattedCode });
      if (existing) {
        return res.status(400).json({
          message: `Coupon with code '${formattedCode}' already exists`,
        });
      }

      if (discountType === "percentage") {
        if (discountAmount <= 0 || discountAmount > 100) {
          return res.status(400).json({
            message: "Percentage discount must be between 1 and 100",
          });
        }
      } else if (discountType === "fixed") {
        if (discountAmount <= 0) {
          return res.status(400).json({
            message: "Fixed discount amount must be greater than 0",
          });
        }
      }

      const start = startDate ? new Date(startDate) : new Date();
      const expiry = new Date(expiryDate);
      if (expiry <= start) {
        return res.status(400).json({
          message: "Expiry date must be after the start date",
        });
      }

      const coupon = new Coupon({
        code: formattedCode,
        description: description.trim(),
        discountType: discountType || "percentage",
        discountAmount: Number(discountAmount),
        maxDiscountAmount:
          discountType === "percentage" && maxDiscountAmount
            ? Number(maxDiscountAmount)
            : null,
        minPurchaseAmount: minPurchaseAmount ? Number(minPurchaseAmount) : 0,
        startDate: start,
        expiryDate: expiry,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        userUsageLimit: userUsageLimit ? Number(userUsageLimit) : 1,
        applicableType: applicableType || "all",
        applicableProducts:
          applicableType === "product" && Array.isArray(applicableProducts)
            ? applicableProducts
            : [],
        isActive: isActive !== undefined ? isActive : true,
      });

      const savedCoupon = await coupon.save();

      res.status(201).json({
        success: true,
        message: "Coupon created successfully",
        coupon: savedCoupon,
      });
    } catch (error) {
      console.error("Create coupon error:", error);
      res.status(500).json({ message: error.message || "Failed to create coupon" });
    }
  };

  /**
   * Auto-generate a coupon code or promotional batch (Admin)
   */
  static generateCoupon = async (req, res) => {
    try {
      const {
        prefix = "SAVE",
        description,
        discountType = "percentage",
        discountAmount = 15,
        maxDiscountAmount,
        minPurchaseAmount = 500,
        validDays = 30,
        usageLimit = 100,
        userUsageLimit = 1,
        applicableType = "all",
        applicableProducts = [],
      } = req.body;

      // Generate a unique random code e.g. SAVE-7X9B2 or FESTIVE20-A4F1
      let uniqueCode = "";
      let isUnique = false;
      let attempts = 0;

      while (!isUnique && attempts < 10) {
        const randomString = crypto.randomBytes(3).toString("hex").toUpperCase();
        uniqueCode = `${prefix.trim().toUpperCase()}${randomString}`;
        const found = await Coupon.findOne({ code: uniqueCode });
        if (!found) {
          isUnique = true;
        }
        attempts++;
      }

      if (!isUnique) {
        uniqueCode = `${prefix.trim().toUpperCase()}${Date.now().toString().slice(-5)}`;
      }

      const startDate = new Date();
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + (Number(validDays) || 30));

      const coupon = new Coupon({
        code: uniqueCode,
        description:
          description ||
          `Get ${discountAmount}${discountType === "percentage" ? "%" : "₹"} OFF on your order`,
        discountType,
        discountAmount: Number(discountAmount),
        maxDiscountAmount:
          discountType === "percentage" && maxDiscountAmount
            ? Number(maxDiscountAmount)
            : null,
        minPurchaseAmount: Number(minPurchaseAmount) || 0,
        startDate,
        expiryDate,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        userUsageLimit: Number(userUsageLimit) || 1,
        applicableType,
        applicableProducts,
        isActive: true,
      });

      const savedCoupon = await coupon.save();

      res.status(201).json({
        success: true,
        message: `Coupon ${uniqueCode} generated successfully`,
        coupon: savedCoupon,
      });
    } catch (error) {
      console.error("Generate coupon error:", error);
      res.status(500).json({ message: error.message || "Failed to generate coupon" });
    }
  };

  /**
   * Get all coupons for Admin with statistics and filters
   */
  static getAllCouponsAdmin = async (req, res) => {
    try {
      const { status, search } = req.query;
      const query = {};

      if (search) {
        query.$or = [
          { code: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }

      const now = new Date();

      if (status === "active") {
        query.isActive = true;
        query.expiryDate = { $gte: now };
      } else if (status === "expired") {
        query.expiryDate = { $lt: now };
      } else if (status === "inactive") {
        query.isActive = false;
      }

      const coupons = await Coupon.find(query)
        .populate("applicableProducts", "name price image images")
        .sort({ createdAt: -1 });

      // Compute summary stats
      const totalCoupons = await Coupon.countDocuments();
      const activeCoupons = await Coupon.countDocuments({
        isActive: true,
        expiryDate: { $gte: now },
      });
      const expiredCoupons = await Coupon.countDocuments({
        expiryDate: { $lt: now },
      });

      // Calculate total redemptions and total savings granted
      const allCouponsData = await Coupon.find({}, "usedCount usersUsed");
      let totalRedemptions = 0;
      let totalSavingsGiven = 0;

      allCouponsData.forEach((c) => {
        totalRedemptions += c.usedCount || 0;
        if (Array.isArray(c.usersUsed)) {
          c.usersUsed.forEach((u) => {
            totalSavingsGiven += u.discountGiven || 0;
          });
        }
      });

      res.json({
        success: true,
        coupons,
        stats: {
          totalCoupons,
          activeCoupons,
          expiredCoupons,
          totalRedemptions,
          totalSavingsGiven,
        },
      });
    } catch (error) {
      console.error("Get admin coupons error:", error);
      res.status(500).json({ message: error.message || "Failed to fetch coupons" });
    }
  };

  /**
   * Get single coupon details (Admin)
   */
  static getCouponById = async (req, res) => {
    try {
      const coupon = await Coupon.findById(req.params.id)
        .populate("applicableProducts", "name price image images")
        .populate("usersUsed.user", "name email")
        .populate("usersUsed.orderId", "_id totalPrice status createdAt");

      if (!coupon) {
        return res.status(404).json({ message: "Coupon not found" });
      }

      res.json({ success: true, coupon });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  /**
   * Update coupon (Admin)
   */
  static updateCoupon = async (req, res) => {
    try {
      const { id } = req.params;
      const {
        code,
        description,
        discountType,
        discountAmount,
        maxDiscountAmount,
        minPurchaseAmount,
        startDate,
        expiryDate,
        usageLimit,
        userUsageLimit,
        applicableType,
        applicableProducts,
        isActive,
      } = req.body;

      const coupon = await Coupon.findById(id);
      if (!coupon) {
        return res.status(404).json({ message: "Coupon not found" });
      }

      if (code && code.trim().toUpperCase() !== coupon.code) {
        const formattedCode = code.trim().toUpperCase();
        const existing = await Coupon.findOne({ code: formattedCode });
        if (existing && existing._id.toString() !== id) {
          return res.status(400).json({
            message: `Coupon code '${formattedCode}' already exists`,
          });
        }
        coupon.code = formattedCode;
      }

      if (description) coupon.description = description.trim();
      if (discountType) coupon.discountType = discountType;
      if (discountAmount !== undefined) coupon.discountAmount = Number(discountAmount);
      if (maxDiscountAmount !== undefined) {
        coupon.maxDiscountAmount = maxDiscountAmount ? Number(maxDiscountAmount) : null;
      }
      if (minPurchaseAmount !== undefined) {
        coupon.minPurchaseAmount = Number(minPurchaseAmount);
      }
      if (startDate) coupon.startDate = new Date(startDate);
      if (expiryDate) coupon.expiryDate = new Date(expiryDate);
      if (usageLimit !== undefined) {
        coupon.usageLimit = usageLimit ? Number(usageLimit) : null;
      }
      if (userUsageLimit !== undefined) {
        coupon.userUsageLimit = Number(userUsageLimit);
      }
      if (applicableType) coupon.applicableType = applicableType;
      if (applicableProducts !== undefined) {
        coupon.applicableProducts = applicableProducts;
      }
      if (isActive !== undefined) coupon.isActive = isActive;

      const updated = await coupon.save();

      res.json({
        success: true,
        message: "Coupon updated successfully",
        coupon: updated,
      });
    } catch (error) {
      console.error("Update coupon error:", error);
      res.status(500).json({ message: error.message || "Failed to update coupon" });
    }
  };

  /**
   * Delete coupon (Admin)
   */
  static deleteCoupon = async (req, res) => {
    try {
      const coupon = await Coupon.findByIdAndDelete(req.params.id);
      if (!coupon) {
        return res.status(404).json({ message: "Coupon not found" });
      }

      res.json({
        success: true,
        message: `Coupon '${coupon.code}' deleted successfully`,
      });
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to delete coupon" });
    }
  };

  /**
   * Toggle active/inactive status (Admin)
   */
  static toggleCouponStatus = async (req, res) => {
    try {
      const coupon = await Coupon.findById(req.params.id);
      if (!coupon) {
        return res.status(404).json({ message: "Coupon not found" });
      }

      coupon.isActive = !coupon.isActive;
      await coupon.save();

      res.json({
        success: true,
        message: `Coupon is now ${coupon.isActive ? "active" : "inactive"}`,
        isActive: coupon.isActive,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  // ================= USER METHODS ================= //

  /**
   * Get all active public coupons available to users
   */
  static getAvailableCoupons = async (req, res) => {
    try {
      const now = new Date();
      const userId = req.user ? req.user._id.toString() : null;

      const coupons = await Coupon.find({
        isActive: true,
        expiryDate: { $gte: now },
        startDate: { $lte: now },
      })
        .populate("applicableProducts", "name price image images")
        .sort({ createdAt: -1 });

      const filtered = coupons
        .filter((c) => c.usageLimit === null || c.usedCount < c.usageLimit)
        .map((c) => {
          let userUsedCount = 0;
          let isSaved = false;

          if (userId) {
            userUsedCount = c.usersUsed.filter(
              (u) => u.user.toString() === userId
            ).length;
            isSaved = c.savedByUsers.some(
              (s) => s.user.toString() === userId
            );
          }

          const hasReachedUserLimit = userUsedCount >= (c.userUsageLimit || 1);

          return {
            _id: c._id,
            code: c.code,
            description: c.description,
            discountType: c.discountType,
            discountAmount: c.discountAmount,
            maxDiscountAmount: c.maxDiscountAmount,
            minPurchaseAmount: c.minPurchaseAmount,
            expiryDate: c.expiryDate,
            applicableType: c.applicableType,
            applicableProducts: c.applicableProducts,
            isSaved,
            isUsed: hasReachedUserLimit,
            remainingUses: Math.max(0, (c.userUsageLimit || 1) - userUsedCount),
          };
        });

      res.json({ success: true, coupons: filtered });
    } catch (error) {
      console.error("Get available coupons error:", error);
      res.status(500).json({ message: error.message });
    }
  };

  /**
   * Get user coupons (Saved, Available, Used) for "My Profile -> Coupons"
   */
  static getUserCoupons = async (req, res) => {
    try {
      const userId = req.user._id;
      const now = new Date();

      // All active valid coupons
      const allActive = await Coupon.find({
        isActive: true,
        expiryDate: { $gte: now },
      }).populate("applicableProducts", "name price image images");

      // Coupons user has saved in profile
      const savedCoupons = [];
      // Other available coupons user hasn't saved yet
      const availableCoupons = [];

      allActive.forEach((coupon) => {
        const userUsageCount = coupon.usersUsed.filter(
          (u) => u.user.toString() === userId.toString()
        ).length;
        const isUserUsedUp = userUsageCount >= (coupon.userUsageLimit || 1);

        const isSaved = coupon.savedByUsers.some(
          (s) => s.user.toString() === userId.toString()
        );

        const couponItem = {
          _id: coupon._id,
          code: coupon.code,
          description: coupon.description,
          discountType: coupon.discountType,
          discountAmount: coupon.discountAmount,
          maxDiscountAmount: coupon.maxDiscountAmount,
          minPurchaseAmount: coupon.minPurchaseAmount,
          expiryDate: coupon.expiryDate,
          applicableType: coupon.applicableType,
          applicableProducts: coupon.applicableProducts,
          isSaved,
          isUsed: isUserUsedUp,
          remainingUses: Math.max(0, (coupon.userUsageLimit || 1) - userUsageCount),
        };

        if (isSaved && !isUserUsedUp) {
          savedCoupons.push(couponItem);
        } else if (!isUserUsedUp) {
          availableCoupons.push(couponItem);
        }
      });

      // Used / Redeemed coupons by this user
      const usedCouponsDocs = await Coupon.find({
        "usersUsed.user": userId,
      })
        .populate("applicableProducts", "name price image")
        .populate("usersUsed.orderId", "totalPrice createdAt status");

      const usedCoupons = [];
      usedCouponsDocs.forEach((coupon) => {
        const userEntries = coupon.usersUsed.filter(
          (u) => u.user.toString() === userId.toString()
        );
        userEntries.forEach((entry) => {
          usedCoupons.push({
            _id: coupon._id,
            code: coupon.code,
            description: coupon.description,
            discountType: coupon.discountType,
            discountAmount: coupon.discountAmount,
            discountGiven: entry.discountGiven,
            usedAt: entry.usedAt,
            order: entry.orderId,
          });
        });
      });

      res.json({
        success: true,
        savedCoupons,
        availableCoupons,
        usedCoupons,
      });
    } catch (error) {
      console.error("Get user coupons error:", error);
      res.status(500).json({ message: error.message });
    }
  };

  /**
   * Save a coupon to user's saved list (User)
   */
  static saveCouponForUser = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user._id;

      const coupon = await Coupon.findById(id);
      if (!coupon) {
        return res.status(404).json({ message: "Coupon not found" });
      }

      if (!coupon.isActive || new Date(coupon.expiryDate) < new Date()) {
        return res.status(400).json({ message: "This coupon is no longer active or has expired" });
      }

      const alreadySaved = coupon.savedByUsers.some(
        (s) => s.user.toString() === userId.toString()
      );

      if (alreadySaved) {
        return res.status(400).json({ message: "Coupon is already saved in your profile" });
      }

      coupon.savedByUsers.push({ user: userId, savedAt: new Date() });
      await coupon.save();

      res.json({
        success: true,
        message: `Coupon '${coupon.code}' saved to your profile!`,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  /**
   * Remove a coupon from user's saved list (User)
   */
  static removeSavedCoupon = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user._id;

      const coupon = await Coupon.findById(id);
      if (!coupon) {
        return res.status(404).json({ message: "Coupon not found" });
      }

      coupon.savedByUsers = coupon.savedByUsers.filter(
        (s) => s.user.toString() !== userId.toString()
      );
      await coupon.save();

      res.json({
        success: true,
        message: "Coupon removed from saved list",
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  /**
   * Claim / Add a coupon by typing code in profile (User)
   */
  static claimCouponByCode = async (req, res) => {
    try {
      const { code } = req.body;
      const userId = req.user._id;

      if (!code || !code.trim()) {
        return res.status(400).json({ message: "Please enter a coupon code" });
      }

      const formattedCode = code.trim().toUpperCase();
      const coupon = await Coupon.findOne({ code: formattedCode });

      if (!coupon) {
        return res.status(404).json({ message: `Coupon '${formattedCode}' does not exist` });
      }

      const validation = coupon.isValidNow();
      if (!validation.valid) {
        return res.status(400).json({ message: validation.reason });
      }

      // Check if user already reached usage limit
      const userUsageCount = coupon.usersUsed.filter(
        (u) => u.user.toString() === userId.toString()
      ).length;

      if (userUsageCount >= (coupon.userUsageLimit || 1)) {
        return res.status(400).json({
          message: "You have already reached the redemption limit for this coupon",
        });
      }

      const alreadySaved = coupon.savedByUsers.some(
        (s) => s.user.toString() === userId.toString()
      );

      if (alreadySaved) {
        return res.status(400).json({
          message: "Coupon is already saved in your coupons list",
        });
      }

      coupon.savedByUsers.push({ user: userId, savedAt: new Date() });
      await coupon.save();

      res.json({
        success: true,
        message: `Coupon '${coupon.code}' successfully claimed and added to your profile!`,
        coupon: {
          _id: coupon._id,
          code: coupon.code,
          description: coupon.description,
          discountType: coupon.discountType,
          discountAmount: coupon.discountAmount,
          maxDiscountAmount: coupon.maxDiscountAmount,
          minPurchaseAmount: coupon.minPurchaseAmount,
          expiryDate: coupon.expiryDate,
        },
      });
    } catch (error) {
      console.error("Claim coupon error:", error);
      res.status(500).json({ message: error.message });
    }
  };

  /**
   * Validate coupon at checkout and compute discount
   */
  static validateCoupon = async (req, res) => {
    try {
      const { code, cartItems = [], subtotal = 0 } = req.body;
      const userId = req.user._id;

      if (!code || !code.trim()) {
        return res.status(400).json({ message: "Coupon code is required" });
      }

      const formattedCode = code.trim().toUpperCase();
      const coupon = await Coupon.findOne({ code: formattedCode });

      if (!coupon) {
        return res.status(404).json({ message: "Invalid coupon code" });
      }

      // Check active and date validity
      const validation = coupon.isValidNow();
      if (!validation.valid) {
        return res.status(400).json({ message: validation.reason });
      }

      // Check per-user limit
      const userUsageCount = coupon.usersUsed.filter(
        (u) => u.user.toString() === userId.toString()
      ).length;

      if (userUsageCount >= (coupon.userUsageLimit || 1)) {
        return res.status(400).json({
          message: "You have already used this coupon the maximum allowed times",
        });
      }

      // Check minimum purchase amount
      const orderSubtotal = Number(subtotal) || 0;
      if (orderSubtotal < coupon.minPurchaseAmount) {
        return res.status(400).json({
          message: `Minimum order amount of ₹${coupon.minPurchaseAmount.toLocaleString(
            "en-IN"
          )} is required for this coupon`,
        });
      }

      // Check applicable products if restricted
      let eligibleAmount = orderSubtotal;
      if (coupon.applicableType === "product" && coupon.applicableProducts.length > 0) {
        const applicableProductIds = coupon.applicableProducts.map((p) => p.toString());
        const matchingCartItems = cartItems.filter((item) => {
          const itemId = (item.product || item._id || item.id || "").toString();
          return applicableProductIds.includes(itemId);
        });

        if (matchingCartItems.length === 0) {
          return res.status(400).json({
            message: "This coupon is only applicable to specific items which are not in your cart",
          });
        }

        // Calculate eligible subtotal from matching items only
        eligibleAmount = matchingCartItems.reduce((sum, item) => {
          const price = parseFloat(item.discountedPrice || item.price) || 0;
          const qty = Number(item.quantity) || 1;
          return sum + price * qty;
        }, 0);
      }

      // Calculate discount
      let discount = 0;
      if (coupon.discountType === "percentage") {
        discount = (eligibleAmount * coupon.discountAmount) / 100;
        if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
          discount = coupon.maxDiscountAmount;
        }
      } else if (coupon.discountType === "fixed") {
        discount = Math.min(coupon.discountAmount, eligibleAmount);
      }

      discount = Math.round(discount * 100) / 100;

      res.json({
        success: true,
        message: `Coupon '${coupon.code}' applied successfully!`,
        coupon: {
          _id: coupon._id,
          code: coupon.code,
          description: coupon.description,
          discountType: coupon.discountType,
          discountAmount: coupon.discountAmount,
          maxDiscountAmount: coupon.maxDiscountAmount,
          minPurchaseAmount: coupon.minPurchaseAmount,
        },
        discountPrice: discount,
        subtotalPrice: orderSubtotal,
        finalTotal: Math.max(0, orderSubtotal - discount),
      });
    } catch (error) {
      console.error("Validate coupon error:", error);
      res.status(500).json({ message: error.message || "Failed to validate coupon" });
    }
  };
}

module.exports = CouponController;
