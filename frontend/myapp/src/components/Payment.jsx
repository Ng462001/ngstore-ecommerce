import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clearCart } from '../Redux/action/action';
import {
    Box,
    Paper,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    RadioGroup,
    FormControlLabel,
    Radio,
    FormControl,
    FormLabel,
    TextField,
    Alert,
    CircularProgress,
    Divider
} from '@mui/material';
import { CreditCard, Lock, Payment as PaymentIcon } from '@mui/icons-material';

export default function Payment({ onBack, selectedAddress, checkoutData }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [cardData, setCardData] = useState({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        nameOnCard: ''
    });
    const [errors, setErrors] = useState({});

    const cartItems = useSelector(state => state.productReducer?.cartItems || []);
    const userInfo = useSelector(state => state.productReducer?.userInfo);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Calculate totals
    const subtotal = cartItems.reduce(
        (sum, item) => sum + (parseFloat(item.discountedPrice || item.price) * item.quantity),
        0
    );
    const shipping = subtotal > 50 ? 0 : 5.00;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    const validateForm = () => {
        const newErrors = {};

        if (paymentMethod === 'card') {
            if (!cardData.cardNumber.trim()) newErrors.cardNumber = 'Card number is required';
            if (!cardData.expiryDate.trim()) newErrors.expiryDate = 'Expiry date is required';
            if (!cardData.cvv.trim()) newErrors.cvv = 'CVV is required';
            if (!cardData.nameOnCard.trim()) newErrors.nameOnCard = 'Name on card is required';

            // Basic card validation
            if (cardData.cardNumber && !/^\d{16}$/.test(cardData.cardNumber.replace(/\s/g, ''))) {
                newErrors.cardNumber = 'Please enter a valid 16-digit card number';
            }
            if (cardData.cvv && !/^\d{3,4}$/.test(cardData.cvv)) {
                newErrors.cvv = 'Please enter a valid CVV';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCardInputChange = (e) => {
        const { name, value } = e.target;

        // Format card number with spaces
        if (name === 'cardNumber') {
            const formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
            setCardData(prev => ({ ...prev, [name]: formattedValue }));
        } else {
            setCardData(prev => ({ ...prev, [name]: value }));
        }

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();

        if (!userInfo) {
            alert('Please log in to complete your purchase.');
            navigate('/login');
            return;
        }

        if (!selectedAddress) {
            alert('Please select a shipping address.');
            return;
        }

        if (paymentMethod === 'card' && !validateForm()) {
            return;
        }

        setIsProcessing(true);

        try {
            const orderData = {
                orderItems: cartItems.map(item => ({
                    name: item.name,
                    quantity: item.quantity,
                    image: item.image || item.images?.[0]?.src,
                    price: parseFloat(item.discountedPrice || item.price),
                    product: item._id || item.id,
                    selectedColor: item.selectedColor,
                    selectedSize: item.selectedSize
                })),
                shippingAddress: selectedAddress,
                paymentMethod: paymentMethod === 'card' ? 'Card' : 'CashOnDelivery',
                itemsPrice: subtotal,
                taxPrice: tax,
                shippingPrice: shipping,
                totalPrice: total
            };

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`,
                },
                body: JSON.stringify(orderData),
            });

            if (response.ok) {
                dispatch(clearCart());
                alert('Payment successful! Order has been placed.');
                navigate('/my-orders');
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Order creation failed');
            }
        } catch (error) {
            console.error('Payment error:', error);
            alert('An error occurred during payment processing.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
                <PaymentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                    Your cart is empty
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Add some items to your cart to proceed with payment
                </Typography>
                <Button
                    variant="contained"
                    onClick={() => navigate('/')}
                >
                    Continue Shopping
                </Button>
            </Paper>
        );
    }

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                Payment Details
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
                Complete your purchase with secure payment
            </Typography>

            <Grid container spacing={4}>
                {/* Left Column - Payment Form */}
                <Grid item xs={12} md={8}>
                    <Paper elevation={1} sx={{ p: 3 }}>
                        <FormControl component="fieldset" sx={{ width: '100%' }}>
                            <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600 }}>
                                Select Payment Method
                            </FormLabel>
                            <RadioGroup
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                sx={{ mb: 3 }}
                            >
                                <FormControlLabel
                                    value="card"
                                    control={<Radio />}
                                    label={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <CreditCard />
                                            <Typography>Credit/Debit Card</Typography>
                                        </Box>
                                    }
                                />
                                <FormControlLabel
                                    value="cod"
                                    control={<Radio />}
                                    label="Cash on Delivery"
                                />
                            </RadioGroup>
                        </FormControl>

                        {paymentMethod === 'card' && (
                            <form onSubmit={handlePaymentSubmit}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Name on Card"
                                            name="nameOnCard"
                                            value={cardData.nameOnCard}
                                            onChange={handleCardInputChange}
                                            error={!!errors.nameOnCard}
                                            helperText={errors.nameOnCard}
                                            placeholder="John Doe"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Card Number"
                                            name="cardNumber"
                                            value={cardData.cardNumber}
                                            onChange={handleCardInputChange}
                                            error={!!errors.cardNumber}
                                            helperText={errors.cardNumber}
                                            placeholder="1234 5678 9012 3456"
                                            inputProps={{ maxLength: 19 }}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            fullWidth
                                            label="Expiry Date"
                                            name="expiryDate"
                                            value={cardData.expiryDate}
                                            onChange={handleCardInputChange}
                                            error={!!errors.expiryDate}
                                            helperText={errors.expiryDate}
                                            placeholder="MM/YY"
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            fullWidth
                                            label="CVV"
                                            name="cvv"
                                            value={cardData.cvv}
                                            onChange={handleCardInputChange}
                                            error={!!errors.cvv}
                                            helperText={errors.cvv}
                                            placeholder="123"
                                            type="password"
                                            inputProps={{ maxLength: 4 }}
                                        />
                                    </Grid>
                                </Grid>
                            </form>
                        )}

                        {paymentMethod === 'cod' && (
                            <Alert severity="info" sx={{ mt: 2 }}>
                                You will pay cash when your order is delivered.
                            </Alert>
                        )}

                        {/* Security Notice */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                            <Lock color="success" />
                            <Typography variant="caption" color="text.secondary">
                                Your payment information is secure and encrypted
                            </Typography>
                        </Box>
                    </Paper>

                    {/* Order Summary */}
                    <Paper elevation={1} sx={{ p: 3, mt: 3 }}>
                        <Typography variant="h6" gutterBottom fontWeight="600">
                            Order Items
                        </Typography>
                        {cartItems.map((item) => (
                            <Box key={item.cartId || item.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                                <Typography variant="body2">
                                    {item.name} × {item.quantity}
                                </Typography>
                                <Typography variant="body2" fontWeight="600">
                                    ₹{(parseFloat(item.discountedPrice || item.price) * item.quantity).toFixed(2)}
                                </Typography>
                            </Box>
                        ))}
                    </Paper>
                </Grid>

                {/* Right Column - Order Summary */}
                <Grid item xs={12} md={4}>
                    <Paper elevation={1} sx={{ p: 3, position: 'sticky', top: 20 }}>
                        <Typography variant="h6" gutterBottom fontWeight="600">
                            Order Summary
                        </Typography>

                        <Box sx={{ spaceY: 2, mb: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Subtotal
                                </Typography>
                                <Typography variant="body2">₹{subtotal.toFixed(2)}</Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Shipping
                                </Typography>
                                <Typography variant="body2">
                                    {shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Tax
                                </Typography>
                                <Typography variant="body2">₹{tax.toFixed(2)}</Typography>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="h6" fontWeight="600">
                                    Total
                                </Typography>
                                <Typography variant="h6" fontWeight="600">
                                    ₹{total.toFixed(2)}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Action Buttons */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Button
                                variant="contained"
                                size="large"
                                fullWidth
                                onClick={handlePaymentSubmit}
                                disabled={isProcessing}
                                startIcon={isProcessing ? <CircularProgress size={20} /> : <PaymentIcon />}
                                sx={{ py: 1.5 }}
                            >
                                {isProcessing ? 'Processing...' : `Pay ₹${total.toFixed(2)}`}
                            </Button>

                            <Button
                                variant="outlined"
                                size="large"
                                fullWidth
                                onClick={onBack}
                                disabled={isProcessing}
                                sx={{ py: 1.5 }}
                            >
                                Back to Order Summary
                            </Button>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}