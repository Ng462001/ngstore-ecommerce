'use client'

import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
    Container,
    Paper,
    Typography,
    Box,
    Button,
    Grid,
    Chip,
    Divider,
    CircularProgress,
    Alert,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Card,
    CardContent,
    IconButton,
    Tooltip,
    Snackbar
} from '@mui/material'
import {
    ArrowBack as ArrowBackIcon,
    Home as HomeIcon,
    ShoppingBag as ShoppingBagIcon,
    LocationOn as LocationIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    CalendarToday as CalendarIcon,
    Receipt as ReceiptIcon,
    Print as PrintIcon,
    CopyAll as CopyIcon,
    AssignmentReturned as ReturnIcon
} from '@mui/icons-material'
import OrderTracking from './OrderTracking'
import { format, isValid } from 'date-fns'
import SupportModal from './SupportModal'
import ReturnExchangeModal from './ReturnExchangeModal'

const OrderDetailsPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [order, setOrder] = useState(null)
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [printing, setPrinting] = useState(false)
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
    const [supportModalOpen, setSupportModalOpen] = useState(false)
    const [returnModalOpen, setReturnModalOpen] = useState(false)
    const [returnRequest, setReturnRequest] = useState(null)
    const [loadingReturn, setLoadingReturn] = useState(false)

    useEffect(() => {
        fetchOrderDetails(id)
    }, [id])

    const fetchOrderDetails = async (id) => {
        try {
            setLoading(true)
            const userInfo = JSON.parse(localStorage.getItem('userInfo'))

            if (!userInfo) {
                navigate('/login')
                return
            }

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/orders/order-details/${id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${userInfo.token}`
                    }
                }
            )

            if (!response.ok) {
                throw new Error('Order not found')
            }

            const { order, user } = await response.json()

            const orderWithTimeline = {
                ...order,
                processingAt: order.processingAt || (['Processing', 'Shipped', 'Delivered'].includes(order.status) ? new Date(Date.now() - 43200000).toISOString() : null),
                shippedAt: order.shippedAt || (['Shipped', 'Delivered'].includes(order.status) ? new Date(Date.now() - 21600000).toISOString() : null),
                outForDeliveryAt: order.outForDeliveryAt || (order.status === 'Delivered' ? new Date(Date.now() - 7200000).toISOString() : null),
                deliveredAt: order.deliveredAt || (order.status === 'Delivered' ? new Date().toISOString() : null)
            }

            setOrder(orderWithTimeline)
            setUser(user)

            // Fetch return request if exists
            fetchReturnRequest(id, userInfo.token)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const fetchReturnRequest = async (orderId, token) => {
        try {
            setLoadingReturn(true)
            console.log('Fetching return request for order:', orderId)
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/return-exchange/order/${orderId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            )

            if (response.ok) {
                const data = await response.json()
                console.log('Return request data:', data)
                if (data.success && data.requests && data.requests.length > 0) {
                    setReturnRequest(data.requests[0])
                }
            }
        } catch (err) {
            console.error('Error fetching return request:', err)
        } finally {
            setLoadingReturn(false)
        }
    }


    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCopyOrderId = () => {
        if (order?._id) {
            navigator.clipboard.writeText(order._id.substring(0, 8).toUpperCase());
            showSnackbar('Order ID copied to clipboard', 'info');
        }
    };

    const handlePrintInvoice = () => {
        if (!order) {
            showSnackbar('Order data not available', 'error');
            return;
        }

        setPrinting(true);

        try {
            // Format dates safely
            const orderDate = order.createdAt && isValid(new Date(order.createdAt))
                ? format(new Date(order.createdAt), 'dd/MM/yyyy')
                : 'N/A';

            const currentDate = format(new Date(), 'dd/MM/yyyy HH:mm');

            // Get shipping address
            const shippingAddress = order.shippingAddress || {};
            const addressLines = [
                shippingAddress.street || '',
                shippingAddress.city || '',
                shippingAddress.state || '',
                shippingAddress.zipCode || '',
                shippingAddress.country || ''
            ].filter(line => line.trim() !== '').join(', ');

            // Calculate subtotal
            const subtotal = order.orderItems?.reduce((total, item) =>
                total + (item.price * item.quantity), 0) || 0;

            const printContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Invoice #${order._id.substring(0, 8).toUpperCase()}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 40px; }
                        .header { text-align: center; margin-bottom: 30px; }
                        .company-info { margin-bottom: 20px; }
                        .billing-info { margin: 20px 0; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                        th { background-color: #f5f5f5; }
                        .total-row { font-weight: bold; }
                        .footer { margin-top: 40px; text-align: center; color: #666; }
                        @media print {
                            body { margin: 0; }
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>INVOICE</h1>
                        <h3>Order #${order._id.substring(0, 8).toUpperCase()}</h3>
                    </div>
                    
                    <div class="company-info">
                        <h4>Billed To:</h4>
                        <p>${user?.name || 'Customer'}</p>
                        <p>${user?.email || 'N/A'}</p>
                        <p>${shippingAddress.mobile || user?.phone || 'N/A'}</p>
                        ${addressLines ? `<p>${addressLines}</p>` : ''}
                    </div>
                    
                    <div class="billing-info">
                        <p><strong>Order Date:</strong> ${orderDate}</p>
                        <p><strong>Status:</strong> ${order.status}</p>
                        <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>
                        <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
                    </div>
                    
                    <table>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.orderItems?.map(item => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td>${item.quantity}</td>
                                    <td>₹${item.price}</td>
                                    <td>₹${item.price * item.quantity}</td>
                                </tr>
                            `).join('')}
                            <tr class="total-row">
                                <td colspan="3" style="text-align: right;">Subtotal:</td>
                                <td>₹${subtotal}</td>
                            </tr>
                            <tr class="total-row">
                                <td colspan="3" style="text-align: right;">Shipping:</td>
                                <td>₹${order.shippingPrice || 0}</td>
                            </tr>
                            <tr class="total-row">
                                <td colspan="3" style="text-align: right;">Tax:</td>
                                <td>₹${order.taxPrice || 0}</td>
                            </tr>
                            ${order.discount && order.discount > 0 ? `
                                <tr class="total-row" style="color: #28a745;">
                                    <td colspan="3" style="text-align: right;">Discount:</td>
                                    <td>-₹${order.discount}</td>
                                </tr>
                            ` : ''}
                            <tr class="total-row">
                                <td colspan="3" style="text-align: right;">Total:</td>
                                <td>₹${order.totalPrice || 0}</td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <div class="footer">
                        <p>Thank you for your business!</p>
                        <p>Generated on ${currentDate}</p>
                    </div>
                    
                    <div class="no-print" style="margin-top: 20px; text-align: center;">
                        <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; cursor: pointer;">
                            Print Invoice
                        </button>
                        <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; cursor: pointer; margin-left: 10px;">
                            Close
                        </button>
                    </div>
                </body>
                </html>
            `;

            const printWindow = window.open('', '_blank');
            printWindow.document.write(printContent);
            printWindow.document.close();

            // Give time for content to load
            setTimeout(() => {
                printWindow.print();
                setPrinting(false);
            }, 500);
        } catch (err) {
            console.error('Print error:', err);
            showSnackbar('Failed to print invoice', 'error');
            setPrinting(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <CircularProgress />
            </Box>
        )
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/my-orders')}>
                    Back to Orders
                </Button>
            </Container>
        )
    }

    if (!order) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="warning">Order not found</Alert>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/my-orders')} sx={{ mt: 2 }}>
                    Back to Orders
                </Button>
            </Container>
        )
    }

    return (
        <>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/my-orders')}
                        sx={{ mb: 2 }}
                        variant="outlined"
                    >
                        Back to Orders
                    </Button>

                    <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                        <Grid item>
                            <Typography variant="h4" component="h1" gutterBottom>
                                Order Details
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Chip
                                        label={`Order #${order._id.substring(0, 8).toUpperCase()}`}
                                        color="primary"
                                        variant="outlined"
                                    />
                                    <Tooltip title="Copy Order ID">
                                        <IconButton
                                            size="small"
                                            onClick={handleCopyOrderId}
                                            aria-label="Copy order ID"
                                        >
                                            <CopyIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                                <Chip
                                    label={order.status}
                                    color={
                                        order.status === 'Delivered' ? 'success' :
                                            order.status === 'Out for delivery' ? 'info' :
                                                order.status === 'Shipped' ? 'info' :
                                                    order.status === 'Processing' ? 'warning' :
                                                        order.status === 'Cancelled' ? 'error' : 'default'
                                    }
                                    sx={{ fontWeight: 'bold' }}
                                />
                                {returnRequest && (
                                    <Chip
                                        icon={<ReturnIcon />}
                                        label={`${returnRequest.type}: ${returnRequest.status}`}
                                        color={
                                            returnRequest.status === 'Completed' ? 'success' :
                                                returnRequest.status === 'Approved' ? 'info' :
                                                    returnRequest.status === 'Rejected' ? 'error' : 'warning'
                                        }
                                        sx={{ fontWeight: 'bold' }}
                                    />
                                )}
                                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <CalendarIcon fontSize="small" />
                                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                {returnRequest && (
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        startIcon={<ReturnIcon />}
                                        onClick={() => navigate(`/profile?tab=requests&requestId=${returnRequest._id}`)}
                                    >
                                        View Return Request
                                    </Button>
                                )}
                                {(order.status === 'Delivered' || order.status === 'Returned') && (
                                    <Button
                                        variant="outlined"
                                        startIcon={printing ? <CircularProgress size={20} /> : <PrintIcon />}
                                        onClick={handlePrintInvoice}
                                        disabled={printing}
                                    >
                                        {printing ? 'Printing...' : 'Print Invoice'}
                                    </Button>
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

                {/* Order Tracking Section */}
                <OrderTracking order={order} isFullPage={true} returnRequest={returnRequest} />

                {/* Order Items & Details Section */}
                <Grid container spacing={3} sx={{ mt: 4 }}>
                    {/* Left Column - Order Items */}
                    <Grid item xs={12} lg={8}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: 'white', border: 1, borderColor: 'grey.200' }}>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                <ShoppingBagIcon color="primary" />
                                Order Items ({order.orderItems.length})
                            </Typography>
                            <List>
                                {order.orderItems.map((item, index) => (
                                    <Box key={item._id || index}>
                                        <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                                            <ListItemAvatar>
                                                <Avatar
                                                    variant="rounded"
                                                    src={item.image && item.image.startsWith('http') ? item.image : `${import.meta.env.VITE_API_URL}${item.image || ''}`}
                                                    alt={item.name}
                                                    sx={{ width: 80, height: 80, mr: 2 }}
                                                />
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={
                                                    <Typography variant="subtitle1" component="div" sx={{ fontWeight: 500 }}>
                                                        {item.name}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Box sx={{ mt: 1 }}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Color: {item.selectedColor} • Size: {item.selectedSize}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Quantity: {item.quantity}
                                                        </Typography>
                                                        <Typography variant="body1" color="primary" sx={{ mt: 1, fontWeight: 500 }}>
                                                            ₹{item.price} × {item.quantity} = ₹{item.price * item.quantity}
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                component={Link}
                                                to={`/product/${item.product}`}
                                                sx={{ ml: 2 }}
                                            >
                                                View Product
                                            </Button>
                                        </ListItem>
                                        {index < order.orderItems.length - 1 && <Divider variant="inset" component="li" />}
                                    </Box>
                                ))}
                            </List>
                        </Paper>
                    </Grid>

                    {/* Right Column - Order Info */}
                    <Grid item xs={12} lg={4}>
                        {/* Order Summary Card */}
                        <Card sx={{ mb: 3, border: 1, borderColor: 'grey.200' }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <ReceiptIcon color="primary" />
                                    Order Summary
                                </Typography>

                                <Box sx={{ mb: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                        <Typography variant="body2" color="text.secondary">Subtotal:</Typography>
                                        <Typography variant="body2" fontWeight={500}>₹{(order.totalPrice - order.taxPrice)}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                        <Typography variant="body2" color="text.secondary">Shipping:</Typography>
                                        <Typography variant="body2" fontWeight={500}>₹{order.shippingPrice}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                        <Typography variant="body2" color="text.secondary">Tax:</Typography>
                                        <Typography variant="body2" fontWeight={500}>₹{order.taxPrice}</Typography>
                                    </Box>
                                    <Divider sx={{ my: 2 }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="h6">Total Amount</Typography>
                                        <Typography variant="h6" color="primary">₹{order.totalPrice}</Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                                        Payment Information
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                        <Typography variant="body2" color="text.secondary">Method:</Typography>
                                        <Typography variant="body2" fontWeight={500}>{order.paymentMethod}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                        <Typography variant="body2" color="text.secondary">Status:</Typography>
                                        <Chip
                                            label={order.paymentStatus}
                                            color={order.paymentStatus === 'Paid' ? 'success' : 'warning'}
                                            size="small"
                                            sx={{ fontWeight: 500 }}
                                        />
                                    </Box>
                                    {order.paidAt && order.paymentStatus === 'Paid' && (
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                            Paid on: {new Date(order.paidAt).toLocaleDateString()}
                                        </Typography>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Action Buttons */}
                <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                    {order.status === 'Delivered' && returnRequest === false && (
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => setReturnModalOpen(true)}
                            startIcon={<ReturnIcon />}
                        >
                            Return/Exchange
                        </Button>
                    )}
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<EmailIcon />}
                        onClick={() => setSupportModalOpen(true)}
                    >
                        Contact Support
                    </Button>
                </Box>

                {/* Snackbar for notifications */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={3000}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <div>
                        {snackbar.severity === 'success' ? (
                            <Alert severity="success" sx={{ width: '100%' }}>
                                {snackbar.message}
                            </Alert>
                        ) : snackbar.severity === 'error' ? (
                            <Alert severity="error" sx={{ width: '100%' }}>
                                {snackbar.message}
                            </Alert>
                        ) : (
                            <Alert severity="info" sx={{ width: '100%' }}>
                                {snackbar.message}
                            </Alert>
                        )}
                    </div>
                </Snackbar>
            </Container>
            <SupportModal
                open={supportModalOpen}
                onClose={() => setSupportModalOpen(false)}
                order={order}
                user={user}
            />
            <ReturnExchangeModal
                open={returnModalOpen}
                onClose={() => setReturnModalOpen(false)}
                order={order}
                user={user}
            />

        </>
    )
}

export default OrderDetailsPage