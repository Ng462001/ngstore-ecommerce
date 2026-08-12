// components/ReturnRequestDetailsModal.js
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
    FormControl,
    MenuItem,
    Select,
    LinearProgress,
    CardHeader,
    ListItemAvatar,
    ListItemSecondaryAction,
    Badge,
    Fade
} from '@mui/material';
import {
    Close,
    Person,
    Email,
    Phone,
    CalendarToday,
    AssignmentReturn,
    CheckCircle,
    Cancel,
    Schedule,
    LocalShipping,
    Refresh,
    Edit,
    Save,
    Visibility,
    ShoppingBag,
    Receipt,
    LocationOn,
    AttachFile,
    Warning,
    Error,
    Info,
    TrendingUp,
    AccountCircle,
    ArrowBack,
    ArrowForward,
    Print,
    Download,
    Payment,
    Category,
    TrackChanges,
    History,
    Update,
    NoteAdd,
    RateReview,
    MarkChatRead,
    ContactSupport
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

// Status configuration
const getStatusConfig = (status) => {
    const statusMap = {
        'Pending': {
            color: 'warning',
            bgColor: '#fff3e0',
            textColor: '#f57c00',
            icon: <AssignmentReturn />,
            nextActions: ['Approved', 'Rejected']
        },
        'Approved': {
            color: 'info',
            bgColor: '#e3f2fd',
            textColor: '#1565c0',
            icon: <CheckCircle />,
            nextActions: ['Pickup Scheduled']
        },
        'Rejected': {
            color: 'error',
            bgColor: '#ffebee',
            textColor: '#c62828',
            icon: <Cancel />,
            nextActions: []
        },
        'Pickup Scheduled': {
            color: 'primary',
            bgColor: '#e8eaf6',
            textColor: '#3949ab',
            icon: <Schedule />,
            nextActions: ['Received']
        },
        'Received': {
            color: 'secondary',
            bgColor: '#f3e5f5',
            textColor: '#7b1fa2',
            icon: <LocalShipping />,
            nextActions: ['Completed']
        },
        'Completed': {
            color: 'success',
            bgColor: '#e8f5e9',
            textColor: '#2e7d32',
            icon: <CheckCircle />,
            nextActions: []
        }
    };
    return statusMap[status] || statusMap['Pending'];
};

const getTypeConfig = (type) => {
    const typeMap = {
        'Return': {
            color: 'secondary',
            bgColor: '#f3e5f5',
            textColor: '#7b1fa2',
            icon: <ArrowBack />
        },
        'Exchange': {
            color: 'primary',
            bgColor: '#e3f2fd',
            textColor: '#1565c0',
            icon: <ArrowForward />
        }
    };
    return typeMap[type] || typeMap['Return'];
};

// Status Stepper Component
// Status Stepper Component
const StatusStepper = ({ status, type, request }) => {
    const statusFlow = type === 'Return'
        ? ['Pending', 'Approved', 'Pickup Scheduled', 'Received', 'Completed']
        : ['Pending', 'Approved', 'Pickup Scheduled', 'Received', 'Completed'];

    const currentIndex = statusFlow.indexOf(status);

    const getStatusDate = (stepStatus) => {
        if (!request) return null;
        try {
            if (stepStatus === 'Pending') {
                return format(new Date(request.createdAt), 'MMM d, h:mm a');
            }
            if (request.statusUpdates) {
                const update = request.statusUpdates.find(u => u.status === stepStatus);
                if (update && update.timestamp) {
                    return format(new Date(update.timestamp), 'MMM d, h:mm a');
                }
            }
            // Fallback for current status if not found in history (for legacy data)
            if (stepStatus === request.status) {
                return format(new Date(request.updatedAt), 'MMM d, h:mm a');
            }
        } catch (e) {
            return null;
        }
        return null;
    };

    return (
        <Box sx={{ position: 'relative', mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                {statusFlow.map((stepStatus, index) => {
                    const stepConfig = getStatusConfig(stepStatus);
                    const isCompleted = index < currentIndex;
                    const isCurrent = index === currentIndex;
                    const stepDate = getStatusDate(stepStatus);

                    return (
                        <Box key={stepStatus} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    bgcolor: isCompleted ? stepConfig.bgColor : isCurrent ? stepConfig.bgColor : 'grey.100',
                                    color: isCompleted ? stepConfig.textColor : isCurrent ? stepConfig.textColor : 'grey.400',
                                    border: `2px solid ${isCompleted || isCurrent ? stepConfig.textColor : 'grey.400'}`,
                                    mb: 1
                                }}
                            >
                                {stepConfig.icon}
                            </Box>
                            <Typography
                                variant="caption"
                                sx={{
                                    fontWeight: isCurrent ? 'bold' : 'normal',
                                    color: isCurrent ? stepConfig.textColor : isCompleted ? stepConfig.textColor : 'text.secondary',
                                    textAlign: 'center',
                                    maxWidth: 80
                                }}
                            >
                                {stepStatus}
                            </Typography>
                            {stepDate && (
                                <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary', mt: 0.5 }}>
                                    {stepDate}
                                </Typography>
                            )}
                        </Box>
                    );
                })}
            </Box>
            <Divider
                sx={{
                    position: 'absolute',
                    top: 20,
                    left: '10%',
                    right: '10%',
                    zIndex: 1,
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 2,
                        bgcolor: 'primary.main',
                        width: `${(currentIndex / (statusFlow.length - 1)) * 100}%`,
                        transition: 'width 0.3s ease'
                    }
                }}
            />
        </Box>
    );
};

