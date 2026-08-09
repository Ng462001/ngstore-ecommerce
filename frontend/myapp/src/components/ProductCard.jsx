import React from 'react'
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toggleWishlist } from '../Redux/action/action';
import { toast } from 'react-hot-toast';

const ProductCard = ({ item }) => {
    const dispatch = useDispatch();

    const wishlistItems = useSelector(state => {
        if (!state) return []
        if (state.productReducer) {
            return state.productReducer.wishlistItems || []
        }
        return state.wishlistItems || []
    });

    const isUserLoggedIn = useSelector(state => {
        if (!state) return false
        if (state.productReducer) {
            return state.productReducer.isUserLoggedIn || false
        }
        return state.isUserLoggedIn || false
    });

    const itemId = item._id || item.id;
    const isWishlisted = wishlistItems.some(w => (w._id || w.id) === itemId);

    const handleWishlistToggle = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        dispatch(toggleWishlist(item));

        if (isWishlisted) {
            toast.success('Removed from wishlist 💔');
        } else {
            toast.success('Added to wishlist ❤️');
        }

        const token = localStorage.getItem('token');
        if (isUserLoggedIn && token) {
            try {
                if (isWishlisted) {
                    await fetch(`${import.meta.env.VITE_API_URL}/api/users/wishlist/${itemId}`, {
                        method: 'DELETE',
                        headers: { Authorization: `Bearer ${token}` }
                    });
                } else {
                    await fetch(`${import.meta.env.VITE_API_URL}/api/users/wishlist/${itemId}`, {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${token}` }
                    });
                }
            } catch (err) {
                console.error('Error syncing wishlist:', err);
            }
        }
    };

    // Calculate discount percentage if not provided
    const calculateDiscount = () => {
        if (item.discount) return item.discount;
        if (item.originalPrice && item.discountedPrice) {
            return Math.round(((item.originalPrice - item.discountedPrice) / item.originalPrice) * 100);
        }
        if (item.price && item.discountedPrice) {
            return Math.round(((item.price - item.discountedPrice) / item.price) * 100);
        }
        return null;
    };

    const discountPercentage = calculateDiscount();
    const displayPrice = item.discountedPrice || item.price;
    const originalPrice = item.originalPrice || (item.discountedPrice ? item.price : null);

    return (
        <NavLink to={`/product/${item.id || item._id}`} style={{ textDecoration: 'none', position: 'relative', display: 'block', width: '100%' }}>
            <Card sx={{
                width: '100%',
                maxWidth: { xs: '100%', sm: 280 },
                height: { xs: 370, sm: 400 },
                margin: '0 auto',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                borderRadius: 3,
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                }
            }}>
                {/* Wishlist Heart Icon Button Overlay */}
                <Tooltip title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"} arrow>
                    <IconButton
                        size="small"
                        onClick={handleWishlistToggle}
                        sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            zIndex: 10,
                            bgcolor: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(4px)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            '&:hover': {
                                bgcolor: '#FFF5F5'
                            }
                        }}
                    >
                        {isWishlisted ? (
                            <FavoriteIcon sx={{ fontSize: 18, color: '#FF4081' }} />
                        ) : (
                            <FavoriteBorderIcon sx={{ fontSize: 18, color: '#666' }} />
                        )}
                    </IconButton>
                </Tooltip>

                <CardActionArea sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Fixed size image container with proper cover */}
                    <Box sx={{
                        height: { xs: 190, sm: 230 },
                        width: '100%',
                        overflow: 'hidden',
                        backgroundColor: '#f5f5f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <CardMedia
                            component="img"
                            sx={{
                                height: '100%',
                                width: '100%',
                                objectFit: 'cover', // This ensures image covers the entire area
                                objectPosition: 'center', // Centers the image
                                transition: 'transform 0.3s ease',
                                '&:hover': {
                                    transform: 'scale(1.05)'
                                }
                            }}
                            image={item.image && (item.image.startsWith('http') ? item.image : `${import.meta.env.VITE_API_URL}${item.image}`)}
                            alt={item.name}
                            onError={(e) => {
                                // Fallback to a demo image if the main image fails to load
                                e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=280&h=200&fit=crop';
                            }}
                        />
                    </Box>

                    {/* Card content with consistent spacing */}
                    <CardContent sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        p: 2,
                        '&:last-child': { pb: 2 }
                    }}>
                        {/* Product name with fixed height */}
                        <Typography
                            gutterBottom
                            variant="h6"
                            component="div"
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '1rem',
                                lineHeight: 1.2,
                                height: 40, // Fixed height for title
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical'
                            }}
                        >
                            {item.name || 'Product Name'}
                        </Typography>

                        {/* Description with fixed height */}
                        <Typography
                            variant="body2"
                            sx={{
                                color: 'text.secondary',
                                minHeight: 40, // Fixed height for description
                                maxHeight: 40,
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrienta: 'vertical',
                                mb: 1
                            }}
                        >
                            {item.description || item.short_description || 'Product description goes here'}
                        </Typography>

                        {/* Price section - always at the bottom */}
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mt: 'auto', // Pushes price to bottom
                            pt: 1
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {/* Current price */}
                                <Typography
                                    variant="h6"
                                    sx={{
                                        color: 'primary.main',
                                        fontWeight: 'bold',
                                        fontSize: '1.1rem'
                                    }}
                                >
                                    ₹{typeof displayPrice === 'number' ? displayPrice.toFixed(2) : (displayPrice || '0.00')}
                                </Typography>

                                {/* Original price if discounted */}
                                {originalPrice && originalPrice !== displayPrice && (
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: 'text.secondary',
                                            textDecoration: 'line-through'
                                        }}
                                    >
                                        ₹{typeof originalPrice === 'number' ? originalPrice.toFixed(2) : originalPrice}
                                    </Typography>
                                )}
                            </Box>

                            {/* Discount chip */}
                            {discountPercentage && discountPercentage > 0 && (
                                <Chip
                                    label={`${discountPercentage}% OFF`}
                                    color="error"
                                    size="small"
                                    sx={{
                                        fontSize: '0.75rem',
                                        height: 24
                                    }}
                                />
                            )}
                        </Box>
                    </CardContent>
                </CardActionArea>
            </Card>
        </NavLink>
    )
}

export default ProductCard