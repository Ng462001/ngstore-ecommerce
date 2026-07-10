import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Chip,
    Divider,
    Grid,
    Paper,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    Card,
    CardContent,
    Alert,
    IconButton
} from '@mui/material';
import {
    Close,
    AssignmentReturn,
    CheckCircle,
    Cancel,
    Schedule,
    LocalShipping,
    ArrowBack,
    ArrowForward,
    ShoppingBag,
    LocationOn,
    TrackChanges,
    Phone
} from '@mui/icons-material';
import { format } from 'date-fns';
import ReturnTracking from './ReturnTracking';

// Status configuration
const getStatusConfig = (status) => {
    const statusMap = {
        'Pending': {
            color: 'warning',
            bgColor: '#fff3e0',
            textColor: '#f57c00',
            icon: <AssignmentReturn />,
        },
        'Approved': {
            color: 'info',
            bgColor: '#e3f2fd',
            textColor: '#1565c0',
            icon: <CheckCircle />,
        },
        'Rejected': {
            color: 'error',
            bgColor: '#ffebee',
            textColor: '#c62828',
            icon: <Cancel />,
        },
        'Pickup Scheduled': {
            color: 'primary',
            bgColor: '#e8eaf6',
            textColor: '#3949ab',
            icon: <Schedule />,
        },
        'Received': {
            color: 'secondary',
            bgColor: '#f3e5f5',
            textColor: '#7b1fa2',
            icon: <LocalShipping />,
        },
        'Completed': {
            color: 'success',
            bgColor: '#e8f5e9',
            textColor: '#2e7d32',
            icon: <CheckCircle />,
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
const StatusStepper = ({ status, type, request }) => {
    const statusFlow = ['Pending', 'Approved', 'Pickup Scheduled', 'Received', 'Completed'];
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
        <Box sx={{ position: 'relative', mt: 2, px: 1 }}>
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
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    bgcolor: isCompleted || isCurrent ? stepConfig.bgColor : 'grey.100',
                                    color: isCompleted || isCurrent ? stepConfig.textColor : 'grey.400',
                                    border: `2px solid ${isCompleted || isCurrent ? stepConfig.textColor : 'grey.300'}`,
                                    mb: 1
                                }}
                            >
                                {stepConfig.icon}
                            </Box>
                            <Typography
                                variant="caption"
                                sx={{
                                    fontWeight: isCurrent ? 'bold' : 'normal',
                                    color: isCurrent ? stepConfig.textColor : isCompleted ? 'text.primary' : 'text.disabled',
                                    textAlign: 'center',
                                    maxWidth: 60,
                                    fontSize: '0.7rem',
                                    lineHeight: 1.2
                                }}
                            >
                                {stepStatus}
                            </Typography>
                            {stepDate && (
                                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary', mt: 0.5, textAlign: 'center', maxWidth: 70 }}>
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
                    top: 16,
                    left: 16,
                    right: 16,
                    zIndex: 1,
                    borderColor: 'grey.300',
                    borderBottomWidth: 2,
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: -2,
                        left: 0,
                        width: `${currentIndex === -1 ? 0 : (currentIndex / (statusFlow.length - 1)) * 100}%`,
                        height: 2,
                        bgcolor: 'primary.main',
                        transition: 'width 0.3s ease'
                    }
                }}
            />
        </Box>
    );
};

