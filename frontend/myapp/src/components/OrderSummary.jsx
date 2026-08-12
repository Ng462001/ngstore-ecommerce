import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Paper, Typography, Divider, List, ListItem, ListItemText, ListItemAvatar, Avatar, IconButton, Alert } from '@mui/material'
import { ShoppingBag, LocationOn, Edit } from '@mui/icons-material'

export default function OrderSummary({ onNext, onBack, selectedAddress }) {
  const navigate = useNavigate()
  const [localSelectedAddress, setLocalSelectedAddress] = useState(selectedAddress)

  // Update local state when prop changes
  useEffect(() => {
    setLocalSelectedAddress(selectedAddress)
  }, [selectedAddress])

  // Get cart items from Redux store
  const cartItems = useSelector(state => {
    if (!state) return []
    if (Array.isArray(state)) return state
    if (state.productReducer) {
      return Array.isArray(state.productReducer)
        ? state.productReducer
        : (state.productReducer.cartItems || [])
    }
    return state.cartItems || []
  })

  // Safe price parser — avoids discountedPrice=0 corrupting totals
  const getItemPrice = (item) => {
    const p = parseFloat(item.price) || 0
    const dp = parseFloat(item.discountedPrice) || 0
    if (dp > 0 && dp < p) return dp
    return p || dp
  }

  // Format price using Indian locale
  const fmt = (val) =>
    val.toLocaleString('en-IN', { maximumFractionDigits: 2 })

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) =>
    sum + (getItemPrice(item) * item.quantity), 0
  )
  const shipping = subtotal > 500 ? 0 : 50 // Free shipping over ₹500
  const tax = subtotal * 0.18 // 18% GST
  const total = subtotal + shipping + tax

  // Get item image
  const getItemImage = (item) => {
    const imgSrc = item.image || item.images?.[0]?.src
    if (!imgSrc) return 'https://via.placeholder.com/150'
    if (imgSrc.startsWith('http')) return imgSrc
    return `${import.meta.env.VITE_API_URL}${imgSrc}`
  }

  const handleContinueShopping = () => {
    navigate('/')
  }

  const handleProceedToPayment = () => {
    if (!localSelectedAddress) {
      alert('Please select a shipping address before proceeding to payment.')
      return
    }

    if (onNext) {
      onNext()
    }
  }

  const handleEditAddress = () => {
    // Go back to address selection step (step 0)
    if (onBack) {
      onBack()
    }
  }

  if (cartItems.length === 0) {
    return (
      <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
        <ShoppingBag sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Your cart is empty
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Add some items to your cart to proceed with checkout
        </Typography>
        <Button
          variant="contained"
          onClick={handleContinueShopping}
        >
          Continue Shopping
        </Button>
      </Paper>
    )
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, color: '#1C1B19' }}>
        Order Summary
      </Typography>
      <Typography variant="subtitle1" sx={{ mb: 4, color: '#6B6862' }}>
        Review your items and shipping details
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 4 }}>
        {/* Left Column - Items and Address */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Order Items */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', bgcolor: '#FFFFFF', border: '1px solid #E7E4DD', boxShadow: '0 4px 20px -2px rgba(28, 27, 25, 0.05)' }}>
            <Typography variant="h6" gutterBottom sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, color: '#1C1B19' }}>
              Items in Cart ({cartItems.length})
            </Typography>
            <List>
              {cartItems.map((item, index) => {
                const itemPrice = parseFloat(item.discountedPrice || item.price)
                const totalPrice = itemPrice * item.quantity

                return (
                  <Box key={item.cartId || item.id}>
                    <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                      <ListItemAvatar>
                        <Avatar
                          src={getItemImage(item)}
                          alt={item.name}
                          sx={{ width: 80, height: 80, borderRadius: '12px', marginRight: 2, border: '1px solid #E7E4DD', bgcolor: '#FAF9F6' }}
                          variant="rounded"
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, color: '#1C1B19' }}>
                            {item.name}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            {item.selectedColor && (
                              <Typography variant="body2" color="text.secondary">
                                Color: {item.selectedColor}
                              </Typography>
                            )}
                            {item.selectedSize && (
                              <Typography variant="body2" color="text.secondary">
                                Size: {item.selectedSize}
                              </Typography>
                            )}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                Qty: {item.quantity}
                              </Typography>
                            </Box>
                            <Typography variant="body1" sx={{ fontWeight: 700, color: '#B8925A', mt: 1 }}>
                              ₹{totalPrice.toFixed(2)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              ₹{itemPrice.toFixed(2)} each
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < cartItems.length - 1 && <Divider variant="inset" component="li" sx={{ borderColor: '#E7E4DD' }} />}
                  </Box>
                )
              })}
            </List>
          </Paper>

          {/* Shipping Address - Only show selected address */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', bgcolor: '#FFFFFF', border: '1px solid #E7E4DD', boxShadow: '0 4px 20px -2px rgba(28, 27, 25, 0.05)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, color: '#1C1B19' }}>
                Shipping Address
              </Typography>
              <Button
                startIcon={<Edit />}
                onClick={handleEditAddress}
                variant="outlined"
                size="small"
                sx={{ borderRadius: '8px', borderColor: '#B8925A', color: '#B8925A' }}
              >
                Change Address
              </Button>
            </Box>

            {!localSelectedAddress ? (
              <Alert severity="warning" sx={{ mb: 2, borderRadius: '12px' }}>
                No shipping address selected. Please go back and select an address.
              </Alert>
            ) : (
              <Box sx={{ p: 2.5, border: '1px solid #B8925A', borderRadius: '14px', bgcolor: '#F7F3EC', color: '#1C1B19' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <LocationOn sx={{ color: '#B8925A', mt: 0.5 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight="600" sx={{ color: '#1C1B19', mb: 1 }}>
                      {localSelectedAddress.name || 'Shipping Address'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6B6862', lineHeight: 1.6 }}>
                      {localSelectedAddress.street}<br />
                      {localSelectedAddress.city}, {localSelectedAddress.state} {localSelectedAddress.zipCode}<br />
                      {localSelectedAddress.country}
                    </Typography>
                    {localSelectedAddress.mobile && (
                      <Typography variant="body2" sx={{ color: '#6B6862', mt: 1 }}>
                        📞 {localSelectedAddress.mobile}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            )}

            {!localSelectedAddress && (
              <Button
                variant="contained"
                fullWidth
                onClick={handleEditAddress}
                startIcon={<LocationOn />}
                sx={{ mt: 2, bgcolor: '#B8925A', '&:hover': { bgcolor: '#9E7B47' }, borderRadius: '12px' }}
              >
                Select Shipping Address
              </Button>
            )}
          </Paper>
        </Box>

        {/* Right Column - Order Totals */}
        <Box>
          <Paper elevation={0} sx={{ p: 3.5, position: 'sticky', top: 20, borderRadius: '20px', bgcolor: '#FFFFFF', border: '1px solid #E7E4DD', boxShadow: '0 4px 20px -2px rgba(28, 27, 25, 0.05)' }}>
            <Typography variant="h6" gutterBottom sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, color: '#1C1B19' }}>
              Summary
            </Typography>

            <Box sx={{ spaceY: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="body2" color="text.secondary">
                  Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)
                </Typography>
                <Typography variant="body2" fontWeight="500">₹{fmt(subtotal)}</Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="body2" color="text.secondary">
                  Shipping
                </Typography>
                <Typography variant="body2" fontWeight="500" sx={{ color: shipping === 0 ? '#3E7A55' : 'inherit' }}>
                  {shipping === 0 ? 'FREE' : `₹${fmt(shipping)}`}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="body2" color="text.secondary">
                  Tax
                </Typography>
                <Typography variant="body2" fontWeight="500">₹{fmt(tax)}</Typography>
              </Box>

              <Divider sx={{ my: 2, borderColor: '#E7E4DD' }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6" fontWeight="600" sx={{ color: '#1C1B19' }}>
                  Total
                </Typography>
                <Typography variant="h6" fontWeight="700" sx={{ color: '#B8925A' }}>
                  ₹{fmt(total)}
                </Typography>
              </Box>

              {shipping === 0 && (
                <Typography variant="body2" sx={{ mt: 1, textAlign: 'center', color: '#3E7A55', fontWeight: 500 }}>
                  🎉 You qualify for free shipping!
                </Typography>
              )}
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleProceedToPayment}
                disabled={!localSelectedAddress}
                sx={{ py: 1.5, borderRadius: '12px', bgcolor: '#B8925A', '&:hover': { bgcolor: '#9E7B47' }, fontWeight: 600 }}
              >
                Proceed to Payment
              </Button>

              <Button
                variant="outlined"
                size="large"
                fullWidth
                onClick={onBack}
                sx={{ py: 1.5, borderRadius: '12px', borderColor: '#E7E4DD', color: '#6B6862', '&:hover': { borderColor: '#B8925A', color: '#B8925A' } }}
              >
                Back to Shipping
              </Button>
            </Box>

            {/* Security Notice */}
            <Box sx={{ mt: 3, p: 2, bgcolor: '#FAF9F6', borderRadius: '12px', border: '1px solid #E7E4DD' }}>
              <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
                🔒 Secure checkout · Encrypted payment
              </Typography>
            </Box>

            {/* Address Requirement Notice */}
            {!localSelectedAddress && (
              <Alert severity="info" sx={{ mt: 2, borderRadius: '12px' }}>
                Please select a shipping address to proceed with payment.
              </Alert>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  )
}