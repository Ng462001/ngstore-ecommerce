import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    IconButton,
    Chip,
    Divider,
    Grid,
    Avatar,
    Paper,
    Tabs,
    Tab,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Tooltip,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Alert,
    TextField,
    Select,
    FormControl,
    MenuItem,
    Stepper,
    Step,
    StepLabel,
    StepConnector,
    LinearProgress
} from '@mui/material';
import {
    Close,
    Person,
    Email,
    Phone,
    LocationOn,
    CalendarToday,
    ShoppingBag,
    Receipt,
    Visibility,
    CheckCircle,
    Schedule,
    AccountCircle,
    Security,
    Block,
    Edit,
    Save,
    ShoppingCart,
    Star,
    Payment,
    VerifiedUser,
    Mail,
    TrendingUp,
    LocalShipping,
    Inventory,
    Home,
    ArrowBack,
    Download,
    Print,
    AttachMoney,
    Discount,
    LocalOffer,
    TrackChanges
} from '@mui/icons-material';
import { format, differenceInDays, formatDistanceToNow, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// Order Details Modal Component
const OrderDetailsModal = ({ open, onClose, order }) => {
    if (!order) return null;

    const getStatusSteps = () => {
        const allSteps = ['Order Placed', 'Processing', 'Shipped', 'Out for delivery', 'Delivered'];
        const currentIndex = allSteps.findIndex(step =>
            order.status?.toLowerCase().includes(step.toLowerCase())
        );

        return {
            steps: allSteps,
            activeStep: currentIndex >= 0 ? currentIndex : 0
        };
    };

    const { steps, activeStep } = getStatusSteps();

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'PPpp');
        } catch (e) {
            return 'Invalid Date';
        }
    };

    const formatCurrency = (amount) => {
        if (!amount || isNaN(amount)) amount = 0;
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    maxHeight: '90vh'
                }
            }}
        >
            <Box sx={{ p: 3 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Box>
                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                            Order #{order._id?.substring(0, 8).toUpperCase()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Placed on {formatDate(order.createdAt)}
                        </Typography>
                    </Box>
                    <IconButton onClick={onClose}>
                        <Close />
                    </IconButton>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Order Status Stepper */}
                <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TrackChanges /> Order Status
                    </Typography>
                    <Stepper
                        activeStep={activeStep}
                        alternativeLabel
                        connector={<StepConnector />}
                        sx={{ mt: 2 }}
                    >
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel
                                    StepIconProps={{
                                        sx: {
                                            color: steps.indexOf(label) <= activeStep ? 'primary.main' : 'grey.300',
                                        }
                                    }}
                                >
                                    {label}
                                </StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Chip
                            label={order.status || 'Unknown'}
                            color={
                                order.status === 'Delivered' ? 'success' :
                                    order.status === 'Cancelled' ? 'error' :
                                        order.status === 'Processing' ? 'warning' : 'info'
                            }
                            variant="filled"
                            sx={{ fontWeight: 'bold' }}
                        />
                    </Box>
                </Paper>

                <Grid container spacing={3}>
                    {/* Order Items */}
                    <Grid item xs={12} md={7}>
                        <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <ShoppingBag /> Order Items ({order.orderItems?.length || 0})
                            </Typography>
                            <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                                {(order.orderItems || []).map((item, index) => (
                                    <React.Fragment key={index}>
                                        <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                                            <Avatar
                                                sx={{
                                                    width: 60,
                                                    height: 60,
                                                    mr: 2,
                                                    bgcolor: 'grey.100',
                                                    color: 'text.secondary'
                                                }}
                                            >
                                                {item.name?.charAt(0) || 'P'}
                                            </Avatar>
                                            <ListItemText
                                                primary={
                                                    <Typography variant="subtitle1" fontWeight="bold">
                                                        {item.name || 'Unknown Product'}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Quantity: {item.quantity || 1}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Price: {formatCurrency(item.price)}
                                                        </Typography>
                                                    </>
                                                }
                                            />
                                            <Typography variant="subtitle1" fontWeight="bold">
                                                {formatCurrency((item.price || 0) * (item.quantity || 1))}
                                            </Typography>
                                        </ListItem>
                                        {index < (order.orderItems?.length || 0) - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </List>
                        </Paper>
                    </Grid>

                    {/* Order Summary */}
                    <Grid item xs={12} md={5}>
                        <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Receipt /> Order Summary
                            </Typography>

                            <Box sx={{ mt: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2">Subtotal:</Typography>
                                    <Typography variant="body2">{formatCurrency(order.totalPrice)}</Typography>
                                </Box>

                                {order.shippingPrice > 0 && (
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2">Shipping:</Typography>
                                        <Typography variant="body2">{formatCurrency(order.shippingPrice)}</Typography>
                                    </Box>
                                )}

                                {order.taxPrice > 0 && (
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2">Tax:</Typography>
                                        <Typography variant="body2">{formatCurrency(order.taxPrice)}</Typography>
                                    </Box>
                                )}

                                {order.discount > 0 && (
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, color: 'success.main' }}>
                                        <Typography variant="body2">Discount:</Typography>
                                        <Typography variant="body2">-{formatCurrency(order.discount)}</Typography>
                                    </Box>
                                )}

                                <Divider sx={{ my: 2 }} />

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography variant="h6">Total:</Typography>
                                    <Typography variant="h6" color="primary" fontWeight="bold">
                                        {formatCurrency(order.totalPrice)}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Payment Information */}
                            <Box sx={{ mt: 3 }}>
                                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Payment fontSize="small" /> Payment Details
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2">Method:</Typography>
                                    <Chip
                                        label={order.paymentMethod || 'Unknown'}
                                        size="small"
                                        color={order.paymentMethod === 'COD' ? 'warning' : 'success'}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2">Status:</Typography>
                                    <Chip
                                        label={order.paymentStatus || 'Pending'}
                                        size="small"
                                        color={
                                            order.paymentStatus === 'Paid' ? 'success' :
                                                order.paymentStatus === 'Failed' ? 'error' : 'warning'
                                        }
                                    />
                                </Box>
                            </Box>

                            {/* Shipping Information */}
                            <Box sx={{ mt: 3 }}>
                                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <LocalShipping fontSize="small" /> Shipping Info
                                </Typography>
                                {order.shippingAddress ? (
                                    <Typography variant="body2" color="text.secondary">
                                        {order.shippingAddress.address || order.shippingAddress.street || 'No address'},
                                        {order.shippingAddress.city || ''},
                                        {order.shippingAddress.state || ''} -
                                        {order.shippingAddress.pinCode || order.shippingAddress.zipCode || ''}
                                    </Typography>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">No shipping address</Typography>
                                )}
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Actions */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                    <Button
                        variant="outlined"
                        className='print-button'
                        startIcon={<Print />}
                        onClick={() => window.print()

                        }
                    >
                        Print
                    </Button>
                </Box>
            </Box>
        </Dialog>
    );
};

// Main Customer Details Modal
const CustomerDetailsModal = ({ open, onClose, customer, onCustomerUpdate }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [customerDetails, setCustomerDetails] = useState(null);
    const [orderStats, setOrderStats] = useState({
        totalOrders: 0,
        totalSpent: 0,
        averageOrderValue: 0,
        successfulOrders: 0,
        cancelledOrders: 0,
        pendingOrders: 0,
        lastOrderDate: null,
        firstOrderDate: null,
        orderFrequency: 0
    });
    const [editMode, setEditMode] = useState(false);
    const [editedCustomer, setEditedCustomer] = useState(null);
    const [saving, setSaving] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderModalOpen, setOrderModalOpen] = useState(false);

    const API_URL = `${import.meta.env.VITE_API_URL}/api`;

    // Reset state when modal closes
    useEffect(() => {
        if (!open) {
            resetState();
        }
    }, [open]);

    // Fetch customer details when modal opens
    useEffect(() => {
        if (open && customer?._id) {
            fetchCustomerDetails();
            fetchCustomerOrders();
        }
    }, [open, customer?._id]);

    // Initialize editedCustomer when customerDetails changes
    useEffect(() => {
        if (customerDetails) {
            setEditedCustomer({ ...customerDetails });
        }
    }, [customerDetails]);

    const fetchCustomerDetails = async () => {
        if (!customer?._id) return;

        try {
            setLoadingDetails(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/admin/users/${customer._id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data) {
                const customerData = response.data;
                // Map backend address structure to frontend format
                if (customerData.addresses && customerData.addresses.length > 0) {
                    const address = customerData.addresses[0];
                    customerData.shippingAddress = {
                        fullName: customerData.name,
                        address: address.street,
                        city: address.city,
                        state: address.state,
                        pinCode: address.zipCode,
                        country: address.country,
                        phone: address.mobile || customerData.phone
                    };
                }
                setCustomerDetails(customerData);
            }
        } catch (error) {
            console.error('Error fetching customer details:', error);
        } finally {
            setLoadingDetails(false);
        }
    };

    const fetchCustomerOrders = async () => {
        if (!customer?._id) return;

        try {
            setLoadingOrders(true);
            const token = localStorage.getItem('token');

            // Try the specific user orders endpoint first
            let orders = [];
            try {
                const response = await axios.get(`${API_URL}/admin/users/${customer._id}/orders`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                orders = response.data || [];
            } catch (error) {
                console.log('Trying fallback endpoint...');
                // Fallback: Search orders by email
                const searchResponse = await axios.get(
                    `${API_URL}/admin/orders/search?query=${customer.email}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                orders = searchResponse.data || [];
            }

            setOrders(orders);

            // Calculate stats
            if (orders.length > 0) {
                const successfulOrders = orders.filter(o => o.status === 'Delivered').length;
                const cancelledOrders = orders.filter(o => o.status === 'Cancelled').length;
                const pendingOrders = orders.filter(o =>
                    ['Processing', 'Shipped', 'Out for delivery'].includes(o.status)
                ).length;

                const totalSpent = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
                const averageOrderValue = orders.length > 0 ? totalSpent / orders.length : 0;

                const orderDates = orders.map(o => new Date(o.createdAt || Date.now()));
                const lastOrderDate = orderDates.length > 0 ? new Date(Math.max(...orderDates)) : null;
                const firstOrderDate = orderDates.length > 0 ? new Date(Math.min(...orderDates)) : null;

                let orderFrequency = 0;
                if (firstOrderDate && orders.length > 0) {
                    const daysSinceFirstOrder = differenceInDays(new Date(), firstOrderDate);
                    orderFrequency = daysSinceFirstOrder > 0 ? (orders.length / daysSinceFirstOrder) * 30 : 0;
                }

                setOrderStats({
                    totalOrders: orders.length,
                    totalSpent,
                    averageOrderValue,
                    successfulOrders,
                    cancelledOrders,
                    pendingOrders,
                    lastOrderDate,
                    firstOrderDate,
                    orderFrequency
                });
            }
        } catch (error) {
            console.error('Error fetching customer orders:', error);
            setOrders([]);
        } finally {
            setLoadingOrders(false);
        }
    };

    const handleSaveChanges = async () => {
        if (!editedCustomer || !customer?._id) return;

        try {
            setSaving(true);
            const token = localStorage.getItem('token');

            // Prepare data for backend (remove frontend-specific fields)
            const updateData = {
                name: editedCustomer.name,
                email: editedCustomer.email,
                phone: editedCustomer.phone,
                role: editedCustomer.role,
                status: editedCustomer.status,
                adminNotes: editedCustomer.adminNotes,
            };

            const response = await axios.put(
                `${API_URL}/admin/users/${customer._id}`,
                updateData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data && onCustomerUpdate) {
                onCustomerUpdate(response.data);
            }

            setEditMode(false);
            await fetchCustomerDetails(); // Refresh data
        } catch (error) {
            console.error('Error updating customer:', error);
            alert('Error updating customer details: ' + (error.response?.data?.message || error.message));
        } finally {
            setSaving(false);
        }
    };

    const resetState = () => {
        setOrders([]);
        setActiveTab(0);
        setCustomerDetails(null);
        setEditedCustomer(null);
        setOrderStats({
            totalOrders: 0,
            totalSpent: 0,
            averageOrderValue: 0,
            successfulOrders: 0,
            cancelledOrders: 0,
            pendingOrders: 0,
            lastOrderDate: null,
            firstOrderDate: null,
            orderFrequency: 0
        });
        setEditMode(false);
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'PPpp');
        } catch (e) {
            return 'Invalid Date';
        }
    };

    const formatCurrency = (amount) => {
        if (!amount || isNaN(amount)) amount = 0;
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(amount);
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'delivered': return 'success';
            case 'out for delivery': return 'info';
            case 'shipped': return 'primary';
            case 'processing': return 'warning';
            case 'cancelled': return 'error';
            default: return 'default';
        }
    };

    const getCustomerValueScore = () => {
        if (orderStats.totalOrders === 0) return 0;

        const score = (
            (orderStats.totalOrders * 0.3) +
            (orderStats.totalSpent / 1000 * 0.4) +
            (orderStats.successfulOrders / Math.max(orderStats.totalOrders, 1) * 0.3)
        );

        return Math.min(Math.round(score * 20), 100);
    };

    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setOrderModalOpen(true);
    };

    const handleCloseOrderModal = () => {
        setOrderModalOpen(false);
        setSelectedOrder(null);
    };

    const renderOverviewTab = () => {
        if (loadingDetails) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            );
        }

        // Use the correct data source based on edit mode
        const displayCustomer = editMode ? editedCustomer : (customerDetails || customer);

        if (!displayCustomer) {
            return (
                <Alert severity="warning">
                    Customer data not available
                </Alert>
            );
        }

        const valueScore = getCustomerValueScore();

        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Grid container spacing={3}>
                    {/* Customer Profile Card */}
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <AccountCircle color="primary" /> Profile
                                </Typography>
                                <Box>
                                    <Tooltip title={editMode ? "Cancel Editing" : "Edit Profile"}>
                                        <IconButton
                                            size="small"
                                            onClick={() => {
                                                if (editMode && customerDetails) {
                                                    // Reset to original customer details
                                                    setEditedCustomer({ ...customerDetails });
                                                }
                                                setEditMode(!editMode);
                                            }}
                                            sx={{
                                                bgcolor: editMode ? 'action.selected' : 'transparent',
                                                '&:hover': { bgcolor: 'action.hover' }
                                            }}
                                        >
                                            {editMode ? <Close fontSize="small" /> : <Edit fontSize="small" />}
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Box>
                            <Divider sx={{ mb: 3 }} />

                            <Box sx={{ textAlign: 'center', mb: 3 }}>
                                <Avatar
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        fontSize: '2rem',
                                        mx: 'auto',
                                        mb: 2
                                    }}
                                >
                                    {displayCustomer.name?.charAt(0).toUpperCase() || 'U'}
                                </Avatar>

                                {editMode ? (
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={editedCustomer?.name || ''}
                                        onChange={(e) => setEditedCustomer({
                                            ...editedCustomer,
                                            name: e.target.value
                                        })}
                                        sx={{ mb: 2 }}
                                    />
                                ) : (
                                    <Typography variant="h6" gutterBottom>
                                        {displayCustomer.name || 'No Name'}
                                    </Typography>
                                )}

                                <Chip
                                    icon={displayCustomer.role === 'admin' ? <Security /> : <Person />}
                                    label={displayCustomer.role === 'admin' ? 'Admin' : 'User'}
                                    color={displayCustomer.role === 'admin' ? 'error' : 'primary'}
                                    size="small"
                                    variant="outlined"
                                    sx={{ mb: 1 }}
                                />
                            </Box>

                            <List dense>
                                <ListItem>
                                    <ListItemIcon><Email fontSize="small" /></ListItemIcon>
                                    {editMode ? (
                                        <TextField
                                            fullWidth
                                            size="small"
                                            value={editedCustomer?.email || ''}
                                            onChange={(e) => setEditedCustomer({
                                                ...editedCustomer,
                                                email: e.target.value
                                            })}
                                        />
                                    ) : (
                                        <ListItemText
                                            primary="Email"
                                            secondary={displayCustomer.email || 'No email'}
                                        />
                                    )}
                                </ListItem>

                                <ListItem>
                                    <ListItemIcon><Phone fontSize="small" /></ListItemIcon>
                                    {editMode ? (
                                        <TextField
                                            fullWidth
                                            size="small"
                                            value={editedCustomer?.phone || ''}
                                            onChange={(e) => setEditedCustomer({
                                                ...editedCustomer,
                                                phone: e.target.value
                                            })}
                                        />
                                    ) : (
                                        <ListItemText
                                            primary="Phone"
                                            secondary={displayCustomer.phone || 'Not provided'}
                                        />
                                    )}
                                </ListItem>

                                <ListItem>
                                    <ListItemIcon><CalendarToday fontSize="small" /></ListItemIcon>
                                    <ListItemText
                                        primary="Member Since"
                                        secondary={
                                            <Box component="span">
                                                {formatDate(displayCustomer.createdAt)}
                                                {displayCustomer.createdAt && (
                                                    <Typography variant="caption" display="block" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                                        {formatDistanceToNow(new Date(displayCustomer.createdAt), { addSuffix: true })}
                                                    </Typography>
                                                )}
                                            </Box>
                                        }
                                    />
                                </ListItem>

                                <ListItem>
                                    <ListItemIcon>
                                        {displayCustomer.status === 'Active' ? (
                                            <CheckCircle color="success" />
                                        ) : (
                                            <Block color="error" />
                                        )}
                                    </ListItemIcon>
                                    {editMode ? (
                                        <FormControl fullWidth size="small">
                                            <Select
                                                value={editedCustomer?.status || 'Inactive'}
                                                onChange={(e) => setEditedCustomer({
                                                    ...editedCustomer,
                                                    status: e.target.value
                                                })}
                                            >
                                                <MenuItem value="Active">Active</MenuItem>
                                                <MenuItem value="Inactive">Inactive</MenuItem>
                                            </Select>
                                        </FormControl>
                                    ) : (
                                        <ListItemText
                                            primary="Account Status"
                                            secondary={displayCustomer.status || 'Inactive'}
                                        />
                                    )}
                                </ListItem>
                            </List>

                            {/* Admin Notes */}
                            <Divider sx={{ my: 2 }} />
                            <Box>
                                <Typography variant="caption" color="text.secondary" gutterBottom>
                                    Admin Notes
                                </Typography>
                                {editMode ? (
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={4}
                                        variant="outlined"
                                        size="small"
                                        placeholder="Add private notes about this customer..."
                                        value={editedCustomer?.adminNotes || ''}
                                        onChange={(e) => setEditedCustomer({
                                            ...editedCustomer,
                                            adminNotes: e.target.value
                                        })}
                                        sx={{ mt: 1 }}
                                    />
                                ) : (
                                    <Paper
                                        variant="outlined"
                                        sx={{
                                            p: 2,
                                            mt: 1,
                                            bgcolor: 'grey.50',
                                            minHeight: 80,
                                            fontStyle: displayCustomer.adminNotes ? 'normal' : 'italic',
                                            color: displayCustomer.adminNotes ? 'text.primary' : 'text.secondary'
                                        }}
                                    >
                                        <Typography variant="body2">
                                            {displayCustomer.adminNotes || 'No notes added yet.'}
                                        </Typography>
                                    </Paper>
                                )}
                            </Box>

                            {editMode && (
                                <Box sx={{ mt: 3 }}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        onClick={handleSaveChanges}
                                        disabled={saving || !editedCustomer}
                                        startIcon={<Save />}
                                    >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </Box>
                            )}
                        </Paper>
                    </Grid>

                    {/* Customer Value & Stats */}
                    <Grid item xs={12} md={8}>
                        <Grid container spacing={3}>
                            {/* Customer Value Score */}
                            <Grid item xs={12}>
                                <Paper sx={{ p: 3, borderRadius: 2 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Customer Value Score
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                                            <CircularProgress
                                                variant="determinate"
                                                value={valueScore}
                                                size={100}
                                                thickness={4}
                                                color={
                                                    valueScore >= 80 ? 'success' :
                                                        valueScore >= 60 ? 'primary' :
                                                            valueScore >= 40 ? 'warning' : 'error'
                                                }
                                            />
                                            <Box
                                                sx={{
                                                    top: 0,
                                                    left: 0,
                                                    bottom: 0,
                                                    right: 0,
                                                    position: 'absolute',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <Typography variant="h6" component="div">
                                                    {valueScore}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                {valueScore >= 80 ? 'VIP Customer' :
                                                    valueScore >= 60 ? 'Loyal Customer' :
                                                        valueScore >= 40 ? 'Regular Customer' : 'New Customer'}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Based on order frequency, total spend, and success rate
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            </Grid>

                            {/* Quick Stats */}
                            <Grid item xs={12}>
                                <Paper sx={{ p: 3, borderRadius: 2 }}>
                                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <ShoppingBag /> Quick Stats
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={6} sm={3}>
                                            <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                                                <Typography variant="h4" color="primary" fontWeight="bold">
                                                    {orderStats.totalOrders}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Total Orders
                                                </Typography>
                                            </Card>
                                        </Grid>
                                        <Grid item xs={6} sm={3}>
                                            <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                                                <Typography variant="h4" color="secondary" fontWeight="bold">
                                                    ₹{orderStats.totalSpent}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Total Spent
                                                </Typography>
                                            </Card>
                                        </Grid>
                                        <Grid item xs={6} sm={3}>
                                            <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                                                <Typography variant="h4" color="success" fontWeight="bold">
                                                    {orderStats.successfulOrders}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Completed
                                                </Typography>
                                            </Card>
                                        </Grid>
                                        <Grid item xs={6} sm={3}>
                                            <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                                                <Typography variant="h4" color="warning" fontWeight="bold">
                                                    {orderStats.orderFrequency.toFixed(1)}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Orders/Month
                                                </Typography>
                                            </Card>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Grid>

                            {/* Address Information */}
                            <Grid item xs={12}>
                                <Paper sx={{ p: 3, borderRadius: 2 }}>
                                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <LocationOn /> Address Information
                                    </Typography>
                                    {displayCustomer.shippingAddress ? (
                                        <Box>
                                            <Typography variant="body1" gutterBottom>
                                                <strong>{displayCustomer.shippingAddress.fullName || displayCustomer.name || 'No Name'}</strong>
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {displayCustomer.shippingAddress.address || 'No address'}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {displayCustomer.shippingAddress.city || ''},
                                                {displayCustomer.shippingAddress.state || ''} -
                                                {displayCustomer.shippingAddress.pinCode || ''}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {displayCustomer.shippingAddress.country || ''}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                <Phone fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                                                {displayCustomer.shippingAddress.phone || displayCustomer.phone || 'No phone'}
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Alert severity="info">
                                            No address information available
                                        </Alert>
                                    )}
                                </Paper>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </motion.div>
        );
    };

    const renderOrdersTab = () => {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Paper sx={{ borderRadius: 2, overflow: 'hidden', mb: 3 }}>
                    <Box sx={{ p: 3, bgcolor: 'grey.50' }}>
                        <Typography variant="h6" gutterBottom>
                            Order Statistics
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6} md={3}>
                                <Typography variant="caption" color="text.secondary">Total Orders</Typography>
                                <Typography variant="h5">{orderStats.totalOrders}</Typography>
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <Typography variant="caption" color="text.secondary">Average Order</Typography>
                                <Typography variant="h5">{formatCurrency(orderStats.averageOrderValue)}</Typography>
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <Typography variant="caption" color="text.secondary">Success Rate</Typography>
                                <Typography variant="h5">
                                    {orderStats.totalOrders ?
                                        ((orderStats.successfulOrders / orderStats.totalOrders) * 100).toFixed(1) : 0}%
                                </Typography>
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <Typography variant="caption" color="text.secondary">Cancellation Rate</Typography>
                                <Typography variant="h5">
                                    {orderStats.totalOrders ?
                                        ((orderStats.cancelledOrders / orderStats.totalOrders) * 100).toFixed(1) : 0}%
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>
                </Paper>

                {loadingOrders ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : orders.length === 0 ? (
                    <Alert severity="info">
                        No orders found for this customer.
                    </Alert>
                ) : (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead sx={{ bgcolor: 'primary.light' }}>
                                <TableRow>
                                    <TableCell><strong>Order ID</strong></TableCell>
                                    <TableCell><strong>Date</strong></TableCell>
                                    <TableCell><strong>Items</strong></TableCell>
                                    <TableCell><strong>Total</strong></TableCell>
                                    <TableCell><strong>Status</strong></TableCell>
                                    <TableCell><strong>Payment</strong></TableCell>
                                    <TableCell><strong>Actions</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {orders.map((order) => (
                                    <TableRow key={order._id || order.id} hover>
                                        <TableCell sx={{ fontFamily: 'monospace' }}>
                                            #{order._id?.substring(0, 8).toUpperCase() || 'N/A'}
                                        </TableCell>
                                        <TableCell>{formatDate(order.createdAt)}</TableCell>
                                        <TableCell>
                                            <Tooltip
                                                title={
                                                    <Box>
                                                        {(order.orderItems || []).map((item, idx) => (
                                                            <Typography key={idx} variant="body2">
                                                                {(item.quantity || 0)}x {item.name || 'Unknown'} - {formatCurrency(item.price)}
                                                            </Typography>
                                                        ))}
                                                    </Box>
                                                }
                                            >
                                                <Typography variant="body2">
                                                    {(order.orderItems || []).length} item(s)
                                                </Typography>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>
                                            <Typography fontWeight="bold" color="primary">
                                                {formatCurrency(order.totalPrice)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                icon={order.status === 'Delivered' ? <CheckCircle /> : <Schedule />}
                                                label={order.status || 'Unknown'}
                                                size="small"
                                                color={getStatusColor(order.status)}
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                icon={<Payment />}
                                                label={order.paymentMethod || 'Unknown'}
                                                size="small"
                                                color={
                                                    order.paymentStatus === 'Paid' ? 'success' :
                                                        order.paymentStatus === 'Failed' ? 'error' : 'warning'
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title="View Order Details">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleViewOrder(order)}
                                                >
                                                    <Visibility fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </motion.div>
        );
    };

    if (!customer) return null;

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        maxHeight: '90vh',
                        overflow: 'hidden'
                    }
                }}
            >
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Box sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        p: 3,
                        position: 'relative'
                    }}>
                        <DialogTitle sx={{ p: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar
                                    sx={{
                                        width: 64,
                                        height: 64,
                                        bgcolor: 'white',
                                        color: '#667eea',
                                        fontWeight: 'bold',
                                        fontSize: '1.5rem',
                                        border: '2px solid rgba(255,255,255,0.5)'
                                    }}
                                >
                                    {customer.name?.charAt(0).toUpperCase() || 'U'}
                                </Avatar>
                                <Box>
                                    <Typography variant="h5" fontWeight="bold">
                                        {customer.name || 'Unknown Customer'}
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.9, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Email sx={{ fontSize: 16 }} /> {customer.email || 'No email'}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                        <Chip
                                            icon={<VerifiedUser />}
                                            label={customer.role === 'admin' ? 'Admin' : 'User'}
                                            size="small"
                                            sx={{ bgcolor: 'rgba(0, 255, 55, 0.45)', color: 'white' }}
                                        />
                                    </Box>
                                </Box>
                            </Box>
                            <IconButton
                                onClick={onClose}
                                sx={{
                                    color: 'white',
                                    bgcolor: 'rgba(255,255,255,0.1)',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                                }}
                            >
                                <Close />
                            </IconButton>
                        </DialogTitle>
                    </Box>
                </motion.div>

                {/* Tabs */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, bgcolor: 'white' }}>
                    <Tabs value={activeTab} onChange={handleTabChange}>
                        <Tab label="Overview" icon={<Person />} iconPosition="start" />
                        <Tab label={`Orders (${orderStats.totalOrders})`} icon={<ShoppingBag />} iconPosition="start" />
                    </Tabs>
                </Box>

                <DialogContent dividers sx={{ p: 0, bgcolor: '#f9fafb', maxHeight: 'calc(90vh - 200px)' }}>
                    <Box sx={{ p: 3 }}>
                        {activeTab === 0 && renderOverviewTab()}
                        {activeTab === 1 && renderOrdersTab()}
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 2, bgcolor: 'grey.50', justifyContent: 'space-between' }}>
                    <Box>
                        {editMode && (
                            <Button
                                onClick={() => {
                                    setEditMode(false);
                                    setEditedCustomer({ ...customerDetails }); // Reset to original
                                }}
                                variant="outlined"
                                sx={{ mr: 1 }}
                            >
                                Cancel
                            </Button>
                        )}
                    </Box>
                    <Box>
                        <Button
                            onClick={onClose}
                            variant="contained"
                            color="primary"
                        >
                            Close
                        </Button>
                    </Box>
                </DialogActions>
            </Dialog>

            {/* Order Details Modal */}
            <OrderDetailsModal
                open={orderModalOpen}
                onClose={handleCloseOrderModal}
                order={selectedOrder}
            />
        </>
    );
};

export default CustomerDetailsModal;