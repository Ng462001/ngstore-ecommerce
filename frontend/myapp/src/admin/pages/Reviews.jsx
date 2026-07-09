// components/Reviews.js
import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Rating,
    Box,
    Avatar,
    Chip,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    CircularProgress,
    Alert,
    Tooltip,
    Pagination,
    Grid,
    TablePagination
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    Edit as EditIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    Star as StarIcon,
    StarBorder as StarBorderIcon,
    Category as CategoryIcon,
} from '@mui/icons-material';
import ClearIcon from '@mui/icons-material/Clear';
import axios from 'axios';
import { format } from 'date-fns';

const Reviews = () => {
    const [totalPages, setTotalPages] = useState(0);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedReview, setSelectedReview] = useState(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [ratingFilter, setRatingFilter] = useState('all');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalReviews, setTotalReviews] = useState(0);
    const [stats, setStats] = useState({
        averageRating: 0,
        breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        count: 0,
        recentReviews: 0,
        recentAverage: 0,
        topProducts: [],
        totalReviews: 0,
    });
    const [editReviewData, setEditReviewData] = useState({
        name: '',
        rating: 5,
        comment: ''
    });
    const [products, setProducts] = useState([]);
    const [productFilter, setProductFilter] = useState('');

    useEffect(() => {
        fetchReviews();
        fetchStats();
        fetchProducts();
    }, [page, rowsPerPage, ratingFilter, productFilter]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/reviews`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    page: page + 1,
                    limit: rowsPerPage,
                    search: searchTerm || undefined,
                    rating: ratingFilter === 'all' ? undefined : parseInt(ratingFilter),
                    productId: productFilter || undefined
                }
            });

            console.log('Reviews API Response:', response.data);

            // Updated structure based on backend response
            setTotalPages(response.data.totalPages);
            setReviews(response.data.reviews || []);
            setTotalReviews(response.data.stats.totalReviews || 0);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load reviews');
            setReviews([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/reviews/stats`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setStats(response.data);
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/reviews/products`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setProducts(response.data.products || []);
        } catch (err) {
            console.error('Error fetching products:', err);
        }
    };

    const handleViewReview = (review) => {
        setSelectedReview(review);
        setViewDialogOpen(true);
    };

    const handleEditReview = (review) => {
        console.log('Editing review:', review);
        setSelectedReview(review);
        setEditReviewData({
            name: review.name,
            rating: review.rating,
            comment: review.comment
        });
        setEditDialogOpen(true);
    };

    const handleDeleteReview = (reviewId) => {
        console.log('Deleting review:', reviewId);
        setReviewToDelete(reviewId);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/reviews/${reviewToDelete}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            // Refresh reviews and stats
            fetchReviews();
            fetchStats();

            setDeleteDialogOpen(false);
            setReviewToDelete(null);

            // Show success message
            alert('Review deleted successfully');
        } catch (err) {
            console.error('Error deleting review:', err);
            alert(err.response?.data?.message || 'Failed to delete review');
        }
    };

    const handleUpdateReview = async () => {
        if (!editReviewData.rating || !editReviewData.name || !editReviewData.comment) {
            alert('Please fill all required fields');
            return;
        }

        if (editReviewData.comment.length < 5) {
            alert('Comment must be at least 5 characters long');
            return;
        }

        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/reviews/${selectedReview._id}`, editReviewData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            // Refresh reviews and stats
            fetchReviews();
            fetchStats();

            setEditDialogOpen(false);
            alert('Review updated successfully');
        } catch (err) {
            console.error('Error updating review:', err);
            alert(err.response?.data?.message || 'Failed to update review');
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const calculatePercentage = (count) => {
        return stats.count > 0 ? ((count / stats.count) * 100).toFixed(1) : '0.0';
    };

    const getProductRatingStats = () => {
        if (!stats.breakdown) return [];

        return [5, 4, 3, 2, 1].map((star) => ({
            star,
            count: stats.breakdown[star] || 0,
            percentage: calculatePercentage(stats.breakdown[star] || 0)
        }));
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    if (loading && page === 0) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <Typography variant="h4" className="font-bold text-gray-800">
                    Product Reviews Management
                </Typography>
                <Typography variant="body1" className="text-gray-600">
                    Manage all customer reviews across all products
                </Typography>
            </div>

            {/* Stats Cards */}
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card className="shadow-md">
                        <CardContent className="text-center">
                            <Typography variant="h3" className="font-bold text-blue-600">
                                {stats.totalReviews || 0}
                            </Typography>
                            <Typography variant="body2" className="text-gray-500">
                                Total Reviews
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card className="shadow-md">
                        <CardContent className="text-center">
                            <Typography variant="h3" className="font-bold text-yellow-600">
                                {stats.averageRating
                                    ?.toFixed(1) || '0.0'}
                            </Typography>
                            <Typography variant="body2" className="text-gray-500">
                                Average Rating
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card className="shadow-md">
                        <CardContent className="text-center">
                            <Typography variant="h3" className="font-bold text-green-600">
                                {stats.recentReviews || 0}
                            </Typography>
                            <Typography variant="body2" className="text-gray-500">
                                Recent Reviews (30 days)
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card className="shadow-md">
                        <CardContent className="text-center">
                            <Typography variant="h3" className="font-bold text-purple-600">
                                {totalPages}
                            </Typography>
                            <Typography variant="body2" className="text-gray-500">
                                Total Pages
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Filters Card */}
            <Card className="shadow-md rounded-xl">
                <CardContent className="p-6">
                    <Typography variant="h6" className="font-bold mb-4">
                        <FilterIcon className="mr-2" />
                        Filters
                    </Typography>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mt-4">
                            {/* Search Field */}
                            <TextField
                                fullWidth
                                variant="outlined"
                                size="small"
                                placeholder="Search by customer name or comment..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                }}
                                InputProps={{
                                    startAdornment: <SearchIcon className="mr-2 text-gray-400" />
                                }}
                            />
                            <Button
                                variant="contained"
                                fullWidth
                                onClick={() => {
                                    setPage(0);
                                    fetchReviews();
                                }}
                                startIcon={<SearchIcon />}
                            >
                                Search
                            </Button>
                            <FormControl fullWidth size="small">
                                <InputLabel>Product</InputLabel>
                                <Select
                                    value={productFilter}
                                    label="Product"
                                    onChange={(e) => {
                                        setProductFilter(e.target.value);
                                        setPage(0);
                                    }}
                                >
                                    <MenuItem value="">All Products</MenuItem>
                                    {products.map((product) => (
                                        <MenuItem key={product._id} value={product._id}>
                                            {product.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl fullWidth size="small">
                                <InputLabel>Rating Filter</InputLabel>
                                <Select
                                    value={ratingFilter}
                                    label="Rating Filter"
                                    onChange={(e) => {
                                        setRatingFilter(e.target.value);
                                        setPage(0);
                                    }}
                                >
                                    <MenuItem value="all">All Ratings</MenuItem>
                                    <MenuItem value={5}>5 Stars Only</MenuItem>
                                    <MenuItem value={4}>4 Stars Only</MenuItem>
                                    <MenuItem value={3}>3 Stars Only</MenuItem>
                                    <MenuItem value={2}>2 Stars Only</MenuItem>
                                    <MenuItem value={1}>1 Star Only</MenuItem>
                                </Select>
                            </FormControl>
                            <Button
                                variant="outlined"
                                fullWidth
                                onClick={() => {
                                    setSearchTerm('');
                                    setProductFilter('');
                                    setRatingFilter('all');
                                    setPage(0);
                                    fetchReviews();
                                }}
                                startIcon={<ClearIcon />}
                            >
                                Clear Filters
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="">
                {/* Reviews Table */}
                <div className="lg:col-span-3">
                    <Card className="shadow-md rounded-xl">
                        <CardContent className="p-6">
                            <Box display="flex" justifyContent="space-between" alignItems="center" className="mb-4">
                                <Typography variant="h6" className="font-bold">
                                    All Product Reviews
                                </Typography>
                                <Typography variant="body2" className="text-gray-500">
                                    Showing {reviews.length} of {totalReviews} reviews
                                </Typography>
                            </Box>

                            {error ? (
                                <Alert severity="error" className="mb-4">
                                    {error}
                                </Alert>
                            ) : null}

                            <TableContainer component={Paper} variant="outlined">
                                <Table>
                                    <TableHead>
                                        <TableRow className="bg-gray-50">
                                            <TableCell>Product</TableCell>
                                            <TableCell>Customer</TableCell>
                                            <TableCell align="center">Rating</TableCell>
                                            <TableCell>Date</TableCell>
                                            <TableCell align="center">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {reviews.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} align="center" className="py-8">
                                                    <Typography variant="body1" className="text-gray-500">
                                                        No reviews found
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            reviews.map((review) => (
                                                <TableRow key={review._id} hover>
                                                    <TableCell>
                                                        <Box display="flex" alignItems="center">
                                                            <Avatar
                                                                src={review.productImage && review.productImage.startsWith('http') ? review.productImage : `${import.meta.env.VITE_API_URL}${review.productImage || ''}`}
                                                                className="w-10 h-10 mr-3"
                                                                variant="rounded"
                                                            >
                                                                {review.productName?.charAt(0)}
                                                            </Avatar>
                                                            <Box>
                                                                <Typography variant="body2" className="font-medium">
                                                                    {review.productName}
                                                                </Typography>
                                                                <Typography variant="caption" className="text-gray-500">
                                                                    {review.productCategory} • {formatCurrency(review.productPrice)}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" className="font-medium">
                                                            {review.name}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Box display="flex" alignItems="center" justifyContent="center">
                                                            <Rating
                                                                value={review.rating}
                                                                readOnly
                                                                size="small"
                                                                icon={<StarIcon fontSize="inherit" />}
                                                                emptyIcon={<StarBorderIcon fontSize="inherit" />}
                                                            />
                                                            <Typography variant="body2" className="ml-2 font-medium">
                                                                {review.rating}.0
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">
                                                            {review.date ? format(new Date(review.date), 'dd/MM/yyyy') : 'N/A'}
                                                        </Typography>
                                                        <Typography variant="caption" className="text-gray-500">
                                                            {review.date ? format(new Date(review.date), 'hh:mm a') : ''}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Box display="flex" justifyContent="center" gap={1}>
                                                            <Tooltip title="View Details">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleViewReview(review)}
                                                                >
                                                                    <ViewIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>

                                                            <Tooltip title="Edit Review">
                                                                <IconButton
                                                                    size="small"
                                                                    color="primary"
                                                                    onClick={() => handleEditReview(review)}
                                                                >
                                                                    <EditIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>

                                                            <Tooltip title="Delete Review">
                                                                <IconButton
                                                                    size="small"
                                                                    color="error"
                                                                    onClick={() => handleDeleteReview(review._id)}
                                                                >
                                                                    <DeleteIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {/* Pagination */}
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25, 50]}
                                component="div"
                                count={totalReviews}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* View Review Dialog */}
            <Dialog
                open={viewDialogOpen}
                onClose={() => setViewDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                {selectedReview && (
                    <>
                        <DialogTitle className="font-bold">
                            Review Details
                        </DialogTitle>
                        <DialogContent>
                            <Grid container spacing={3} className="mt-2">
                                <Grid item xs={12} md={6}>
                                    <Box className="space-y-3">
                                        <div>
                                            <Typography variant="subtitle2" className="text-gray-500">
                                                Customer Information
                                            </Typography>
                                            <Box display="flex" alignItems="center" className="mt-2">
                                                <Avatar className="w-12 h-12 mr-3 bg-blue-500">
                                                    {selectedReview.name?.charAt(0) || 'C'}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body1" className="font-medium">
                                                        {selectedReview.name}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </div>

                                        <div>
                                            <Typography variant="subtitle2" className="text-gray-500">
                                                Rating
                                            </Typography>
                                            <Box display="flex" alignItems="center" className="mt-1">
                                                <Rating
                                                    value={selectedReview.rating}
                                                    readOnly
                                                    icon={<StarIcon fontSize="inherit" />}
                                                    emptyIcon={<StarBorderIcon fontSize="inherit" />}
                                                />
                                                <Typography variant="h6" className="ml-2">
                                                    {selectedReview.rating}.0
                                                </Typography>
                                            </Box>
                                        </div>
                                    </Box>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Box className="space-y-3">
                                        <div>
                                            <Typography variant="subtitle2" className="text-gray-500">
                                                Product Information
                                            </Typography>
                                            <Typography variant="body1" className="font-medium mt-1">
                                                {selectedReview.productName}
                                            </Typography>
                                            <Typography variant="body2" className="text-gray-600">
                                                Category: {selectedReview.productCategory}
                                            </Typography>
                                            <Typography variant="body2" className="text-gray-600">
                                                Price: {formatCurrency(selectedReview.productPrice)}
                                            </Typography>
                                        </div>

                                        <div>
                                            <Typography variant="subtitle2" className="text-gray-500">
                                                Review Date
                                            </Typography>
                                            <Typography variant="body1" className="mt-1">
                                                {selectedReview.date ? format(new Date(selectedReview.date), 'PPP') : 'N/A'}
                                            </Typography>
                                            <Typography variant="body2" className="text-gray-500">
                                                {selectedReview.date ? format(new Date(selectedReview.date), 'hh:mm:ss aa') : ''}
                                            </Typography>
                                        </div>
                                    </Box>
                                </Grid>

                                <Grid item xs={12}>
                                    <div>
                                        <Typography variant="subtitle2" className="text-gray-500">
                                            Review Comment
                                        </Typography>
                                        <Card variant="outlined" className="mt-2 p-3">
                                            <Typography variant="body1">
                                                {selectedReview.comment}
                                            </Typography>
                                        </Card>
                                    </div>
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setViewDialogOpen(false)}>
                                Close
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* Edit Review Dialog */}
            <Dialog
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                {selectedReview && (
                    <>
                        <DialogTitle className="font-bold">
                            Edit Review
                        </DialogTitle>
                        <DialogContent>
                            <Box className="space-y-4 pt-4">
                                <Typography variant="subtitle2" className="text-gray-600 mb-2">
                                    Product: {selectedReview.productName}
                                </Typography>

                                <TextField
                                    fullWidth
                                    label="Customer Name"
                                    variant="outlined"
                                    value={editReviewData.name}
                                    onChange={(e) => setEditReviewData({ ...editReviewData, name: e.target.value })}
                                    required
                                />

                                <Box>
                                    <Typography variant="subtitle2" className="mb-2">
                                        Rating *
                                    </Typography>
                                    <Rating
                                        value={editReviewData.rating}
                                        onChange={(event, newValue) => {
                                            setEditReviewData({ ...editReviewData, rating: newValue });
                                        }}
                                        size="large"
                                        icon={<StarIcon fontSize="inherit" />}
                                        emptyIcon={<StarBorderIcon fontSize="inherit" />}
                                    />
                                </Box>

                                <TextField
                                    fullWidth
                                    label="Comment"
                                    variant="outlined"
                                    multiline
                                    rows={4}
                                    value={editReviewData.comment}
                                    onChange={(e) => setEditReviewData({ ...editReviewData, comment: e.target.value })}
                                    required
                                    helperText="Minimum 5 characters"
                                />
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setEditDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleUpdateReview}
                                variant="contained"
                                color="primary"
                            >
                                Update Review
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle className="font-bold">
                    Delete Review
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this review? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={confirmDelete}
                        color="error"
                        variant="contained"
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default Reviews;