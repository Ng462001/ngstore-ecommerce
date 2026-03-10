import React, { useState, useEffect } from 'react';
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
    Divider,
    Alert,
    LinearProgress,
    Fade,
    Zoom,
    Tooltip,
    Avatar,
    Card,
    CardContent,
    Stepper,
    Step,
    StepLabel,
    StepConnector,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Tab,
    Tabs
} from '@mui/material';
import {
    Close,
    CloudUpload,
    Add,
    Delete,
    Inventory,
    Category,
    LocalOffer,
    PhotoLibrary,
    ColorLens,
    Straighten,
    Style,
    CheckCircle,
    Warning,
    Info,
    TrendingUp,
    Star,
    AttachMoney,
    Discount,
    Save,
    Edit,
    ShoppingBag,
    Receipt,
    TrackChanges,
    AccountCircle,
    Security,
    Block,
    Person,
    Email,
    Phone,
    LocationOn,
    CalendarToday,
    Payment,
    VerifiedUser,
    Mail,
    LocalShipping,
    Home,
    ArrowBack,
    Download,
    Print,
    Grade,
    History,
    Favorite
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

// Styled components (matching CustomerDetailsModal style)
const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: 16,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
    background: 'white',
    borderBottom: '1px solid rgba(0,0,0,0.08)',
    padding: theme.spacing(2, 3),
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
    background: '#f8fafc',
    padding: theme.spacing(3),
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
    background: 'white',
    borderTop: '1px solid rgba(0,0,0,0.08)',
    padding: theme.spacing(2, 3),
}));

const SectionCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: 12,
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    height: '100%',
    '&:hover': {
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    },
}));

const SectionHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    marginBottom: theme.spacing(3),
    '& .MuiSvgIcon-root': {
        color: '#667eea',
        fontSize: 24,
    },
    '& .MuiTypography-root': {
        fontWeight: 600,
        fontSize: '1.1rem',
        color: '#1e293b',
    },
}));

const StyledChip = styled(Chip)(({ theme }) => ({
    borderRadius: 8,
    fontWeight: 500,
    '&.MuiChip-colorPrimary': {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
    },
    '&.MuiChip-colorSuccess': {
        background: '#10b981',
        color: 'white',
    },
    '&.MuiChip-colorWarning': {
        background: '#f59e0b',
        color: 'white',
    },
    '&.MuiChip-colorError': {
        background: '#ef4444',
        color: 'white',
    },
}));

const StatsCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    borderRadius: 12,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    position: 'relative',
    overflow: 'hidden',
    '&::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        right: 0,
        width: '100px',
        height: '100px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '50%',
        transform: 'translate(30px, -30px)',
    },
}));

const ProductAvatar = styled(Avatar)(({ theme }) => ({
    width: 100,
    height: 100,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontSize: '2.5rem',
    border: '4px solid white',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
}));

const InfoItem = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    padding: theme.spacing(1.5),
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    transition: 'background-color 0.2s',
    '&:hover': {
        backgroundColor: '#f1f5f9',
    },
}));

const ImageUploadArea = styled(Box)(({ theme }) => ({
    border: '2px dashed #cbd5e1',
    borderRadius: 12,
    padding: theme.spacing(3),
    textAlign: 'center',
    background: '#f8fafc',
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
        borderColor: '#667eea',
        background: '#f1f5f9',
    },
}));

const ImagePreview = styled(Box)(({ theme }) => ({
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
    '& img': {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transition: 'transform 0.3s',
    },
    '&:hover img': {
        transform: 'scale(1.05)',
    },
    '& .MuiIconButton-root': {
        position: 'absolute',
        top: 4,
        right: 4,
        background: 'rgba(255,255,255,0.9)',
        '&:hover': {
            background: '#fff',
        },
    },
}));

