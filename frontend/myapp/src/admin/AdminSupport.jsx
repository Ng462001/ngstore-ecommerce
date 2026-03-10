// components/AdminSupport.js
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
    Box,
    Tooltip,
    Avatar,
    Alert,
    Paper
} from '@mui/material';
import {
    Refresh,
    Search,
    Visibility,
    CheckCircle,
    Cancel,
    Chat,
    AttachFile,
    ArrowUpward,
    ArrowDownward,
    Remove
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import SupportTicketDetailsModal from './SupportTicketDetailsModal';

const API_URL = import.meta.env.VITE_API_URL;
const ITEMS_PER_PAGE = 10;

const AdminSupport = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [responseMessage, setResponseMessage] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const userInfo = useSelector(state => state.productReducer.userInfo);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/support/admin/all`, {
                headers: {
                    'Authorization': `Bearer ${userInfo?.token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch tickets');
            }

            const data = await response.json();
            if (data.success) {
                setTickets(data.tickets || []);
            } else {
                throw new Error(data.message || 'Failed to load tickets');
            }
            setError(null);
        } catch (error) {
            console.error('Error fetching tickets:', error);
            setError(error.message);
            toast.error('Failed to load tickets');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (ticketId, status) => {
        setActionLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/support/admin/${ticketId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userInfo?.token}`
                },
                body: JSON.stringify({ status })
            });

            const data = await response.json();
            if (data.success) {
                toast.success(`Status updated to ${status}`);
                // Update the ticket in state
                setTickets(prevTickets =>
                    prevTickets.map(ticket =>
                        ticket._id === ticketId ? { ...ticket, status } : ticket
                    )
                );
                if (selectedTicket && selectedTicket._id === ticketId) {
                    setSelectedTicket(prev => ({ ...prev, status }));
                }
                return data.ticket;
            } else {
                throw new Error(data.message || 'Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
            throw error;
        } finally {
            setActionLoading(false);
        }
    };

    const handleTicketUpdate = async (ticketId, updateData) => {
        if (updateData.status) {
            return await handleUpdateStatus(ticketId, updateData.status);
        }
    };

    const handleSendResponse = async () => {
        if (!responseMessage.trim()) {
            toast.error('Please enter a response message');
            return;
        }

        setActionLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/support/${selectedTicket._id}/response`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userInfo?.token}`
                },
                body: JSON.stringify({ message: responseMessage })
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Response sent successfully');
                setResponseMessage('');
                setSelectedTicket(data.ticket);
                // Update tickets list as well to show new response count or status
                setTickets(prev => prev.map(t => t._id === data.ticket._id ? data.ticket : t));
            } else {
                throw new Error(data.message || 'Failed to send response');
            }
        } catch (error) {
            console.error('Error sending response:', error);
            toast.error('Failed to send response');
        } finally {
            setActionLoading(false);
        }
    };

    const handleViewDetails = (ticket) => {
        setSelectedTicket(ticket);
        setDetailsOpen(true);
    };

    const handleCloseDetails = () => {
        setDetailsOpen(false);
        setSelectedTicket(null);
        setResponseMessage('');
    };

    // Filter tickets
    const filteredTickets = tickets.filter(ticket => {
        const matchesSearch = !searchTerm ||
            ticket.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket._id?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !statusFilter || ticket.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Pagination
    const totalPages = Math.ceil(filteredTickets.length / ITEMS_PER_PAGE);
    const paginatedTickets = filteredTickets.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
    );

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getUserInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    const getPriorityColor = (priority) => {
        const priorityMap = {
            'Low': 'success',
            'Medium': 'info',
            'High': 'warning',
            'Urgent': 'error'
        };
        return priorityMap[priority] || 'default';
    };

    const getStatusColor = (status) => {
        const statusMap = {
            'Open': 'error',
            'In Progress': 'warning',
            'Resolved': 'success',
            'Closed': 'default'
        };
        return statusMap[status] || 'default';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <Typography variant="h4" className="font-bold text-gray-800">
                        Support Tickets
                    </Typography>
                    <Typography variant="body1" className="text-gray-600">
                        Manage customer support requests ({filteredTickets.length} tickets)
                    </Typography>
                </div>
                <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={fetchTickets}
                >
                    Refresh
                </Button>
            </div>

            {/* Error Alert */}
            {error && (
                <Alert severity="error" className="mb-4">
                    {error}
                </Alert>
            )}

            {/* Filters */}
            <Card className="shadow-md rounded-xl">
                <CardContent>
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
                            style={{ minWidth: 150 }}
                        >
                            <MenuItem value="">All Status</MenuItem>
                            <MenuItem value="Open">Open</MenuItem>
                            <MenuItem value="In Progress">In Progress</MenuItem>
                            <MenuItem value="Resolved">Resolved</MenuItem>
                            <MenuItem value="Closed">Closed</MenuItem>
                        </TextField>

                        <TextField
                            label="Search Tickets"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPage(1);
                            }}
                            size="small"
                            style={{ minWidth: 250 }}
                            placeholder="Search by subject, customer, or ID..."
                            InputProps={{
                                startAdornment: <Search color="action" sx={{ mr: 1 }} />
                            }}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Tickets Table */}
            <Card className="shadow-md rounded-xl">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <CircularProgress />
                        </div>
                    ) : filteredTickets.length === 0 ? (
                        <div className="text-center py-12">
                            <Typography className="text-gray-500">
                                No support tickets found
                            </Typography>
                        </div>
                    ) : (
                        <>
                            <TableContainer>
                                <Table>
                                    <TableHead className="bg-gray-50">
                                        <TableRow>
                                            <TableCell className="font-bold">Ticket ID</TableCell>
                                            <TableCell className="font-bold">Customer</TableCell>
                                            <TableCell className="font-bold">Subject</TableCell>
                                            <TableCell className="font-bold">Priority</TableCell>
                                            <TableCell className="font-bold">Status</TableCell>
                                            <TableCell className="font-bold">Date</TableCell>
                                            <TableCell className="font-bold">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {paginatedTickets.map((ticket) => (
                                            <TableRow key={ticket._id} className="hover:bg-gray-50">
                                                <TableCell>
                                                    <Typography variant="body2" className="font-mono text-gray-700">
                                                        #{ticket._id?.slice(0, 8).toUpperCase()}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center">
                                                        <Avatar className="w-8 h-8 mr-3 bg-blue-500">
                                                            {getUserInitials(ticket.user?.name)}
                                                        </Avatar>
                                                        <div>
                                                            <Typography variant="body2" className="font-medium">
                                                                {ticket.user?.name || 'Unknown'}
                                                            </Typography>
                                                            <Typography variant="caption" className="text-gray-500">
                                                                {ticket.user?.email || 'N/A'}
                                                            </Typography>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" className="truncate max-w-xs">
                                                        {ticket.subject}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={ticket.priority}
                                                        size="small"
                                                        color={getPriorityColor(ticket.priority)}
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={ticket.status}
                                                        size="small"
                                                        color={getStatusColor(ticket.status)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <Typography variant="body2">
                                                            {formatDate(ticket.createdAt)}
                                                        </Typography>
                                                        <Typography variant="caption" className="text-gray-500">
                                                            {formatTime(ticket.createdAt)}
                                                        </Typography>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Tooltip title="View ticket details">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleViewDetails(ticket)}
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
            <SupportTicketDetailsModal
                open={detailsOpen}
                onClose={handleCloseDetails}
                ticket={selectedTicket}
                onSendResponse={handleSendResponse} // Note: This might need to be wrapped or the modal should use the passed prop properly.
                onTicketUpdate={handleTicketUpdate}
            />
        </div>
    );
};

export default AdminSupport;