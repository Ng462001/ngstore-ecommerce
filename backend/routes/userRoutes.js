const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", UserController.registerUser);
router.post("/login", UserController.loginUser);
router.get("/me", protect, UserController.getMe);
router.put("/profile", protect, UserController.updateUserProfile);
router.put("/change-password", protect, UserController.changePassword);
router.post("/address", protect, UserController.addAddress);
router.put("/address/:id", protect, UserController.updateAddress);
router.delete("/address/:id", protect, UserController.deleteAddress);
router.post("/forgot-password", UserController.forgotPassword);
router.put("/reset-password/:token", UserController.resetPassword);
router.put("/verifyemail/:token", UserController.verifyEmail);
router.get("/verifyemail/:token", UserController.verifyEmail);
router.put("/verify-email/:token", UserController.verifyEmail);
router.get("/verify-email/:token", UserController.verifyEmail);
router.get("/wishlist", protect, UserController.getWishlist);
router.post("/wishlist/:productId", protect, UserController.addToWishlist);
router.delete(
  "/wishlist/:productId",
  protect,
  UserController.removeFromWishlist,
);
router.get("/reviews", protect, UserController.getUserReviews);
router.delete(
  "/reviews/:productId/:reviewId",
  protect,
  UserController.deleteUserReview,
);

// Recent Searches
router.get("/recent-searches", protect, UserController.getRecentSearches);
router.post("/recent-searches", protect, UserController.addRecentSearch);
router.delete(
  "/recent-searches/clear",
  protect,
  UserController.clearAllRecentSearches,
);
router.delete("/recent-searches", protect, UserController.deleteRecentSearch);

module.exports = router;
