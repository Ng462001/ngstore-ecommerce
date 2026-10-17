import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearCart } from "../Redux/action/action";
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Alert,
  CircularProgress,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Chip,
} from "@mui/material";
import {
  CreditCardOutlined as CreditCardOutlinedIcon,
  PaymentsOutlined as PaymentsOutlinedIcon,
  Lock,
  Payment as PaymentIcon,
  LocalOffer as CouponIcon,
  Close as CloseIcon,
  CheckCircleOutline as CheckCircleIcon,
} from "@mui/icons-material";
import { toast } from "react-hot-toast";

export default function Payment({ onBack, selectedAddress }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");

  // Coupon States
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);

  const cartItems = useSelector(
    (state) => state.productReducer?.cartItems || [],
  );
  const userInfo = useSelector((state) => state.productReducer?.userInfo);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Safe price parser — avoids discountedPrice=0 corrupting totals
  const getItemPrice = (item) => {
    const p = parseFloat(item.price) || 0;
    const dp = parseFloat(item.discountedPrice) || 0;
    if (dp > 0 && dp < p) return dp;
    return p || dp;
  };

  // Format price using Indian locale
  const fmt = (val) =>
    val.toLocaleString("en-IN", { maximumFractionDigits: 2 });

  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + getItemPrice(item) * item.quantity,
    0,
  );
  const discount = appliedCoupon ? appliedCoupon.discountPrice || 0 : 0;
  const shipping = subtotal > 500 ? 0 : 50; // Free shipping over ₹500
  const total = Number(Math.max(0, subtotal - discount + shipping).toFixed(2));

  // Fetch available coupons
  useEffect(() => {
    if (userInfo?.token) {
      fetchAvailableCoupons();
    }
  }, [userInfo]);

  const fetchAvailableCoupons = async () => {
    try {
      setLoadingCoupons(true);
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/coupons/available`,
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        setAvailableCoupons(data.coupons || []);
      }
    } catch (err) {
      console.error("Failed to load available coupons:", err);
    } finally {
      setLoadingCoupons(false);
    }
  };

  const handleApplyCoupon = async (codeToApply) => {
    const code = (codeToApply || couponInput || "").trim();
    if (!code) {
      toast.error("Please enter a coupon code");
      return;
    }

    try {
      setIsApplyingCoupon(true);
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/coupons/validate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userInfo.token}`,
          },
          body: JSON.stringify({
            code,
            cartItems,
            subtotal,
          }),
        }
      );

      const data = await res.json();
      if (res.ok && data.success) {
        setAppliedCoupon({
          ...data.coupon,
          discountPrice: data.discountPrice,
        });
        setCouponInput("");
        setShowCouponModal(false);
        toast.success(
          `Coupon '${code.toUpperCase()}' applied! You saved ₹${data.discountPrice}`
        );
      } else {
        toast.error(data.message || "Invalid coupon code");
      }
    } catch (err) {
      toast.error("Failed to validate coupon");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast.success("Coupon removed");
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    if (!userInfo) {
      toast.error("Please log in to complete your purchase.");
      navigate("/login");
      return;
    }

    if (!selectedAddress) {
      toast.error("Please select a shipping address.");
      return;
    }

    setIsProcessing(true);

    try {
      const orderData = {
        orderItems: cartItems.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          image: item.image || item.images?.[0]?.src,
          price: parseFloat(item.discountedPrice || item.price),
          product: item._id || item.id,
          selectedColor: item.selectedColor,
          selectedSize: item.selectedSize,
        })),
        shippingAddress: selectedAddress,
        paymentMethod: paymentMethod === "card" ? "Card" : "CashOnDelivery",
        itemsPrice: subtotal,
        subtotalPrice: subtotal,
        discountPrice: discount,
        couponCode: appliedCoupon?.code,
        taxPrice: 0,
        shippingPrice: shipping,
        totalPrice: total,
        isPaid: paymentMethod === "card",
        paidAt: paymentMethod === "card" ? new Date() : undefined,
        paymentStatus: paymentMethod === "card" ? "Paid" : "Pending",
      };

      if (paymentMethod === "card") {
        // Save pending order to be processed after Stripe redirects back
        localStorage.setItem("pendingOrder", JSON.stringify(orderData));

        const piResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/payment/create-checkout-session`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userInfo.token}`,
            },
            body: JSON.stringify({
              items: cartItems.map((item) => ({
                name: item.name,
                image: item.image || item.images?.[0]?.src,
                price: parseFloat(item.discountedPrice || item.price),
                quantity: item.quantity,
              })),
              email: userInfo.email,
              couponCode: appliedCoupon?.code,
              discountPrice: discount,
            }),
          },
        );

        const piData = await piResponse.json();
        if (!piResponse.ok)
          throw new Error(piData.message || "Payment initiation failed");

        // Redirect to Stripe Checkout page
        window.location.href = piData.url;
        return;
      }

      // Cash on Delivery
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userInfo.token}`,
          },
          body: JSON.stringify(orderData),
        },
      );

      if (response.ok) {
        dispatch(clearCart());
        toast.success(`Order has been placed`);
        navigate("/my-orders");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Order creation failed");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(
        error.message || "An error occurred during payment processing.",
      );
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <Paper elevation={1} sx={{ p: 4, textAlign: "center" }}>
        <PaymentIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Your cart is empty
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Add some items to your cart to proceed with payment
        </Typography>
        <Button variant="contained" onClick={() => navigate("/")}>
          Continue Shopping
        </Button>
      </Paper>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{
          fontFamily: '"Playfair Display", Georgia, serif',
          fontWeight: 600,
          color: "#1C1B19",
        }}
      >
        Payment Details
      </Typography>
      <Typography variant="subtitle1" sx={{ mb: 4, color: "#6B6862" }}>
        Complete your purchase with secure payment
      </Typography>

      <Grid container spacing={4}>
        {/* Left Column - Payment Form */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={0}
            sx={{
              p: 3.5,
              borderRadius: "20px",
              bgcolor: "#FFFFFF",
              border: "1px solid #E7E4DD",
              boxShadow: "0 4px 20px -2px rgba(28, 27, 25, 0.05)",
            }}
          >
            <FormControl component="fieldset" sx={{ width: "100%" }}>
              <FormLabel
                component="legend"
                sx={{ mb: 2, fontWeight: 600, color: "#1C1B19" }}
              >
                Select Payment Method
              </FormLabel>
              <RadioGroup
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                sx={{ mb: 3 }}
              >
                <FormControlLabel
                  value="card"
                  control={
                    <Radio
                      sx={{
                        color: "#B8925A",
                        "&.Mui-checked": { color: "#B8925A" },
                      }}
                    />
                  }
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CreditCardOutlinedIcon sx={{ color: "#B8925A" }} />
                      <Typography sx={{ fontWeight: 500, color: "#1C1B19" }}>
                        Credit/Debit Card (Stripe Checkout)
                      </Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="cod"
                  control={
                    <Radio
                      sx={{
                        color: "#B8925A",
                        "&.Mui-checked": { color: "#B8925A" },
                      }}
                    />
                  }
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <PaymentsOutlinedIcon sx={{ color: "#B8925A" }} />
                      <Typography sx={{ fontWeight: 500, color: "#1C1B19" }}>
                        Cash on Delivery
                      </Typography>
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>

            {paymentMethod === "card" && (
              <Alert severity="info" sx={{ mt: 2, borderRadius: "12px" }}>
                You will be redirected to Stripe's secure checkout page to
                complete your payment.
              </Alert>
            )}

            {paymentMethod === "cod" && (
              <Alert severity="info" sx={{ mt: 2, borderRadius: "12px" }}>
                You will pay cash when your order is delivered.
              </Alert>
            )}

            {/* Security Notice */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mt: 3,
                p: 2,
                bgcolor: "#FAF9F6",
                borderRadius: "12px",
                border: "1px solid #E7E4DD",
              }}
            >
              <Lock sx={{ color: "#3E7A55" }} />
              <Typography variant="caption" color="text.secondary">
                Your payment information is secure and encrypted by Stripe
              </Typography>
            </Box>
          </Paper>

          {/* Order Summary */}
          <Paper
            elevation={0}
            sx={{
              p: 3.5,
              mt: 3,
              borderRadius: "20px",
              bgcolor: "#FFFFFF",
              border: "1px solid #E7E4DD",
              boxShadow: "0 4px 20px -2px rgba(28, 27, 25, 0.05)",
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontWeight: 600,
                color: "#1C1B19",
              }}
            >
              Order Items
            </Typography>
            {cartItems.map((item) => (
              <Box
                key={item.cartId || item.id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  py: 1.5,
                  borderBottom: "1px border #FAF9F6",
                }}
              >
                <Typography variant="body2" sx={{ color: "#1C1B19" }}>
                  {item.name} × {item.quantity}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: "#B8925A" }}
                >
                  ₹{fmt(getItemPrice(item) * item.quantity)}
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Right Column - Order Summary */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3.5,
              position: "sticky",
              top: 20,
              borderRadius: "20px",
              bgcolor: "#FFFFFF",
              border: "1px solid #E7E4DD",
              boxShadow: "0 4px 20px -2px rgba(28, 27, 25, 0.05)",
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontWeight: 600,
                color: "#1C1B19",
              }}
            >
              Summary
            </Typography>

            {/* Coupon Code Section */}
            <Box
              sx={{
                p: 2,
                mb: 3,
                borderRadius: "14px",
                bgcolor: appliedCoupon ? "rgba(62, 122, 85, 0.08)" : "#FAF9F6",
                border: "1px dashed",
                borderColor: appliedCoupon ? "#3E7A55" : "#E7E4DD",
              }}
            >
              {appliedCoupon ? (
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CouponIcon sx={{ color: "#3E7A55", fontSize: 18 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#3E7A55" }}>
                        {appliedCoupon.code}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      onClick={handleRemoveCoupon}
                      sx={{
                        textTransform: "none",
                        color: "#B3413B",
                        fontSize: "0.75rem",
                        p: 0,
                        minWidth: "auto",
                        fontWeight: 600,
                        "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
                      }}
                    >
                      Remove
                    </Button>
                  </Box>
                  <Typography variant="caption" sx={{ color: "#3E7A55", display: "block", mt: 0.5 }}>
                    Coupon applied! You saved ₹{fmt(discount)}
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <input
                      type="text"
                      placeholder="ENTER COUPON CODE"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleApplyCoupon();
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        fontSize: "0.8rem",
                        fontFamily: "monospace",
                        fontWeight: "bold",
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E7E4DD",
                        borderRadius: "10px",
                        outline: "none",
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={() => handleApplyCoupon()}
                      disabled={isApplyingCoupon || !couponInput.trim()}
                      sx={{
                        bgcolor: "#B8925A",
                        "&:hover": { bgcolor: "#9E7B47" },
                        textTransform: "none",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        borderRadius: "10px",
                        px: 2,
                        boxShadow: "none",
                      }}
                    >
                      {isApplyingCoupon ? "..." : "Apply"}
                    </Button>
                  </Box>

                  {availableCoupons.length > 0 && (
                    <Button
                      onClick={() => setShowCouponModal(true)}
                      startIcon={<CouponIcon sx={{ fontSize: 14 }} />}
                      sx={{
                        mt: 1.5,
                        p: 0,
                        textTransform: "none",
                        color: "#B8925A",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
                      }}
                    >
                      View Available Offers ({availableCoupons.length})
                    </Button>
                  )}
                </Box>
              )}
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 1.5,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Subtotal
                </Typography>
                <Typography variant="body2" fontWeight="500">
                  ₹{fmt(subtotal)}
                </Typography>
              </Box>

              {appliedCoupon && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1.5,
                  }}
                >
                  <Typography variant="body2" sx={{ color: "#3E7A55", fontWeight: 500 }}>
                    Coupon Discount ({appliedCoupon.code})
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#3E7A55", fontWeight: 700 }}>
                    -₹{fmt(discount)}
                  </Typography>
                </Box>
              )}

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 1.5,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Shipping
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight="500"
                  sx={{ color: shipping === 0 ? "#3E7A55" : "inherit" }}
                >
                  {shipping === 0 ? "FREE" : `₹${fmt(shipping)}`}
                </Typography>
              </Box>

              <Divider sx={{ my: 2, borderColor: "#E7E4DD" }} />

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography
                  variant="h6"
                  fontWeight="600"
                  sx={{ color: "#1C1B19" }}
                >
                  Total
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight="700"
                  sx={{ color: "#B8925A" }}
                >
                  ₹{fmt(total)}
                </Typography>
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handlePaymentSubmit}
                disabled={isProcessing}
                startIcon={
                  isProcessing ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <PaymentIcon />
                  )
                }
                sx={{
                  py: 1.5,
                  borderRadius: "12px",
                  bgcolor: "#B8925A",
                  "&:hover": { bgcolor: "#9E7B47" },
                  fontWeight: 600,
                }}
              >
                {isProcessing ? "Processing..." : `Pay ₹${fmt(total)}`}
              </Button>

              <Button
                variant="outlined"
                size="large"
                fullWidth
                onClick={onBack}
                disabled={isProcessing}
                sx={{
                  py: 1.5,
                  borderRadius: "12px",
                  borderColor: "#E7E4DD",
                  color: "#6B6862",
                  "&:hover": { borderColor: "#B8925A", color: "#B8925A" },
                }}
              >
                Back to Summary
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Available Coupons Modal */}
      <Dialog
        open={showCouponModal}
        onClose={() => setShowCouponModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "20px",
            p: 1,
            bgcolor: "#FFFFFF",
            border: "1px solid #E7E4DD",
            boxShadow: "0 12px 32px -4px rgba(28, 27, 25, 0.12)",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 1,
            borderBottom: "1px solid #E7E4DD",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "10px",
                bgcolor: "#F7F3EC",
                color: "#B8925A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CouponIcon fontSize="small" />
            </Box>
            <Box>
              <Typography
                variant="subtitle1"
                sx={{
                  fontFamily: '"Playfair Display", Georgia, serif',
                  fontWeight: 700,
                  color: "#1C1B19",
                }}
              >
                Available Offers & Discounts
              </Typography>
              <Typography variant="caption" sx={{ color: "#6B6862" }}>
                Select an offer to apply instant savings
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={() => setShowCouponModal(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          {availableCoupons.length === 0 ? (
            <Typography variant="body2" sx={{ textAlign: "center", py: 4, color: "#6B6862" }}>
              No active public coupons found at the moment.
            </Typography>
          ) : (
            availableCoupons.map((coupon) => {
              const isEligible = subtotal >= (coupon.minPurchaseAmount || 0);

              return (
                <Box
                  key={coupon._id}
                  sx={{
                    p: 2,
                    borderRadius: "14px",
                    border: "1px solid #E7E4DD",
                    bgcolor: isEligible ? "#FAF9F6" : "#F3F1EC",
                    opacity: isEligible ? 1 : 0.7,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    transition: "all 0.2s ease",
                    "&:hover": isEligible ? { borderColor: "#B8925A", bgcolor: "#FFFFFF" } : {},
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            fontFamily: "monospace",
                            fontWeight: 700,
                            letterSpacing: "0.05em",
                            px: 1.5,
                            py: 0.5,
                            borderRadius: "6px",
                            bgcolor: "#F7F3EC",
                            color: "#B8925A",
                            border: "1px solid rgba(184, 146, 90, 0.3)",
                          }}
                        >
                          {coupon.code}
                        </Typography>
                        <Chip
                          label={
                            coupon.discountType === "percentage"
                              ? `${coupon.discountAmount}% OFF`
                              : `₹${coupon.discountAmount} FLAT`
                          }
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            bgcolor: "rgba(62, 122, 85, 0.1)",
                            color: "#3E7A55",
                          }}
                        />
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#1C1B19", mt: 1 }}>
                        {coupon.description}
                      </Typography>
                    </Box>

                    <Button
                      variant="contained"
                      size="small"
                      disabled={!isEligible || isApplyingCoupon}
                      onClick={() => handleApplyCoupon(coupon.code)}
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        borderRadius: "8px",
                        bgcolor: "#B8925A",
                        "&:hover": { bgcolor: "#9E7B47" },
                        boxShadow: "none",
                        shrink: 0,
                      }}
                    >
                      {appliedCoupon?.code === coupon.code ? "Applied" : "Apply"}
                    </Button>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 0.5 }}>
                    <Typography variant="caption" sx={{ color: "#6B6862" }}>
                      Min spend: ₹{coupon.minPurchaseAmount || 0}
                    </Typography>
                    {coupon.discountType === "percentage" && coupon.maxDiscountAmount && (
                      <Typography variant="caption" sx={{ color: "#6B6862" }}>
                        Max discount: ₹{coupon.maxDiscountAmount}
                      </Typography>
                    )}
                    <Typography
                      variant="caption"
                      sx={{
                        color: isEligible ? "#3E7A55" : "#B3413B",
                        fontWeight: 500,
                        ml: "auto",
                      }}
                    >
                      {isEligible
                        ? "Eligible for this order"
                        : `Add ₹${fmt(coupon.minPurchaseAmount - subtotal)} more`}
                    </Typography>
                  </Box>
                </Box>
              );
            })
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

