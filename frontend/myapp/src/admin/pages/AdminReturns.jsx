// components/AdminReturns.js
import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    CircularProgress,
    Pagination,
    TextField,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    Box,
    Tooltip,
    Paper,
    Grid
} from '@mui/material';
import {
    CheckCircle,
    Cancel,
    Refresh,
    Search,
    Visibility,
    Schedule,
    LocalShipping,
    AssignmentReturn,
    Delete
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useOutletContext } from 'react-router-dom';
import ReturnRequestDetailsModal from '../components/ReturnRequestDetailsModal';

// Custom hook for debouncing
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

// Error handling utility
const handleApiError = (error, defaultMessage) => {
    if (error.response?.data?.message) {
        return error.response.data.message;
    }
    return error.message || defaultMessage;
};

// Status colors mapping
const getStatusColor = (status) => {
    const statusMap = {
        'Pending': 'warning',
        'Approved': 'info',
        'Rejected': 'error',
        'Completed': 'success',
        'Pickup Scheduled': 'primary',
        'Received': 'secondary'
    };
    return statusMap[status] || 'default';
};

// Status icons mapping
const getStatusIcon = (status) => {
    const iconMap = {
        'Pending': <AssignmentReturn fontSize="small" />,
        'Approved': <CheckCircle fontSize="small" />,
        'Rejected': <Cancel fontSize="small" />,
        'Completed': <CheckCircle fontSize="small" />,
        'Pickup Scheduled': <Schedule fontSize="small" />,
        'Received': <LocalShipping fontSize="small" />
    };
    return iconMap[status] || <AssignmentReturn fontSize="small" />;
};

const ITEMS_PER_PAGE = 10;

