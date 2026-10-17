import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Paper,
  Fade,
} from "@mui/material";
import {
  Close,
  Autorenew,
  Stars,
  Celebration,
  Bolt,
  CardGiftcard,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { toast } from "react-hot-toast";

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

const PresetCard = styled(Paper)(({ theme, selected }) => ({
  padding: theme.spacing(2),
  borderRadius: 14,
  border: selected ? "2px solid #B8925A" : "1px solid #E7E4DD",
  backgroundColor: selected ? "#F7F3EC" : "#FFFFFF",
  cursor: "pointer",
  transition: "all 0.2s ease",
  "&:hover": {
    borderColor: "#B8925A",
    backgroundColor: "#F7F3EC",
  },
}));

const presets = [
  {
    id: "welcome10",
    title: "Welcome 10%",
    desc: "10% off for first-time orders (Max ₹300)",
    icon: CardGiftcard,
    prefix: "WELCOME",
    description: "Welcome offer: 10% off on your purchase",
    discountType: "percentage",
    discountAmount: 10,
    maxDiscountAmount: 300,
    minPurchaseAmount: 499,
    validDays: 60,
    usageLimit: 200,
  },
  {
    id: "festive20",
    title: "Festive 20%",
    desc: "20% off on festive collections (Min ₹999)",
    icon: Celebration,
    prefix: "FESTIVE",
    description: "Festive celebration: 20% off on all orders",
    discountType: "percentage",
    discountAmount: 20,
    maxDiscountAmount: 1000,
    minPurchaseAmount: 999,
    validDays: 15,
    usageLimit: 100,
  },
  {
    id: "flat200",
    title: "Flash ₹200",
    desc: "Flat ₹200 off on cart above ₹1,299",
    icon: Bolt,
    prefix: "FLASH",
    description: "Flash Deal: Flat ₹200 discount",
    discountType: "fixed",
    discountAmount: 200,
    maxDiscountAmount: null,
    minPurchaseAmount: 1299,
    validDays: 7,
    usageLimit: 150,
  },
  {
    id: "vip500",
    title: "VIP ₹500",
    desc: "Flat ₹500 off for orders above ₹2,499",
    icon: Stars,
    prefix: "VIP",
    description: "VIP Club Exclusive: Flat ₹500 savings",
    discountType: "fixed",
    discountAmount: 500,
    maxDiscountAmount: null,
    minPurchaseAmount: 2499,
    validDays: 45,
    usageLimit: 50,
  },
];

const CouponGeneratorModal = ({ open, onClose, onSuccess }) => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const [selectedPreset, setSelectedPreset] = useState("welcome10");
  const [generating, setGenerating] = useState(false);

  const [generateData, setGenerateData] = useState({
    prefix: "WELCOME",
    description: "Welcome offer: 10% off on your purchase",
    discountType: "percentage",
    discountAmount: 10,
    maxDiscountAmount: 300,
    minPurchaseAmount: 499,
    validDays: 60,
    usageLimit: 200,
  });

  const handleSelectPreset = (p) => {
    setSelectedPreset(p.id);
    setGenerateData({
      prefix: p.prefix,
      description: p.description,
      discountType: p.discountType,
      discountAmount: p.discountAmount,
      maxDiscountAmount: p.maxDiscountAmount,
      minPurchaseAmount: p.minPurchaseAmount,
      validDays: p.validDays,
      usageLimit: p.usageLimit,
    });
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/coupons/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userInfo.token}`,
          },
          body: JSON.stringify(generateData),
        }
      );

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Promotional coupon generated successfully!");
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(data.message || "Failed to generate coupon");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error generating coupon");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <StyledDialog
      open={open}
      onClose={generating ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      TransitionComponent={Fade}
    >
      <form onSubmit={handleGenerate}>
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
                <Autorenew />
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
                  Quick Coupon Generator
                </Typography>
                <Typography variant="caption" sx={{ color: "#6B6862" }}>
                  Instantly launch promotional campaigns using curated templates
                </Typography>
              </Box>
            </Box>

            <IconButton onClick={onClose} disabled={generating} size="small">
              <Close fontSize="small" />
            </IconButton>
          </Box>
        </StyledDialogTitle>

        <StyledDialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          {/* Preset templates */}
          <Box>
            <Typography variant="caption" fontWeight={600} color="#1C1B19" sx={{ display: "block", mb: 1.5 }}>
              Select Promotion Template
            </Typography>
            <Grid container spacing={1.5}>
              {presets.map((p) => {
                const Icon = p.icon;
                const isSelected = selectedPreset === p.id;
                return (
                  <Grid item xs={12} sm={6} key={p.id}>
                    <PresetCard selected={isSelected} onClick={() => handleSelectPreset(p)}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <Icon sx={{ color: isSelected ? "#B8925A" : "#6B6862", fontSize: 18 }} />
                        <Typography variant="subtitle2" fontWeight={700} color="#1C1B19">
                          {p.title}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="#6B6862" sx={{ display: "block", fontSize: "0.725rem" }}>
                        {p.desc}
                      </Typography>
                    </PresetCard>
                  </Grid>
                );
              })}
            </Grid>
          </Box>

          {/* Parameters */}
          <Paper sx={{ p: 2.5, borderRadius: "16px", border: "1px solid #E7E4DD", bgcolor: "#FFFFFF" }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" fontWeight={600} color="#1C1B19" sx={{ display: "block", mb: 0.5 }}>
                  Code Prefix
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  required
                  value={generateData.prefix}
                  onChange={(e) =>
                    setGenerateData({ ...generateData, prefix: e.target.value.toUpperCase() })
                  }
                  inputProps={{
                    style: {
                      fontFamily: "monospace",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                    },
                  }}
                />
                <Typography variant="caption" sx={{ color: "#6B6862", fontSize: "0.7rem", mt: 0.5, display: "block" }}>
                  Result preview: {generateData.prefix || "CODE"}9F2A
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" fontWeight={600} color="#1C1B19" sx={{ display: "block", mb: 0.5 }}>
                  Valid Duration (Days)
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  required
                  inputProps={{ min: 1 }}
                  value={generateData.validDays}
                  onChange={(e) =>
                    setGenerateData({ ...generateData, validDays: e.target.value })
                  }
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" fontWeight={600} color="#1C1B19" sx={{ display: "block", mb: 0.5 }}>
                  Discount Amount ({generateData.discountType === "percentage" ? "%" : "₹"})
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  required
                  inputProps={{ min: 1 }}
                  value={generateData.discountAmount}
                  onChange={(e) =>
                    setGenerateData({ ...generateData, discountAmount: e.target.value })
                  }
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" fontWeight={600} color="#1C1B19" sx={{ display: "block", mb: 0.5 }}>
                  Min. Purchase Requirement (₹)
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  inputProps={{ min: 0 }}
                  value={generateData.minPurchaseAmount}
                  onChange={(e) =>
                    setGenerateData({ ...generateData, minPurchaseAmount: e.target.value })
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="caption" fontWeight={600} color="#1C1B19" sx={{ display: "block", mb: 0.5 }}>
                  Campaign Description
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  required
                  value={generateData.description}
                  onChange={(e) =>
                    setGenerateData({ ...generateData, description: e.target.value })
                  }
                />
              </Grid>
            </Grid>
          </Paper>
        </StyledDialogContent>

        <StyledDialogActions>
          <Button onClick={onClose} disabled={generating} sx={{ color: "#6B6862", textTransform: "none" }}>
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={generating}
            startIcon={generating ? <CircularProgress size={16} color="inherit" /> : <Autorenew />}
            sx={{
              borderRadius: "10px",
              bgcolor: "#B8925A",
              "&:hover": { bgcolor: "#9E7B47" },
              textTransform: "none",
              fontWeight: 600,
              px: 3,
            }}
          >
            {generating ? "Generating..." : "Generate Code"}
          </Button>
        </StyledDialogActions>
      </form>
    </StyledDialog>
  );
};

export default CouponGeneratorModal;
