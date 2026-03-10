// components/Orders.js
import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Button,
    CircularProgress,
    Menu,
    MenuItem,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Divider,
    Box,
    Tooltip
} from '@mui/material';
import {
    Visibility,
    Refresh,
    Edit,
    Close,
    Receipt,
    ArrowDropDown
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

const Orders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Status Update State
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Order Details Modal State
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [viewOrder, setViewOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
                setError('Please login to view orders');
                setLoading(false);
                return;
            }

            const response = await axios.get(`${API_URL}/admin/orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(response.data.orders || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusClick = (event, order) => {
        setAnchorEl(event.currentTarget);
        setSelectedOrder(order);
    };

    const handlePaymentStatus = (status) => {
        switch (status) {
            case 'Paid': return 'success';
            case 'Pending': return 'warning';
            case 'Failed': return 'error';
            default: return 'default';
        }
    };

    const handleStatusClose = () => {
        setAnchorEl(null);
        setSelectedOrder(null);
    };

    const handleStatusUpdate = async (newStatus) => {
        if (!selectedOrder) return;

        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${API_URL}/admin/orders/${selectedOrder._id}/status`,
                { status: newStatus, isPaid: newStatus === 'Delivered' ? true : false },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Update local state
            setOrders(orders.map(order =>
                order._id === selectedOrder._id
                    ? { ...order, status: newStatus, isDelivered: newStatus === 'Delivered' ? true : order.isDelivered, isPaid: newStatus === 'Delivered' ? true : false }
                    : order
            ));

            handleStatusClose();
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Failed to update status');
        }
    };

    const handleViewOrder = (order) => {
        setViewOrder(order);
        setDetailsOpen(true);
    };

    const handleCloseDetails = () => {
        setDetailsOpen(false);
        setViewOrder(null);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Delivered': return 'success';
            case 'Out for delivery': return 'primary';
            case 'Shipped': return 'info';
            case 'Processing': return 'warning';
            case 'Cancelled': return 'error';
            default: return 'default';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <Typography variant="h4" className="font-bold text-gray-800">
                        Orders
                    </Typography>
                    <Typography variant="body1" className="text-gray-600">
                        Manage and track customer orders ({orders.length} orders)
                    </Typography>
                </div>
                <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={fetchOrders}
                >
                    Refresh
                </Button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    Error loading orders: {error}
                </div>
            )}

            <Card className="shadow-md rounded-xl">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <CircularProgress />
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-12">
                            <Typography className="text-gray-500">
                                No orders found
                            </Typography>
                        </div>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead className="bg-gray-50">
                                    <TableRow>
                                        <TableCell className="font-bold">Order ID</TableCell>
                                        <TableCell className="font-bold">Customer</TableCell>
                                        <TableCell className="font-bold">Date</TableCell>
                                        <TableCell className="font-bold">Amount</TableCell>
                                        <TableCell className="font-bold">Items</TableCell>
                                        <TableCell className="font-bold">Payment</TableCell>
                                        <TableCell className="font-bold">Status</TableCell>
                                        <TableCell className="font-bold" align="center">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {orders.map((order) => (
                                        <TableRow key={order._id} className="hover:bg-gray-50">
                                            <TableCell>
                                                <Typography variant="body1" className="font-medium">
                                                    #{order._id.substring(0, 8).toUpperCase()}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <Typography variant="body2" className="font-medium">
                                                        {order.user?.name || order.shippingAddress?.city || 'N/A'}
                                                    </Typography>
                                                    <Typography variant="caption" className="text-gray-500">
                                                        {order.user?.email || order.shippingAddress?.mobile || ''}
                                                    </Typography>
                                                </div>
                                            </TableCell>
                                            <TableCell>{formatDate(order.createdAt)}</TableCell>
                                            <TableCell className="font-medium">
                                                ₹{order.totalPrice?.toFixed(2) || '0.00'}
                                            </TableCell>
                                            <TableCell>{order.orderItems?.length || 0}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={order.paymentStatus}
                                                    size="small"
                                                    color={handlePaymentStatus(order.paymentStatus)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={order.status || 'Processing'}
                                                    color={getStatusColor(order.status)}
                                                    onClick={(e) => handleStatusClick(e, order)}
                                                    onDelete={(e) => handleStatusClick(e, order)}
                                                    deleteIcon={<ArrowDropDown style={{ fontSize: 16 }} />}
                                                    variant='outlined'
                                                    className="cursor-pointer hover:shadow-sm"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex space-x-2 justify-center">
                                                    <Tooltip title="View Details">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => navigate(`/admin/order/${order._id}`)}
                                                        >
                                                            <Visibility fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="View Receipt">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleViewOrder(order)}
                                                        >
                                                            <Receipt fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </CardContent>
            </Card>

            {/* Status Update Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleStatusClose}
            >
                <MenuItem onClick={() => handleStatusUpdate('Processing')}>Processing</MenuItem>
                <MenuItem onClick={() => handleStatusUpdate('Shipped')}>Shipped</MenuItem>
                <MenuItem onClick={() => handleStatusUpdate('Out for delivery')}>Out for delivery</MenuItem>
                <MenuItem onClick={() => handleStatusUpdate('Delivered')}>Delivered</MenuItem>
                <MenuItem onClick={() => handleStatusUpdate('Cancelled')}>Cancelled</MenuItem>
            </Menu>

            {/* Order Details Dialog */}
            <Dialog
                open={detailsOpen}
                onClose={handleCloseDetails}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">
                            Order Details #{viewOrder?._id?.substring(0, 8)}
                        </Typography>
                        <IconButton onClick={handleCloseDetails} size="small">
                            <Close />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent dividers>
                    {viewOrder && (
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                    Customer Information
                                </Typography>
                                <Typography variant="body2">
                                    Name: {viewOrder.user?.name || 'N/A'}
                                </Typography>
                                <Typography variant="body2">
                                    Email: {viewOrder.user?.email || 'N/A'}
                                </Typography>
                                <Box mt={2}>
                                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                        Shipping Address
                                    </Typography>
                                    <Typography variant="body2">
                                        {viewOrder.shippingAddress?.street}
                                    </Typography>
                                    <Typography variant="body2">
                                        {viewOrder.shippingAddress?.city}, {viewOrder.shippingAddress?.state} {viewOrder.shippingAddress?.zipCode}
                                    </Typography>
                                    <Typography variant="body2">
                                        {viewOrder.shippingAddress?.country}
                                    </Typography>
                                    <Typography variant="body2">
                                        Phone: {viewOrder.shippingAddress?.mobile}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                    Order Summary
                                </Typography>
                                <Typography variant="body2">
                                    Date: {formatDate(viewOrder.createdAt)}
                                </Typography>
                                <Typography variant="body2">
                                    Status: <span className={`font-medium text-${getStatusColor(viewOrder.status)}-600`}>{viewOrder.status}</span>
                                </Typography>
                                <Typography variant="body2">
                                    Payment Method: {viewOrder.paymentMethod}
                                </Typography>
                                <Typography variant="body2">
                                    Payment Status: {viewOrder.paymentStatus}
                                </Typography>
                                <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
                                    <Box display="flex" justifyContent="space-between">
                                        <Typography variant="body2">Items Price:</Typography>
                                        <Typography variant="body2">₹{viewOrder.orderItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2) || '0.00'}</Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between">
                                        <Typography variant="body2">Tax:</Typography>
                                        <Typography variant="body2">₹{viewOrder.taxPrice?.toFixed(2) || '0.00'}</Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between">
                                        <Typography variant="body2">Shipping:</Typography>
                                        <Typography variant="body2">₹{viewOrder.shippingPrice?.toFixed(2) || '0.00'}</Typography>
                                    </Box>
                                    <Divider sx={{ my: 1 }} />
                                    <Box display="flex" justifyContent="space-between">
                                        <Typography variant="subtitle2">Total:</Typography>
                                        <Typography variant="subtitle2">₹{viewOrder.totalPrice?.toFixed(2) || '0.00'}</Typography>
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                    Order Items
                                </Typography>
                                <TableContainer className="border rounded-lg">
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Product</TableCell>
                                                <TableCell>Color</TableCell>
                                                <TableCell>Size</TableCell>
                                                <TableCell align="right">Price</TableCell>
                                                <TableCell align="right">Qty</TableCell>
                                                <TableCell align="right">Total</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {viewOrder.orderItems?.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>
                                                        <Box display="flex" alignItems="center" gap={2}>
                                                            <img
                                                                src={item.image && item.image.startsWith('http') ? item.image : `${import.meta.env.VITE_API_URL}${item.image || ''}`}
                                                                alt={item.name}
                                                                style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
                                                            />
                                                            <Typography variant="body2">{item.name}</Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>{item.selectedColor || '-'}</TableCell>
                                                    <TableCell>{item.selectedSize || '-'}</TableCell>
                                                    <TableCell align="right">₹{item.price?.toFixed(2)}</TableCell>
                                                    <TableCell align="right">{item.quantity}</TableCell>

                                                    <TableCell align="right">₹{(item.price * item.quantity).toFixed(2)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDetails}>Close</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default Orders;