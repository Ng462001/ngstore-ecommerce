// components/Products.js
import React, { useState, useEffect } from 'react';
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
    Tooltip
} from '@mui/material';
import {
    Edit,
    Delete,
    Add,
    Refresh,
    Search,
    Visibility
} from '@mui/icons-material';
import axios from 'axios';
import ProductFormModal from './ProductFormModal';
import ProductDetailsModal from './ProductDetailsModal';

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

// Constants
// Must match backend Product model enum exactly
const PRODUCT_CATEGORIES = [
    { value: 'electronic device', label: 'Electronic Device' },
    { value: 'mobile', label: 'Mobile' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'cloths', label: 'Cloths' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'men', label: 'Men' },
    { value: 'women', label: 'Women' },
    { value: 'kids', label: 'Kids' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'home', label: 'Home & Living' },
    { value: 'sports', label: 'Sports' },
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
            src={imgError ? 'https://via.placeholder.com/48' : src}
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
    const [category, setCategory] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [viewProduct, setViewProduct] = useState(null);
    const [actionLoading, setActionLoading] = useState({
        delete: false,
        refresh: false
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
                sort: 'createdAt',
                order: 'desc',
                status: 'all'  // Admin sees ALL products regardless of status
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
            console.error('Error fetching products:', err);
            setError(handleApiError(err, 'Failed to load products'));
        } finally {
            setLoading(false);
            setActionLoading(prev => ({ ...prev, refresh: false }));
        }
    };

    const handleRefresh = () => {
        setActionLoading(prev => ({ ...prev, refresh: true }));
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
        setProducts(prev => prev.filter(p => p._id !== productId));
        setDeleteDialogOpen(false);
        setActionLoading(prev => ({ ...prev, delete: true }));

        try {
            await axios.delete(`${API_URL}/products/${productId}`);
            // Success - no need to refetch, we already updated
        } catch (err) {
            // Revert on error
            setProducts(originalProducts);
            alert('Failed to delete product: ' + handleApiError(err, 'Delete operation failed'));
        } finally {
            setActionLoading(prev => ({ ...prev, delete: false }));
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
        setCategory('');
        setSearchTerm('');
        setPage(1);
    };

    const getStatusChip = (product) => {
        const inStock = product.quantity > 0 && product.status === 'active';
        return (
            <Chip
                label={inStock ? 'In Stock' : 'Out of Stock'}
                size="small"
                color={inStock ? 'success' : 'default'}
                variant="outlined"
            />
        );
    };

    const hasActiveFilters = category || searchTerm;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <Typography variant="h4" className="font-bold text-gray-800">
                        Products
                    </Typography>
                    <Typography variant="body1" className="text-gray-600">
                        Manage your product inventory ({products.length} products)
                    </Typography>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={handleRefresh}
                        disabled={actionLoading.refresh}
                    >
                        {actionLoading.refresh ? <CircularProgress size={20} /> : 'Refresh'}
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={handleAddProduct}
                        className="bg-blue-600 hover:bg-blue-700 shadow-md"
                    >
                        Add Product
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card className="shadow-md rounded-xl">
                <CardContent className="p-4">
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
                            {PRODUCT_CATEGORIES.map(cat => (
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
                                startAdornment: <Search color="action" sx={{ mr: 1 }} />
                            }}
                        />

                        {hasActiveFilters && (
                            <Button
                                variant="text"
                                onClick={handleFilterReset}
                                className="self-center"
                            >
                                Clear Filters
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Error Alert */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <strong>Error: </strong>{error}
                </div>
            )}

            {/* Products Table */}
            <Card className="shadow-md rounded-xl">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <CircularProgress />
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-12">
                            <Typography variant="h6" className="text-gray-500 mb-2">
                                No products found
                            </Typography>
                            <Typography variant="body2" className="text-gray-400 mb-4">
                                {hasActiveFilters
                                    ? 'Try changing your filters or search term'
                                    : 'Get started by adding your first product'
                                }
                            </Typography>
                            {!hasActiveFilters && (
                                <Button
                                    variant="contained"
                                    startIcon={<Add />}
                                    onClick={handleAddProduct}
                                >
                                    Add First Product
                                </Button>
                            )}
                        </div>
                    ) : (
                        <>
                            <TableContainer>
                                <Table>
                                    <TableHead className="bg-gray-50">
                                        <TableRow>
                                            <TableCell className="font-bold">Product</TableCell>
                                            <TableCell className="font-bold">Category</TableCell>
                                            <TableCell className="font-bold">Price</TableCell>
                                            <TableCell className="font-bold">Stock</TableCell>
                                            <TableCell className="font-bold">Status</TableCell>
                                            <TableCell className="font-bold">Rating</TableCell>
                                            <TableCell className="font-bold" align="center">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {products.map((product) => (
                                            <TableRow
                                                key={product._id}
                                                className="hover:bg-gray-50"
                                            >
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <ProductImage
                                                            src={product.image ? (product.image.startsWith('http') ? product.image : `${API_URL.replace('/api', '')}${product.image}`) : 'https://via.placeholder.com/48'}
                                                            alt={product.name}
                                                            className="w-12 h-12 object-cover rounded"
                                                        />
                                                        <Box>
                                                            <Typography variant="body1" className="font-medium">
                                                                {product.name}
                                                            </Typography>
                                                            {product.description && (
                                                                <Typography variant="body2" className="text-gray-500 truncate max-w-xs">
                                                                    {product.description}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="capitalize">
                                                    {product.category}
                                                </TableCell>
                                                <TableCell>
                                                    ₹{typeof product.price === 'number' ? product.price.toFixed(2) : '0.00'}
                                                </TableCell>
                                                <TableCell>
                                                    {product.quantity}
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusChip(product)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center">
                                                        <span className="text-yellow-500 mr-1">★</span>
                                                        <span>{(product.rating?.average || 0).toFixed(1)}</span>
                                                        <span className="text-gray-400 ml-1">
                                                            ({product.rating?.count || 0})
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex space-x-2 justify-center">
                                                        <Tooltip title="View product details">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => {
                                                                    setViewProduct(product);
                                                                    setDetailsOpen(true);
                                                                }}
                                                                aria-label={`View ${product.name}`}
                                                            >
                                                                <Visibility fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Edit product">
                                                            <IconButton
                                                                size="small"
                                                                color="primary"
                                                                onClick={() => handleEditProduct(product)}
                                                                aria-label={`Edit ${product.name}`}
                                                            >
                                                                <Edit fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Delete product">
                                                            <IconButton
                                                                size="small"
                                                                color="error"
                                                                onClick={() => handleDeleteClick(product)}
                                                                aria-label={`Delete ${product.name}`}
                                                                disabled={actionLoading.delete}
                                                            >
                                                                {actionLoading.delete && productToDelete?._id === product._id ? (
                                                                    <CircularProgress size={20} />
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
                                <div className="flex justify-center py-4">
                                    <Pagination
                                        count={totalPages}
                                        page={page}
                                        onChange={(e, value) => setPage(value)}
                                        color="primary"
                                        showFirstButton
                                        showLastButton
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
                        Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
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
                        startIcon={actionLoading.delete ? <CircularProgress size={16} /> : null}
                    >
                        {actionLoading.delete ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default Products;