import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Tabs,
    Tab,
    Chip,
    Button,
    List,
    ListItem,
    ListItemText,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    Divider
} from '@mui/material';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { Assignment, Sync as SyncIcon, Visibility } from '@mui/icons-material';
import UserReturnDetailsModal from './UserReturnDetailsModal';

const UserRequests = ({ requestId }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [tickets, setTickets] = useState([]);
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(false);
    const userInfo = useSelector(state => state.productReducer.userInfo);

    // Support Response
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [responseMessage, setResponseMessage] = useState('');
    const [openDialog, setOpenDialog] = useState(false);

    // Return Details
    const [selectedReturn, setSelectedReturn] = useState(null);
    const [openReturnDialog, setOpenReturnDialog] = useState(false);

    useEffect(() => {
        if (activeTab === 0) {
            fetchTickets();
        } else {
            fetchReturns();
        }
    }, [activeTab]);

    // Fetch returns immediately if requestId is provided
    useEffect(() => {
        if (requestId) {
            fetchReturns();
        }
    }, [requestId]);

    // Handle requestId from URL parameter
    useEffect(() => {
        if (requestId && returns.length > 0) {
            const returnRequest = returns.find(r => r._id === requestId);
            if (returnRequest) {
                setSelectedReturn(returnRequest);
                setOpenReturnDialog(true);
                setActiveTab(1); // Switch to Returns tab
            }
        }
    }, [requestId, returns]);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/support/my-tickets`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            const data = await response.json();
            if (data.success) {
                setTickets(data.tickets);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchReturns = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/return-exchange/my-requests`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            const data = await response.json();
            if (data.success) {
                setReturns(data.requests);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendResponse = async () => {
        if (!responseMessage.trim()) return;
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/support/${selectedTicket._id}/response`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`
                },
                body: JSON.stringify({ message: responseMessage })
            });
            const data = await response.json();
            if (data.success) {
                toast.success('Reply sent');
                setResponseMessage('');
                // Update local state with new response
                const updatedTicket = {
                    ...selectedTicket,
                    responses: [...selectedTicket.responses, data.newResponse]
                };
                setSelectedTicket(updatedTicket); // Update modal view

                // Update list view
                setTickets(prev => prev.map(t => t._id === updatedTicket._id ? updatedTicket : t));
            }
        } catch (error) {
            toast.error('Failed to send reply');
        }
    };

    return (
        <Paper elevation={0} sx={{ p: 0, bgcolor: 'transparent' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
                    <Tab label="Support Tickets" icon={<Assignment fontSize="small" />} iconPosition="start" />
                    <Tab label="Returns & Exchanges" icon={<SyncIcon fontSize="small" />} iconPosition="start" />
                </Tabs>
            </Box>

            {/* Support Tickets Tab */}
            {activeTab === 0 && (
                <Box>
                    {tickets.length === 0 && !loading ? (
                        <Typography sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                            You haven't submitted any support tickets yet.
                        </Typography>
                    ) : (
                        tickets.map(ticket => (
                            <Paper key={ticket._id} sx={{ p: 3, mb: 2, borderRadius: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontSize: '1.1rem', mb: 0.5 }}>
                                            {ticket.subject}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography variant="caption" color="text.secondary">
                                                Ticket Id: #{ticket._id.slice(0, 8).toUpperCase()}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                • {new Date(ticket.createdAt).toLocaleDateString()}
                                            </Typography>
                                            <Chip label={ticket.category} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                                        </Box>
                                    </Box>
                                    <Chip
                                        label={ticket.status}
                                        color={ticket.status === 'Resolved' ? 'success' : ticket.status === 'Closed' ? 'default' : 'primary'}
                                        size="small"
                                    />
                                </Box>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    {ticket.message.substring(0, 100)}...
                                </Typography>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => {
                                        setSelectedTicket(ticket);
                                        setOpenDialog(true);
                                    }}
                                >
                                    View Conversation ({ticket.responses.length})
                                </Button>
                            </Paper>
                        ))
                    )}
                </Box>
            )}

            {/* Returns Tab */}
            {activeTab === 1 && (
                <Box>
                    {returns.length === 0 && !loading ? (
                        <Typography sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                            No return or exchange requests found.
                        </Typography>
                    ) : (
                        returns.map(req => (
                            <Paper key={req._id} sx={{ p: 3, mb: 2, borderRadius: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            {req.type} Request
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Order: #{req.order?._id.slice(0, 8).toUpperCase() || 'N/A'} • {new Date(req.createdAt).toLocaleDateString()}
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label={req.status}
                                        color={req.status === 'Completed' ? 'success' : req.status === 'Rejected' ? 'error' : 'warning'}
                                        size="small"
                                    />
                                </Box>
                                <Divider sx={{ my: 1 }} />

                                <Box sx={{ mt: 2 }}>
                                    {req.items.map((item, idx) => (
                                        <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2">{item.name} (x{item.quantity})</Typography>
                                            <Typography variant="body2" color="text.secondary">{item.reason}</Typography>
                                        </Box>
                                    ))}
                                </Box>
                                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<Visibility />}
                                        onClick={() => {
                                            setSelectedReturn(req);
                                            setOpenReturnDialog(true);
                                        }}
                                    >
                                        View Details
                                    </Button>
                                </Box>
                            </Paper>
                        ))
                    )}
                </Box>
            )}

            {/* Ticket Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                {selectedTicket && (
                    <>
                        <DialogTitle>
                            {selectedTicket.subject}
                            <Typography variant="caption" display="block" color="text.secondary">
                                Ticket Id: #{selectedTicket._id.slice(0, 8).toUpperCase()}
                            </Typography>
                        </DialogTitle>
                        <DialogContent dividers>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                                <Box sx={{ alignSelf: 'flex-start', maxWidth: '85%', bgcolor: 'grey.100', p: 2, borderRadius: 2 }}>
                                    <Typography variant="body2">{selectedTicket.message}</Typography>
                                    <Typography variant="caption" display="block" sx={{ mt: 1, opacity: 0.7 }}>
                                        You • {new Date(selectedTicket.createdAt).toLocaleString()}
                                    </Typography>
                                </Box>

                                {selectedTicket.responses.map((resp, idx) => (
                                    <Box
                                        key={idx}
                                        sx={{
                                            alignSelf: resp.senderRole === 'User' ? 'flex-start' : 'flex-end',
                                            maxWidth: '85%',
                                            bgcolor: resp.senderRole === 'User' ? 'grey.100' : 'primary.light',
                                            color: resp.senderRole === 'User' ? 'text.primary' : 'white',
                                            p: 2,
                                            borderRadius: 2
                                        }}
                                    >
                                        <Typography variant="body2">{resp.message}</Typography>
                                        <Typography variant="caption" display="block" sx={{ mt: 1, opacity: 0.7 }}>
                                            {resp.senderRole} • {new Date(resp.createdAt).toLocaleString()}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>

                            {selectedTicket.status !== 'Closed' && (
                                <Box>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={2}
                                        placeholder="Type your reply..."
                                        value={responseMessage}
                                        onChange={(e) => setResponseMessage(e.target.value)}
                                        sx={{ mb: 1 }}
                                    />
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        onClick={handleSendResponse}
                                        disabled={!responseMessage.trim()}
                                    >
                                        Send Reply
                                    </Button>
                                </Box>
                            )}
                        </DialogContent>
                    </>
                )}
            </Dialog>

            {/* Return Request Details Modal */}
            <UserReturnDetailsModal
                open={openReturnDialog}
                onClose={() => setOpenReturnDialog(false)}
                request={selectedReturn}
            />
        </Paper>
    );
};

export default UserRequests;
