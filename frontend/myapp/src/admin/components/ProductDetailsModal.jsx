import { useState } from 'react';
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
    Tooltip,
    Tabs,
    Tab,
    Stack,
    Paper,
    Rating
} from '@mui/material';
import {
    Close,
    Visibility,
    Star,
    Category,
    Store,
    CalendarToday,
    Verified,
    Assignment,
    Description,
    CopyAll,
    Image as ImageIcon,
    CheckCircle,
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
            const src = img.src || product.image;
            if (src) {
                return src.startsWith('http') ? src : `${API_URL.replace('/api', '')}${src}`;
            }
            return 'https://via.placeholder.com/400';
        }
        if (product.image) {
            return product.image.startsWith('http') ? product.image : `${API_URL.replace('/api', '')}${product.image}`;
        }
        return 'https://via.placeholder.com/400';
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
    // Filter duplicates by source URL to avoid repeating image thumbnails
    const uniqueImages = [];
    const seenSrcs = new Set();
    images.forEach((img, index) => {
        const src = img.src || product.image;
        if (src && !seenSrcs.has(src)) {
            seenSrcs.add(src);
            uniqueImages.push({ ...img, originalIndex: index });
        }
    });

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
                    borderRadius: '24px',
                    maxHeight: '95vh',
                    overflow: 'hidden',
                    bgcolor: '#FFFFFF',
                    border: '1px solid #E7E4DD',
                    boxShadow: '0 20px 40px -10px rgba(28, 27, 25, 0.15)'
                }
            }}
        >
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Box sx={{
                    bgcolor: '#FAF9F6',
                    color: '#1C1B19',
                    borderBottom: '1px solid #E7E4DD',
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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, flexWrap: 'wrap' }}>
                            <Avatar
                                src={product.image ? (product.image.startsWith('http') ? product.image : `${API_URL.replace('/api', '')}${product.image}`) : 'https://via.placeholder.com/48'}
                                variant="rounded"
                                sx={{
                                    width: 52,
                                    height: 52,
                                    border: '1px solid #E7E4DD',
                                    boxShadow: '0 4px 12px rgba(28, 27, 25, 0.08)',
                                    bgcolor: '#F3F1EC',
                                    flexShrink: 0
                                }}
                            />
                            <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5, flexWrap: 'wrap' }}>
                                    <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
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
                        label="Reviews"
                        icon={<Star />}
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
                                {/* Left Column - Summary & Description */}
                                <Grid item xs={12} md={7}>
                                    {/* Price Section */}
                                    <Paper sx={{
                                        p: 3,
                                        borderRadius: 3,
                                        mb: 3,
                                        background: 'linear-gradient(135deg, #f8faff 0%, #f1f5ff 100%)',
                                        border: '1px solid rgba(102, 126, 234, 0.12)',
                                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.05)'
                                    }}>
                                        <Stack spacing={2}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                                                <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a237e', tracking: '-0.5px' }}>
                                                    {formatCurrency(product.price)}
                                                </Typography>
                                                {product.originalPrice > product.price && (
                                                    <>
                                                        <Typography variant="h6" sx={{ color: '#94a3b8', textDecoration: 'line-through', fontWeight: 500 }}>
                                                            {formatCurrency(product.originalPrice)}
                                                        </Typography>
                                                        <Chip
                                                            label={`${Math.round((1 - product.price / product.originalPrice) * 100)}% OFF`}
                                                            sx={{
                                                                background: 'linear-gradient(135deg, #ff5630 0%, #ff8e53 100%)',
                                                                color: 'white',
                                                                fontWeight: 'bold',
                                                                fontSize: '0.75rem',
                                                                boxShadow: '0 2px 8px rgba(255,86,48,0.2)'
                                                            }}
                                                            size="small"
                                                        />
                                                    </>
                                                )}
                                            </Box>

                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Box sx={{
                                                    width: 10,
                                                    height: 10,
                                                    borderRadius: '50%',
                                                    bgcolor: product.quantity > 10 ? '#36B37E' : product.quantity > 0 ? '#FFB020' : '#FF5630',
                                                    boxShadow: `0 0 8px ${product.quantity > 10 ? '#36B37E' : product.quantity > 0 ? '#FFB020' : '#FF5630'}`,
                                                    animation: 'pulse 2s infinite',
                                                    '@keyframes pulse': {
                                                        '0%': { transform: 'scale(0.9)', opacity: 0.6, boxShadow: `0 0 0 0px ${product.quantity > 10 ? 'rgba(54,179,126,0.4)' : product.quantity > 0 ? 'rgba(255,176,32,0.4)' : 'rgba(255,86,48,0.4)'}` },
                                                        '70%': { transform: 'scale(1)', opacity: 1, boxShadow: `0 0 0 6px ${product.quantity > 10 ? 'rgba(54,179,126,0)' : product.quantity > 0 ? 'rgba(255,176,32,0)' : 'rgba(255,86,48,0)'}` },
                                                        '100%': { transform: 'scale(0.9)', opacity: 0.6, boxShadow: `0 0 0 0px ${product.quantity > 10 ? 'rgba(54,179,126,0)' : product.quantity > 0 ? 'rgba(255,176,32,0)' : 'rgba(255,86,48,0)'}` }
                                                    }
                                                }} />
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569' }}>
                                                    {product.quantity > 0
                                                        ? `${product.quantity} units available in stock`
                                                        : 'Currently Out of stock'}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Paper>

                                    {/* Short Description */}
                                    {product.short_description && (
                                        <Paper sx={{
                                            p: 2.5,
                                            borderRadius: 3,
                                            mb: 3,
                                            bgcolor: '#fafaff',
                                            borderLeft: '4px solid #4f46e5',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                                        }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#312e81', display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Description sx={{ fontSize: 18, color: '#4f46e5' }} /> Quick Summary
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.6, fontStyle: 'italic' }}>
                                                "{product.short_description}"
                                            </Typography>
                                        </Paper>
                                    )}

                                    {/* Description */}
                                    <Paper sx={{
                                        p: 2.5,
                                        borderRadius: 3,
                                        bgcolor: '#fcfcfc',
                                        borderLeft: '4px solid #475569',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                                    }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#1e293b' }}>
                                            Detailed Description
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.6 }}>
                                            {product.description || 'No description available.'}
                                        </Typography>
                                    </Paper>
                                </Grid>

                                {/* Right Column - Quick Info & Tags */}
                                <Grid item xs={12} md={5}>
                                    {/* Quick Info Grid */}
                                    <Grid container spacing={2} sx={{ mb: 3 }}>
                                        {[
                                            { label: 'Category', value: product.category || 'N/A', icon: <Category sx={{ color: '#4f46e5' }} />, bg: 'rgba(79, 70, 229, 0.08)' },
                                            { label: 'Brand', value: product.brand || 'No Brand', icon: <Store sx={{ color: '#9333ea' }} />, bg: 'rgba(147, 51, 234, 0.08)' },
                                            { label: 'Rating', value: `${product.rating?.average?.toFixed(1) || '0.0'} (${product.rating?.count || 0})`, icon: <Star sx={{ color: '#ca8a04' }} />, bg: 'rgba(202, 138, 4, 0.08)' },
                                            { label: 'Status', value: product.status?.charAt(0).toUpperCase() + product.status?.slice(1), icon: <Verified sx={{ color: product.status === 'active' ? '#16a34a' : '#ea580c' }} />, bg: product.status === 'active' ? 'rgba(22, 163, 74, 0.08)' : 'rgba(234, 88, 12, 0.08)' }
                                        ].map((item, index) => (
                                            <Grid item xs={12} key={index}>
                                                <Paper sx={{
                                                    p: 2,
                                                    borderRadius: 3,
                                                    border: '1px solid rgba(0,0,0,0.04)',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    '&:hover': {
                                                        transform: 'translateY(-2px)',
                                                        boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
                                                        borderColor: 'rgba(0,0,0,0.08)'
                                                    }
                                                }}>
                                                    <Stack direction="row" spacing={2} alignItems="center">
                                                        <Box sx={{
                                                            width: 40,
                                                            height: 40,
                                                            borderRadius: 2,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            bgcolor: item.bg,
                                                            flexShrink: 0
                                                        }}>
                                                            {item.icon}
                                                        </Box>
                                                        <Stack spacing={0.2}>
                                                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                                {item.label}
                                                            </Typography>
                                                            <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                                                {item.value}
                                                            </Typography>
                                                        </Stack>
                                                    </Stack>
                                                </Paper>
                                            </Grid>
                                        ))}
                                    </Grid>

                                    {/* Tags */}
                                    {product.tags && product.tags.length > 0 && (
                                        <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: '#1e293b' }}>
                                                Tags
                                            </Typography>
                                            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                                                {product.tags.map((tag, index) => (
                                                    <Chip
                                                        key={index}
                                                        label={tag}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: '#f1f5f9',
                                                            color: '#475569',
                                                            border: '1px solid #e2e8f0',
                                                            fontWeight: 500,
                                                            transition: 'all 0.2s',
                                                            '&:hover': {
                                                                bgcolor: '#e2e8f0',
                                                                transform: 'translateY(-1px)'
                                                            }
                                                        }}
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
                                    <Paper sx={{
                                        p: 3,
                                        borderRadius: 3,
                                        mb: 3,
                                        border: '1px solid rgba(0,0,0,0.04)',
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
                                    }}>
                                        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, fontWeight: 700, color: '#1e293b' }}>
                                            <Description sx={{ color: '#4f46e5' }} /> Product Details
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.6 }}>
                                            {product.details || 'No additional details provided.'}
                                        </Typography>
                                    </Paper>

                                    {/* Highlights */}
                                    {product.highlights && product.highlights.length > 0 && (
                                        <Paper sx={{
                                            p: 3,
                                            borderRadius: 3,
                                            border: '1px solid rgba(0,0,0,0.04)',
                                            boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
                                        }}>
                                            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, fontWeight: 700, color: '#1e293b' }}>
                                                <CheckCircle sx={{ color: '#16a34a' }} /> Key Features & Highlights
                                            </Typography>
                                            <Grid container spacing={2}>
                                                {product.highlights.map((highlight, index) => (
                                                    <Grid item xs={12} sm={6} key={index}>
                                                        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                                                            <CheckCircle sx={{ color: '#16a34a', fontSize: 18, mt: 0.2 }} />
                                                            <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.5 }}>
                                                                {highlight}
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                ))}
                                            </Grid>
                                        </Paper>
                                    )}
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    {/* Specifications */}
                                    <Paper sx={{
                                        p: 3,
                                        borderRadius: 3,
                                        border: '1px solid rgba(0,0,0,0.04)',
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
                                    }}>
                                        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, fontWeight: 700, color: '#1e293b' }}>
                                            <Assignment sx={{ color: '#9333ea' }} /> Technical Specs
                                        </Typography>
                                        <Stack spacing={2.5}>
                                            <Box>
                                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                    Product ID
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', fontFamily: 'monospace' }}>
                                                    #{product._id.toUpperCase()}
                                                </Typography>
                                            </Box>
                                            <Divider />

                                            <Box>
                                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                    Last Updated
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                                    {formatDate(product.updatedAt)}
                                                </Typography>
                                            </Box>
                                            <Divider />

                                            {/* Colors */}
                                            {product.colors && product.colors.length > 0 && (
                                                <Box>
                                                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 1, display: 'block' }}>
                                                        Available Colors
                                                    </Typography>
                                                    <Stack direction="row" spacing={1.5} flexWrap="wrap" gap={1}>
                                                        {product.colors.map((color, index) => (
                                                            <Tooltip key={index} title={color.name}>
                                                                <Box className={color.class}
                                                                    sx={{
                                                                        width: 28,
                                                                        height: 28,
                                                                        borderRadius: '50%',
                                                                        border: '2.5px solid #fff',
                                                                        boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
                                                                        cursor: 'pointer',
                                                                        transition: 'all 0.2s ease',
                                                                        '&:hover': {
                                                                            transform: 'scale(1.2)',
                                                                            boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
                                                                        }
                                                                    }}
                                                                />
                                                            </Tooltip>
                                                        ))}
                                                    </Stack>
                                                </Box>
                                            )}
                                            {product.colors && product.colors.length > 0 && <Divider />}

                                            {/* Sizes */}
                                            {product.sizes && product.sizes.length > 0 && (
                                                <Box>
                                                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 1, display: 'block' }}>
                                                        Available Sizes
                                                    </Typography>
                                                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                                                        {product.sizes.map((size, index) => (
                                                            <Chip
                                                                key={index}
                                                                label={size.name}
                                                                size="small"
                                                                sx={{
                                                                    bgcolor: size.inStock ? '#eff6ff' : '#f1f5f9',
                                                                    color: size.inStock ? '#2563eb' : '#94a3b8',
                                                                    border: size.inStock ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                                                                    fontWeight: 600,
                                                                    textDecoration: size.inStock ? 'none' : 'line-through',
                                                                    transition: 'all 0.2s',
                                                                    '&:hover': size.inStock ? {
                                                                        bgcolor: '#dbeafe',
                                                                        transform: 'translateY(-1px)'
                                                                    } : {}
                                                                }}
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
                                    <Grid container>
                                        <Grid item xs={6} sm={4} md={3}>
                                            <Paper sx={{
                                                borderRadius: 2,
                                                overflow: 'hidden',
                                                transition: 'transform 0.2s',
                                                '&:hover': { transform: 'translateY(-4px)' }
                                            }}>
                                                <Box
                                                    component="img"
                                                    src={product.image ? (product.image.startsWith('http') ? product.image : `${API_URL.replace('/api', '')}${product.image}`) : 'https://via.placeholder.com/300'}
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
                                                        src={img.src ? (img.src.startsWith('http') ? img.src : `${API_URL.replace('/api', '')}${img.src}`) : 'https://via.placeholder.com/300'}
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
                            <Grid container spacing={3}>
                                {/* Reviews Summary */}
                                <Grid item xs={12} md={4}>
                                    <Paper sx={{ p: 3, borderRadius: 2, textAlign: 'center', height: '100%' }}>
                                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                            Rating Summary
                                        </Typography>
                                        <Typography variant="h2" sx={{ fontWeight: 700, color: '#FFB020', my: 1 }}>
                                            {product.rating?.average?.toFixed(1) || '0.0'}
                                        </Typography>
                                        <Rating
                                            value={product.rating?.average || 0}
                                            precision={0.5}
                                            readOnly
                                            sx={{ mb: 1 }}
                                        />
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            Based on {product.rating?.count || product.ratingCount || 0} ratings ({product.rating?.reviewCount || product.reviewCount || 0} written reviews)
                                        </Typography>

                                        {product.rating?.breakdown && (
                                            <Box sx={{ mt: 3, textAlign: 'left' }}>
                                                {[5, 4, 3, 2, 1].map((stars) => {
                                                    const count = product.rating.breakdown[stars] || 0;
                                                    const total = product.rating.count || 1;
                                                    const percentage = Math.round((count / total) * 100);
                                                    return (
                                                        <Box key={stars} sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                                                            <Typography variant="body2" sx={{ width: 15, fontWeight: 'medium' }}>
                                                                {stars}
                                                            </Typography>
                                                            <Star sx={{ color: '#FFB020', fontSize: 16 }} />
                                                            <Box sx={{ flexGrow: 1, mx: 1, bgcolor: '#e0e0e0', height: 8, borderRadius: 4, overflow: 'hidden' }}>
                                                                <Box sx={{ bgcolor: '#FFB020', height: '100%', width: `${percentage}%` }} />
                                                            </Box>
                                                            <Typography variant="body2" color="text.secondary" sx={{ width: 35, textAlign: 'right' }}>
                                                                {count}
                                                            </Typography>
                                                        </Box>
                                                    );
                                                })}
                                            </Box>
                                        )}
                                    </Paper>
                                </Grid>

                                {/* Reviews List */}
                                <Grid item xs={12} md={8}>
                                    <Paper sx={{ p: 3, borderRadius: 2, maxHeight: '55vh', overflowY: 'auto' }}>
                                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, fontWeight: 600 }}>
                                            <Star sx={{ color: '#FFB020' }} /> Customer Ratings & Reviews ({product.rating?.count || product.reviews?.length || 0})
                                        </Typography>

                                        {!product.reviews || product.reviews.length === 0 ? (
                                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                                <Typography variant="body1" color="text.secondary">
                                                    No ratings or reviews yet for this product.
                                                </Typography>
                                            </Box>
                                        ) : (
                                            <Stack spacing={3}>
                                                {product.reviews.map((review, idx) => (
                                                    <Box key={review._id || idx}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                                <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, fontSize: '0.875rem' }}>
                                                                    {review.name ? review.name.charAt(0).toUpperCase() : 'A'}
                                                                </Avatar>
                                                                <Box>
                                                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                                        {review.name || 'Anonymous'}
                                                                    </Typography>
                                                                    <Rating
                                                                        value={review.rating}
                                                                        size="small"
                                                                        readOnly
                                                                    />
                                                                </Box>
                                                            </Box>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {formatDate(review.date)}
                                                            </Typography>
                                                        </Box>
                                                        <Typography variant="body2" color={review.comment ? "text.primary" : "text.secondary"} sx={{ pl: 6.5, fontStyle: review.comment ? 'normal' : 'italic' }}>
                                                            {review.comment || "⭐ Star rating only (no written comment)."}
                                                        </Typography>
                                                        {idx < product.reviews.length - 1 && <Divider sx={{ mt: 2 }} />}
                                                    </Box>
                                                ))}
                                            </Stack>
                                        )}
                                    </Paper>
                                </Grid>
                            </Grid>
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