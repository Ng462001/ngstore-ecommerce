import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  InputAdornment,
  Chip,
  Paper,
  Switch,
  FormControlLabel,
  CircularProgress,
  RadioGroup,
  Radio,
  FormLabel,
  Checkbox,
  Divider,
  Fade,
} from "@mui/material";
import {
  Close,
  LocalOffer,
  Discount,
  CalendarToday,
  ShoppingCart,
  CheckCircle,
  Autorenew,
  ShoppingBag,
  InfoOutlined,
  Save,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { toast } from "react-hot-toast";

// Styled Components (Matching NGStore Admin Quiet Luxury Aesthetic)
const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    borderRadius: 24,
    background: "#FFFFFF",
    border: "1px solid #E7E4DD",
    boxShadow: "0 20px 40px -10px rgba(28, 27, 25, 0.15)",
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  background: "#FAF9F6",
  borderBottom: "1px solid #E7E4DD",
  padding: theme.spacing(2.5, 3),
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  background: "#FAF9F6",
  padding: theme.spacing(3),
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  background: "#FAF9F6",
  borderTop: "1px solid #E7E4DD",
  padding: theme.spacing(2, 3),
}));

const SectionCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 16,
  border: "1px solid #E7E4DD",
  boxShadow: "0 4px 20px -2px rgba(28, 27, 25, 0.05)",
  backgroundColor: "#FFFFFF",
  transition: "box-shadow 0.2s ease",
  "&:hover": {
    boxShadow: "0 6px 24px -2px rgba(28, 27, 25, 0.08)",
  },
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  marginBottom: theme.spacing(2.5),
  "& .MuiSvgIcon-root": {
    color: "#B8925A",
    fontSize: 22,
  },
}));

