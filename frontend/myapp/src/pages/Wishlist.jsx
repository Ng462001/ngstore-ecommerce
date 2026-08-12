import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Box,
  Typography,
  Grid,
  Button,
  Paper,
  Chip,
} from '@mui/material'
import {
  Favorite as FavoriteIcon,
  ShoppingCart as ShoppingCartIcon,
  ArrowForward as ArrowForwardIcon,
  ShoppingBag as ShoppingBagIcon,
  ClearAll as ClearAllIcon
} from '@mui/icons-material'
import { removeFromWishlist, addProduct, clearWishlist, setWishlist } from '../Redux/action/action'
import { toast } from 'react-hot-toast'
import ProductCard from '../components/ProductCard'

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
    <Box sx={{ bgcolor: '#FAF9F6', minHeight: '80vh', py: 6 }}>
      <Container maxWidth="lg">
        {/* Page Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 5,
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <FavoriteIcon sx={{ fontSize: 36, color: '#B8925A' }} />
            <Typography variant="h4" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, color: '#1C1B19' }}>
              My Wishlist
            </Typography>
            <Chip
              label={`${wishlistItems.length} ${wishlistItems.length === 1 ? 'item' : 'items'}`}
              size="medium"
              sx={{ fontWeight: 600, borderRadius: '10px', bgcolor: '#B8925A', color: 'white' }}
            />
          </Box>

          {wishlistItems.length > 0 && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<ClearAllIcon />}
              onClick={handleClearWishlist}
              sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600, borderColor: '#B3413B', color: '#B3413B' }}
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
              borderRadius: '24px',
              bgcolor: '#FFFFFF',
              border: '1px solid #E7E4DD',
              boxShadow: '0 4px 20px -2px rgba(28, 27, 25, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 12
            }}
          >
            <Box
              sx={{
                width: 90,
                height: 90,
                borderRadius: '50%',
                bgcolor: '#F7F3EC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
                border: '1px solid #E7E4DD'
              }}
            >
              <FavoriteIcon sx={{ fontSize: 44, color: '#B8925A' }} />
            </Box>
            <Typography variant="h5" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, color: '#1C1B19', mb: 1 }}>
              Your Wishlist is Empty
            </Typography>
            <Typography variant="body1" sx={{ color: '#6B6862', maxWidth: 450, mb: 4, fontSize: '0.95rem' }}>
              Explore our store and save products you love to your wishlist to view or purchase them anytime!
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<ShoppingBagIcon />}
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/store')}
              sx={{
                borderRadius: '14px',
                px: 4,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                bgcolor: '#B8925A',
                boxShadow: '0 4px 14px rgba(184, 146, 90, 0.25)',
                '&:hover': {
                  bgcolor: '#9E7B47'
                }
              }}
            >
              Explore Products
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {wishlistItems.map((item) => {
              const productId = item._id || item.id
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={productId}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <ProductCard item={item} />
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<ShoppingCartIcon />}
                      onClick={() => handleAddToCart(item)}
                      sx={{
                        borderRadius: '12px',
                        py: 1.2,
                        fontWeight: 600,
                        textTransform: 'none',
                        fontSize: '0.9rem',
                        bgcolor: '#B8925A',
                        boxShadow: '0 2px 8px rgba(184, 146, 90, 0.2)',
                        '&:hover': { bgcolor: '#9E7B47' }
                      }}
                    >
                      Add to Cart
                    </Button>
                  </Box>
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
