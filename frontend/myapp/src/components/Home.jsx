import React, { useState, useEffect, useRef } from 'react'
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
  Chip,
  Rating,
  IconButton,
  Skeleton,
  Fab,
  Fade,
  Zoom,
  Slide,
  Grow,
  useTheme,
  useMediaQuery,
  alpha,
  Avatar,
  Badge,
  Paper,
  Divider,
  Tooltip,
  Stack,
  Tabs,
  Tab,
  InputBase,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  InputAdornment,
  Pagination,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Slider,
  Drawer
} from '@mui/material'
import {
  ShoppingCart as ShoppingCartIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  ArrowForward as ArrowForwardIcon,
  LocalShipping as ShippingIcon,
  Shield as ShieldIcon,
  Replay as ReturnIcon,
  SupportAgent as SupportIcon,
  Discount as DiscountIcon,
  Whatshot as HotIcon,
  NewReleases as NewIcon,
  Verified as VerifiedIcon,
  ChevronRight as ChevronRightIcon,
  FlashOn as FlashIcon,
  Bolt as BoltIcon,
  Timer as TimerIcon,
  LocalOffer as OfferIcon,
  Category as CategoryIcon,
  Search as SearchIcon,
  Computer as ComputerIcon,
  PhoneAndroid as PhoneIcon,
  Watch as WatchIcon,
  Headphones as HeadphonesIcon,
  Kitchen as KitchenIcon,
  CheckCircle as CheckCircleIcon,
  StarBorder as StarBorderIcon,
  Sell as SellIcon,
  Campaign as CampaignIcon,
  Groups as GroupsIcon,
  Diamond as DiamondIcon,
  EmojiEvents as EmojiEventsIcon,
  Security as SecurityIcon,
  AccountCircle as AccountCircleIcon,
  Store as StoreIcon,
  MenuBook as MenuBookIcon,
  SportsEsports as SportsEsportsIcon,
  DirectionsCar as DirectionsCarIcon,
  Chair as ChairIcon,
  FitnessCenter as FitnessCenterIcon,
  Spa as SpaIcon,
  Restaurant as RestaurantIcon,
  CardGiftcard as CardGiftcardIcon,
  ConfirmationNumber as ConfirmationNumberIcon,
  ShoppingBag as ShoppingBagIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  YouTube as YouTubeIcon,
  LinkedIn as LinkedInIcon,
  Pinterest as PinterestIcon,
  East as EastIcon,
  ArrowBackIosNew as ArrowBackIosNewIcon,
  ArrowForwardIos as ArrowForwardIosIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  GridView as GridViewIcon,
  ViewList as ViewListIcon,
  CompareArrows as CompareArrowsIcon,
  Visibility as VisibilityIcon,
  Share as ShareIcon,
  Paid as PaidIcon,
  WorkspacePremium as WorkspacePremiumIcon,
  Celebration as CelebrationIcon,
  ThumbUp as ThumbUpIcon,
  AutoAwesome as AutoAwesomeIcon,
  LocalFireDepartment as FireIcon,
  Inventory as InventoryIcon,
  Check as CheckIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
  PlayCircle as PlayCircleIcon,
  Close,
  Clear,
} from '@mui/icons-material'
import Carousel from '../carsouel/Carousel'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { keyframes } from '@mui/system'
import { addProduct } from '../Redux/action/action'

// Animation keyframes

const pulseAnimation = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 87, 34, 0.7); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(255, 87, 34, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 87, 34, 0); }
`


const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`

