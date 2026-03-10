// components/ProductDetailsModal.js
import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    IconButton,
    Chip,
    Divider,
    Grid,
    Avatar,
    Card,
    CardContent,
    Tooltip,
    Tabs,
    Tab,
    Stack,
    Badge,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Breadcrumbs,
    Link
} from '@mui/material';
import {
    Close,
    ShoppingCart,
    Favorite,
    Share,
    Visibility,
    Inventory,
    LocalOffer,
    Star,
    Category,
    Store,
    CalendarToday,
    Verified,
    Edit,
    Refresh,
    Assignment,
    AttachMoney,
    Description,
    Tag,
    PriorityHigh,
    CopyAll,
    Print,
    Image as ImageIcon,
    CheckCircle,
    Cancel,
    Error
} from '@mui/icons-material';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const ProductDetailsModal = ({ open, onClose, product }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [selectedImage, setSelectedImage] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(false);

    if (!product) return null;

    const API_URL = `${import.meta.env.VITE_API_URL}/api`;

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleFavoriteClick = () => {
        setIsFavorite(!isFavorite);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
    };

    const getMainImage = () => {
        if (product.images && product.images[selectedImage]) {
            const img = product.images[selectedImage];
            return img.src ? `${API_URL.replace('/api', '')}${img.src}` :
                product.image ? `${API_URL.replace('/api', '')}${product.image}` :
                    'https://via.placeholder.com/400';
        }
        return product.image ? `${API_URL.replace('/api', '')}${product.image}` :
            'https://via.placeholder.com/400';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return product.quantity > 0 ? '#36B37E' : '#FF5630';
            case 'inactive':
                return '#FFB020';
            default:
                return '#666';
        }
    };

    const getStatusText = () => {
        if (product.status !== 'active') return 'Inactive';
        return product.quantity > 0 ? 'In Stock' : 'Out of Stock';
    };

    const images = product.images || [];

    const handleCopyId = () => {
        navigator.clipboard.writeText(product._id.toUpperCase());
        // You could add a snackbar notification here
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    maxHeight: '95vh',
                    overflow: 'hidden',
                }
            }}
        >
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Box sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    p: 3,
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <DialogTitle sx={{
                        p: 0,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        position: 'relative',
                        zIndex: 1
                    }}>
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, flexWrap: 'wrap' }}>
                                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                    {product.name}
                                </Typography>
                                <Chip
                                    label={getStatusText()}
                                    size="small"
                                    sx={{
                                        bgcolor: 'white',
                                        color: getStatusColor(product.status),
                                        fontWeight: 'bold',
                                        fontSize: '0.75rem'
                                    }}
                                />
                                {product.isFeatured && (
                                    <Chip
                                        label="Featured"
                                        size="small"
                                        sx={{
                                            bgcolor: 'rgba(255,193,7,0.2)',
                                            color: '#ffc107',
                                            fontWeight: 'bold'
                                        }}
                                    />
                                )}
                            </Box>
                            <Typography variant="body2" sx={{ opacity: 0.9, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CalendarToday sx={{ fontSize: 16 }} />
                                Created: {formatDate(product.createdAt)}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Copy Product ID">
                                <IconButton
                                    onClick={handleCopyId}
                                    sx={{ color: 'white' }}
                                    size="small"
                                >
                                    <CopyAll />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Close">
                                <IconButton
                                    onClick={onClose}
                                    sx={{ color: 'white' }}
                                >
                                    <Close />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </DialogTitle>
                </Box>
            </motion.div>

            {/* Tab Navigation */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant="fullWidth"
                >
                    <Tab
                        label="Overview"
                        icon={<Visibility />}
                        iconPosition="start"
                    />
                    <Tab
                        label="Details"
                        icon={<Assignment />}
                        iconPosition="start"
                    />
                    <Tab
                        label="Gallery"
                        icon={<ImageIcon />}
                        iconPosition="start"
                    />
                    <Tab
                        label="Inventory"
                        icon={<Inventory />}
                        iconPosition="start"
                    />
                </Tabs>
            </Box>

            <DialogContent dividers sx={{ p: 0 }}>
                <Box sx={{ p: 3 }}>
                    {activeTab === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <Grid container spacing={3}>
                                {/* Left Column - Image */}
                                <Grid item xs={12} md={6}>
                                    <Paper sx={{ p: 2, borderRadius: 2, mb: 3 }}>
                                        <Box
                                            component="img"
                                            src={getMainImage()}
                                            alt={product.name}
                                            sx={{
                                                width: '100%',
                                                height: '300px',
                                                objectFit: 'contain',
                                                borderRadius: 1
                                            }}
                                        />
                                    </Paper>

                                    {/* Thumbnails */}
                                    {images.length > 1 && (
                                        <Paper sx={{ p: 2, borderRadius: 2 }}>
                                            <Typography variant="subtitle2" gutterBottom>
                                                Product Images
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1 }}>
                                                {images.map((img, index) => (
                                                    <Box
                                                        key={index}
                                                        onClick={() => setSelectedImage(index)}
                                                        sx={{
                                                            width: 60,
                                                            height: 60,
                                                            borderRadius: 1,
                                                            overflow: 'hidden',
                                                            cursor: 'pointer',
                                                            border: selectedImage === index ? '2px solid #667eea' : '1px solid #e0e0e0',
                                                            flexShrink: 0
                                                        }}
                                                    >
                                                        <img
                                                            src={img.src ? `${API_URL.replace('/api', '')}${img.src}` : 'https://via.placeholder.com/60'}
                                                            alt={`${product.name} ${index + 1}`}
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        />
                                                    </Box>
                                                ))}
                                            </Box>
                                        </Paper>
                                    )}
                                </Grid>

                                {/* Right Column - Details */}
                                <Grid item xs={12} md={6}>
                                    {/* Price Section */}
                                    <Paper sx={{ p: 2, borderRadius: 2, mb: 3 }}>
                                        <Stack spacing={2}>
                                            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                                                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e' }}>
                                                    {formatCurrency(product.price)}
                                                </Typography>
                                                {product.originalPrice > product.price && (
                                                    <>
                                                        <Typography variant="h6" sx={{ color: '#757575', textDecoration: 'line-through' }}>
                                                            {formatCurrency(product.originalPrice)}
                                                        </Typography>
                                                        <Chip
                                                            label={`${Math.round((1 - product.price / product.originalPrice) * 100)}% OFF`}
                                                            color="error"
                                                            size="small"
                                                        />
                                                    </>
                                                )}
                                            </Box>

                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Badge
                                                    badgeContent={product.quantity}
                                                    color={product.quantity > 10 ? "success" : product.quantity > 0 ? "warning" : "error"}
                                                >
                                                    <Inventory />
                                                </Badge>
                                                <Typography variant="body2">
                                                    {product.quantity > 0
                                                        ? `${product.quantity} units in stock`
                                                        : 'Out of stock'}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Paper>

                                    {/* Quick Info */}
                                    <Grid container spacing={2} sx={{ mb: 3 }}>
                                        <Grid item xs={6}>
                                            <Paper sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                                                <Stack spacing={1}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Category
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Category sx={{ color: '#667eea', fontSize: 20 }} />
                                                        <Typography variant="body2" fontWeight="medium">
                                                            {product.category || 'N/A'}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Paper sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                                                <Stack spacing={1}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Brand
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Store sx={{ color: '#9C27B0', fontSize: 20 }} />
                                                        <Typography variant="body2" fontWeight="medium">
                                                            {product.brand || 'No brand'}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Paper sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                                                <Stack spacing={1}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Rating
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Star sx={{ color: '#FFB020', fontSize: 20 }} />
                                                        <Typography variant="body2" fontWeight="medium">
                                                            {product.rating?.average?.toFixed(1) || '0.0'}
                                                            <Typography component="span" variant="caption" color="text.secondary">
                                                                {' '}({product.rating?.count || 0})
                                                            </Typography>
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Paper sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                                                <Stack spacing={1}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Status
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Verified sx={{
                                                            color: product.status === 'active' ? '#36B37E' :
                                                                product.status === 'inactive' ? '#FFB020' : '#FF5630',
                                                            fontSize: 20
                                                        }} />
                                                        <Typography variant="body2" fontWeight="medium">
                                                            {product.status?.charAt(0).toUpperCase() + product.status?.slice(1)}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </Paper>
                                        </Grid>
                                    </Grid>

                                    {/* Description */}
                                    <Paper sx={{ p: 2, borderRadius: 2, mb: 3 }}>
                                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                            Description
                                        </Typography>
                                        <Typography variant="body2" paragraph>
                                            {product.description || 'No description available.'}
                                        </Typography>
                                    </Paper>

                                    {/* Tags */}
                                    {product.tags && product.tags.length > 0 && (
                                        <Paper sx={{ p: 2, borderRadius: 2 }}>
                                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                                Tags
                                            </Typography>
                                            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                                                {product.tags.map((tag, index) => (
                                                    <Chip
                                                        key={index}
                                                        label={tag}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                ))}
                                            </Stack>
                                        </Paper>
                                    )}
                                </Grid>
                            </Grid>
                        </motion.div>
                    )}

                    {activeTab === 1 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={8}>
                                    {/* Product Details */}
                                    <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
                                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Description /> Product Details
                                        </Typography>
                                        <Typography variant="body2">
                                            {product.details || 'No additional details provided.'}
                                        </Typography>
                                    </Paper>

                                    {/* Highlights */}
                                    {product.highlights && product.highlights.length > 0 && (
                                        <Paper sx={{ p: 3, borderRadius: 2 }}>
                                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <PriorityHigh /> Key Features
                                            </Typography>
                                            <Box component="ul" sx={{ pl: 2, m: 0 }}>
                                                {product.highlights.map((highlight, index) => (
                                                    <Box component="li" key={index} sx={{ mb: 1 }}>
                                                        <Typography variant="body2">
                                                            {highlight}
                                                        </Typography>
                                                    </Box>
                                                ))}
                                            </Box>
                                        </Paper>
                                    )}
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    {/* Specifications */}
                                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Assignment /> Specifications
                                        </Typography>
                                        <Stack spacing={2}>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    Product ID
                                                </Typography>
                                                <Typography variant="body2" fontWeight="medium">
                                                    #{product._id.toUpperCase()}
                                                </Typography>
                                            </Box>
                                            <Divider />

                                            <Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    Last Updated
                                                </Typography>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {formatDate(product.updatedAt)}
                                                </Typography>
                                            </Box>
                                            <Divider />

                                            {/* Colors */}
                                            {product.colors && product.colors.length > 0 && (
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary" gutterBottom>
                                                        Available Colors
                                                    </Typography>
                                                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                                                        {product.colors.map((color, index) => (
                                                            <Tooltip key={index} title={color.name}>
                                                                <Box className={color.class}
                                                                    sx={{
                                                                        width: 24,
                                                                        height: 24,
                                                                        borderRadius: '50%',
                                                                        border: '2px solid #fff',
                                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',

                                                                    }}
                                                                />
                                                            </Tooltip>
                                                        ))}
                                                    </Stack>
                                                </Box>
                                            )}

                                            {/* Sizes */}
                                            {product.sizes && product.sizes.length > 0 && (
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary" gutterBottom>
                                                        Available Sizes
                                                    </Typography>
                                                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                                                        {product.sizes.map((size, index) => (
                                                            <Chip
                                                                key={index}
                                                                label={size.name}
                                                                size="small"
                                                                color={size.inStock ? "primary" : "default"}
                                                                variant={size.inStock ? "filled" : "outlined"}
                                                            />
                                                        ))}
                                                    </Stack>
                                                </Box>
                                            )}
                                        </Stack>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </motion.div>
                    )}

                    {activeTab === 2 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <Paper sx={{ p: 3, borderRadius: 2, mb: 2 }}>
                                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <ImageIcon /> Product Main Image
                                </Typography>
                                {product.image ? (
                                    <Grid item xs={6} sm={4} md={3}>
                                        <Paper sx={{
                                            borderRadius: 2,
                                            width: '20%',
                                            height: '20%',
                                            overflow: 'hidden',
                                            transition: 'transform 0.2s',
                                            '&:hover': { transform: 'translateY(-4px)' }
                                        }}>
                                            <Box
                                                component="img"
                                                src={product.image ? `${API_URL.replace('/api', '')}${product.image}` : 'https://via.placeholder.com/300'}
                                                alt={`${product.name}`}
                                                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                            <Box sx={{ p: 1, textAlign: 'center' }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    Main Image
                                                </Typography>
                                            </Box>
                                        </Paper>
                                    </Grid>
                                ) : (
                                    <Box sx={{ textAlign: 'center', py: 4 }}>
                                        <ImageIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                                        <Typography variant="body1" color="text.secondary">
                                            No images available
                                        </Typography>
                                    </Box>
                                )}
                            </Paper>
                            <Paper sx={{ p: 3, borderRadius: 2 }}>
                                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <ImageIcon /> Product Additional Images
                                </Typography>
                                {images.length > 0 ? (
                                    <Grid container spacing={2}>
                                        {images.map((img, index) => (
                                            <Grid item xs={6} sm={4} md={3} key={index}>
                                                <Paper sx={{
                                                    borderRadius: 2,
                                                    overflow: 'hidden',
                                                    transition: 'transform 0.2s',
                                                    '&:hover': { transform: 'translateY(-4px)' }
                                                }}>
                                                    <Box
                                                        component="img"
                                                        src={img.src ? `${API_URL.replace('/api', '')}${img.src}` : 'https://via.placeholder.com/300'}
                                                        alt={`${product.name} ${index + 1}`}
                                                        sx={{ width: '100%', height: '120', objectFit: 'cover' }}
                                                    />
                                                    <Box sx={{ p: 1, textAlign: 'center' }}>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Image {index + 1}
                                                        </Typography>
                                                    </Box>
                                                </Paper>
                                            </Grid>
                                        ))}
                                    </Grid>
                                ) : (
                                    <Box sx={{ textAlign: 'center', py: 4 }}>
                                        <ImageIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                                        <Typography variant="body1" color="text.secondary">
                                            No images available
                                        </Typography>
                                    </Box>
                                )}
                            </Paper>
                        </motion.div>
                    )}

                    {activeTab === 3 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <Paper sx={{ p: 3, borderRadius: 2 }}>
                                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Inventory /> Inventory Details
                                </Typography>
                                <TableContainer>
                                    <Table size="small">
                                        <TableBody>
                                            <TableRow>
                                                <TableCell><strong>Current Stock</strong></TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={product.quantity}
                                                        size="small"
                                                        color={product.quantity > 10 ? "success" : product.quantity > 0 ? "warning" : "error"}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell><strong>Stock Status</strong></TableCell>
                                                <TableCell>
                                                    {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell><strong>Brand</strong></TableCell>
                                                <TableCell>{product.brand || 'N/A'}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell><strong>Color</strong></TableCell>
                                                <TableCell>
                                                    {product.colors.map((color, index) => (
                                                        <Chip
                                                            key={index}
                                                            label={color.name}
                                                            size="small"
                                                            sx={{ mr: 1 }}
                                                        />

                                                    ))}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell><strong>Size</strong></TableCell>
                                                <TableCell>
                                                    {product.sizes.map((size, index) => (
                                                        <Chip
                                                            key={index}
                                                            label={size.name}
                                                            size="small"
                                                            sx={{ mr: 1 }}
                                                        />

                                                    ))}
                                                </TableCell>
                                            </TableRow>
                                            {product.weight && (
                                                <TableRow>
                                                    <TableCell><strong>Weight</strong></TableCell>
                                                    <TableCell>{product.weight} kg</TableCell>
                                                </TableRow>
                                            )}
                                            {product.dimensions && (
                                                <TableRow>
                                                    <TableCell><strong>Dimensions</strong></TableCell>
                                                    <TableCell>{product.dimensions}</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Paper>
                        </motion.div>
                    )}
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Stack direction="row" spacing={1} justifyContent="end" sx={{ width: '100%' }}>
                    <Button
                        variant="contained"
                        size="small"
                        onClick={onClose}
                    >
                        Close
                    </Button>
                </Stack>
            </DialogActions>
        </Dialog>
    );
};

export default ProductDetailsModal;