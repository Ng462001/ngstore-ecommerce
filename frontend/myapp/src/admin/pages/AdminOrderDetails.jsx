import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Grid,
    Chip,
    Button,
    Divider,
    Avatar,
    IconButton,
    Stack,
    Alert,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Switch,
    FormControlLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Snackbar,
    Alert as MuiAlert,
    Paper,
    Breadcrumbs,
    Link,
    Stepper,
    Step,
    StepLabel,
    CircularProgress,
    Fab,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Tabs,
    Tab
} from '@mui/material';
import {
    ArrowBack,
    LocalShipping,
    ShoppingBag,
    Person,
    LocationOn,
    Print,
    Email,
    Phone,
    Edit,
    Refresh,
    Assignment,
    Timeline,
    AttachMoney,
    Description,
    Tag,
    PriorityHigh,
    Schedule,
    Payment,
    Cancel,
    CheckCircle,
    Error,
    Info,
    Add,
    Star,
    StarBorder,
    CopyAll,
    History,
    Assessment,
    Download
} from '@mui/icons-material';
import axios from 'axios';
import { format, isValid } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AlertComponent = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const AdminOrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
    const [refundDialogOpen, setRefundDialogOpen] = useState(false);
    const [tagsDialogOpen, setTagsDialogOpen] = useState(false);
    const [notes, setNotes] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('');
    const [sendNotification, setSendNotification] = useState(true);
    const [newTag, setNewTag] = useState('');
    const [orderTags, setOrderTags] = useState([]);
    const [isPriority, setIsPriority] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [activityLog, setActivityLog] = useState([]);
    const [customerStats, setCustomerStats] = useState(null);
    const [loadingAction, setLoadingAction] = useState(false);
    const [printing, setPrinting] = useState(false);

    const statusOptions = [
        { value: 'Pending', label: 'Pending', color: '#FFB020', icon: Schedule },
        { value: 'Processing', label: 'Processing', color: '#5048E5', icon: Refresh },
        { value: 'Shipped', label: 'Shipped', color: '#2196F3', icon: LocalShipping },
        { value: 'Out for delivery', label: 'Out for Delivery', color: '#FF6B6B', icon: LocalShipping },
        { value: 'Delivered', label: 'Delivered', color: '#36B37E', icon: CheckCircle },
        { value: 'Cancelled', label: 'Cancelled', color: '#FF5630', icon: Cancel },
        { value: 'Returned', label: 'Returned', color: '#6554C0', icon: Assignment },
        { value: 'Refunded', label: 'Refunded', color: '#00B8D9', icon: AttachMoney }
    ];

    const paymentStatusOptions = [
        { value: 'Pending', label: 'Pending', color: 'warning', icon: Schedule },
        { value: 'Paid', label: 'Paid', color: 'success', icon: CheckCircle },
        { value: 'Failed', label: 'Failed', color: 'error', icon: Error },
        { value: 'Refunded', label: 'Refunded', color: 'info', icon: AttachMoney }
    ];

    const statusTimeline = useMemo(() => {
        if (!order) return [];

        const defaultSteps = [
            { status: 'Pending', action: 'Order placed' },
            { status: 'Processing', action: 'Order confirmed' },
            { status: 'Shipped', action: 'Shipped to carrier' },
            { status: 'Out for delivery', action: 'Out for delivery' },
            { status: 'Delivered', action: 'Delivered' }
        ];

        if (order.status === 'Cancelled') {
            return [
                { status: 'Pending', action: 'Order placed' },
                { status: 'Cancelled', action: 'Order Cancelled', isError: true }
            ];
        }

        if (order.status === 'Returned') {
            return [...defaultSteps, { status: 'Returned', action: 'Order Returned', isError: true }];
        }

        if (order.status === 'Refunded') {
            return [...defaultSteps, { status: 'Refunded', action: 'Order Refunded' }];
        }

        return defaultSteps;
    }, [order]);

    // Memoized calculations
    const totalAmount = useMemo(() => {
        return order?.orderItems?.reduce((total, item) => total + item.price * item.quantity, 0) || 0;
    }, [order?.orderItems]);

    const subtotal = useMemo(() => {
        return totalAmount + (order?.shippingPrice || 0) + (order?.taxPrice || 0);
    }, [totalAmount, order?.shippingPrice, order?.taxPrice]);

    // API Error Handler
    const handleApiError = useCallback((err, defaultMessage) => {
        console.error('API Error:', err);

        if (err.response?.status === 401) {
            navigate('/admin/login');
            showSnackbar('Session expired. Please login again.', 'error');
            return;
        }

        const message = err.response?.data?.message || err.message || defaultMessage || 'Operation failed';
        showSnackbar(message, 'error');
    }, [navigate]);

    // Fetch order details
    const fetchOrderDetails = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
                navigate('/admin/login');
                return;
            }

            const response = await axios.get(`${API_URL}/api/admin/orders/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log(response.data);
            setOrder(response.data);
            setSelectedStatus(response.data.status);
            setSelectedPaymentStatus(response.data.paymentStatus);
            setNotes(response.data.adminNotes || '');
            setOrderTags(response.data.tags || []);
            setIsPriority(response.data.isPriority || false);
            setCustomerStats(response.data.customerStats || response.data.user);
            setError(null);
        } catch (err) {
            handleApiError(err, 'Failed to load order details');
            setError('Failed to load order details');
        } finally {
            setLoading(false);
        }
    }, [id, navigate, handleApiError]);

    // Fetch activity log
    const fetchActivityLog = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/admin/orders/${id}/activity`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log(response.data);
            setActivityLog(response.data || []);
        } catch (err) {
            console.error('Error fetching activity log:', err);
        }
    }, [id]);

    useEffect(() => {
        fetchOrderDetails();
        fetchActivityLog();
    }, [fetchOrderDetails, fetchActivityLog]);

    const getAllowedTransitions = (currentStatus) => {
        const s = currentStatus || 'Pending';
        switch (s) {
            case 'Pending':
                return ['Confirmed', 'Processing', 'Cancelled'];
            case 'Confirmed':
                return ['Pending', 'Processing', 'Cancelled'];
            case 'Processing':
                return ['Pending', 'Shipped', 'Cancelled'];
            case 'Shipped':
                return ['Processing', 'Out for delivery', 'Cancelled'];
            case 'Out for delivery':
                return ['Shipped', 'Delivered', 'Cancelled'];
            case 'Delivered':
                return ['Returned'];
            case 'Returned':
                return ['Refunded'];
            case 'Cancelled':
                return ['Pending'];
            case 'Refunded':
            default:
                return [];
        }
    };

    const getAllowedPaymentTransitions = (currentStatus) => {
        const s = (currentStatus || 'Pending').toLowerCase();
        switch (s) {
            case 'pending':
                return ['Paid'];
            case 'failed':
                return ['Pending'];
            case 'paid':
                return ['Refunded'];
            case 'refunded':
            default:
                return [];
        }
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleStatusUpdate = async () => {
        try {
            setLoadingAction(true);
            const token = localStorage.getItem('token');

            await axios.put(
                `${API_URL}/api/admin/orders/${id}/status`,
                {
                    status: selectedStatus,
                    notes: notes.trim(),
                    notifyCustomer: sendNotification
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setOrder(prev => ({ ...prev, status: selectedStatus }));
            showSnackbar('Order status updated successfully', 'success');
            setStatusDialogOpen(false);
            fetchActivityLog();
        } catch (err) {
            handleApiError(err, 'Failed to update status');
        } finally {
            setLoadingAction(false);
        }
    };

    const handlePaymentStatusUpdate = async () => {
        try {
            setLoadingAction(true);
            const token = localStorage.getItem('token');

            await axios.put(
                `${API_URL}/api/admin/orders/${id}/payment`,
                {
                    paymentStatus: selectedPaymentStatus,
                    paymentDetails: {
                        updatedBy: 'admin',
                        updatedAt: new Date().toISOString()
                    }
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setOrder(prev => ({
                ...prev,
                paymentStatus: selectedPaymentStatus,
                ...(selectedPaymentStatus === 'paid' ? {
                    isPaid: true,
                    paidAt: new Date().toISOString()
                } : selectedPaymentStatus === 'refunded' ? {
                    isPaid: false,
                    refundedAt: new Date().toISOString()
                } : {})
            }));

            showSnackbar('Payment status updated successfully', 'success');
            setPaymentDialogOpen(false);
            fetchActivityLog();
        } catch (err) {
            handleApiError(err, 'Failed to update payment status');
        } finally {
            setLoadingAction(false);
        }
    };

    const handleSaveNotes = async () => {
        if (!notes.trim()) {
            showSnackbar('Notes cannot be empty', 'warning');
            return;
        }

        try {
            setLoadingAction(true);
            const token = localStorage.getItem('token');

            await axios.put(
                `${API_URL}/api/admin/orders/${id}/notes`,
                { adminNotes: notes },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            showSnackbar('Notes saved successfully', 'success');
            setEditDialogOpen(false);
            fetchOrderDetails();
        } catch (err) {
            handleApiError(err, 'Failed to save notes');
        } finally {
            setLoadingAction(false);
        }
    };

    const handleRefund = async () => {
        try {
            setLoadingAction(true);
            const token = localStorage.getItem('token');

            await axios.post(
                `${API_URL}/api/admin/orders/${id}/refund`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setOrder(prev => ({
                ...prev,
                status: 'Refunded',
                paymentStatus: 'refunded',
                refundedAt: new Date().toISOString(),
                isPaid: false
            }));

            showSnackbar('Refund processed successfully', 'success');
            setRefundDialogOpen(false);
            fetchActivityLog();
        } catch (err) {
            handleApiError(err, 'Failed to process refund');
        } finally {
            setLoadingAction(false);
        }
    };

    const handleAddTags = async () => {
        if (!newTag.trim()) {
            showSnackbar('Tag cannot be empty', 'warning');
            return;
        }

        if (orderTags.includes(newTag.trim())) {
            showSnackbar('Tag already exists', 'warning');
            return;
        }

        try {
            setLoadingAction(true);
            const token = localStorage.getItem('token');

            const updatedTags = [...orderTags, newTag.trim()];

            await axios.post(
                `${API_URL}/api/admin/orders/${id}/tags`,
                { tags: updatedTags },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setOrderTags(updatedTags);
            setOrder(prev => ({ ...prev, tags: updatedTags }));
            setNewTag('');
            showSnackbar('Tag added successfully', 'success');
        } catch (err) {
            handleApiError(err, 'Failed to add tag');
        } finally {
            setLoadingAction(false);
        }
    };

    const handleRemoveTag = async (tagToRemove) => {
        try {
            const token = localStorage.getItem('token');
            const updatedTags = orderTags.filter(tag => tag !== tagToRemove);

            await axios.post(
                `${API_URL}/api/admin/orders/${id}/tags`,
                { tags: updatedTags },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setOrderTags(updatedTags);
            setOrder(prev => ({ ...prev, tags: updatedTags }));
            showSnackbar('Tag removed', 'success');
        } catch (err) {
            handleApiError(err, 'Failed to remove tag');
        }
    };

    const handleTogglePriority = async () => {
        try {
            setLoadingAction(true);
            const token = localStorage.getItem('token');
            const newPriorityStatus = !isPriority;

            await axios.put(
                `${API_URL}/api/admin/orders/${id}/priority`,
                { isPriority: newPriorityStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setIsPriority(newPriorityStatus);
            setOrder(prev => ({ ...prev, isPriority: newPriorityStatus }));
            showSnackbar(`Order ${newPriorityStatus ? 'marked as priority' : 'removed from priority'}`, 'success');
        } catch (err) {
            handleApiError(err, 'Failed to update priority');
        } finally {
            setLoadingAction(false);
        }
    };

    const handlePrintInvoice = () => {
        setPrinting(true);
        try {
            const printContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Invoice #${order?._id}</title>
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
                        <h3>Order #${order?._id}</h3>
                    </div>
                    
                    <div class="company-info">
                        <h4>Billed To:</h4>
                        <p>${customerStats?.name || 'N/A'}</p>
                        <p>${customerStats?.email || 'N/A'}</p>
                        <p>${customerStats?.phone || order?.shippingAddress?.mobile || 'N/A'}</p>
                    </div>
                    
                    <div class="billing-info">
                        <p><strong>Order Date:</strong> ${format(new Date(order?.createdAt), 'dd/MM/yyyy')}</p>
                        <p><strong>Status:</strong> ${order?.status}</p>
                        <p><strong>Payment Status:</strong> ${order?.paymentStatus}</p>
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
                            ${order?.orderItems?.map(item => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td>${item.quantity}</td>
                                    <td>₹${item.price}</td>
                                    <td>₹${item.price * item.quantity}</td>
                                </tr>
                            `).join('')}
                            <tr class="total-row">
                                <td colspan="3" style="text-align: right;">Subtotal:</td>
                                <td>₹${totalAmount || 0}</td>
                            </tr>
                            <tr class="total-row">
                                <td colspan="3" style="text-align: right;">Shipping:</td>
                                <td>₹${order?.shippingPrice || 0}</td>
                            </tr>
                            <tr class="total-row">
                                <td colspan="3" style="text-align: right;">Tax:</td>
                                <td>₹${order?.taxPrice || 0}</td>
                            </tr>
                            <tr class="total-row">
                                <td colspan="3" style="text-align: right;">Total:</td>
                                <td>₹${order?.totalPrice || 0}</td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <div class="footer">
                        <p>Thank you for your business!</p>
                        <p>Generated on ${format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
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

    const handleCopyOrderId = () => {
        navigator.clipboard.writeText(order?._id || '');
        showSnackbar('Order ID copied to clipboard', 'info');
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(amount || 0);
    };

    const getStatusColor = (status) => {
        const statusOption = statusOptions.find(opt => opt.value === status);
        return statusOption?.color || '#666';
    };

    const getActiveStep = () => {
        if (!order) return 0;
        const index = statusTimeline.findIndex(step => step.status === order.status);
        return index >= 0 ? index : 0;
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <Box sx={{ width: '100%', maxWidth: 600, textAlign: 'center' }}>
                    <CircularProgress size={60} thickness={4} sx={{ mb: 3 }} />
                    <Typography variant="h6" color="text.secondary">
                        Loading order details...
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Order ID: {id}
                    </Typography>
                </Box>
            </Box>
        );
    }

    if (error || !order) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <Alert
                        severity="error"
                        sx={{ mb: 3 }}
                        action={
                            <Button color="inherit" size="small" onClick={fetchOrderDetails}>
                                Retry
                            </Button>
                        }
                    >
                        {error || 'Order not found'}
                    </Alert>
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={() => navigate('/admin/orders')}
                        variant="contained"
                        sx={{ mt: 2 }}
                    >
                        Back to Orders
                    </Button>
                </motion.div>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            {/* Breadcrumb */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Breadcrumbs sx={{ mb: 3 }}>
                    <Link
                        underline="hover"
                        color="inherit"
                        href="/admin/orders"
                        sx={{ display: 'flex', alignItems: 'center' }}
                    >
                        <ShoppingBag sx={{ mr: 0.5 }} fontSize="small" />
                        Orders
                    </Link>
                    <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                        <Assignment sx={{ mr: 0.5 }} fontSize="small" />
                        Order #{order._id.substring(0, 8).toUpperCase()}
                    </Typography>
                </Breadcrumbs>
            </motion.div>

            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <Paper elevation={0} sx={{
                    p: 3,
                    mb: 3,
                    bgcolor: 'primary.main',
                    color: 'white',
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                <Typography variant="h4" fontWeight="bold">
                                    Order #{order._id.substring(0, 8).toUpperCase()}
                                </Typography>
                                <Chip
                                    label={order.status}
                                    sx={{
                                        bgcolor: 'white',
                                        color: getStatusColor(order.status),
                                        fontWeight: 'bold',
                                        fontSize: '0.875rem'
                                    }}
                                />
                            </Box>
                            <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                Placed on {format(new Date(order.createdAt), 'PPP pp')}
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}>
                                <Chip
                                    icon={<Person />}
                                    label={customerStats?.name || 'N/A'}
                                    size="small"
                                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                                />
                                <Chip
                                    icon={<Payment />}
                                    label={order.paymentMethod}
                                    size="small"
                                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                                />
                                {order.isPriority && (
                                    <Chip
                                        icon={<PriorityHigh />}
                                        label="Priority"
                                        size="small"
                                        sx={{ bgcolor: 'rgba(255,193,7,0.2)', color: '#ffc107' }}
                                    />
                                )}
                            </Stack>
                        </Box>

                        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                            <Tooltip title="Refresh">
                                <IconButton
                                    onClick={fetchOrderDetails}
                                    sx={{ color: 'white' }}
                                    aria-label="Refresh order details"
                                >
                                    <Refresh />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Copy Order ID">
                                <IconButton
                                    onClick={handleCopyOrderId}
                                    sx={{ color: 'white' }}
                                    aria-label="Copy order ID"
                                >
                                    <CopyAll />
                                </IconButton>
                            </Tooltip>
                            <Button
                                variant="contained"
                                startIcon={printing ? <CircularProgress size={20} /> : <Print />}
                                onClick={handlePrintInvoice}
                                disabled={printing}
                                sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
                            >
                                {printing ? 'Printing...' : 'Print Invoice'}
                            </Button>
                        </Stack>
                    </Box>
                </Paper>
            </motion.div>



            {/* Status Timeline */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Timeline /> Order Timeline
                    </Typography>
                    <Stepper activeStep={getActiveStep()} orientation="horizontal">
                        {statusTimeline.map((step, index) => (
                            <Step key={step.status} completed={index < getActiveStep() || order.status === 'Delivered'}>
                                <StepLabel
                                    error={step.isError}
                                    optional={
                                        index === getActiveStep() ? (
                                            <Typography variant="caption" color={step.isError ? "error" : "primary"}>
                                                {step.status}
                                            </Typography>
                                        ) : null
                                    }
                                >
                                    {step.action}
                                </StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                </Paper>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
                style={{ marginBottom: '2rem' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>Quick Actions</Typography>
                    <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} flexWrap="wrap">
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={loadingAction ? <CircularProgress size={20} /> : <Edit />}
                            onClick={() => setStatusDialogOpen(true)}
                            disabled={loadingAction}
                        >
                            Update Status
                        </Button>

                        <Button
                            variant="outlined"
                            color="secondary"
                            startIcon={loadingAction ? <CircularProgress size={20} /> : <Payment />}
                            onClick={() => {
                                setSelectedPaymentStatus(order.paymentStatus);
                                setPaymentDialogOpen(true);
                            }}
                            disabled={loadingAction}
                        >
                            Update Payment
                        </Button>

                        <Button
                            variant="outlined"
                            startIcon={loadingAction ? <CircularProgress size={20} /> : <Description />}
                            onClick={() => setEditDialogOpen(true)}
                            disabled={loadingAction}
                        >
                            {order.adminNotes ? 'Edit Notes' : 'Add Notes'}
                        </Button>

                        <Button
                            variant="outlined"
                            startIcon={loadingAction ? <CircularProgress size={20} /> : <Tag />}
                            onClick={() => setTagsDialogOpen(true)}
                            disabled={loadingAction}
                        >
                            Manage Tags
                        </Button>

                        <Button
                            variant="outlined"
                            color={isPriority ? "warning" : "inherit"}
                            startIcon={isPriority ? <Star /> : <StarBorder />}
                            onClick={handleTogglePriority}
                            disabled={loadingAction}
                        >
                            {isPriority ? 'Remove Priority' : 'Mark as Priority'}
                        </Button>

                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={loadingAction ? <CircularProgress size={20} /> : <Cancel />}
                            onClick={() => {
                                if (window.confirm('Are you sure you want to cancel this order?')) {
                                    setSelectedStatus('Cancelled');
                                    handleStatusUpdate();
                                }
                            }}
                            disabled={loadingAction || ['Cancelled', 'Delivered', 'Refunded'].includes(order.status)}
                        >
                            Cancel Order
                        </Button>

                        {order.paymentStatus === 'paid' && order.status !== 'Refunded' && (
                            <Button
                                variant="contained"
                                color="error"
                                startIcon={loadingAction ? <CircularProgress size={20} /> : <AttachMoney />}
                                onClick={() => setRefundDialogOpen(true)}
                                disabled={loadingAction}
                            >
                                Process Refund
                            </Button>
                        )}
                    </Stack>
                </Paper>
            </motion.div>

            {/* Tab Navigation */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
            >
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Tabs
                        value={tabValue}
                        onChange={(e, newValue) => setTabValue(newValue)}
                        variant="fullWidth"
                    >
                        <Tab
                            label="Overview"
                            icon={<Assignment />}
                            iconPosition="start"
                        />
                        <Tab
                            label="Activity Log"
                            icon={<History />}
                            iconPosition="start"
                        />
                    </Tabs>
                </Paper>
            </motion.div>

            <Grid container spacing={3}>
                {/* Main Content */}
                <Grid item xs={12} lg={8}>
                    <AnimatePresence mode="wait">
                        {tabValue === 0 && (
                            <motion.div
                                key="overview"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <Grid container spacing={3}>
                                    {/* Order Summary */}
                                    <Grid item xs={12}>
                                        <Paper sx={{ p: 3 }}>
                                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Assessment /> Order Summary
                                            </Typography>
                                            <Grid container spacing={3}>
                                                <Grid item xs={12} md={7}>
                                                    <TableContainer>
                                                        <Table size="small">
                                                            <TableBody>
                                                                <TableRow>
                                                                    <TableCell><strong>Order ID</strong></TableCell>
                                                                    <TableCell>
                                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                            #{order._id.substring(0, 8).toUpperCase()}
                                                                            <IconButton
                                                                                size="small"
                                                                                onClick={handleCopyOrderId}
                                                                                aria-label="Copy order ID"
                                                                            >
                                                                                <CopyAll fontSize="small" />
                                                                            </IconButton>
                                                                        </Box>
                                                                    </TableCell>
                                                                </TableRow>
                                                                <TableRow>
                                                                    <TableCell><strong>Customer</strong></TableCell>
                                                                    <TableCell>
                                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                            <Avatar sx={{ width: 24, height: 24 }}>
                                                                                {customerStats?.name?.charAt(0) || '?'}
                                                                            </Avatar>
                                                                            {customerStats?.name || 'N/A'}
                                                                        </Box>
                                                                    </TableCell>
                                                                </TableRow>
                                                                <TableRow>
                                                                    <TableCell><strong>Order Date</strong></TableCell>
                                                                    <TableCell>{format(new Date(order.createdAt), 'PPP pp')}</TableCell>
                                                                </TableRow>
                                                                <TableRow>
                                                                    <TableCell><strong>Payment Method</strong></TableCell>
                                                                    <TableCell>
                                                                        <Chip
                                                                            label={order.paymentMethod}
                                                                            size="small"
                                                                            icon={<Payment />}
                                                                        />
                                                                    </TableCell>
                                                                </TableRow>
                                                                <TableRow>
                                                                    <TableCell><strong>Payment Status</strong></TableCell>
                                                                    <TableCell>
                                                                        <Chip
                                                                            label={order.paymentStatus}
                                                                            size="small"
                                                                            color={order.paymentStatus === 'paid' ? 'success' :
                                                                                order.paymentStatus === 'pending' ? 'warning' : 'error'}
                                                                        />
                                                                    </TableCell>
                                                                </TableRow>
                                                                <TableRow>
                                                                    <TableCell><strong>Order Status</strong></TableCell>
                                                                    <TableCell>
                                                                        <Chip
                                                                            label={order.status}
                                                                            size="small"
                                                                            sx={{
                                                                                bgcolor: getStatusColor(order.status) + '20',
                                                                                color: getStatusColor(order.status)
                                                                            }}
                                                                        />
                                                                    </TableCell>
                                                                </TableRow>
                                                            </TableBody>
                                                        </Table>
                                                    </TableContainer>
                                                </Grid>
                                                <Grid item xs={12} md={5}>
                                                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                                                        <Stack spacing={2}>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <Typography>Subtotal:</Typography>
                                                                <Typography fontWeight="bold">
                                                                    {formatCurrency(totalAmount)}
                                                                </Typography>
                                                            </Box>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <Typography>Shipping:</Typography>
                                                                <Typography fontWeight="bold">
                                                                    {formatCurrency(order.shippingPrice || 0)}
                                                                </Typography>
                                                            </Box>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <Typography>Tax:</Typography>
                                                                <Typography fontWeight="bold">
                                                                    {formatCurrency(order.taxPrice || 0)}
                                                                </Typography>
                                                            </Box>
                                                            <Divider />
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <Typography variant="h6">Total:</Typography>
                                                                <Typography variant="h5" color="primary" fontWeight="bold">
                                                                    {formatCurrency(order.totalPrice || 0)}
                                                                </Typography>
                                                            </Box>
                                                            {order.discount && (
                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                    <Typography color="success.main">Discount Applied:</Typography>
                                                                    <Typography color="success.main" fontWeight="bold">
                                                                        -{formatCurrency(order.discount || 0)}
                                                                    </Typography>
                                                                </Box>
                                                            )}
                                                        </Stack>
                                                    </Paper>
                                                </Grid>
                                            </Grid>
                                        </Paper>
                                    </Grid>

                                    {/* Order Items */}
                                    <Grid item xs={12}>
                                        <Paper sx={{ p: 3 }}>
                                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                                <ShoppingBag /> Order Items ({order.orderItems?.length || 0})
                                            </Typography>
                                            <Stack spacing={2}>
                                                {order.orderItems?.map((item, index) => (
                                                    <motion.div
                                                        key={item._id || index}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: index * 0.1 }}
                                                    >
                                                        <Paper
                                                            elevation={1}
                                                            sx={{
                                                                p: 2,
                                                                '&:hover': {
                                                                    boxShadow: 3,
                                                                    bgcolor: 'action.hover'
                                                                }
                                                            }}
                                                        >
                                                            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                                                                <Avatar
                                                                    src={item.image ? (item.image.startsWith('http') ? item.image : API_URL + item.image) : ''}
                                                                    variant="rounded"
                                                                    sx={{ width: 80, height: 80 }}
                                                                >
                                                                    {!item.image && <ShoppingBag />}
                                                                </Avatar>
                                                                <Box sx={{ flex: 1 }}>
                                                                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'flex-start' }, gap: 2 }}>
                                                                        <Box>
                                                                            <Typography variant="subtitle1" fontWeight="bold">
                                                                                {item.name}
                                                                            </Typography>
                                                                            {item.selectedColor && (
                                                                                <Chip
                                                                                    label={`Color: ${item.selectedColor}`}
                                                                                    size="small"
                                                                                    sx={{ mr: 1, mt: 0.5 }}
                                                                                />
                                                                            )}
                                                                            {item.selectedSize && (
                                                                                <Chip
                                                                                    label={`Size: ${item.selectedSize}`}
                                                                                    size="small"
                                                                                    variant="outlined"
                                                                                    sx={{ mt: 0.5 }}
                                                                                />
                                                                            )}
                                                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                                                Product ID: {item.product}
                                                                            </Typography>
                                                                        </Box>
                                                                        <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                                                                            <Typography variant="h6" color="primary">
                                                                                {formatCurrency(item.price * item.quantity)}
                                                                            </Typography>
                                                                            <Typography variant="body2" color="text.secondary">
                                                                                {item.quantity} × {formatCurrency(item.price)}
                                                                            </Typography>
                                                                            {item.price !== item.originalPrice && (
                                                                                <Typography variant="caption" color="success.main">
                                                                                    Discount applied
                                                                                </Typography>
                                                                            )}
                                                                        </Box>
                                                                    </Box>
                                                                </Box>
                                                            </Box>
                                                        </Paper>
                                                    </motion.div>
                                                ))}
                                            </Stack>
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </motion.div>
                        )}

                        {tabValue === 1 && (
                            <motion.div
                                key="activity"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <Paper sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <History /> Activity Log
                                        </Typography>
                                        <Button
                                            startIcon={<Refresh />}
                                            onClick={fetchActivityLog}
                                            size="small"
                                        >
                                            Refresh Log
                                        </Button>
                                    </Box>
                                    {activityLog.length > 0 ? (
                                        <List>
                                            {activityLog.map((log, index) => (
                                                <motion.div
                                                    key={log._id || index}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                >
                                                    <ListItem
                                                        alignItems="flex-start"
                                                        sx={{
                                                            bgcolor: index % 2 === 0 ? 'action.hover' : 'transparent',
                                                            borderRadius: 1,
                                                            mb: 1
                                                        }}
                                                    >
                                                        <ListItemIcon>
                                                            <Avatar sx={{
                                                                bgcolor: log.action === 'status_changed' ? '#5048E5' :
                                                                    log.action === 'note_added' ? '#FFB020' :
                                                                        log.action === 'payment_updated' ? '#36B37E' :
                                                                            log.action === 'refund_processed' ? '#00B8D9' : '#6554C0',
                                                                width: 40,
                                                                height: 40
                                                            }}>
                                                                {log.action === 'status_changed' ? '🔄' :
                                                                    log.action === 'note_added' ? '📝' :
                                                                        log.action === 'payment_updated' ? '💰' :
                                                                            log.action === 'refund_processed' ? '↩️' : '📋'}
                                                            </Avatar>
                                                        </ListItemIcon>
                                                        <ListItemText
                                                            primary={
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                                                    <Typography variant="subtitle2" fontWeight="bold">
                                                                        {log.user?.name || 'System'}
                                                                    </Typography>
                                                                    <Typography variant="body2">
                                                                        {log.description}
                                                                    </Typography>
                                                                </Box>
                                                            }
                                                            secondary={
                                                                <>
                                                                    <Typography variant="caption" color="text.secondary">
                                                                        {format(new Date(log.createdAt), 'PPP pp')}
                                                                    </Typography>
                                                                </>
                                                            }
                                                        />
                                                    </ListItem>
                                                </motion.div>
                                            ))}
                                        </List>
                                    ) : (
                                        <Box sx={{ textAlign: 'center', py: 4 }}>
                                            <Timeline sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                                            <Typography variant="h6" color="text.secondary">
                                                No activity recorded yet
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Activity will appear here when you update the order
                                            </Typography>
                                        </Box>
                                    )}
                                </Paper>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Grid>

                {/* Sidebar */}
                <Grid item xs={12} lg={4}>
                    <Stack spacing={3}>
                        {/* Customer Information */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Person /> Customer Information
                                </Typography>
                                <Stack spacing={2}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                        <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
                                            {customerStats?.name?.charAt(0) || '?'}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight="bold">
                                                {customerStats?.name || 'N/A'}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {customerStats?.email || 'N/A'}
                                            </Typography>
                                            {customerStats?.phone && (
                                                <Typography variant="caption" color="text.secondary">
                                                    {customerStats.phone}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>

                                    {customerStats && (customerStats.totalOrders || customerStats.totalSpent) && (
                                        <>
                                            <Divider />
                                            <Box>
                                                <Typography style={{ marginBottom: '15px' }} variant="subtitle2" color="text.secondary" gutterBottom>
                                                    Customer Stats
                                                </Typography>
                                                <Grid container spacing={1}>
                                                    <Grid item xs={6}>
                                                        <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'primary.light', textAlign: 'center' }}>
                                                            <Typography variant="h6" color="primary.contrastText">
                                                                {customerStats.totalOrders || 0}
                                                            </Typography>
                                                            <Typography variant="caption" color="primary.contrastText">
                                                                Total Orders
                                                            </Typography>
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'success.light', textAlign: 'center' }}>
                                                            <Typography variant="h6" color="success.contrastText">
                                                                {formatCurrency(customerStats.totalSpent || 0)}
                                                            </Typography>
                                                            <Typography variant="caption" color="success.contrastText">
                                                                Total Spent
                                                            </Typography>
                                                        </Paper>
                                                    </Grid>
                                                </Grid>
                                            </Box>
                                        </>
                                    )}
                                </Stack>
                            </Paper>
                        </motion.div>

                        {/* Shipping Address */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <LocationOn /> Shipping Address
                                </Typography>
                                {order.shippingAddress ? (
                                    <Box>
                                        <Typography variant="body2" paragraph sx={{ lineHeight: 1.8 }}>
                                            <strong>{order.shippingAddress.street || 'N/A'}</strong><br />
                                            {order.shippingAddress.city || ''}, {order.shippingAddress.state || ''}<br />
                                            {order.shippingAddress.zipCode || ''}<br />
                                            {order.shippingAddress.country || ''}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Phone fontSize="small" />
                                            <Typography variant="body2">
                                                {order.shippingAddress.mobile || 'N/A'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                ) : (
                                    <Alert severity="info">
                                        No shipping address provided
                                    </Alert>
                                )}
                            </Paper>
                        </motion.div>

                        {/* Order Tags */}
                        {order.tags && order.tags.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <Paper sx={{ p: 3 }}>
                                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Tag /> Order Tags
                                    </Typography>
                                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                                        {order.tags.map((tag, index) => (
                                            <Chip
                                                key={index}
                                                label={tag}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                            />
                                        ))}
                                    </Stack>
                                </Paper>
                            </motion.div>
                        )}
                    </Stack>
                </Grid>
            </Grid>

            {/* Update Status Dialog */}
            <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Edit /> Update Order Status
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={selectedStatus}
                                label="Status"
                                onChange={(e) => setSelectedStatus(e.target.value)}
                            >
                                {statusOptions
                                    .filter((option) => option.value === order?.status || getAllowedTransitions(order?.status).includes(option.value))
                                    .map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Box sx={{
                                                    width: 10,
                                                    height: 10,
                                                    borderRadius: '50%',
                                                    bgcolor: option.color
                                                }} />
                                                {option.label}
                                            </Box>
                                        </MenuItem>
                                    ))}
                            </Select>
                        </FormControl>

                        <TextField
                            label="Notes (optional)"
                            multiline
                            rows={4}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            fullWidth
                            placeholder="Add any internal notes about this status change..."
                        />

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={sendNotification}
                                    onChange={(e) => setSendNotification(e.target.checked)}
                                    color="primary"
                                />
                            }
                            label={
                                <Box>
                                    <Typography variant="body2">Notify customer via email</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Customer will receive an email about this status update
                                    </Typography>
                                </Box>
                            }
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setStatusDialogOpen(false)} disabled={loadingAction}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleStatusUpdate}
                        variant="contained"
                        disabled={loadingAction}
                        startIcon={loadingAction ? <CircularProgress size={20} /> : null}
                    >
                        {loadingAction ? 'Updating...' : 'Update Status'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Update Payment Dialog */}
            <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Payment /> Update Payment Status
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <FormControl fullWidth>
                            <InputLabel>Payment Status</InputLabel>
                            <Select
                                value={selectedPaymentStatus}
                                label="Payment Status"
                                onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                            >
                                {paymentStatusOptions
                                    .filter((option) =>
                                        option.value.toLowerCase() === (order?.paymentStatus || '').toLowerCase() ||
                                        getAllowedPaymentTransitions(order?.paymentStatus).map(s => s.toLowerCase()).includes(option.value.toLowerCase())
                                    )
                                    .map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <option.icon fontSize="small" />
                                                {option.label}
                                            </Box>
                                        </MenuItem>
                                    ))}
                            </Select>
                        </FormControl>

                        {selectedPaymentStatus === 'refunded' && (
                            <Alert severity="warning">
                                Marking as refunded will also update order status to "Refunded" and reverse inventory.
                            </Alert>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPaymentDialogOpen(false)} disabled={loadingAction}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handlePaymentStatusUpdate}
                        variant="contained"
                        color="primary"
                        disabled={loadingAction}
                        startIcon={loadingAction ? <CircularProgress size={20} /> : null}
                    >
                        {loadingAction ? 'Updating...' : 'Update Payment'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Refund Dialog */}
            <Dialog open={refundDialogOpen} onClose={() => setRefundDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AttachMoney /> Process Refund
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <Alert severity="warning">
                            <Typography variant="subtitle2" gutterBottom>
                                This action cannot be undone
                            </Typography>
                            <Typography variant="body2">
                                Processing a refund will:
                                <ul>
                                    <li>Update order status to "Refunded"</li>
                                    <li>Mark payment as refunded</li>
                                    <li>Restore product inventory</li>
                                    <li>Log this activity</li>
                                </ul>
                            </Typography>
                        </Alert>

                        <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Refund Amount
                            </Typography>
                            <Typography variant="h4" color="error">
                                {formatCurrency(order.totalPrice)}
                            </Typography>
                        </Box>

                        <TextField
                            label="Refund Reason (optional)"
                            multiline
                            rows={3}
                            fullWidth
                            placeholder="Enter reason for refund..."
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRefundDialogOpen(false)} disabled={loadingAction}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleRefund}
                        variant="contained"
                        color="error"
                        disabled={loadingAction}
                        startIcon={loadingAction ? <CircularProgress size={20} /> : null}
                    >
                        {loadingAction ? 'Processing...' : 'Confirm Refund'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Tags Dialog */}
            <Dialog open={tagsDialogOpen} onClose={() => setTagsDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Tag /> Manage Order Tags
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Current Tags
                            </Typography>
                            {orderTags.length > 0 ? (
                                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                                    {orderTags.map((tag, index) => (
                                        <Chip
                                            key={index}
                                            label={tag}
                                            onDelete={() => handleRemoveTag(tag)}
                                            size="small"
                                        />
                                    ))}
                                </Stack>
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    No tags added yet
                                </Typography>
                            )}
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                            <TextField
                                label="Add new tag"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                fullWidth
                                size="small"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && newTag.trim()) {
                                        handleAddTags();
                                    }
                                }}
                                helperText="Press Enter to add tag"
                            />
                            <Button
                                variant="contained"
                                onClick={handleAddTags}
                                disabled={!newTag.trim() || loadingAction}
                                startIcon={loadingAction ? <CircularProgress size={20} /> : <Add />}
                                sx={{ mt: 1 }}
                            >
                                Add
                            </Button>
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setTagsDialogOpen(false)}>
                        Done
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Notes Dialog */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Description /> Order Notes
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Admin Notes"
                        multiline
                        rows={10}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        fullWidth
                        variant="outlined"
                        placeholder="Add internal notes about this order. These notes are only visible to admins."
                        helperText="These notes are for internal use only and will not be shared with the customer."
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)} disabled={loadingAction}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSaveNotes}
                        variant="contained"
                        disabled={loadingAction}
                        startIcon={loadingAction ? <CircularProgress size={20} /> : null}
                    >
                        {loadingAction ? 'Saving...' : 'Save Notes'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <AlertComponent
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </AlertComponent>
            </Snackbar>
        </Container>
    );
};

export default AdminOrderDetails;