// Main Return Request Details Modal
const ReturnRequestDetailsModal = ({ open, onClose, request, onRequestUpdate }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editedRequest, setEditedRequest] = useState(null);
    const [adminNote, setAdminNote] = useState('');
    const [ticketHistory, setTicketHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Reset state when modal closes
    useEffect(() => {
        if (!open) {
            resetState();
        }
    }, [open]);

    // Initialize when request changes
    useEffect(() => {
        if (open && request) {
            setEditedRequest({ ...request });
            setAdminNote(request.adminDetails?.note || '');
            fetchRequestHistory();
        }
    }, [open, request]);

    const fetchRequestHistory = async () => {
        // Simulate history fetching
        setLoadingHistory(true);
        setTimeout(() => {
            const history = [
                {
                    action: 'Created',
                    timestamp: request.createdAt,
                    user: request.user?.name || 'Customer',
                    details: `${request.type} request created`,
                    status: 'Pending'
                },
                ...(request.statusUpdates || []).map(update => ({
                    action: 'Status Update',
                    timestamp: update.timestamp || new Date().toISOString(),
                    user: 'Admin',
                    details: `Status changed to ${update.status}`,
                    status: update.status
                }))
            ];
            setTicketHistory(history);
            setLoadingHistory(false);
        }, 500);
    };

    const handleUpdateStatus = async (status) => {
        if (!request?._id) return;

        try {
            setLoading(true);
            const updateData = {
                status,
                adminNote: adminNote.trim() || undefined
            };

            if (onRequestUpdate) {
                await onRequestUpdate(request._id, updateData);
            }
        } catch (error) {
            console.error('Error updating request:', error);
            alert('Error updating request: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveChanges = async () => {
        if (!editedRequest || !request?._id) return;

        try {
            setLoading(true);
            const updateData = {
                status: editedRequest.status,
                type: editedRequest.type,
                adminNote: editedRequest.adminDetails?.note || adminNote
            };

            if (onRequestUpdate) {
                await onRequestUpdate(request._id, updateData);
            }
            handleUpdateStatus(editedRequest.status);
            setEditMode(false);
        } catch (error) {
            console.error('Error updating request:', error);
            alert('Error updating request: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const resetState = () => {
        setActiveTab(0);
        setEditMode(false);
        setEditedRequest(null);
        setAdminNote('');
        setTicketHistory([]);
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

    const getTimeSinceCreation = () => {
        if (!request?.createdAt) return '';
        return formatDistanceToNow(new Date(request.createdAt), { addSuffix: true });
    };

    const renderOverviewTab = () => {
        if (!request) return null;

        const displayRequest = editMode ? editedRequest : request;
        const statusConfig = getStatusConfig(displayRequest.status);
        const typeConfig = getTypeConfig(displayRequest.type);

        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Grid container spacing={3}>
                    {/* Request Info Card */}
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <AssignmentReturn color="primary" /> Request Details
                                </Typography>
                                <Box>
                                    <Tooltip title={editMode ? "Cancel Editing" : "Edit Request"}>
                                        <IconButton
                                            size="small"
                                            onClick={() => {
                                                if (editMode && request) {
                                                    setEditedRequest({ ...request });
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

                            <List dense>
                                <ListItem>
                                    <ListItemIcon><AccountCircle fontSize="small" /></ListItemIcon>
                                    <ListItemText
                                        primary="Request ID"
                                        secondary={
                                            <Typography variant="body2" fontFamily="monospace">
                                                #{request._id?.slice(0, 8).toUpperCase()}
                                            </Typography>
                                        }
                                    />
                                </ListItem>

                                <ListItem>
                                    <ListItemIcon><CalendarToday fontSize="small" /></ListItemIcon>
                                    <ListItemText
                                        primary="Created"
                                        secondary={
                                            <Box component="span">
                                                {formatDate(request.createdAt)}
                                                <Typography variant="caption" display="block" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                                    {getTimeSinceCreation()}
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                </ListItem>

                                <ListItem>
                                    <ListItemIcon>
                                        {typeConfig.icon}
                                    </ListItemIcon>
                                    {editMode ? (
                                        <FormControl fullWidth size="small">
                                            <Select
                                                value={editedRequest?.type || 'Return'}
                                                onChange={(e) => setEditedRequest({
                                                    ...editedRequest,
                                                    type: e.target.value
                                                })}
                                            >
                                                <MenuItem value="Return">Return</MenuItem>
                                                <MenuItem value="Exchange">Exchange</MenuItem>
                                            </Select>
                                        </FormControl>
                                    ) : (
                                        <ListItemText
                                            primary="Type"
                                            secondary={
                                                <Chip
                                                    label={displayRequest.type}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: typeConfig.bgColor,
                                                        color: typeConfig.textColor,
                                                        fontWeight: 500
                                                    }}
                                                />
                                            }
                                        />
                                    )}
                                </ListItem>

                                <ListItem>
                                    <ListItemIcon>
                                        {statusConfig.icon}
                                    </ListItemIcon>
                                    {editMode ? (
                                        <FormControl fullWidth size="small">
                                            <Select
                                                value={editedRequest?.status || 'Pending'}
                                                onChange={(e) => setEditedRequest({
                                                    ...editedRequest,
                                                    status: e.target.value
                                                })}
                                            >
                                                <MenuItem value="Pending">Pending</MenuItem>
                                                <MenuItem value="Approved">Approved</MenuItem>
                                                <MenuItem value="Rejected">Rejected</MenuItem>
                                                <MenuItem value="Pickup Scheduled">Pickup Scheduled</MenuItem>
                                                <MenuItem value="Received">Received</MenuItem>
                                                <MenuItem value="Completed">Completed</MenuItem>
                                            </Select>
                                        </FormControl>
                                    ) : (
                                        <ListItemText
                                            primary="Status"
                                            secondary={
                                                <Chip
                                                    label={displayRequest.status}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: statusConfig.bgColor,
                                                        color: statusConfig.textColor,
                                                        fontWeight: 500
                                                    }}
                                                />
                                            }
                                        />
                                    )}
                                </ListItem>

                                <ListItem>
                                    <ListItemIcon>
                                        <ShoppingBag fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Order Value"
                                        secondary={formatCurrency(request.order?.totalPrice)}
                                    />
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
                                        placeholder="Add internal notes about this request..."
                                        value={editedRequest?.adminDetails?.note || adminNote}
                                        onChange={(e) => setEditedRequest({
                                            ...editedRequest,
                                            adminDetails: {
                                                ...editedRequest.adminDetails,
                                                note: e.target.value
                                            }
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
                                            fontStyle: displayRequest.adminDetails?.note ? 'normal' : 'italic',
                                            color: displayRequest.adminDetails?.note ? 'text.primary' : 'text.secondary'
                                        }}
                                    >
                                        <Typography variant="body2">
                                            {displayRequest.adminDetails?.note || 'No notes added yet.'}
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
                                        disabled={loading || !editedRequest}
                                        startIcon={<Save />}
                                    >
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </Box>
                            )}
                        </Paper>
                    </Grid>

                    {/* Customer & Request Details */}
                    <Grid item xs={12} md={8}>
                        <Grid container spacing={3}>
                            {/* Customer Information */}
                            <Grid item xs={12}>
                                <Paper sx={{ p: 3, borderRadius: 2 }}>
                                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Person /> Customer Information
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={6}>
                                            <Card variant="outlined" sx={{ p: 2 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Avatar
                                                        sx={{
                                                            bgcolor: 'primary.main',
                                                            color: 'white',
                                                            width: 50,
                                                            height: 50
                                                        }}
                                                    >
                                                        {request.user?.name?.charAt(0).toUpperCase() || 'U'}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="subtitle1" fontWeight="bold">
                                                            {request.user?.name || 'Unknown Customer'}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {request.user?.email || 'No email'}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Card>
                                        </Grid>
                                        {request.order?._id && (
                                            <Grid item xs={12} md={6}>
                                                <Card variant="outlined" sx={{ p: 2 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Receipt color="action" />
                                                        <Box>
                                                            <Typography variant="subtitle2" color="text.secondary">
                                                                Order ID
                                                            </Typography>
                                                            <Typography variant="body1" fontFamily="monospace">
                                                                #{request.order._id?.slice(0, 8).toUpperCase()}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Card>
                                            </Grid>
                                        )}
                                    </Grid>
                                </Paper>
                            </Grid>

                            {/* Pickup Address */}
                            {request.pickupAddress && (
                                <Grid item xs={12}>
                                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <LocationOn /> Pickup Address
                                        </Typography>
                                        <Card variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                                            <Box>
                                                <Typography variant="body1" fontWeight="bold" gutterBottom>
                                                    {request.pickupAddress.fullName || request.user?.name || 'Customer'}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {request.pickupAddress.street}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {request.pickupAddress.city}, {request.pickupAddress.state} - {request.pickupAddress.zipCode}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {request.pickupAddress.country}
                                                </Typography>
                                                {request.pickupAddress.mobile && (
                                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <Phone fontSize="small" /> {request.pickupAddress.mobile}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Card>
                                    </Paper>
                                </Grid>
                            )}

                            {/* Status Stepper */}
                            <Grid item xs={12}>
                                <Paper sx={{ p: 3, borderRadius: 2 }}>
                                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <TrackChanges /> Request Status Flow
                                    </Typography>
                                    <StatusStepper status={request.status} type={request.type} request={request} />
                                </Paper>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </motion.div>
        );
    };

    const renderItemsTab = () => {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                        <ShoppingBag /> Requested Items ({request.items?.length || 0})
                    </Typography>

                    {!request.items || request.items.length === 0 ? (
                        <Alert severity="info">
                            No items found in this request.
                        </Alert>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead sx={{ bgcolor: 'grey.50' }}>
                                    <TableRow>
                                        <TableCell><strong>Product</strong></TableCell>
                                        <TableCell><strong>Quantity</strong></TableCell>
                                        <TableCell><strong>Condition</strong></TableCell>
                                        <TableCell><strong>Reason</strong></TableCell>
                                        <TableCell><strong>Resolution</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {request.items.map((item, index) => (
                                        <TableRow key={index} hover>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    {item.image ? (
                                                        <Avatar
                                                            src={item.image.startsWith('http') ? item.image : `${import.meta.env.VITE_API_URL}${item.image}`}
                                                            sx={{ width: 50, height: 50 }}
                                                        />
                                                    ) : (
                                                        <Avatar sx={{ width: 50, height: 50, bgcolor: 'grey.200' }}>
                                                            <ShoppingBag />
                                                        </Avatar>
                                                    )}
                                                    <Box>
                                                        <Typography variant="subtitle1" fontWeight="bold">
                                                            {item.name || 'Unnamed Product'}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={item.quantity || 1} size="small" />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={item.condition || 'N/A'}
                                                    size="small"
                                                    color={
                                                        item.condition?.toLowerCase() === 'new' ? 'success' :
                                                            item.condition?.toLowerCase() === 'like new' ? 'primary' :
                                                                item.condition?.toLowerCase() === 'used' ? 'warning' : 'default'
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {item.reason || 'No reason provided'}
                                                </Typography>
                                                {item.description && (
                                                    <Typography variant="caption" color="text.secondary" display="block">
                                                        {item.description}
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={item.resolution || 'Pending'}
                                                    size="small"
                                                    color={
                                                        item.resolution === 'Refunded' ? 'success' :
                                                            item.resolution === 'Exchanged' ? 'info' :
                                                                item.resolution === 'Rejected' ? 'error' : 'warning'
                                                    }
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>
            </motion.div>
        );
    };

    const renderAttachmentsTab = () => {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                        <AttachFile /> Proof Images & Attachments ({request.images?.length || 0})
                    </Typography>

                    {(!request.images || request.images.length === 0) ? (
                        <Alert severity="info">
                            No proof images or attachments uploaded.
                        </Alert>
                    ) : (
                        <Grid container spacing={2}>
                            {request.images.map((image, index) => (
                                <Grid item xs={12} sm={6} md={4} key={index}>
                                    <Card variant="outlined" sx={{ height: '100%' }}>
                                        <CardContent sx={{ textAlign: 'center' }}>
                                            <Box
                                                component="img"
                                                src={image.startsWith('http') ? image : `${import.meta.env.VITE_API_URL}${image}`}
                                                alt={`Proof Image ${index + 1}`}
                                                sx={{
                                                    width: '100%',
                                                    height: 200,
                                                    objectFit: 'cover',
                                                    borderRadius: 1,
                                                    mb: 1
                                                }}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://via.placeholder.com/300x200?text=Image+Error';
                                                }}
                                            />
                                            <Typography variant="caption" color="text.secondary">
                                                Proof Image {index + 1}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Paper>
            </motion.div>
        );
    };

    const renderHistoryTab = () => {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                        <History /> Request History
                    </Typography>

                    {loadingHistory ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : ticketHistory.length === 0 ? (
                        <Alert severity="info">
                            No history available for this request.
                        </Alert>
                    ) : (
                        <Stack spacing={2}>
                            {ticketHistory.map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <Box>
                                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        {item.action}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {item.details}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                                        By {item.user} • {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                                                    </Typography>
                                                </Box>
                                                {item.status && (
                                                    <Chip
                                                        label={item.status}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: getStatusConfig(item.status).bgColor,
                                                            color: getStatusConfig(item.status).textColor
                                                        }}
                                                    />
                                                )}
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </Stack>
                    )}
                </Paper>
            </motion.div>
        );
    };

    if (!request) return null;

    const statusConfig = getStatusConfig(request.status);
    const typeConfig = getTypeConfig(request.type);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '24px',
                    maxHeight: '90vh',
                    overflow: 'hidden',
                    bgcolor: '#FFFFFF',
                    border: '1px solid #E7E4DD',
                    boxShadow: '0 20px 40px -10px rgba(28, 27, 25, 0.15)'
                }
            }}
        >
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Box sx={{
                    bgcolor: '#FAF9F6',
                    color: '#1C1B19',
                    borderBottom: '1px solid #E7E4DD',
                    p: 3,
                    position: 'relative'
                }}>
                    <DialogTitle sx={{ p: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar
                                sx={{
                                    width: 64,
                                    height: 64,
                                    bgcolor: '#B8925A',
                                    color: '#FFFFFF',
                                    fontWeight: 'bold',
                                    fontSize: '1.5rem',
                                    border: '1px solid #E7E4DD'
                                }}
                            >
                                {typeConfig.icon}
                            </Avatar>
                            <Box>
                                <Typography variant="h5" fontWeight="bold">
                                    {request.type} Request #{request._id?.slice(0, 8).toUpperCase()}
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Person sx={{ fontSize: 16 }} />
                                    {request.user?.name || 'Unknown Customer'} • {request.user?.email || 'No email'}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                    <Chip
                                        icon={statusConfig.icon}
                                        label={request.status}
                                        size="small"
                                        sx={{
                                            bgcolor: 'rgba(255,255,255,0.2)',
                                            color: 'white',
                                            fontWeight: 'bold'
                                        }}
                                    />
                                    <Chip
                                        icon={typeConfig.icon}
                                        label={request.type}
                                        size="small"
                                        sx={{
                                            bgcolor: 'rgba(255,255,255,0.2)',
                                            color: 'white',
                                            fontWeight: 'bold'
                                        }}
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
                    <Tab label="Overview" icon={<Visibility />} iconPosition="start" />
                    <Tab label={`Items (${request.items?.length || 0})`} icon={<ShoppingBag />} iconPosition="start" />
                    <Tab label={`Attachments (${request.images?.length || 0})`} icon={<AttachFile />} iconPosition="start" />
                    <Tab label="History" icon={<History />} iconPosition="start" />
                </Tabs>
            </Box>

            <DialogContent dividers sx={{ p: 0, bgcolor: '#f9fafb', maxHeight: 'calc(90vh - 200px)' }}>
                <Box sx={{ p: 3 }}>
                    {activeTab === 0 && renderOverviewTab()}
                    {activeTab === 1 && renderItemsTab()}
                    {activeTab === 2 && renderAttachmentsTab()}
                    {activeTab === 3 && renderHistoryTab()}
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2, bgcolor: 'grey.50', justifyContent: 'space-between' }}>
                <Box>
                    {editMode && (
                        <Button
                            onClick={() => {
                                setEditMode(false);
                                setEditedRequest({ ...request });
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
    );
};

export default ReturnRequestDetailsModal;