const UserReturnDetailsModal = ({ open, onClose, request }) => {
    const [activeTab, setActiveTab] = useState(0);

    if (!request) return null;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'PPpp');
        } catch (e) {
            return 'Invalid Date';
        }
    };

    const statusConfig = getStatusConfig(request.status);
    const typeConfig = getTypeConfig(request.type);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 2, minHeight: '60vh' }
            }}
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Box>
                    <Typography variant="h6" component="div">
                        {request.type} Request Details
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Request ID: #{request._id?.slice(0, 8).toUpperCase()}
                    </Typography>
                </Box>
                <IconButton onClick={onClose} size="small">
                    <Close />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 0 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 1 }}>
                    <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
                        <Tab label="Overview" />
                        <Tab label="Tracking" />
                        <Tab label="Items" />
                        <Tab label="Attachments" />
                    </Tabs>
                </Box>

                <Box sx={{ p: 3 }}>
                    {activeTab === 0 && (
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                {/* Status Stepper */}
                                <Paper variant="outlined" sx={{ p: 3, mb: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                                    <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <TrackChanges fontSize="small" /> Status Timeline
                                    </Typography>
                                    <StatusStepper status={request.status} type={request.type} request={request} />
                                </Paper>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                                    <Typography variant="subtitle2" gutterBottom color="text.secondary">
                                        Request Information
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2">Type</Typography>
                                            <Chip
                                                label={request.type}
                                                size="small"
                                                icon={typeConfig.icon}
                                                sx={{
                                                    bgcolor: typeConfig.bgColor,
                                                    color: typeConfig.textColor
                                                }}
                                            />
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2">Current Status</Typography>
                                            <Chip
                                                label={request.status}
                                                size="small"
                                                sx={{
                                                    bgcolor: statusConfig.bgColor,
                                                    color: statusConfig.textColor
                                                }}
                                            />
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2">Created On</Typography>
                                            <Typography variant="body2" fontWeight="medium">
                                                {formatDate(request.createdAt)}
                                            </Typography>
                                        </Box>
                                        {request.order && (
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="body2">Order ID</Typography>
                                                <Typography variant="body2" fontFamily="monospace">
                                                    #{request.order._id?.slice(0, 8).toUpperCase()}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>

                                    {request.adminDetails?.note && (
                                        <Box sx={{ mt: 3, p: 2, bgcolor: 'warning.light', borderRadius: 1, border: '1px dashed orange' }}>
                                            <Typography variant="subtitle2" color="warning.dark" gutterBottom>
                                                Note from Support:
                                            </Typography>
                                            <Typography variant="body2" color="text.primary">
                                                {request.adminDetails.note}
                                            </Typography>
                                        </Box>
                                    )}
                                </Paper>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                                    <Typography variant="subtitle2" gutterBottom color="text.secondary">
                                        Pickup Address
                                    </Typography>
                                    {request.pickupAddress ? (
                                        <Box sx={{ mt: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                <LocationOn color="primary" fontSize="small" />
                                                <Typography variant="body2" fontWeight="bold">
                                                    {request.pickupAddress.fullName || 'User'}
                                                </Typography>
                                            </Box>
                                            <Typography variant="body2" color="text.secondary" sx={{ ml: 3.5 }}>
                                                {request.pickupAddress.street}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ ml: 3.5 }}>
                                                {request.pickupAddress.city}, {request.pickupAddress.state} {request.pickupAddress.zipCode}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ ml: 3.5 }}>
                                                {request.pickupAddress.country}
                                            </Typography>
                                            {request.pickupAddress.mobile && (
                                                <Typography variant="body2" color="text.secondary" sx={{ ml: 3.5, mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <Phone fontSize="inherit" /> {request.pickupAddress.mobile}
                                                </Typography>
                                            )}
                                        </Box>
                                    ) : (
                                        <Alert severity="warning" sx={{ mt: 1 }}>
                                            Pickup details not available.
                                        </Alert>
                                    )}
                                </Paper>
                            </Grid>
                        </Grid>
                    )}

                    {activeTab === 1 && (
                        <Box sx={{ mt: -2 }}>
                            <ReturnTracking request={request} isFullPage={false} />
                        </Box>
                    )}

                    {activeTab === 2 && (
                        <TableContainer component={Paper} variant="outlined">
                            <Table>
                                <TableHead sx={{ bgcolor: 'grey.50' }}>
                                    <TableRow>
                                        <TableCell>Product</TableCell>
                                        <TableCell align="center">Qty</TableCell>
                                        <TableCell>Condition</TableCell>
                                        <TableCell>Reason</TableCell>
                                        <TableCell>Resolution</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {request.items?.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Avatar
                                                        src={item.image ? (item.image.startsWith('http') ? item.image : `${import.meta.env.VITE_API_URL}${item.image}`) : undefined}
                                                        variant="rounded"
                                                    >
                                                        <ShoppingBag />
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="medium">
                                                            {item.name}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell align="center">{item.quantity}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={item.condition}
                                                    size="small"
                                                    color={item.condition === 'New' ? 'success' : 'default'}
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">{item.reason}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={item.resolution || 'Pending'}
                                                    size="small"
                                                    color={
                                                        item.resolution === 'Refunded' ? 'success' :
                                                            item.resolution === 'Exchanged' ? 'info' :
                                                                item.resolution === 'Rejected' ? 'error' : 'default'
                                                    }
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {activeTab === 3 && (
                        <Box>
                            {(!request.images || request.images.length === 0) ? (
                                <Alert severity="info">No proof images uploaded for this request.</Alert>
                            ) : (
                                <Grid container spacing={2}>
                                    {request.images.map((img, idx) => (
                                        <Grid item xs={12} sm={6} md={4} key={idx}>
                                            <Card variant="outlined">
                                                <Box
                                                    component="img"
                                                    src={img.startsWith('http') ? img : `${import.meta.env.VITE_API_URL}${img}`}
                                                    sx={{
                                                        width: '100%',
                                                        height: 200,
                                                        objectFit: 'cover'
                                                    }}
                                                    alt={`Proof ${idx + 1}`}
                                                />
                                                <CardContent>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Attachment {idx + 1}
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </Box>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default UserReturnDetailsModal;
