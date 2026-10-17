const express = require("express");
const router = express.Router();
const CouponController = require("../controllers/couponController");
const { protect, admin } = require("../middleware/authMiddleware");

// Admin routes
router.post("/", protect, admin, CouponController.createCoupon);
router.post("/generate", protect, admin, CouponController.generateCoupon);
router.get("/admin/all", protect, admin, CouponController.getAllCouponsAdmin);
router.get("/admin/:id", protect, admin, CouponController.getCouponById);
router.put("/admin/:id", protect, admin, CouponController.updateCoupon);
router.delete("/admin/:id", protect, admin, CouponController.deleteCoupon);
router.patch("/admin/:id/toggle-status", protect, admin, CouponController.toggleCouponStatus);

// User routes
router.get("/available", protect, CouponController.getAvailableCoupons);
router.get("/my-coupons", protect, CouponController.getUserCoupons);
router.post("/save/:id", protect, CouponController.saveCouponForUser);
router.delete("/save/:id", protect, CouponController.removeSavedCoupon);
router.post("/claim", protect, CouponController.claimCouponByCode);
router.post("/validate", protect, CouponController.validateCoupon);

module.exports = router;
