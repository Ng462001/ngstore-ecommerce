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
import Carousel from '../components/carousel/Carousel'
import ProductCard from '../components/ProductCard'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import { keyframes } from '@mui/system'
import { addProduct, toggleWishlist } from '../Redux/action/action'

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
  const [trendingProducts, setTrendingProducts] = useState([])
  const [loading, setLoading] = useState(true)

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
    fetchHomeProducts()
  }, [])

  const fetchHomeProducts = async () => {
    try {
      setLoading(true)
      const [latestRes, trendingRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/products?limit=8&sort=createdAt&order=desc`),
        fetch(`${import.meta.env.VITE_API_URL}/api/products?limit=8&sort=rating&order=desc`)
      ])

      const latestData = await latestRes.json()
      const trendingData = await trendingRes.json()

      if (latestData.success && latestData.data) {
        setAllProducts(latestData.data)
      }
      if (trendingData.success && trendingData.data) {
        setTrendingProducts(trendingData.data)
      } else if (latestData.data) {
        setTrendingProducts(latestData.data)
      }
    } catch (error) {
      console.error('Error fetching home products:', error)
      toast.error('Failed to load products')
    } finally {
      setTimeout(() => setLoading(false), 500)
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
    toast.success('Added to cart! 🛒')
  }

  const toggleFavorite = async (product) => {
    const token = localStorage.getItem('token')
    if (!isUserLoggedIn || !token) {
      toast.error('Please login to save items to your wishlist ❤️')
      navigate('/login', { state: { from: window.location.pathname } })
      return
    }

    const productId = product._id || product.id
    const isWishlisted = wishlistItems.some(item => (item._id || item.id) === productId)

    dispatch(toggleWishlist(product))

    if (isWishlisted) {
      toast.success('Removed from wishlist 💔')
    } else {
      toast.success('Added to wishlist ❤️')
    }

    try {
      if (isWishlisted) {
        await fetch(`${import.meta.env.VITE_API_URL}/api/users/wishlist/${productId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        })
      } else {
        await fetch(`${import.meta.env.VITE_API_URL}/api/users/wishlist/${productId}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        })
      }
    } catch (err) {
      console.error('Error syncing wishlist with backend:', err)
    }
  }

  const getProductPriceInfo = (product) => {
    const numPrice = parseFloat(product.price) || 0
    const numDiscountedPrice = parseFloat(product.discountedPrice) || 0
    const numOriginalPrice = parseFloat(product.originalPrice) || 0

    let displayPrice = numPrice
    let originalPrice = null

    if (numDiscountedPrice > 0 && numDiscountedPrice < numPrice) {
      displayPrice = numDiscountedPrice
      originalPrice = numPrice
    } else if (numOriginalPrice > 0 && numPrice < numOriginalPrice) {
      displayPrice = numPrice
      originalPrice = numOriginalPrice
    } else if (numDiscountedPrice > 0 && numOriginalPrice > numDiscountedPrice) {
      displayPrice = numDiscountedPrice
      originalPrice = numOriginalPrice
    } else {
      displayPrice = numDiscountedPrice || numPrice
      if (numOriginalPrice > displayPrice) {
        originalPrice = numOriginalPrice
      }
    }

    const formatAmount = (val) => {
      if (val === null || val === undefined || isNaN(val)) return '0'
      const num = parseFloat(val)
      return num.toLocaleString('en-IN', { maximumFractionDigits: 2 })
    }

    return {
      displayPrice: formatAmount(displayPrice),
      originalPrice: originalPrice && originalPrice > displayPrice ? formatAmount(originalPrice) : null,
      hasDiscount: originalPrice && originalPrice > displayPrice
    }
  }

  const getProductImage = (product) => {
    const src = product.image || product.images?.[0]?.src
    if (!src) return ''
    return src.startsWith('http') ? src : `${import.meta.env.VITE_API_URL}${src}`
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
      bgcolor: '#FAF9F6',
      overflow: 'hidden',
      py: 2
    }}>
      {/* Hero Carousel */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Carousel />
      </Container>

      {/* Categories Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 4
        }}>
          <Typography variant="h4" sx={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            color: '#1C1B19'
          }}>
            <CategoryIcon sx={{ color: '#B8925A', fontSize: 32 }} />
            Shop by Categories
          </Typography>
        </Box>

        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {categories.map((category) => (
            <Grid item xs={6} sm={4} md={3} key={category.id}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, sm: 2.5 },
                  borderRadius: '16px',
                  textAlign: 'center',
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E7E4DD',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  height: '100%',
                  boxShadow: '0 4px 20px -2px rgba(28, 27, 25, 0.05)',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 12px 32px -4px rgba(28, 27, 25, 0.12)',
                    borderColor: '#B8925A'
                  }
                }}
                onClick={() => navigate(`/category/${category.id}`)}
              >
                <Avatar
                  sx={{
                    width: 52,
                    height: 52,
                    mx: 'auto',
                    mb: 2,
                    bgcolor: '#F7F3EC',
                    color: '#B8925A',
                    fontSize: 24,
                    border: '1px solid #E7E4DD'
                  }}
                >
                  {category.icon}
                </Avatar>
                <Typography variant="subtitle1" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, color: '#1C1B19', mb: 0.5 }}>
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

      {/* Trending Products Section (Database Fetched) */}
      <Container maxWidth="lg" sx={{ mb: 10 }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 4,
          flexWrap: 'wrap',
          gap: 2
        }}>
          <div>
            <Typography variant="h4" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, color: '#1C1B19', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <TrendingUpIcon sx={{ color: '#B8925A', fontSize: 32 }} />
              Trending Products
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B6862', mt: 0.5 }}>
              Popular items highly rated and favored by our customers
            </Typography>
          </div>
          <Button
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate('/store')}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1,
              borderColor: '#B8925A',
              color: '#B8925A',
              border: '1px solid #B8925A',
              '&:hover': {
                bgcolor: '#B8925A',
                color: '#FFFFFF'
              }
            }}
          >
            Explore All Trending
          </Button>
        </Box>

        {loading ? (
          <Grid container spacing={3}>
            {[...Array(4)].map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </Grid>
        ) : trendingProducts.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: '16px', bgcolor: '#FFFFFF', border: '1px solid #E7E4DD' }}>
            <Typography variant="h6" color="text.secondary">
              No trending products found
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {trendingProducts.map((product) => (
              <Grid item xs={12} sm={6} md={3} key={product._id}>
                <ProductCard item={product} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Latest Collections Section (Database Fetched) */}
      <Container maxWidth="lg" sx={{ mb: 12 }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 4,
          flexWrap: 'wrap',
          gap: 2
        }}>
          <div>
            <Typography variant="h4" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, color: '#1C1B19', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <NewIcon sx={{ color: '#B8925A', fontSize: 32 }} />
              Latest Arrivals
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B6862', mt: 0.5 }}>
              Discover the newest products added to our storefront catalog
            </Typography>
          </div>
          <Button
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate('/store')}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1,
              borderColor: '#B8925A',
              color: '#B8925A',
              border: '1px solid #B8925A',
              '&:hover': {
                bgcolor: '#B8925A',
                color: '#FFFFFF'
              }
            }}
          >
            View Full Store
          </Button>
        </Box>

        {loading ? (
          <Grid container spacing={3}>
            {[...Array(4)].map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </Grid>
        ) : allProducts.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: '16px', bgcolor: '#FFFFFF', border: '1px solid #E7E4DD' }}>
            <Typography variant="h6" color="text.secondary">
              No products found
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {allProducts.map((product) => (
              <Grid item xs={12} sm={6} md={3} key={product._id}>
                <ProductCard item={product} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Floating Actions */}
      {!isMobile && (
        <Box sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Tooltip title="Back to Top" arrow>
            <Fab
              sx={{
                bgcolor: '#B8925A',
                color: '#FFFFFF',
                boxShadow: '0 4px 20px rgba(184, 146, 90, 0.4)',
                '&:hover': { bgcolor: '#9E7B47' }
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