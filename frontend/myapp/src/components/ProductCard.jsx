import React from "react";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import StarIcon from "@mui/icons-material/Star";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleWishlist } from "../Redux/action/action";
import { toast } from "react-hot-toast";

const ProductCard = ({ item }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const wishlistItems = useSelector((state) => {
    if (!state) return [];
    if (state.productReducer) {
      return state.productReducer.wishlistItems || [];
    }
    return state.wishlistItems || [];
  });

  const isUserLoggedIn = useSelector((state) => {
    if (!state) return false;
    if (state.productReducer) {
      return state.productReducer.isUserLoggedIn || false;
    }
    return state.isUserLoggedIn || false;
  });

  const itemId = item._id || item.id;
  const isWishlisted = wishlistItems.some((w) => (w._id || w.id) === itemId);

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem("token");
    if (!isUserLoggedIn || !token) {
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }

    dispatch(toggleWishlist(item));

    try {
      if (isWishlisted) {
        await fetch(
          `${import.meta.env.VITE_API_URL}/api/users/wishlist/${itemId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          },
        );
      } else {
        await fetch(
          `${import.meta.env.VITE_API_URL}/api/users/wishlist/${itemId}`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          },
        );
      }
    } catch (err) {
      console.error("Error syncing wishlist:", err);
    }
  };

  // Parse numeric prices safely
  const numPrice = parseFloat(item.price) || 0;
  const numDiscountedPrice = parseFloat(item.discountedPrice) || 0;
  const numOriginalPrice = parseFloat(item.originalPrice) || 0;

  // Determine selling display price and MRP (original price)
  let displayPrice = numPrice;
  let originalPrice = null;

  if (numDiscountedPrice > 0 && numDiscountedPrice < numPrice) {
    displayPrice = numDiscountedPrice;
    originalPrice = numPrice;
  } else if (numOriginalPrice > 0 && numPrice < numOriginalPrice) {
    displayPrice = numPrice;
    originalPrice = numOriginalPrice;
  } else if (numDiscountedPrice > 0 && numOriginalPrice > numDiscountedPrice) {
    displayPrice = numDiscountedPrice;
    originalPrice = numOriginalPrice;
  } else {
    displayPrice = numDiscountedPrice || numPrice;
    if (numOriginalPrice > displayPrice) {
      originalPrice = numOriginalPrice;
    }
  }

  // Calculate discount percentage if not provided
  const calculateDiscount = () => {
    if (
      item.discount &&
      !isNaN(parseFloat(item.discount)) &&
      parseFloat(item.discount) > 0
    ) {
      return Math.round(parseFloat(item.discount));
    }
    if (originalPrice && displayPrice && originalPrice > displayPrice) {
      return Math.round(((originalPrice - displayPrice) / originalPrice) * 100);
    }
    return null;
  };

  const discountPercentage = calculateDiscount();

  // Extract rating average
  const ratingAverage =
    typeof item.rating === "number"
      ? item.rating
      : typeof item.rating?.average === "number"
        ? item.rating.average
        : typeof item.averageRating === "number"
          ? item.averageRating
          : 0;

  // Helper to format currency consistently
  const formatAmount = (val) => {
    if (val === null || val === undefined || isNaN(val)) return "0";
    const num = parseFloat(val);
    return num.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    });
  };

  return (
    <NavLink
      to={`/product/${item.id || item._id}`}
      style={{
        textDecoration: "none",
        position: "relative",
        display: "block",
        width: "100%",
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: { xs: "100%", sm: 280 },
          height: { xs: 380, sm: 410 },
          margin: "0 auto",
          backgroundColor: "#FFFFFF",
          border: "1px solid #E7E4DD",
          boxShadow: "0 4px 20px -2px rgba(28, 27, 25, 0.05)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          borderRadius: "16px",
          overflow: "hidden",
          "&:hover": {
            transform: "translateY(-6px)",
            boxShadow: "0 12px 32px -4px rgba(28, 27, 25, 0.12)",
            borderColor: "#D4B382",
          },
        }}
      >
        {/* Wishlist Heart Icon Button Overlay */}
        <Tooltip
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          arrow
        >
          <IconButton
            size="small"
            onClick={handleWishlistToggle}
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              zIndex: 10,
              bgcolor: "rgba(250, 249, 246, 0.85)",
              backdropFilter: "blur(6px)",
              border: "1px solid #E7E4DD",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: "#FFFFFF",
                transform: "scale(1.1)",
              },
            }}
          >
            {isWishlisted ? (
              <FavoriteIcon sx={{ fontSize: 18, color: "#B8925A" }} />
            ) : (
              <FavoriteBorderIcon sx={{ fontSize: 18, color: "#6B6862" }} />
            )}
          </IconButton>
        </Tooltip>

        <CardActionArea
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
          }}
        >
          {/* Fixed size image container with proper cover */}
          <Box
            sx={{
              height: { xs: 200, sm: 240 },
              width: "100%",
              overflow: "hidden",
              backgroundColor: "#FAF9F6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <CardMedia
              component="img"
              sx={{
                height: "100%",
                width: "100%",
                objectFit: "cover",
                objectPosition: "center",
                transition: "transform 0.5s ease-out",
                "&:hover": {
                  transform: "scale(1.06)",
                },
              }}
              image={
                item.image &&
                (item.image.startsWith("http")
                  ? item.image
                  : `${import.meta.env.VITE_API_URL}${item.image}`)
              }
              alt={item.name}
              onError={(e) => {
                e.target.src =
                  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=280&h=200&fit=crop";
              }}
            />

            {/* Rating Badge Overlay at Bottom Left */}
            {ratingAverage > 0 && (
              <Box
                sx={{
                  position: "absolute",
                  bottom: 10,
                  left: 10,
                  zIndex: 4,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "2px",
                  bgcolor: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(4px)",
                  px: "6px",
                  py: "2px",
                  borderRadius: "6px",
                  border: "1px solid rgba(231, 228, 221, 0.8)",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                }}
              >
                <Typography
                  component="span"
                  sx={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "#1C1B19",
                    lineHeight: 1,
                  }}
                >
                  {ratingAverage.toFixed(1)}
                </Typography>
                <StarIcon
                  className="text-amber-400"
                  sx={{
                    fontSize: 13,
                  }}
                />
              </Box>
            )}
          </Box>

          {/* Card content with consistent spacing */}
          <CardContent
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              p: 2.5,
              "&:last-child": { pb: 2.5 },
            }}
          >
            {/* Product name with fixed height */}
            <Typography
              gutterBottom
              variant="h6"
              component="div"
              sx={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontWeight: 600,
                color: "#1C1B19",
                fontSize: "1.05rem",
                lineHeight: 1.3,
                height: 42,
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {item.name || "Product Name"}
            </Typography>

            {/* Description with fixed height */}
            <Typography
              variant="body2"
              sx={{
                color: "#6B6862",
                fontSize: "0.825rem",
                minHeight: 36,
                maxHeight: 36,
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                mb: 1.5,
              }}
            >
              {item.description ||
                item.short_description ||
                "Product description goes here"}
            </Typography>

            {/* Price section - always at the bottom */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mt: "auto",
                pt: 1,
                borderTop: "1px solid #F3F1EC",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                {/* Current price */}
                <Typography
                  variant="body1"
                  sx={{
                    color: "#1C1B19",
                    fontWeight: 600,
                    fontSize: "1.05rem",
                    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
                  }}
                >
                  ₹{formatAmount(displayPrice)}
                </Typography>

                {/* Original price if discounted */}
                {originalPrice && originalPrice > displayPrice && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#6B6862",
                      textDecoration: "line-through",
                      fontSize: "0.85rem",
                    }}
                  >
                    ₹{formatAmount(originalPrice)}
                  </Typography>
                )}
              </Box>

              {/* Discount chip */}
              {discountPercentage && discountPercentage > 0 && (
                <Chip
                  label={`${discountPercentage}% OFF`}
                  size="small"
                  sx={{
                    backgroundColor: "#B3413B",
                    color: "#FFFFFF",
                    fontWeight: 600,
                    fontSize: "0.7rem",
                    height: 22,
                    borderRadius: "6px",
                  }}
                />
              )}
            </Box>
          </CardContent>
        </CardActionArea>
      </Card>
    </NavLink>
  );
};

export default ProductCard;
