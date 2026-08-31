// components/Products.js
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  CircularProgress,
  Pagination,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Box,
  Tooltip,
} from "@mui/material";
import {
  Edit,
  Delete,
  Add,
  Refresh,
  Search,
  Visibility,
} from "@mui/icons-material";
import axios from "axios";
import ProductFormModal from "../components/ProductFormModal";
import ProductDetailsModal from "../components/ProductDetailsModal";

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

// Constants
// Must match backend Product model enum exactly
const PRODUCT_CATEGORIES = [
  { value: "electronic device", label: "Electronic Device" },
  { value: "mobile", label: "Mobile" },
  { value: "electronics", label: "Electronics" },
  { value: "cloths", label: "Cloths" },
  { value: "clothing", label: "Clothing" },
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "kids", label: "Kids" },
  { value: "accessories", label: "Accessories" },
  { value: "home", label: "Home & Living" },
  { value: "sports", label: "Sports" },
];

const ITEMS_PER_PAGE = 10;

// Custom hook for debouncing
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Image component with error handling
const ProductImage = ({ src, alt, className }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <img
      src={imgError ? "https://via.placeholder.com/48" : src}
      alt={alt}
      className={className}
      onError={() => setImgError(true)}
      loading="lazy"
    />
  );
};

// Error handling utility
const handleApiError = (error, defaultMessage) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  return error.message || defaultMessage;
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [viewProduct, setViewProduct] = useState(null);
  const [actionLoading, setActionLoading] = useState({
    delete: false,
    refresh: false,
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    fetchProducts();
  }, [page, category, debouncedSearchTerm]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit: ITEMS_PER_PAGE,
        sort: "createdAt",
        order: "desc",
        status: "all", // Admin sees ALL products regardless of status
      };

      if (category) {
        params.category = category;
      }

      if (debouncedSearchTerm) {
        params.search = debouncedSearchTerm;
      }

      const response = await axios.get(`${API_URL}/products`, { params });

      setProducts(response.data.data || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(handleApiError(err, "Failed to load products"));
    } finally {
      setLoading(false);
      setActionLoading((prev) => ({ ...prev, refresh: false }));
    }
  };

  const handleRefresh = () => {
    setActionLoading((prev) => ({ ...prev, refresh: true }));
    fetchProducts();
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    const productId = productToDelete._id;
    const originalProducts = [...products];

    // Optimistic update
    setProducts((prev) => prev.filter((p) => p._id !== productId));
    setDeleteDialogOpen(false);
    setActionLoading((prev) => ({ ...prev, delete: true }));

    try {
      await axios.delete(`${API_URL}/products/${productId}`);
      // Success - no need to refetch, we already updated
    } catch (err) {
      // Revert on error
      setProducts(originalProducts);
    } finally {
      setActionLoading((prev) => ({ ...prev, delete: false }));
      setProductToDelete(null);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedProduct(null);
  };

  const handleSuccess = () => {
    fetchProducts();
  };

  const handleFilterReset = () => {
    setCategory("");
    setSearchTerm("");
    setPage(1);
  };

  const getStatusChip = (product) => {
    const inStock = product.quantity > 0 && product.status === "active";
    return (
      <Chip
        label={inStock ? "In Stock" : "Out of Stock"}
        size="small"
        color={inStock ? "success" : "default"}
        variant="outlined"
      />
    );
  };

  const hasActiveFilters = category || searchTerm;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Typography
            variant="h4"
            sx={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontWeight: 600,
              color: "#1C1B19",
            }}
          >
            Product Management
          </Typography>
          <Typography variant="body2" sx={{ color: "#6B6862", mt: 0.5 }}>
            Manage your product inventory and catalog items
          </Typography>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={actionLoading.refresh}
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 600,
              borderColor: "#E7E4DD",
              color: "#1C1B19",
              bgcolor: "#FFFFFF",
              "&:hover": { bgcolor: "#F7F3EC", borderColor: "#B8925A" },
            }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddProduct}
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 600,
              bgcolor: "#B8925A",
              boxShadow: "0 4px 14px rgba(184, 146, 90, 0.25)",
              "&:hover": { bgcolor: "#9E7B47" },
            }}
          >
            Add Product
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card
        elevation={0}
        sx={{
          borderRadius: "20px",
          bgcolor: "#FFFFFF",
          border: "1px solid #E7E4DD",
          boxShadow: "0 4px 20px -2px rgba(28, 27, 25, 0.05)",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <div className="flex gap-4 flex-wrap">
            <TextField
              select
              label="Category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              size="small"
              style={{ minWidth: 200 }}
            >
              <MenuItem value="">All Categories</MenuItem>
              {PRODUCT_CATEGORIES.map((cat) => (
                <MenuItem key={cat.value} value={cat.value}>
                  {cat.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Search Products"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              size="small"
              style={{ minWidth: 250 }}
              placeholder="Search by name..."
              InputProps={{
                startAdornment: <Search sx={{ color: "#6B6862", mr: 1 }} />,
              }}
            />

            {hasActiveFilters && (
              <Button
                variant="text"
                onClick={handleFilterReset}
                sx={{
                  color: "#B3413B",
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <div className="bg-error/10 border border-error/30 text-error px-4 py-3 rounded-2xl">
          <strong>Error: </strong>
          {error}
        </div>
      )}

      {/* Products Table */}
      <Card
        elevation={0}
        sx={{
          borderRadius: "20px",
          bgcolor: "#FFFFFF",
          border: "1px solid #E7E4DD",
          boxShadow: "0 4px 20px -2px rgba(28, 27, 25, 0.05)",
          overflow: "hidden",
        }}
      >
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <CircularProgress sx={{ color: "#B8925A" }} />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <Typography
                variant="h6"
                sx={{
                  fontFamily: '"Playfair Display", Georgia, serif',
                  fontWeight: 600,
                  color: "#1C1B19",
                  mb: 1,
                }}
              >
                No products found
              </Typography>
              <Typography variant="body2" sx={{ color: "#6B6862", mb: 3 }}>
                {hasActiveFilters
                  ? "Try changing your filters or search term"
                  : "Get started by adding your first product"}
              </Typography>
              {!hasActiveFilters && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleAddProduct}
                  sx={{
                    borderRadius: "12px",
                    textTransform: "none",
                    fontWeight: 600,
                    bgcolor: "#B8925A",
                    "&:hover": { bgcolor: "#9E7B47" },
                  }}
                >
                  Add First Product
                </Button>
              )}
            </div>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead
                    sx={{
                      bgcolor: "#FAF9F6",
                      borderBottom: "1px solid #E7E4DD",
                    }}
                  >
                    <TableRow>
                      <TableCell
                        sx={{
                          fontFamily: '"Playfair Display", Georgia, serif',
                          fontWeight: 600,
                          color: "#1C1B19",
                        }}
                      >
                        Product
                      </TableCell>
                      <TableCell
                        sx={{
                          fontFamily: '"Playfair Display", Georgia, serif',
                          fontWeight: 600,
                          color: "#1C1B19",
                        }}
                      >
                        Category
                      </TableCell>
                      <TableCell
                        sx={{
                          fontFamily: '"Playfair Display", Georgia, serif',
                          fontWeight: 600,
                          color: "#1C1B19",
                        }}
                      >
                        Price
                      </TableCell>
                      <TableCell
                        sx={{
                          fontFamily: '"Playfair Display", Georgia, serif',
                          fontWeight: 600,
                          color: "#1C1B19",
                        }}
                      >
                        Stock
                      </TableCell>
                      <TableCell
                        sx={{
                          fontFamily: '"Playfair Display", Georgia, serif',
                          fontWeight: 600,
                          color: "#1C1B19",
                        }}
                      >
                        Status
                      </TableCell>
                      <TableCell
                        sx={{
                          fontFamily: '"Playfair Display", Georgia, serif',
                          fontWeight: 600,
                          color: "#1C1B19",
                        }}
                      >
                        Rating
                      </TableCell>
                      <TableCell
                        sx={{
                          fontFamily: '"Playfair Display", Georgia, serif',
                          fontWeight: 600,
                          color: "#1C1B19",
                        }}
                        align="center"
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow
                        key={product._id}
                        sx={{
                          "&:hover": { bgcolor: "#FAF9F6" },
                          borderBottom: "1px solid #E7E4DD",
                        }}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <ProductImage
                              src={
                                product.image
                                  ? product.image.startsWith("http")
                                    ? product.image
                                    : `${API_URL.replace("/api", "")}${product.image}`
                                  : "https://via.placeholder.com/48"
                              }
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-xl border border-border-light bg-background"
                            />
                            <Box>
                              <Typography
                                variant="body1"
                                sx={{
                                  fontFamily:
                                    '"Playfair Display", Georgia, serif',
                                  fontWeight: 600,
                                  color: "#1C1B19",
                                }}
                              >
                                {product.name}
                              </Typography>
                              {product.description && (
                                <Typography
                                  variant="body2"
                                  sx={{ color: "#6B6862" }}
                                  className="truncate max-w-xs"
                                >
                                  {product.description}
                                </Typography>
                              )}
                            </Box>
                          </div>
                        </TableCell>
                        <TableCell
                          className="capitalize"
                          sx={{ color: "#6B6862" }}
                        >
                          {product.category}
                        </TableCell>
                        <TableCell sx={{ color: "#B8925A", fontWeight: 700 }}>
                          ₹
                          {typeof product.price === "number"
                            ? product.price.toFixed(2)
                            : "0.00"}
                        </TableCell>
                        <TableCell sx={{ color: "#1C1B19", fontWeight: 600 }}>
                          {product.quantity}
                        </TableCell>
                        <TableCell>{getStatusChip(product)}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className="text-amber-500 mr-1">★</span>
                            <span className="font-semibold text-text-primary">
                              {(product.rating?.average || 0).toFixed(1)}
                            </span>
                            <span className="text-text-secondary text-xs ml-1">
                              ({product.rating?.count || 0})
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1 justify-center">
                            <Tooltip title="View product details">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setViewProduct(product);
                                  setDetailsOpen(true);
                                }}
                                sx={{
                                  color: "#6B6862",
                                  "&:hover": {
                                    color: "#1C1B19",
                                    bgcolor: "#F3F1EC",
                                  },
                                }}
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit product">
                              <IconButton
                                size="small"
                                onClick={() => handleEditProduct(product)}
                                sx={{
                                  color: "#B8925A",
                                  "&:hover": {
                                    color: "#9E7B47",
                                    bgcolor: "#F7F3EC",
                                  },
                                }}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete product">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteClick(product)}
                                disabled={actionLoading.delete}
                                sx={{
                                  color: "#B3413B",
                                  "&:hover": {
                                    color: "#96342E",
                                    bgcolor: "#FDF2F2",
                                  },
                                }}
                              >
                                {actionLoading.delete &&
                                productToDelete?._id === product._id ? (
                                  <CircularProgress size={20} color="error" />
                                ) : (
                                  <Delete fontSize="small" />
                                )}
                              </IconButton>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center py-4 border-t border-border-light">
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                    showFirstButton
                    showLastButton
                    sx={{
                      "& .MuiPaginationItem-root.Mui-selected": {
                        bgcolor: "#B8925A",
                        color: "white",
                        "&:hover": { bgcolor: "#9E7B47" },
                      },
                    }}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Product Form Modal */}
      <ProductFormModal
        open={modalOpen}
        onClose={handleModalClose}
        product={selectedProduct}
        onSuccess={handleSuccess}
      />

      <ProductDetailsModal
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        product={viewProduct}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !actionLoading.delete && setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{productToDelete?.name}"? This
            action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={actionLoading.delete}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={actionLoading.delete}
            startIcon={
              actionLoading.delete ? <CircularProgress size={16} /> : null
            }
          >
            {actionLoading.delete ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Products;