const CouponFormModal = ({
  open,
  onClose,
  coupon = null,
  onSuccess,
  productsList = [],
  loadingProducts = false,
}) => {
  const isEditing = Boolean(coupon);
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "percentage",
    discountAmount: "",
    maxDiscountAmount: "",
    minPurchaseAmount: "",
    startDate: new Date().toISOString().split("T")[0],
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    usageLimit: "",
    userUsageLimit: "1",
    applicableType: "all",
    applicableProducts: [],
    isActive: true,
  });

  const [saving, setSaving] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code || "",
        description: coupon.description || "",
        discountType: coupon.discountType || "percentage",
        discountAmount: coupon.discountAmount !== undefined ? coupon.discountAmount : "",
        maxDiscountAmount: coupon.maxDiscountAmount || "",
        minPurchaseAmount: coupon.minPurchaseAmount || "",
        startDate: coupon.startDate
          ? new Date(coupon.startDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        expiryDate: coupon.expiryDate
          ? new Date(coupon.expiryDate).toISOString().split("T")[0]
          : "",
        usageLimit: coupon.usageLimit || "",
        userUsageLimit: coupon.userUsageLimit || "1",
        applicableType: coupon.applicableType || "all",
        applicableProducts:
          coupon.applicableProducts?.map((p) => (p._id ? p._id : p)) || [],
        isActive: coupon.isActive !== undefined ? coupon.isActive : true,
      });
    } else {
      setFormData({
        code: "",
        description: "",
        discountType: "percentage",
        discountAmount: "",
        maxDiscountAmount: "",
        minPurchaseAmount: "",
        startDate: new Date().toISOString().split("T")[0],
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        usageLimit: "",
        userUsageLimit: "1",
        applicableType: "all",
        applicableProducts: [],
        isActive: true,
      });
    }
  }, [coupon, open]);

  const generateRandomCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let res = "NG";
    for (let i = 0; i < 6; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, code: res }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.code.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Please enter a description for this coupon");
      return;
    }
    if (!formData.discountAmount || Number(formData.discountAmount) <= 0) {
      toast.error("Please specify a valid discount amount");
      return;
    }
    if (
      formData.discountType === "percentage" &&
      Number(formData.discountAmount) > 100
    ) {
      toast.error("Percentage discount cannot exceed 100%");
      return;
    }
    if (!formData.expiryDate) {
      toast.error("Please specify an expiry date");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        code: formData.code.trim().toUpperCase(),
        discountAmount: Number(formData.discountAmount),
        maxDiscountAmount:
          formData.discountType === "percentage" && formData.maxDiscountAmount
            ? Number(formData.maxDiscountAmount)
            : null,
        minPurchaseAmount: formData.minPurchaseAmount
          ? Number(formData.minPurchaseAmount)
          : 0,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
        userUsageLimit: formData.userUsageLimit
          ? Number(formData.userUsageLimit)
          : 1,
      };

      const url = isEditing
        ? `${import.meta.env.VITE_API_URL}/api/coupons/admin/${coupon._id}`
        : `${import.meta.env.VITE_API_URL}/api/coupons`;
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || (isEditing ? "Coupon updated!" : "Coupon created!"));
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(data.message || "Failed to save coupon");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error while saving coupon");
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = Array.isArray(productsList)
    ? productsList.filter((p) =>
        (p.name || "").toLowerCase().includes(productSearch.toLowerCase())
      )
    : [];

  return (
    <StyledDialog
      open={open}
      onClose={saving ? undefined : onClose}
      maxWidth="md"
      fullWidth
      TransitionComponent={Fade}
    >
      <form onSubmit={handleSubmit}>
        {/* Title */}
        <StyledDialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: "12px",
                  bgcolor: "#F7F3EC",
                  color: "#B8925A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <LocalOffer />
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: '"Playfair Display", Georgia, serif',
                    fontWeight: 700,
                    color: "#1C1B19",
                  }}
                >
                  {isEditing
                    ? `Edit Coupon: ${coupon?.code}`
                    : "Create Promotional Coupon"}
                </Typography>
                <Typography variant="caption" sx={{ color: "#6B6862" }}>
                  Configure discount value, usage limits, and product targeting
                </Typography>
              </Box>
            </Box>

            <IconButton
              onClick={onClose}
              disabled={saving}
              sx={{
                color: "#6B6862",
                "&:hover": { color: "#1C1B19", bgcolor: "#E7E4DD" },
              }}
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>
        </StyledDialogTitle>

        {/* Content */}
        <StyledDialogContent sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Section 1: Discount Core Info */}
          <SectionCard>
            <SectionHeader>
              <Discount />
              <Typography variant="subtitle1" fontWeight={600} color="#1C1B19">
                Coupon Identification & Discount Value
              </Typography>
            </SectionHeader>

            <Grid container spacing={2.5}>
              {/* Code */}
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography variant="caption" fontWeight={600} color="#1C1B19">
                    Coupon Code *
                  </Typography>
                  {!isEditing && (
                    <Typography
                      variant="caption"
                      onClick={generateRandomCode}
                      sx={{
                        color: "#B8925A",
                        cursor: "pointer",
                        fontWeight: 600,
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      Generate Random
                    </Typography>
                  )}
                </Box>
                <TextField
                  fullWidth
                  size="small"
                  required
                  placeholder="e.g. FESTIVE25"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  inputProps={{
                    style: {
                      fontFamily: "monospace",
                      fontWeight: "bold",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    },
                  }}
                />
              </Grid>

              {/* Discount Type */}
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" fontWeight={600} color="#1C1B19" sx={{ display: "block", mb: 0.5 }}>
                  Discount Type *
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={formData.discountType}
                    onChange={(e) =>
                      setFormData({ ...formData, discountType: e.target.value })
                    }
                  >
                    <MenuItem value="percentage">Percentage Discount (%)</MenuItem>
                    <MenuItem value="fixed">Flat Amount Discount (₹)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <Typography variant="caption" fontWeight={600} color="#1C1B19" sx={{ display: "block", mb: 0.5 }}>
                  Offer Title / Description *
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  required
                  placeholder="e.g. Get 25% off on our latest summer collection"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </Grid>

              {/* Discount Amount */}
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" fontWeight={600} color="#1C1B19" sx={{ display: "block", mb: 0.5 }}>
                  {formData.discountType === "percentage"
                    ? "Discount Percentage (%) *"
                    : "Discount Flat Amount (₹) *"}
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  required
                  inputProps={{
                    min: 1,
                    max: formData.discountType === "percentage" ? 100 : undefined,
                  }}
                  placeholder={formData.discountType === "percentage" ? "20" : "300"}
                  value={formData.discountAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, discountAmount: e.target.value })
                  }
                />
              </Grid>

              {/* Max Discount (Cap) */}
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" fontWeight={600} color="#1C1B19" sx={{ display: "block", mb: 0.5 }}>
                  Maximum Discount Cap (₹) {formData.discountType === "fixed" && "(N/A)"}
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  disabled={formData.discountType === "fixed"}
                  placeholder="e.g. 500 (Leave empty for no limit)"
                  value={formData.maxDiscountAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, maxDiscountAmount: e.target.value })
                  }
                />
              </Grid>
            </Grid>
          </SectionCard>

          {/* Section 2: Restrictions & Validity */}
          <SectionCard>
            <SectionHeader>
              <CalendarToday />
              <Typography variant="subtitle1" fontWeight={600} color="#1C1B19">
                Redemption Rules & Validity
              </Typography>
            </SectionHeader>

            <Grid container spacing={2.5}>
              {/* Min Purchase */}
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" fontWeight={600} color="#1C1B19" sx={{ display: "block", mb: 0.5 }}>
                  Minimum Order Subtotal (₹)
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  inputProps={{ min: 0 }}
                  placeholder="0 for no minimum"
                  value={formData.minPurchaseAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, minPurchaseAmount: e.target.value })
                  }
                />
              </Grid>

              {/* Expiry Date */}
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" fontWeight={600} color="#1C1B19" sx={{ display: "block", mb: 0.5 }}>
                  Expiry Date *
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  required
                  value={formData.expiryDate}
                  onChange={(e) =>
                    setFormData({ ...formData, expiryDate: e.target.value })
                  }
                />
              </Grid>

              {/* Overall Usage Limit */}
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" fontWeight={600} color="#1C1B19" sx={{ display: "block", mb: 0.5 }}>
                  Total Usage Limit (All Customers)
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  inputProps={{ min: 1 }}
                  placeholder="Leave empty for unlimited"
                  value={formData.usageLimit}
                  onChange={(e) =>
                    setFormData({ ...formData, usageLimit: e.target.value })
                  }
                />
              </Grid>

              {/* Per-User Usage Limit */}
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" fontWeight={600} color="#1C1B19" sx={{ display: "block", mb: 0.5 }}>
                  Usage Limit Per Customer
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  required
                  inputProps={{ min: 1 }}
                  value={formData.userUsageLimit}
                  onChange={(e) =>
                    setFormData({ ...formData, userUsageLimit: e.target.value })
                  }
                />
              </Grid>
            </Grid>
          </SectionCard>

          {/* Section 3: Product Targeting */}
          <SectionCard>
            <SectionHeader>
              <ShoppingCart />
              <Typography variant="subtitle1" fontWeight={600} color="#1C1B19">
                Product Eligibility
              </Typography>
            </SectionHeader>

            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <RadioGroup
                row
                value={formData.applicableType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    applicableType: e.target.value,
                    applicableProducts: e.target.value === "all" ? [] : formData.applicableProducts,
                  })
                }
              >
                <FormControlLabel
                  value="all"
                  control={<Radio size="small" sx={{ color: "#B8925A", "&.Mui-checked": { color: "#B8925A" } }} />}
                  label={<Typography variant="body2">Applicable to All Store Products</Typography>}
                />
                <FormControlLabel
                  value="product"
                  control={<Radio size="small" sx={{ color: "#B8925A", "&.Mui-checked": { color: "#B8925A" } }} />}
                  label={<Typography variant="body2">Specific Selected Products Only</Typography>}
                />
              </RadioGroup>
            </FormControl>

            {formData.applicableType === "product" && (
              <Box
                sx={{
                  border: "1px solid #E7E4DD",
                  borderRadius: "12px",
                  p: 2,
                  bgcolor: "#FAF9F6",
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search products to select..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  sx={{ mb: 1.5, bgcolor: "#FFFFFF" }}
                />

                <Box sx={{ maxHeight: 180, overflowY: "auto", pr: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
                  {loadingProducts ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                      <CircularProgress size={20} sx={{ color: "#B8925A" }} />
                    </Box>
                  ) : filteredProducts.length === 0 ? (
                    <Typography variant="caption" sx={{ color: "#6B6862", textAlign: "center", py: 2 }}>
                      No matching products found
                    </Typography>
                  ) : (
                    filteredProducts.map((p) => {
                      const isSelected = formData.applicableProducts.includes(p._id);
                      return (
                        <Box
                          key={p._id}
                          onClick={() => {
                            if (isSelected) {
                              setFormData({
                                ...formData,
                                applicableProducts: formData.applicableProducts.filter((id) => id !== p._id),
                              });
                            } else {
                              setFormData({
                                ...formData,
                                applicableProducts: [...formData.applicableProducts, p._id],
                              });
                            }
                          }}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            p: 1,
                            borderRadius: "8px",
                            cursor: "pointer",
                            bgcolor: isSelected ? "#F7F3EC" : "#FFFFFF",
                            border: "1px solid",
                            borderColor: isSelected ? "#B8925A" : "#E7E4DD",
                            "&:hover": { bgcolor: "#F7F3EC" },
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Checkbox
                              size="small"
                              checked={isSelected}
                              sx={{
                                color: "#B8925A",
                                "&.Mui-checked": { color: "#B8925A" },
                                p: 0.5,
                              }}
                            />
                            <Typography variant="body2" fontWeight={500} color="#1C1B19">
                              {p.name}
                            </Typography>
                          </Box>
                          <Typography variant="caption" fontWeight={600} color="#B8925A">
                            ₹{p.price}
                          </Typography>
                        </Box>
                      );
                    })
                  )}
                </Box>
                <Typography variant="caption" sx={{ color: "#6B6862", display: "block", mt: 1 }}>
                  Selected: {formData.applicableProducts.length} product(s)
                </Typography>
              </Box>
            )}
          </SectionCard>

          {/* Section 4: Activation Status */}
          <SectionCard sx={{ p: 2.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="subtitle2" fontWeight={600} color="#1C1B19">
                  Coupon Status
                </Typography>
                <Typography variant="caption" color="#6B6862">
                  When active, users can validate and redeem this promo code at checkout
                </Typography>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: "#3E7A55",
                      },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                        backgroundColor: "#3E7A55",
                      },
                    }}
                  />
                }
                label={
                  <Typography variant="caption" fontWeight={600} color={formData.isActive ? "#3E7A55" : "#6B6862"}>
                    {formData.isActive ? "Active" : "Inactive"}
                  </Typography>
                }
              />
            </Box>
          </SectionCard>
        </StyledDialogContent>

        {/* Footer Actions */}
        <StyledDialogActions>
          <Button
            onClick={onClose}
            disabled={saving}
            sx={{
              borderRadius: "10px",
              color: "#6B6862",
              textTransform: "none",
              fontWeight: 500,
              px: 2.5,
              "&:hover": { bgcolor: "#E7E4DD" },
            }}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save />}
            sx={{
              borderRadius: "10px",
              bgcolor: "#B8925A",
              "&:hover": { bgcolor: "#9E7B47" },
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              boxShadow: "0 4px 12px rgba(184, 146, 90, 0.25)",
            }}
          >
            {saving ? "Saving..." : isEditing ? "Save Changes" : "Create Coupon"}
          </Button>
        </StyledDialogActions>
      </form>
    </StyledDialog>
  );
};

export default CouponFormModal;