const AdminReturns = () => {
    const { showSnackbar } = useOutletContext();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState({
        refresh: false,
        update: false
    });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [adminNote, setAdminNote] = useState('');
    const userInfo = useSelector(state => state.productReducer.userInfo);

    // Delete Request State
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [requestToDelete, setRequestToDelete] = useState(null);

    const handleDeleteClick = (requestId) => {
        setRequestToDelete(requestId);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/return-exchange/admin/${requestToDelete}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${userInfo.token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                showSnackbar('Return/Exchange request deleted successfully', 'success');
                setRequests(requests.filter(request => request._id !== requestToDelete));
            } else {
                showSnackbar(data.message || 'Failed to delete request', 'error');
            }
            setDeleteDialogOpen(false);
            setRequestToDelete(null);
        } catch (error) {
            console.error('Error deleting request:', error);
            showSnackbar('Failed to delete request', 'error');
        } finally {
            setLoading(false);
        }
    };

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    useEffect(() => {
        fetchRequests();
    }, [page, statusFilter, typeFilter, debouncedSearchTerm]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/return-exchange/admin/all`, {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`
                }
            });
            const data = await response.json();

            if (data.success) {
                // Validate and clean the data
                const validatedRequests = data.requests.map(request => ({
                    ...request,
                    createdAt: request.createdAt || new Date().toISOString(),
                    order: request.order || { totalPrice: 0 },
                    user: request.user || { name: 'N/A', email: 'N/A' },
                    items: request.items || [],
                    status: request.status || 'Pending',
                    type: request.type || 'Return'
                }));
                setRequests(validatedRequests);
                setTotalPages(Math.ceil(validatedRequests.length / ITEMS_PER_PAGE));
            }
        } catch (error) {
            console.error('Error fetching requests:', error);
            showSnackbar('Failed to load requests', 'error');
        } finally {
            setLoading(false);
            setActionLoading(prev => ({ ...prev, refresh: false }));
        }
    };

    const handleUpdateStatus = async (requestId, updateData) => {
        setActionLoading(prev => ({ ...prev, update: true }));
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/return-exchange/admin/${requestId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`
                },
                body: JSON.stringify(updateData)
            });

            const data = await response.json();
            if (data.success) {
                showSnackbar(`Request updated successfully`, 'success');
                fetchRequests();
                // setDetailsOpen(false); // Optional: keep open if just saving
                if (selectedRequest && selectedRequest._id === requestId) {
                    setSelectedRequest(data.request); // Update local selected request
                }
            } else {
                showSnackbar(data.message || 'Failed to update request', 'error');
            }
        } catch (error) {
            showSnackbar('Failed to update status', 'error');
        } finally {
            setActionLoading(prev => ({ ...prev, update: false }));
        }
    };

    const handleRefresh = () => {
        setActionLoading(prev => ({ ...prev, refresh: true }));
        fetchRequests();
    };

    const handleFilterReset = () => {
        setStatusFilter('');
        setTypeFilter('');
        setSearchTerm('');
        setPage(1);
    };

    const handleViewDetails = (request) => {
        setSelectedRequest(request);
        setAdminNote(request.adminDetails?.note || '');
        setDetailsOpen(true);
    };

    const getRequestItems = (request) => {
        const startIndex = (page - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return requests.slice(startIndex, endIndex);
    };

    const filteredRequests = requests.filter(request => {
        const matchesSearch = searchTerm === '' ||
            request.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request._id?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === '' || request.status === statusFilter;
        const matchesType = typeFilter === '' || request.type === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
    });

    const paginatedRequests = filteredRequests.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
    );

    const hasActiveFilters = statusFilter || typeFilter || searchTerm;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <Typography variant="h4" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, color: '#1C1B19' }}>
                        Returns & Exchanges
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6B6862', mt: 0.5 }}>
                        Manage return and exchange requests ({filteredRequests.length} requests)
                    </Typography>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={handleRefresh}
                        disabled={actionLoading.refresh}
                        sx={{
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 600,
                            borderColor: '#E7E4DD',
                            color: '#1C1B19',
                            bgcolor: '#FFFFFF',
                            '&:hover': { bgcolor: '#F7F3EC', borderColor: '#B8925A' }
                        }}
                    >
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card elevation={0} sx={{ borderRadius: '20px', border: '1px solid #E7E4DD', bgcolor: '#FFFFFF', boxShadow: '0 4px 20px -2px rgba(28, 27, 25, 0.05)' }}>
                <CardContent sx={{ p: 3 }}>
                    <div className="flex gap-4 flex-wrap">
                        <TextField
                            select
                            label="Status"
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPage(1);
                            }}
                            size="small"
                            style={{ minWidth: 180 }}
                        >
                            <MenuItem value="">All Status</MenuItem>
                            <MenuItem value="Pending">Pending</MenuItem>
                            <MenuItem value="Approved">Approved</MenuItem>
                            <MenuItem value="Rejected">Rejected</MenuItem>
                            <MenuItem value="Pickup Scheduled">Pickup Scheduled</MenuItem>
                            <MenuItem value="Received">Received</MenuItem>
                            <MenuItem value="Completed">Completed</MenuItem>
                        </TextField>

                        <TextField
                            select
                            label="Type"
                            value={typeFilter}
                            onChange={(e) => {
                                setTypeFilter(e.target.value);
                                setPage(1);
                            }}
                            size="small"
                            style={{ minWidth: 150 }}
                        >
                            <MenuItem value="">All Types</MenuItem>
                            <MenuItem value="Return">Return</MenuItem>
                            <MenuItem value="Exchange">Exchange</MenuItem>
                        </TextField>

                        <TextField
                            label="Search Requests"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPage(1);
                            }}
                            size="small"
                            style={{ minWidth: 250 }}
                            placeholder="Search by customer name or ID..."
                            InputProps={{
                                startAdornment: <Search sx={{ color: '#6B6862', mr: 1 }} />
                            }}
                        />

                        {hasActiveFilters && (
                            <Button
                                variant="text"
                                onClick={handleFilterReset}
                                sx={{ color: '#B3413B', textTransform: 'none', fontWeight: 600 }}
                            >
                                Clear Filters
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Requests Table */}
            <Card elevation={0} sx={{ borderRadius: '20px', bgcolor: '#FFFFFF', border: '1px solid #E7E4DD', boxShadow: '0 4px 20px -2px rgba(28, 27, 25, 0.05)', overflow: 'hidden' }}>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <CircularProgress sx={{ color: '#B8925A' }} />
                        </div>
                    ) : paginatedRequests.length === 0 ? (
                        <div className="text-center py-12">
                            <Typography variant="h6" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, color: '#1C1B19', mb: 1 }}>
                                No requests found
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#6B6862' }}>
                                {hasActiveFilters
                                    ? 'Try changing your filters or search term'
                                    : 'No return or exchange requests yet'
                                }
                            </Typography>
                        </div>
                    ) : (
                        <>
                            <TableContainer>
                                <Table>
                                    <TableHead sx={{ bgcolor: '#FAF9F6', borderBottom: '1px solid #E7E4DD' }}>
                                        <TableRow>
                                            <TableCell sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, color: '#1C1B19' }}>Request ID</TableCell>
                                            <TableCell sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, color: '#1C1B19' }}>Type</TableCell>
                                            <TableCell sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, color: '#1C1B19' }}>Customer</TableCell>
                                            <TableCell sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, color: '#1C1B19' }}>Order Total</TableCell>
                                            <TableCell sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, color: '#1C1B19' }}>Status</TableCell>
                                            <TableCell sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, color: '#1C1B19' }}>Date</TableCell>
                                            <TableCell sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, color: '#1C1B19' }} align="center">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {paginatedRequests.map((request) => (
                                            <TableRow
                                                key={request._id}
                                                sx={{ '&:hover': { bgcolor: '#FAF9F6' }, borderBottom: '1px solid #E7E4DD' }}
                                            >
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, color: '#1C1B19' }}>
                                                        #{request._id?.slice(0, 8).toUpperCase() || 'N/A'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={request.type || 'N/A'}
                                                        color={request.type === 'Return' ? 'secondary' : 'primary'}
                                                        size="small"
                                                        variant="outlined"
                                                        icon={getStatusIcon(request.type)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Box>
                                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1C1B19' }}>
                                                            {request.user?.name || 'N/A'}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: '#6B6862' }}>
                                                            {request.user?.email || 'N/A'}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ color: '#B8925A', fontWeight: 700 }}>
                                                        ₹{request.order?.totalPrice?.toFixed(2) || '0.00'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={request.status || 'Pending'}
                                                        color={getStatusColor(request.status)}
                                                        size="small"
                                                        variant="outlined"
                                                        icon={getStatusIcon(request.status)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {new Date(request.createdAt).toLocaleDateString()}
                                                    </Typography>
                                                    <Typography variant="caption" className="text-gray-500">
                                                        {new Date(request.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex space-x-2 justify-center">
                                                        <Tooltip title="View request details">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleViewDetails(request)}
                                                                aria-label={`View request ${request._id}`}
                                                            >
                                                                <Visibility fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Delete Return/Exchange Request">
                                                            <IconButton
                                                                size="small"
                                                                color="error"
                                                                onClick={() => handleDeleteClick(request._id)}
                                                            >
                                                                <Delete fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center py-4">
                                    <Pagination
                                        count={totalPages}
                                        page={page}
                                        onChange={(e, value) => setPage(value)}
                                        color="primary"
                                        showFirstButton
                                        showLastButton
                                    />
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            <ReturnRequestDetailsModal
                open={detailsOpen}
                onClose={() => setDetailsOpen(false)}
                request={selectedRequest}
                onRequestUpdate={handleUpdateStatus}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle className="font-bold">
                    Delete Return/Exchange Request
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this return/exchange request? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={confirmDelete}
                        color="error"
                        variant="contained"
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default AdminReturns;