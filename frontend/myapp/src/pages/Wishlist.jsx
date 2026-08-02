import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Chip,
  Paper,
  Tooltip,
  Divider
} from '@mui/material'
import {
  Favorite as FavoriteIcon,
  DeleteOutline as DeleteOutlineIcon,
  ShoppingCart as ShoppingCartIcon,
  ArrowForward as ArrowForwardIcon,
  ShoppingBag as ShoppingBagIcon,
  ClearAll as ClearAllIcon
} from '@mui/icons-material'
import { removeFromWishlist, addProduct, clearWishlist, setWishlist } from '../Redux/action/action'
import { toast } from 'react-hot-toast'

const Wishlist = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const wishlistItems = useSelector(state => {
    if (!state) return []
    if (state.productReducer) {
      return state.productReducer.wishlistItems || []
    }
    return state.wishlistItems || []
  })

  const isUserLoggedIn = useSelector(state => {
    if (!state) return false
    if (state.productReducer) {
      return state.productReducer.isUserLoggedIn || false
    }
    return state.isUserLoggedIn || false
  })

  // Fetch synced wishlist from API if user is logged in
  useEffect(() => {
    const fetchUserWishlist = async () => {
      const token = localStorage.getItem('token')
      if (isUserLoggedIn && token) {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/wishlist`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          const data = await response.json()
          if (data.success && data.wishlist) {
            dispatch(setWishlist(data.wishlist))
          }
        } catch (error) {
          console.error('Error fetching API wishlist:', error)
        }
      }
    }
    fetchUserWishlist()
  }, [isUserLoggedIn, dispatch])

  const handleRemoveFromWishlist = async (productId) => {
    dispatch(removeFromWishlist(productId))
    toast.success('Removed from wishlist 💔')

    const token = localStorage.getItem('token')
    if (isUserLoggedIn && token) {
      try {
        await fetch(`${import.meta.env.VITE_API_URL}/api/users/wishlist/${productId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        })
      } catch (err) {
        console.error('Error syncing remove wishlist:', err)
      }
    }
  }

  const handleAddToCart = (product) => {
    const productId = product._id || product.id
    const cartItem = {
      _id: productId,
      cartId: `${productId}-no-color-no-size`,
      name: product.name,
      price: product.discountedPrice || product.price,
      discountedPrice: product.discountedPrice,
      image: product.image || product.images?.[0]?.src,
      quantity: 1,
      selectedColor: null,
      selectedSize: null
    }
    dispatch(addProduct(cartItem))
    toast.success('Moved to cart! 🛒')
  }

  const handleClearWishlist = () => {
    dispatch(clearWishlist())
    toast.success('Wishlist cleared 💔')
  }

  const getProductImage = (product) => {
    const src = product.image || product.images?.[0]?.src
    if (!src) return 'https://via.placeholder.com/300x300?text=No+Image'
    return src.startsWith('http') ? src : `${import.meta.env.VITE_API_URL}${src}`
  }

  return (
    <Box sx={{ bgcolor: '#F8F9FA', minHeight: '80vh', py: 5 }}>
      <Container maxWidth="lg">
        {/* Page Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 4,
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <FavoriteIcon sx={{ fontSize: 36, color: '#FF4081' }} />
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1A202C' }}>
              My Wishlist
            </Typography>
            <Chip
              label={`${wishlistItems.length} ${wishlistItems.length === 1 ? 'item' : 'items'}`}
              color="secondary"
              size="medium"
              sx={{ fontWeight: 700, borderRadius: 2, bgcolor: '#FF4081', color: 'white' }}
            />
          </Box>

          {wishlistItems.length > 0 && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<ClearAllIcon />}
              onClick={handleClearWishlist}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              Clear Wishlist
            </Button>
          )}
        </Box>

        {/* Wishlist Items List */}
        {wishlistItems.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: 4,
              bgcolor: 'white',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 10
            }}
          >
            <Box
              sx={{
                width: 90,
                height: 90,
                borderRadius: '50%',
                bgcolor: '#FCE4EC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3
              }}
            >
              <FavoriteIcon sx={{ fontSize: 48, color: '#FF4081' }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#2D3748', mb: 1 }}>
              Your Wishlist is Empty
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 450, mb: 4 }}>
              Explore our store and save products you love to your wishlist to view or purchase them anytime!
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<ShoppingBagIcon />}
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/store')}
              sx={{
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontWeight: 700,
                textTransform: 'none',
                bgcolor: '#4F46E5',
                background: 'linear-gradient(135deg, #FF4081 0%, #FF4081 100%)',
                boxShadow: '0 8px 20px rgba(79, 70, 229, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #c82e61ff 0%, #d5376cff 100%)'
                }
              }}
            >
              Explore Products
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {wishlistItems.map((item) => {
              const productId = item._id || item.id
              const displayPrice = item.discountedPrice || item.price
              const originalPrice = item.price && item.discountedPrice ? item.price : item.originalPrice

              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={productId}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      bgcolor: 'white',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-6px)',
                        boxShadow: '0 12px 24px rgba(0,0,0,0.12)'
                      }
                    }}
                  >
                    {/* Delete button */}
                    <Tooltip title="Remove from wishlist" arrow>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveFromWishlist(productId)}
                        sx={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          zIndex: 2,
                          bgcolor: 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(4px)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                          color: '#E53E3E',
                          '&:hover': {
                            bgcolor: '#FFF5F5',
                            color: '#C53030'
                          }
                        }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    {/* Image */}
                    <Box
                      sx={{
                        height: 200,
                        overflow: 'hidden',
                        bgcolor: '#F7FAFC',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        p: 2
                      }}
                      onClick={() => navigate(`/product/${productId}`)}
                    >
                      <CardMedia
                        component="img"
                        image={getProductImage(item)}
                        alt={item.name}
                        sx={{
                          height: '100%',
                          maxWidth: '100%',
                          objectFit: 'contain',
                          transition: 'transform 0.3s ease',
                          '&:hover': { transform: 'scale(1.06)' }
                        }}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x300?text=No+Image'
                        }}
                      />
                    </Box>

                    {/* Content */}
                    <CardContent sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      {item.category && (
                        <Typography variant="caption" sx={{ color: '#4F46E5', fontWeight: 700, mb: 0.5 }}>
                          {item.category.toUpperCase()}
                        </Typography>
                      )}

                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 700,
                          lineHeight: 1.3,
                          mb: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          minHeight: '2.6em',
                          cursor: 'pointer',
                          '&:hover': { color: '#4F46E5' }
                        }}
                        onClick={() => navigate(`/product/${productId}`)}
                      >
                        {item.name}
                      </Typography>

                      <Box sx={{ mt: 'auto', pt: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1A202C' }}>
                            ₹{typeof displayPrice === 'number' ? displayPrice.toLocaleString() : displayPrice}
                          </Typography>
                          {originalPrice && originalPrice > displayPrice && (
                            <Typography
                              variant="body2"
                              sx={{ color: '#A0AEC0', textDecoration: 'line-through' }}
                            >
                              ₹{typeof originalPrice === 'number' ? originalPrice.toLocaleString() : originalPrice}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </CardContent>

                    <Divider />

                    {/* Action buttons */}
                    <CardActions sx={{ p: 1.5, gap: 1 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        size="medium"
                        startIcon={<ShoppingCartIcon />}
                        onClick={() => handleAddToCart(item)}
                        sx={{
                          borderRadius: 2,
                          py: 1,
                          fontWeight: 700,
                          textTransform: 'none',
                          bgcolor: '#4F46E5',
                          '&:hover': { bgcolor: '#4338CA' }
                        }}
                      >
                        Add to Cart
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              )
            })}
          </Grid>
        )}
      </Container>
    </Box>
  )
}

export default Wishlist