// Main Product Form Modal
const ProductFormModal = ({ open, onClose, product, onSuccess }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [activeSection, setActiveSection] = useState('basic');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        short_description: '',
        details: '',
        price: '',
        originalPrice: '',
        discountedPrice: '',
        discount: 0,
        quantity: '',
        category: '',
        subcategory: '',
        brand: '',
        status: 'active',
        image: null,
        images: [],
        colors: [],
        sizes: [],
        highlights: [],
        tags: [],
    });

    const [imagePreview, setImagePreview] = useState(null);
    const [additionalImages, setAdditionalImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [newHighlight, setNewHighlight] = useState('');
    const [newTag, setNewTag] = useState('');
    const [newColor, setNewColor] = useState('');
    const [newSize, setNewSize] = useState('');

    // Categories that have sizes
    const sizeCategories = ['cloths', 'clothing', 'men', 'women', 'kids', 'sports'];

    // Categories that have colors
    const colorCategories = ['cloths', 'clothing', 'men', 'women', 'kids', 'accessories', 'sports'];

    // Categories that have both sizes and colors
    const variantCategories = ['cloths', 'clothing', 'men', 'women', 'kids', 'sports'];

    const categories = [
        { value: 'electronic device', label: '📱 Electronic Device', icon: '📱' },
        { value: 'mobile', label: '📱 Mobile', icon: '📱' },
        { value: 'electronics', label: '💻 Electronics', icon: '💻' },
        { value: 'cloths', label: '👕 Cloths', icon: '👕' },
        { value: 'clothing', label: '👗 Clothing', icon: '👗' },
        { value: 'men', label: '👔 Men', icon: '👔' },
        { value: 'women', label: '👚 Women', icon: '👚' },
        { value: 'kids', label: '🧒 Kids', icon: '🧒' },
        { value: 'accessories', label: '💍 Accessories', icon: '💍' },
        { value: 'home', label: '🏠 Home & Living', icon: '🏠' },
        { value: 'sports', label: '⚽ Sports', icon: '⚽' },
    ];

    const statusOptions = [
        { value: 'active', label: 'Active', color: '#10b981' },
        { value: 'inactive', label: 'Inactive', color: '#f59e0b' },
        { value: 'out_of_stock', label: 'Out of Stock', color: '#ef4444' },
    ];

    const sizeOptions = ['XXS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];

    const colorPresets = [
        { name: 'Red', class: 'bg-red-500' },
        { name: 'Blue', class: 'bg-blue-500' },
        { name: 'Green', class: 'bg-green-500' },
        { name: 'Black', class: 'bg-black' },
        { name: 'White', class: 'bg-white' },
        { name: 'Yellow', class: 'bg-yellow-400' },
        { name: 'Pink', class: 'bg-pink-400' },
        { name: 'Purple', class: 'bg-purple-500' },
        { name: 'Orange', class: 'bg-orange-400' },
        { name: 'Gray', class: 'bg-gray-500' },
        { name: 'Brown', class: 'bg-amber-800' },
        { name: 'Navy', class: 'bg-blue-900' },
    ];

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                description: product.description || '',
                short_description: product.short_description || '',
                details: product.details || '',
                price: product.price || '',
                originalPrice: product.originalPrice || '',
                discountedPrice: product.discountedPrice || '',
                discount: product.discount || 0,
                quantity: product.quantity || '',
                category: product.category || '',
                subcategory: product.subcategory || '',
                brand: product.brand || '',
                status: product.status || 'active',
                image: null,
                images: product.images || [],
                colors: product.colors || [],
                sizes: product.sizes || [],
                highlights: product.highlights || [],
                tags: product.tags || [],
            });

            if (product.image) {
                const imageUrl = product.image.startsWith('http')
                    ? product.image
                    : `${API_URL.replace('/api', '')}${product.image}`;
                setImagePreview(imageUrl);
            }
        } else {
            resetForm();
        }
    }, [product, open]);

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            short_description: '',
            details: '',
            price: '',
            originalPrice: '',
            discountedPrice: '',
            discount: 0,
            quantity: '',
            category: '',
            subcategory: '',
            brand: '',
            status: 'active',
            image: null,
            images: [],
            colors: [],
            sizes: [],
            highlights: [],
            tags: [],
        });
        setImagePreview(null);
        setAdditionalImages([]);
        setError(null);
        setSuccess(null);
        setActiveTab(0);
        setActiveSection('basic');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCategoryChange = (e) => {
        const newCategory = e.target.value;

        if (!sizeCategories.includes(newCategory)) {
            setFormData(prev => ({ ...prev, sizes: [] }));
        }

        if (!colorCategories.includes(newCategory)) {
            setFormData(prev => ({ ...prev, colors: [] }));
        }

        setFormData(prev => ({ ...prev, category: newCategory }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size should be less than 5MB');
                return;
            }
            setFormData(prev => ({ ...prev, image: file }));
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleAdditionalImagesChange = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(file => file.size <= 5 * 1024 * 1024);

        if (validFiles.length !== files.length) {
            setError('Some images exceeded 5MB limit');
        }

        const newImages = validFiles.map(file => ({
            url: URL.createObjectURL(file),
            file: file
        }));

        setAdditionalImages(prev => [...prev, ...newImages]);
    };

    const removeAdditionalImage = (index) => {
        setAdditionalImages(prev => prev.filter((_, i) => i !== index));
    };

    const addHighlight = () => {
        if (newHighlight.trim()) {
            setFormData(prev => ({
                ...prev,
                highlights: [...prev.highlights, newHighlight.trim()]
            }));
            setNewHighlight('');
        }
    };

    const addTag = () => {
        if (newTag.trim()) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, newTag.trim().toLowerCase()]
            }));
            setNewTag('');
        }
    };

    const addColor = () => {
        if (newColor.trim()) {
            const preset = colorPresets.find(c => c.name.toLowerCase() === newColor.trim().toLowerCase());
            const colorObj = preset
                ? preset
                : { name: newColor.trim(), class: 'bg-gray-500' };

            if (!formData.colors.find(c => c.name.toLowerCase() === colorObj.name.toLowerCase())) {
                setFormData(prev => ({
                    ...prev,
                    colors: [...prev.colors, colorObj]
                }));
            }
            setNewColor('');
        }
    };

    const addSize = () => {
        if (newSize) {
            const sizeObj = { name: newSize, inStock: true };
            if (!formData.sizes.find(s => s.name === newSize)) {
                setFormData(prev => ({
                    ...prev,
                    sizes: [...prev.sizes, sizeObj]
                }));
            }
            setNewSize('');
        }
    };

    const removeItem = (type, index) => {
        setFormData(prev => ({
            ...prev,
            [type]: prev[type].filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Please login to continue');
                return;
            }

            const submitData = new FormData();

            Object.keys(formData).forEach(key => {
                if (key !== 'image' && key !== 'images' && key !== 'colors' && key !== 'sizes' && key !== 'highlights' && key !== 'tags') {
                    submitData.append(key, formData[key] || '');
                }
            });

            submitData.append('colors', JSON.stringify(formData.colors));
            submitData.append('sizes', JSON.stringify(formData.sizes));
            submitData.append('highlights', JSON.stringify(formData.highlights));
            submitData.append('tags', JSON.stringify(formData.tags));

            if (formData.image instanceof File) {
                submitData.append('image', formData.image);
            }

            if (additionalImages.length > 0) {
                additionalImages.forEach(img => {
                    if (img.file) {
                        submitData.append('images', img.file);
                    }
                });
            }

            if (product && formData.images.length > 0) {
                submitData.append('existingImages', JSON.stringify(formData.images));
            }

            const response = product
                ? await axios.put(`${API_URL}/products/${product._id}`, submitData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                })
                : await axios.post(`${API_URL}/products`, submitData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });

            if (response.data.success) {
                setSuccess(product ? 'Product updated successfully!' : 'Product added successfully!');
                setTimeout(() => {
                    if (onSuccess) onSuccess();
                    onClose();
                }, 1500);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const QuickStats = () => (
        <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={3}>
                <StatsCard>
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                        <Typography variant="caption" sx={{ opacity: 0.9 }}>Stock Quantity</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                            {formData.quantity || 0}
                        </Typography>
                        <Inventory sx={{ position: 'absolute', bottom: 0, right: 0, opacity: 0.3, fontSize: 40 }} />
                    </Box>
                </StatsCard>
            </Grid>
            <Grid item xs={12} md={3}>
                <StatsCard sx={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                        <Typography variant="caption" sx={{ opacity: 0.9 }}>Selling Price</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                            ₹{formData.discountedPrice || formData.price || 0}
                        </Typography>
                        <AttachMoney sx={{ position: 'absolute', bottom: 0, right: 0, opacity: 0.3, fontSize: 40 }} />
                    </Box>
                </StatsCard>
            </Grid>
            <Grid item xs={12} md={3}>
                <StatsCard sx={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                        <Typography variant="caption" sx={{ opacity: 0.9 }}>MRP</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                            ₹{formData.originalPrice || 0}
                        </Typography>
                        <LocalOffer sx={{ position: 'absolute', bottom: 0, right: 0, opacity: 0.3, fontSize: 40 }} />
                    </Box>
                </StatsCard>
            </Grid>
            <Grid item xs={12} md={3}>
                <StatsCard sx={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                        <Typography variant="caption" sx={{ opacity: 0.9 }}>Discount</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                            {formData.discount || 0}%
                        </Typography>
                        <Discount sx={{ position: 'absolute', bottom: 0, right: 0, opacity: 0.3, fontSize: 40 }} />
                    </Box>
                </StatsCard>
            </Grid>
        </Grid>
    );

    const renderBasicInfo = () => (
        <Zoom in>
            <SectionCard>
                <SectionHeader>
                    <Info />
                    <Typography>Basic Information</Typography>
                </SectionHeader>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            required
                            label="Product Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            variant="outlined"
                            placeholder="e.g., iPhone 13 Pro Max"
                            InputProps={{
                                sx: { borderRadius: 2 }
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Brand"
                            name="brand"
                            value={formData.brand}
                            onChange={handleChange}
                            placeholder="e.g., Apple, Nike"
                            InputProps={{
                                sx: { borderRadius: 2 }
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel>Category *</InputLabel>
                            <Select
                                name="category"
                                value={formData.category}
                                onChange={handleCategoryChange}
                                label="Category *"
                                required
                                sx={{ borderRadius: 2 }}
                            >
                                {categories.map((cat) => (
                                    <MenuItem key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            required
                            multiline
                            rows={3}
                            label="Description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Detailed description of the product..."
                            InputProps={{
                                sx: { borderRadius: 2 }
                            }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            multiline
                            rows={2}
                            label="Short Description"
                            name="short_description"
                            value={formData.short_description}
                            onChange={handleChange}
                            placeholder="Brief summary for product listings"
                            InputProps={{
                                sx: { borderRadius: 2 }
                            }}
                        />
                    </Grid>
                </Grid>
            </SectionCard>
        </Zoom>
    );

    const renderPricing = () => (
        <Zoom in>
            <SectionCard>
                <SectionHeader>
                    <LocalOffer />
                    <Typography>Pricing & Inventory</Typography>
                </SectionHeader>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            required
                            type="number"
                            label="MRP"
                            name="originalPrice"
                            value={formData.originalPrice}
                            onChange={handleChange}
                            InputProps={{
                                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                sx: { borderRadius: 2 }
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Selling Price"
                            name="discountedPrice"
                            value={formData.discountedPrice}
                            onChange={handleChange}
                            InputProps={{
                                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                sx: { borderRadius: 2 }
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Discount %"
                            name="discount"
                            value={formData.discount}
                            onChange={handleChange}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                sx: { borderRadius: 2 }
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            required
                            type="number"
                            label="Quantity in Stock"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            InputProps={{
                                sx: { borderRadius: 2 }
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                label="Status"
                                sx={{ borderRadius: 2 }}
                            >
                                {statusOptions.map((status) => (
                                    <MenuItem key={status.value} value={status.value}>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Box sx={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: '50%',
                                                bgcolor: status.color
                                            }} />
                                            {status.label}
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </SectionCard>
        </Zoom>
    );

    const renderMedia = () => (
        <Zoom in>
            <SectionCard>
                <SectionHeader>
                    <PhotoLibrary />
                    <Typography>Product Images</Typography>
                </SectionHeader>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" gutterBottom sx={{ color: '#64748b' }}>
                            Main Image
                        </Typography>
                        <input
                            accept="image/*"
                            type="file"
                            id="main-image"
                            hidden
                            onChange={handleImageChange}
                        />
                        <label htmlFor="main-image">
                            <ImageUploadArea>
                                {imagePreview ? (
                                    <ImagePreview sx={{ height: 200 }}>
                                        <img src={imagePreview} alt="Preview" />
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setImagePreview(null);
                                                setFormData(prev => ({ ...prev, image: null }));
                                            }}
                                        >
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </ImagePreview>
                                ) : (
                                    <Box>
                                        <CloudUpload sx={{ fontSize: 40, color: '#94a3b8', mb: 1 }} />
                                        <Typography variant="body2" color="textSecondary">
                                            Click to upload main image
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            Recommended: 1000x1000px, Max 5MB
                                        </Typography>
                                    </Box>
                                )}
                            </ImageUploadArea>
                        </label>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" gutterBottom sx={{ color: '#64748b' }}>
                            Additional Images
                        </Typography>
                        <input
                            accept="image/*"
                            type="file"
                            id="additional-images"
                            multiple
                            hidden
                            onChange={handleAdditionalImagesChange}
                        />
                        <label htmlFor="additional-images">
                            <ImageUploadArea>
                                <CloudUpload sx={{ fontSize: 40, color: '#94a3b8', mb: 1 }} />
                                <Typography variant="body2" color="textSecondary">
                                    Click to upload multiple images
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    You can select multiple files
                                </Typography>
                            </ImageUploadArea>
                        </label>
                    </Grid>

                    {additionalImages.length > 0 && (
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" gutterBottom sx={{ color: '#64748b', mt: 2 }}>
                                Uploaded Images ({additionalImages.length})
                            </Typography>
                            <Box display="flex" gap={2} flexWrap="wrap">
                                {additionalImages.map((img, index) => (
                                    <ImagePreview key={index} sx={{ width: 100, height: 100 }}>
                                        <img src={img.url} alt={`Additional ${index + 1}`} />
                                        <IconButton
                                            size="small"
                                            onClick={() => removeAdditionalImage(index)}
                                        >
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </ImagePreview>
                                ))}
                            </Box>
                        </Grid>
                    )}
                </Grid>
            </SectionCard>
        </Zoom>
    );

    const renderVariants = () => {
        if (!formData.category) {
            return (
                <Zoom in>
                    <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                        <Info sx={{ fontSize: 48, color: '#94a3b8', mb: 2 }} />
                        <Typography variant="h6" color="textSecondary" gutterBottom>
                            Select a Category First
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Please go to Basic Information and select a category to configure variants.
                        </Typography>
                    </Paper>
                </Zoom>
            );
        }

        const showVariants = variantCategories.includes(formData.category);

        if (!showVariants) {
            return (
                <Zoom in>
                    <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                        <Info sx={{ fontSize: 48, color: '#94a3b8', mb: 2 }} />
                        <Typography variant="h6" color="textSecondary" gutterBottom>
                            No Variants Available
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            The selected category "{categories.find(c => c.value === formData.category)?.label || formData.category}" doesn't support size or color variants.
                        </Typography>
                    </Paper>
                </Zoom>
            );
        }

        return (
            <Zoom in>
                <SectionCard>
                    <SectionHeader>
                        <ColorLens />
                        <Typography>Product Variants</Typography>
                    </SectionHeader>
                    <Grid container spacing={4}>
                        {/* Colors Section */}
                        {colorCategories.includes(formData.category) && (
                            <Grid item xs={12} md={sizeCategories.includes(formData.category) ? 6 : 12}>
                                <Typography variant="subtitle2" gutterBottom sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <ColorLens fontSize="small" /> Colors
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                    <FormControl fullWidth size="small">
                                        <Select
                                            value={newColor}
                                            onChange={(e) => setNewColor(e.target.value)}
                                            displayEmpty
                                            sx={{ borderRadius: 2 }}
                                        >
                                            <MenuItem value="">Select or type color</MenuItem>
                                            {colorPresets.map((c) => (
                                                <MenuItem key={c.name} value={c.name}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Box sx={{
                                                            width: 16,
                                                            height: 16,
                                                            borderRadius: '50%',
                                                            border: '1px solid #ccc',
                                                            bgcolor: c.class.replace('bg-', '')
                                                        }} />
                                                        {c.name}
                                                    </Box>
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <Button
                                        variant="contained"
                                        onClick={addColor}
                                        sx={{
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            borderRadius: 2,
                                            minWidth: '40px'
                                        }}
                                    >
                                        <Add />
                                    </Button>
                                </Box>
                                <Box display="flex" flexWrap="wrap" gap={1}>
                                    {formData.colors.map((color, index) => (
                                        <StyledChip
                                            key={index}
                                            label={typeof color === 'object' ? color.name : color}
                                            onDelete={() => removeItem('colors', index)}
                                            color="primary"
                                            variant="outlined"
                                        />
                                    ))}
                                </Box>
                            </Grid>
                        )}

                        {/* Sizes Section */}
                        {sizeCategories.includes(formData.category) && (
                            <Grid item xs={12} md={colorCategories.includes(formData.category) ? 6 : 12}>
                                <Typography variant="subtitle2" gutterBottom sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Straighten fontSize="small" /> Sizes
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                    <FormControl fullWidth size="small">
                                        <Select
                                            value={newSize}
                                            onChange={(e) => setNewSize(e.target.value)}
                                            displayEmpty
                                            sx={{ borderRadius: 2 }}
                                        >
                                            <MenuItem value="">Select size</MenuItem>
                                            {sizeOptions.map((size) => (
                                                <MenuItem key={size} value={size}>{size}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <Button
                                        variant="contained"
                                        onClick={addSize}
                                        sx={{
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            borderRadius: 2,
                                            minWidth: '40px'
                                        }}
                                    >
                                        <Add />
                                    </Button>
                                </Box>
                                <Box display="flex" flexWrap="wrap" gap={1}>
                                    {formData.sizes.map((size, index) => (
                                        <StyledChip
                                            key={index}
                                            label={typeof size === 'object' ? size.name : size}
                                            onDelete={() => removeItem('sizes', index)}
                                            color="success"
                                            variant="outlined"
                                        />
                                    ))}
                                </Box>
                            </Grid>
                        )}
                    </Grid>
                </SectionCard>
            </Zoom>
        );
    };

    const renderDetails = () => (
        <Zoom in>
            <SectionCard>
                <SectionHeader>
                    <Star />
                    <Typography>Additional Details</Typography>
                </SectionHeader>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" gutterBottom sx={{ color: '#64748b' }}>
                            Product Highlights
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            <TextField
                                fullWidth
                                size="small"
                                value={newHighlight}
                                onChange={(e) => setNewHighlight(e.target.value)}
                                placeholder="Add a highlight"
                                onKeyPress={(e) => e.key === 'Enter' && addHighlight()}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                            <Button
                                variant="contained"
                                onClick={addHighlight}
                                sx={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    borderRadius: 2
                                }}
                            >
                                <Add />
                            </Button>
                        </Box>
                        <Box display="flex" flexWrap="wrap" gap={1}>
                            {formData.highlights.map((highlight, index) => (
                                <StyledChip
                                    key={index}
                                    label={highlight}
                                    onDelete={() => removeItem('highlights', index)}
                                    color="secondary"
                                />
                            ))}
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" gutterBottom sx={{ color: '#64748b' }}>
                            Tags
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            <TextField
                                fullWidth
                                size="small"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                placeholder="Add a tag"
                                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                            <Button
                                variant="contained"
                                onClick={addTag}
                                sx={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    borderRadius: 2
                                }}
                            >
                                <Add />
                            </Button>
                        </Box>
                        <Box display="flex" flexWrap="wrap" gap={1}>
                            {formData.tags.map((tag, index) => (
                                <StyledChip
                                    key={index}
                                    label={tag}
                                    onDelete={() => removeItem('tags', index)}
                                    color="primary"
                                    variant="outlined"
                                />
                            ))}
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Product Details (HTML supported)"
                            name="details"
                            value={formData.details}
                            onChange={handleChange}
                            placeholder="Detailed specifications, features, etc."
                            InputProps={{
                                sx: { borderRadius: 2 }
                            }}
                        />
                    </Grid>
                </Grid>
            </SectionCard>
        </Zoom>
    );

    return (
        <StyledDialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <StyledDialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={2}>
                        <Box sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            {product ? <Style sx={{ color: 'white' }} /> : <Add sx={{ color: 'white' }} />}
                        </Box>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {product ? 'Edit Product' : 'Add New Product'}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                {product ? 'Update product details' : 'Fill in the product information'}
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton onClick={onClose} size="small" sx={{ bgcolor: '#f1f5f9' }}>
                        <Close fontSize="small" />
                    </IconButton>
                </Box>
            </StyledDialogTitle>

            <form onSubmit={handleSubmit}>
                <StyledDialogContent>
                    {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

                    {error && (
                        <Fade in>
                            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
                                {error}
                            </Alert>
                        </Fade>
                    )}

                    {success && (
                        <Fade in>
                            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} icon={<CheckCircle />}>
                                {success}
                            </Alert>
                        </Fade>
                    )}

                    {/* Quick Stats */}
                    {product && <QuickStats />}

                    {/* Navigation Tabs */}
                    <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                        {[
                            { id: 'basic', label: 'Basic Info', icon: <Info /> },
                            { id: 'pricing', label: 'Pricing', icon: <AttachMoney /> },
                            { id: 'media', label: 'Media', icon: <PhotoLibrary /> },
                            { id: 'variants', label: 'Variants', icon: <ColorLens /> },
                            { id: 'details', label: 'Details', icon: <Star /> }
                        ].map((section) => (
                            <Button
                                key={section.id}
                                variant={activeSection === section.id ? 'contained' : 'outlined'}
                                onClick={() => setActiveSection(section.id)}
                                startIcon={section.icon}
                                sx={{
                                    borderRadius: 8,
                                    textTransform: 'capitalize',
                                    background: activeSection === section.id ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                                    borderColor: activeSection === section.id ? 'transparent' : '#cbd5e1',
                                    color: activeSection === section.id ? 'white' : '#64748b',
                                    '&:hover': {
                                        background: activeSection === section.id ? 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)' : '#f1f5f9',
                                    }
                                }}
                            >
                                {section.label}
                            </Button>
                        ))}
                    </Box>

                    {/* Section Content */}
                    {activeSection === 'basic' && renderBasicInfo()}
                    {activeSection === 'pricing' && renderPricing()}
                    {activeSection === 'media' && renderMedia()}
                    {activeSection === 'variants' && renderVariants()}
                    {activeSection === 'details' && renderDetails()}
                </StyledDialogContent>

                <StyledDialogActions>
                    <Button
                        onClick={onClose}
                        disabled={loading}
                        sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        startIcon={<Save />}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            px: 4,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                            }
                        }}
                    >
                        {loading ? 'Saving...' : (product ? 'Update Product' : 'Add Product')}
                    </Button>
                </StyledDialogActions>
            </form>
        </StyledDialog>
    );
};

export default ProductFormModal;