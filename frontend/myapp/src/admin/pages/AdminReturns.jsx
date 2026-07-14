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
    AssignmentReturn
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
            <div className="flex justify-between items-center">
                <div>
                    <Typography variant="h4" className="font-bold text-gray-800">
                        Returns & Exchanges
                    </Typography>
                    <Typography variant="body1" className="text-gray-600">
                        Manage return and exchange requests ({filteredRequests.length} requests)
                    </Typography>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={handleRefresh}
                        disabled={actionLoading.refresh}
                    >
                        {actionLoading.refresh ? <CircularProgress size={20} /> : 'Refresh'}
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card className="shadow-md rounded-xl">
                <CardContent className="p-4">
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
                                startAdornment: <Search color="action" sx={{ mr: 1 }} />
                            }}
                        />

                        {hasActiveFilters && (
                            <Button
                                variant="text"
                                onClick={handleFilterReset}
                                className="self-center"
                            >
                                Clear Filters
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Requests Table */}
            <Card className="shadow-md rounded-xl">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <CircularProgress />
                        </div>
                    ) : paginatedRequests.length === 0 ? (
                        <div className="text-center py-12">
                            <Typography variant="h6" className="text-gray-500 mb-2">
                                No requests found
                            </Typography>
                            <Typography variant="body2" className="text-gray-400">
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
                                    <TableHead className="bg-gray-50">
                                        <TableRow>
                                            <TableCell className="font-bold">Request ID</TableCell>
                                            <TableCell className="font-bold">Type</TableCell>
                                            <TableCell className="font-bold">Customer</TableCell>
                                            <TableCell className="font-bold">Order Total</TableCell>
                                            <TableCell className="font-bold">Status</TableCell>
                                            <TableCell className="font-bold">Date</TableCell>
                                            <TableCell className="font-bold" align="center">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {paginatedRequests.map((request) => (
                                            <TableRow
                                                key={request._id}
                                                className="hover:bg-gray-50"
                                            >
                                                <TableCell>
                                                    <Typography variant="body2" className="font-mono">
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
                                                        <Typography variant="body2" fontWeight="bold">
                                                            {request.user?.name || 'N/A'}
                                                        </Typography>
                                                        <Typography variant="caption" className="text-gray-500">
                                                            {request.user?.email || 'N/A'}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" className="font-medium">
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
        </div>
    );
};

export default AdminReturns;