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
  ListItemText
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
  PlayCircle as PlayCircleIcon
} from '@mui/icons-material'
import Carousel from '../carsouel/Carousel'
import { useDispatch } from 'react-redux'
import { addProduct } from '../Redux/action/action'
import { toast } from 'react-toastify'
import { keyframes } from '@mui/system'

// Animation keyframes
const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`

const pulseAnimation = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 87, 34, 0.7); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(255, 87, 34, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 87, 34, 0); }
`

const shimmerAnimation = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: 200px 0; }
`

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`

const Home = () => {
  const [topProducts, setTopProducts] = useState([])
  const [trendingProducts, setTrendingProducts] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState(new Set())
  const [hoveredCard, setHoveredCard] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [activeTab, setActiveTab] = useState(0)
  const [viewMode, setViewMode] = useState('grid')
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 15, seconds: 33 })
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))

  // Categories — IDs must exactly match backend Product model enum values:
  // men, women, kids, clothing, accessories, electronics, home, sports, electronic device, mobile, cloths
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

  // Featured brands
  const featuredBrands = [
    { id: 1, name: 'Apple', logo: '🍎', color: '#000000', bgColor: '#F5F5F7' },
    { id: 2, name: 'Samsung', logo: '📱', color: '#1428A0', bgColor: '#E8F0FE' },
    { id: 3, name: 'Nike', logo: '✓', color: '#111111', bgColor: '#F0F0F0' },
    { id: 4, name: 'Sony', logo: 'S', color: '#003791', bgColor: '#E8F0FE' },
    { id: 5, name: 'Adidas', logo: '🏃', color: '#000000', bgColor: '#F0F0F0' },
    { id: 6, name: 'LG', logo: 'LG', color: '#A50034', bgColor: '#FFEBEE' },
  ]

  // Daily deals
  const dailyDeals = [
    { id: 1, title: 'Flash Sale', discount: 'Up to 70% OFF', timeLeft: '02:15:33', color: '#FF5252', icon: <FlashIcon />, bgColor: '#FFEBEE' },
    { id: 2, title: 'Weekend Special', discount: 'Min 50% OFF', timeLeft: '24:00:00', color: '#2196F3', icon: <CelebrationIcon />, bgColor: '#E3F2FD' },
    { id: 3, title: 'Clearance', discount: 'Under ₹999', timeLeft: '12:30:45', color: '#4CAF50', icon: <SellIcon />, bgColor: '#E8F5E9' },
  ]

  // Testimonials
  const testimonials = [
    { id: 1, name: 'Rahul Sharma', rating: 5, text: 'Excellent service and quality products! Delivery was super fast.', avatar: 'R' },
    { id: 2, name: 'Priya Patel', rating: 4.5, text: 'Best shopping experience ever. Great deals and easy returns.', avatar: 'P' },
    { id: 3, name: 'Amit Kumar', rating: 5, text: 'Authentic products at the best prices. Highly recommended!', avatar: 'A' },
    { id: 4, name: 'Sneha Singh', rating: 4, text: 'Customer support is amazing. Solved my issue within minutes.', avatar: 'S' },
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products?limit=16&sort=rating.average&order=desc`)
      const result = await response.json()
      if (result.success && result.data) {
        setTopProducts(result.data)
        setTrendingProducts(result.data.slice(0, 8))
        setNewArrivals(result.data.slice(4, 12))
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
      // cartId is used by the reducer for deduplication
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
          <Button
            endIcon={<EastIcon />}
            sx={{
              color: 'primary.main',
              fontWeight: 600,
              '&:hover': { bgcolor: 'primary.light', color: 'white' }
            }}
            onClick={() => navigate('/categories')}
          >
            View All
          </Button>
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

      {/* Flash Sale Section */}
      <Container maxWidth="lg" sx={{ mb: 4 }}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #FF5252 0%, #FF4081 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.1)'
          }} />

          <Grid container alignItems="center" spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <FlashIcon sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    FLASH SALE
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Limited time offer
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{
                  bgcolor: 'rgba(0,0,0,0.2)',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  textAlign: 'center',
                  minWidth: 60
                }}>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    {timeLeft.hours.toString().padStart(2, '0')}
                  </Typography>
                  <Typography variant="caption">Hours</Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>:</Typography>
                <Box sx={{
                  bgcolor: 'rgba(0,0,0,0.2)',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  textAlign: 'center',
                  minWidth: 60
                }}>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    {timeLeft.minutes.toString().padStart(2, '0')}
                  </Typography>
                  <Typography variant="caption">Minutes</Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>:</Typography>
                <Box sx={{
                  bgcolor: 'rgba(0,0,0,0.2)',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  textAlign: 'center',
                  minWidth: 60
                }}>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    {timeLeft.seconds.toString().padStart(2, '0')}
                  </Typography>
                  <Typography variant="caption">Seconds</Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                {dailyDeals.map((deal) => (
                  <Grid item xs={12} sm={4} key={deal.id}>
                    <Paper
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          bgcolor: 'rgba(255,255,255,0.2)'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        {deal.icon}
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {deal.title}
                        </Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
                        {deal.discount}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        ⏰ Ends in {deal.timeLeft}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      {/* Featured Brands */}
      <Container maxWidth="lg" sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
          <DiamondIcon sx={{ mr: 1, color: 'primary.main' }} />
          Featured Brands
        </Typography>
        <Grid container spacing={2}>
          {featuredBrands.map((brand) => (
            <Grid item xs={4} sm={2} key={brand.id}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  textAlign: 'center',
                  bgcolor: brand.bgColor,
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3
                  }
                }}
              >
                <Typography variant="h4" sx={{ mb: 1, color: brand.color }}>
                  {brand.logo}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: brand.color }}>
                  {brand.name}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Top Products Section */}
      <Container maxWidth="lg" sx={{ mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{
              '& .MuiTab-root': {
                fontWeight: 600,
                fontSize: '1rem',
                textTransform: 'none',
                minHeight: 60
              }
            }}
          >
            <Tab icon={<TrendingUpIcon />} iconPosition="start" label="Trending" />
            <Tab icon={<NewIcon />} iconPosition="start" label="New Arrivals" />
            <Tab icon={<StarIcon />} iconPosition="start" label="Best Sellers" />
            <Tab icon={<DiscountIcon />} iconPosition="start" label="On Sale" />
          </Tabs>
        </Box>

        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            {activeTab === 0 ? '🔥 Trending Now' :
              activeTab === 1 ? '🆕 New Arrivals' :
                activeTab === 2 ? '⭐ Best Sellers' :
                  '💸 On Sale'}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              onClick={() => setViewMode('grid')}
              sx={{
                bgcolor: viewMode === 'grid' ? 'primary.main' : 'transparent',
                color: viewMode === 'grid' ? 'white' : 'text.secondary',
                '&:hover': { bgcolor: 'primary.light' }
              }}
            >
              <GridViewIcon />
            </IconButton>
            <IconButton
              onClick={() => setViewMode('list')}
              sx={{
                bgcolor: viewMode === 'list' ? 'primary.main' : 'transparent',
                color: viewMode === 'list' ? 'white' : 'text.secondary',
                '&:hover': { bgcolor: 'primary.light' }
              }}
            >
              <ViewListIcon />
            </IconButton>
            <Button
              startIcon={<FilterListIcon />}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              Filter
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {(activeTab === 0 ? trendingProducts :
            activeTab === 1 ? newArrivals :
              activeTab === 2 ? topProducts.slice(0, 8) :
                topProducts.filter(p => p.discount > 0)).map((product, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                    <Card
                      elevation={0}
                      onMouseEnter={() => setHoveredCard(product._id)}
                      onMouseLeave={() => setHoveredCard(null)}
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 3,
                        bgcolor: 'white',
                        position: 'relative',
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: 'divider',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          borderColor: 'primary.main',
                          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                          transform: 'translateY(-8px)'
                        }
                      }}
                    >
                      {/* Product Badges */}
                      <Box sx={{ position: 'absolute', top: 12, left: 12, zIndex: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {product.discount > 0 && (
                          <Chip
                            label={`${product.discount}% OFF`}
                            size="small"
                            sx={{
                              height: 24,
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              bgcolor: '#FF5252',
                              color: 'white',
                              boxShadow: 2
                            }}
                          />
                        )}
                        {product.quantity < 10 && (
                          <Chip
                            label="Almost Gone!"
                            size="small"
                            sx={{
                              height: 24,
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              bgcolor: '#FF9800',
                              color: 'white',
                              boxShadow: 2
                            }}
                          />
                        )}
                      </Box>

                      {/* Quick Actions */}
                      <Box sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        zIndex: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        opacity: hoveredCard === product._id ? 1 : 0,
                        transition: 'opacity 0.3s'
                      }}>
                        <Tooltip title="Add to Wishlist">
                          <IconButton
                            size="small"
                            sx={{
                              bgcolor: 'white',
                              boxShadow: 2,
                              '&:hover': { bgcolor: '#FFEBEE', color: '#FF5252' }
                            }}
                            onClick={() => toggleFavorite(product._id)}
                          >
                            {favorites.has(product._id) ? (
                              <FavoriteIcon sx={{ fontSize: 20, color: '#FF5252' }} />
                            ) : (
                              <FavoriteBorderIcon sx={{ fontSize: 20 }} />
                            )}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Quick View">
                          <IconButton
                            size="small"
                            sx={{
                              bgcolor: 'white',
                              boxShadow: 2,
                              '&:hover': { bgcolor: '#E3F2FD', color: '#2196F3' }
                            }}
                            onClick={() => navigate(`/product/${product._id}`)}
                          >
                            <VisibilityIcon sx={{ fontSize: 20 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>

                      {/* Product Image */}
                      <Box
                        sx={{
                          position: 'relative',
                          height: 200,
                          overflow: 'hidden',
                          bgcolor: '#F8F9FA',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                        onClick={() => navigate(`/product/${product._id}`)}
                      >
                        <CardMedia
                          component="img"
                          image={`${import.meta.env.VITE_API_URL}${product.images?.[0]?.src || product.image}`}
                          alt={product.name}
                          sx={{
                            height: '100%',
                            width: 'auto',
                            maxWidth: '100%',
                            objectFit: 'contain',
                            transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                            transform: hoveredCard === product._id ? 'scale(1.1) rotate(1deg)' : 'scale(1)'
                          }}
                        />
                      </Box>

                      {/* Product Info */}
                      <CardContent sx={{ p: 2.5, flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Chip
                            label={product.category || 'General'}
                            size="small"
                            sx={{
                              fontSize: '0.65rem',
                              height: 20,
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: 'primary.main'
                            }}
                          />
                        </Box>

                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 600,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            minHeight: '2.8em',
                            mb: 1,
                            cursor: 'pointer',
                            transition: 'color 0.3s',
                            '&:hover': {
                              color: 'primary.main'
                            }
                          }}
                          onClick={() => navigate(`/product/${product._id}`)}
                        >
                          {product.name}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                          <Rating
                            value={product.rating?.average || 0}
                            precision={0.1}
                            size="small"
                            readOnly
                            sx={{ '& .MuiRating-icon': { fontSize: 18 } }}
                          />
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                            ({product.rating?.count || 0} reviews)
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
                              ₹{product.price?.toLocaleString()}
                            </Typography>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <Typography variant="caption" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                                ₹{product.originalPrice?.toLocaleString()}
                              </Typography>
                            )}
                          </Box>
                          <Chip
                            icon={<ShippingIcon />}
                            label="Free"
                            size="small"
                            sx={{
                              bgcolor: '#E8F5E9',
                              color: '#4CAF50',
                              fontWeight: 600
                            }}
                          />
                        </Box>
                      </CardContent>

                      {/* Action Buttons */}
                      <CardActions sx={{ p: 2.5, pt: 0 }}>
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<ShoppingCartIcon />}
                          onClick={() => handleAddToCart(product)}
                          disabled={product.quantity === 0}
                          sx={{
                            borderRadius: 2,
                            py: 1.2,
                            fontWeight: 700,
                            textTransform: 'none',
                            fontSize: '0.95rem',
                            bgcolor: product.quantity === 0 ? 'grey.300' : 'primary.main',
                            '&:hover': {
                              bgcolor: product.quantity === 0 ? 'grey.300' : 'primary.dark'
                            }
                          }}
                        >
                          {product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
        </Grid>

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="outlined"
            size="large"
            endIcon={<EastIcon />}
            onClick={() => navigate('/products')}
            sx={{
              borderRadius: 3,
              px: 6,
              py: 1.5,
              fontWeight: 700,
              fontSize: '1rem',
              borderWidth: 2,
              '&:hover': {
                borderWidth: 2,
                bgcolor: 'primary.main',
                color: 'white'
              }
            }}
          >
            View All Products
          </Button>
        </Box>
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

      {/* Testimonials */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 4, textAlign: 'center' }}>
          <EmojiEventsIcon sx={{ mr: 1, color: 'primary.main' }} />
          What Our Customers Say
        </Typography>

        <Grid container spacing={3}>
          {testimonials.map((testimonial) => (
            <Grid item xs={12} sm={6} md={3} key={testimonial.id}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: 'white',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    {testimonial.avatar}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {testimonial.name}
                    </Typography>
                    <Rating value={testimonial.rating} size="small" readOnly />
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                  "{testimonial.text}"
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                  <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                  <Typography variant="caption" color="text.secondary">
                    Verified Purchase
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Newsletter Section */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            bgcolor: 'white',
            border: '1px solid',
            borderColor: 'divider',
            textAlign: 'center'
          }}
        >
          <AutoAwesomeIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
            Don't Miss Out!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
            Subscribe to our newsletter and get exclusive deals, new arrivals, and special offers delivered straight to your inbox.
          </Typography>

          <Box sx={{
            display: 'flex',
            gap: 1,
            maxWidth: 500,
            mx: 'auto',
            flexDirection: isMobile ? 'column' : 'row'
          }}>
            <InputBase
              placeholder="Enter your email address"
              sx={{
                flex: 1,
                bgcolor: '#F8F9FA',
                borderRadius: 2,
                px: 2,
                py: 1.2,
                border: '1px solid',
                borderColor: 'divider',
                '&:focus': {
                  borderColor: 'primary.main'
                }
              }}
            />
            <Button
              variant="contained"
              size="large"
              sx={{
                borderRadius: 2,
                px: 4,
                fontWeight: 700,
                bgcolor: 'primary.main',
                '&:hover': {
                  bgcolor: 'primary.dark'
                }
              }}
            >
              Subscribe
            </Button>
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            By subscribing, you agree to our Privacy Policy and consent to receive updates.
          </Typography>
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