const Home = () => {

  const [allProducts, setAllProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState(new Set())

  // New filter states
  const [page, setPage] = useState(1)
  const itemsPerPage = 1
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const categories = [
    { id: 'electronic device', name: 'Electronic Device', icon: <ComputerIcon />, color: '#2196F3', bgColor: '#E3F2FD' },
    { id: 'mobile', name: 'Mobile', icon: <PhoneIcon />, color: '#4CAF50', bgColor: '#E8F5E9' },
    { id: 'cloths', name: 'Cloths', icon: <AccountCircleIcon />, color: '#FF4081', bgColor: '#FCE4EC' },
    { id: 'home', name: 'Home & Living', icon: <ChairIcon />, color: '#FF9800', bgColor: '#FFF3E0' },
    { id: 'accessories', name: 'Accessories', icon: <WatchIcon />, color: '#9C27B0', bgColor: '#F3E5F5' },
    { id: 'sports', name: 'Sports', icon: <FitnessCenterIcon />, color: '#00BCD4', bgColor: '#E0F7FA' },
    { id: 'men', name: 'Men', icon: <ShoppingBagIcon />, color: '#3F51B5', bgColor: '#E8EAF6' },
    { id: 'women', name: 'Women', icon: <SpaIcon />, color: '#E91E63', bgColor: '#FCE4EC' },
  ]


  useEffect(() => {
    fetchTopProducts()
    // Timer for flash sale
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newSeconds = prev.seconds - 1
        if (newSeconds < 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        }
        if (prev.minutes < 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 }
        }
        return { ...prev, seconds: newSeconds }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const fetchTopProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products?limit=50`)
      const result = await response.json()
      if (result.success && result.data) {
        setAllProducts(result.data)
      }
    } catch (error) {
      console.error('Error fetching top products:', error)
      toast.error('Failed to load products')
    } finally {
      setTimeout(() => setLoading(false), 1000)
    }
  }

  const handleAddToCart = (product) => {
    const cartItem = {
      _id: product._id,
      cartId: `${product._id}-no-color-no-size`,
      name: product.name,
      price: product.discountedPrice || product.price,
      discountedPrice: product.discountedPrice,
      image: product.image || product.images?.[0]?.src,
      quantity: 1,
      selectedColor: null,
      selectedSize: null,
    }
    dispatch(addProduct(cartItem))
    toast.success('Added to cart! 🛒', {
      position: "bottom-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      theme: "light",
    })
  }

  const toggleFavorite = (productId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId)
        toast.info('Removed from favorites 💔', {
          position: "bottom-right",
          autoClose: 1500,
        })
      } else {
        newFavorites.add(productId)
        toast.success('Added to favorites ❤️', {
          position: "bottom-right",
          autoClose: 1500,
        })
      }
      return newFavorites
    })
  }

  const getProductImage = (product) => {
    const src = product.image || product.images?.[0]?.src
    if (!src) return ''
    return src.startsWith('http') ? src : `${import.meta.env.VITE_API_URL}${src}`
  }

  // Pagination
  const totalPages = Math.ceil(allProducts.length / itemsPerPage)
  const paginatedProducts = allProducts.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  )

  const ProductSkeleton = () => (
    <Grid item xs={6} sm={4} md={3} lg={3}>
      <Card sx={{
        height: '100%',
        borderRadius: 2,
        overflow: 'hidden',
        position: 'relative',
        animation: `${fadeIn} 0.3s ease`,
      }}>
        <Skeleton
          variant="rectangular"
          height={180}
          sx={{
            borderRadius: '12px 12px 0 0',
            bgcolor: 'grey.200'
          }}
        />
        <CardContent sx={{ p: 2 }}>
          <Skeleton variant="text" height={20} sx={{ borderRadius: 1, bgcolor: 'grey.200' }} />
          <Skeleton variant="text" height={16} width="70%" sx={{ borderRadius: 1, bgcolor: 'grey.200', mt: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Skeleton variant="text" height={24} width="40%" sx={{ borderRadius: 1, bgcolor: 'grey.200' }} />
            <Skeleton variant="circular" width={24} height={24} sx={{ bgcolor: 'grey.200' }} />
          </Box>
        </CardContent>
      </Card>
    </Grid>
  )

  return (
    <Box sx={{
      bgcolor: '#F8F9FA',
      overflow: 'hidden'
    }}>
      {/* Hero Carousel */}
      <Container maxWidth="lg" sx={{ my: 3 }}>
        <Carousel />
      </Container>

      {/* Categories Section */}
      <Container maxWidth="lg" sx={{ mb: 4 }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3
        }}>
          <Typography variant="h5" sx={{
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: 'text.primary'
          }}>
            <CategoryIcon sx={{ color: 'primary.main' }} />
            Shop by Categories
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {categories.map((category) => (
            <Grid item xs={6} sm={3} md={3} key={category.id}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  textAlign: 'center',
                  bgcolor: category.bgColor,
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: '2px solid transparent',
                  height: '100%',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                    borderColor: category.color
                  }
                }}
                onClick={() => navigate(`/category/${category.id}`)}
              >
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    mx: 'auto',
                    mb: 2,
                    bgcolor: category.color,
                    color: 'white',
                    fontSize: 24
                  }}
                >
                  {category.icon}
                </Avatar>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {category.name}
                </Typography>
                {category.items && (
                  <Typography variant="caption" color="text.secondary">
                    {category.items} items
                  </Typography>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* All Products Section with Filters */}
      <Container maxWidth="lg" sx={{ mb: 4 }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Products
          </Typography>
        </Box>

        {/* Products Grid */}
        {loading ? (
          <Grid container spacing={2}>
            {[...Array(4)].map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </Grid>
        ) : paginatedProducts.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
            <Typography variant="h6" color="text.secondary">
              No products found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your filters or search terms
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {paginatedProducts.map((product) => (
              <Grid item xs={6} sm={4} md={3} lg={3} key={product._id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                    bgcolor: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                      '& .quick-actions': {
                        opacity: 1,
                      }
                    }
                  }}
                >
                  {/* Badges */}
                  <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 2 }}>
                    {product.discount > 0 && (
                      <Chip
                        label={`${product.discount}% OFF`}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          bgcolor: '#FF5252',
                          color: 'white',
                          mb: 0.5
                        }}
                      />
                    )}
                    {product.quantity < 5 && product.quantity > 0 && (
                      <Chip
                        label="Low Stock"
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          bgcolor: '#FF9800',
                          color: 'white'
                        }}
                      />
                    )}
                  </Box>

                  {/* Quick Actions */}
                  <Box
                    className="quick-actions"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      zIndex: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.5,
                      opacity: 0,
                      transition: 'opacity 0.3s ease'
                    }}
                  >
                    <IconButton
                      size="small"
                      sx={{
                        bgcolor: 'white',
                        boxShadow: 1,
                        '&:hover': { bgcolor: '#FFEBEE' },
                        width: 28,
                        height: 28
                      }}
                      onClick={() => toggleFavorite(product._id)}
                    >
                      {favorites.has(product._id) ? (
                        <FavoriteIcon sx={{ fontSize: 16, color: '#FF5252' }} />
                      ) : (
                        <FavoriteBorderIcon sx={{ fontSize: 16 }} />
                      )}
                    </IconButton>
                    <IconButton
                      size="small"
                      sx={{
                        bgcolor: 'white',
                        boxShadow: 1,
                        '&:hover': { bgcolor: '#E3F2FD' },
                        width: 28,
                        height: 28
                      }}
                      onClick={() => navigate(`/product/${product._id}`)}
                    >
                      <VisibilityIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>

                  {/* Image */}
                  <Box
                    sx={{
                      height: 220,
                      overflow: 'hidden',
                      bgcolor: '#F8F9FA',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      p: 1
                    }}
                    onClick={() => navigate(`/product/${product._id}`)}
                  >
                    <CardMedia
                      component="img"
                      image={getProductImage(product)}
                      alt={product.name}
                      sx={{
                        height: '100%',
                        maxWidth: '100%',
                        objectFit: 'contain',
                        transition: 'transform 0.3s ease',
                        '&:hover': { transform: 'scale(1.05)' }
                      }}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x300?text=No+Image'
                      }}
                    />
                  </Box>

                  {/* Content */}
                  <CardContent sx={{ p: 1.5, flexGrow: 1 }}>
                    {product.category && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'primary.main',
                          fontWeight: 600,
                          display: 'block',
                          mb: 0.5
                        }}
                      >
                        {product.category}
                      </Typography>
                    )}
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        minHeight: '2.4em',
                        cursor: 'pointer',
                        '&:hover': { color: 'primary.main' }
                      }}
                      onClick={() => navigate(`/product/${product._id}`)}
                    >
                      {product.name}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, mb: 1 }}>
                      {product?.rating && product?.rating?.count > 0 &&
                        <>
                          <Rating
                            value={product.rating?.average || 0}
                            precision={0.1}
                            size="small"
                            readOnly
                            sx={{ '& .MuiRating-icon': { fontSize: 14 } }}
                          />
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                            ({product.rating?.count || 0})
                          </Typography>
                        </>
                      }
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                        ₹{(product.discountedPrice || product.price)?.toLocaleString()}
                      </Typography>
                      {product.discount > 0 && (
                        <Typography variant="caption" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                          ₹{product.price?.toLocaleString()}
                        </Typography>
                      )}
                    </Box>
                  </CardContent>

                  {/* Actions */}
                  <CardActions sx={{ p: 1.5, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      size="small"
                      startIcon={<ShoppingCartIcon sx={{ fontSize: 18 }} />}
                      onClick={() => handleAddToCart(product)}
                      disabled={product.quantity === 0}
                      sx={{
                        borderRadius: 1.5,
                        py: 0.8,
                        fontWeight: 600,
                        textTransform: 'none',
                        fontSize: '0.8rem',
                        bgcolor: product.quantity === 0 ? 'grey.300' : 'primary.main'
                      }}
                    >
                      {product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
            />
          </Box>
        )}

      </Container>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            bgcolor: 'white',
            backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.1)'
          }} />

          <Typography variant="h4" sx={{ fontWeight: 800, mb: 4, textAlign: 'center', position: 'relative' }}>
            Why Shop With Us?
          </Typography>

          <Grid container spacing={3}>
            {[
              {
                icon: <WorkspacePremiumIcon sx={{ fontSize: 40 }} />,
                title: 'Premium Quality',
                desc: '100% authentic products with warranty'
              },
              {
                icon: <SecurityIcon sx={{ fontSize: 40 }} />,
                title: 'Secure Payment',
                desc: '256-bit SSL encrypted transactions'
              },
              {
                icon: <SupportIcon sx={{ fontSize: 40 }} />,
                title: '24/7 Support',
                desc: 'Round-the-clock customer service'
              },
              {
                icon: <ShippingIcon sx={{ fontSize: 40 }} />,
                title: 'Fast Delivery',
                desc: 'Same day delivery in select cities'
              },
              {
                icon: <ReturnIcon sx={{ fontSize: 40 }} />,
                title: 'Easy Returns',
                desc: '30-day return policy'
              },
              {
                icon: <ThumbUpIcon sx={{ fontSize: 40 }} />,
                title: 'Best Price',
                desc: 'Price match guarantee'
              }
            ].map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Box sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  textAlign: 'center',
                  height: '100%',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    bgcolor: 'rgba(255,255,255,0.2)'
                  }
                }}>
                  <Box sx={{ mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {feature.desc}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>

      {/* Floating Actions */}
      {!isMobile && (
        <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Tooltip title="Back to Top" arrow>
            <Fab
              color="primary"
              sx={{
                animation: `${pulseAnimation} 2s infinite`,
                bgcolor: 'primary.main',
                '&:hover': { bgcolor: 'primary.dark' }
              }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <ArrowForwardIcon sx={{ transform: 'rotate(-90deg)' }} />
            </Fab>
          </Tooltip>
        </Box>
      )}
    </Box>
  )
}

export default Home