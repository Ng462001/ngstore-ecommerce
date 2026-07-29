// components/AdminContactManagement.js
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
    Paper,
    Grid,
    Avatar,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Tabs,
    Tab,
    Badge,
    Alert
} from '@mui/material';
import {
    CheckCircle,
    Cancel,
    Refresh,
    Search,
    Visibility,
    Email,
    Phone,
    Person,
    CalendarToday,
    MarkEmailRead,
    MarkEmailUnread,
    ChatBubble,
    PriorityHigh,
    AccessTime,
    Send,
    Delete,
    Close,
    Reply,
    History,
    Print
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import { useSelector } from 'react-redux';
import { useOutletContext } from 'react-router-dom';

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
        'new': 'error',
        'read': 'warning',
        'replied': 'success',
        'closed': 'default'
    };
    return statusMap[status] || 'default';
};

// Status icons mapping
const getStatusIcon = (status) => {
    const iconMap = {
        'new': <MarkEmailUnread fontSize="small" />,
        'read': <MarkEmailRead fontSize="small" />,
        'replied': <CheckCircle fontSize="small" />,
        'closed': <Cancel fontSize="small" />
    };
    return iconMap[status] || <Email fontSize="small" />;
};

// Priority colors mapping
const getPriorityColor = (priority) => {
    const priorityMap = {
        'high': 'error',
        'medium': 'warning',
        'low': 'info'
    };
    return priorityMap[priority] || 'default';
};

// Priority icons mapping
const getPriorityIcon = (priority) => {
    const iconMap = {
        'high': <PriorityHigh fontSize="small" />,
        'medium': <AccessTime fontSize="small" />,
        'low': <AccessTime fontSize="small" />
    };
    return iconMap[priority] || <AccessTime fontSize="small" />;
};

const ITEMS_PER_PAGE = 10;

// Contact Timeline Component
const ContactTimeline = ({ statusUpdates, currentStatus }) => {
    const steps = ['new', 'read', 'replied', 'closed'];

    return (
        <Box sx={{ position: 'relative', mt: 2, px: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                {steps.map((step, index) => {
                    const stepConfig = {
                        new: { label: 'New', icon: <MarkEmailUnread fontSize="small" />, color: '#c62828' },
                        read: { label: 'Read', icon: <MarkEmailRead fontSize="small" />, color: '#f57c00' },
                        replied: { label: 'Replied', icon: <CheckCircle fontSize="small" />, color: '#2e7d32' },
                        closed: { label: 'Closed', icon: <Cancel fontSize="small" />, color: '#616161' }
                    }[step];

                    const stepIndex = steps.indexOf(currentStatus);
                    const currentStepIndex = steps.indexOf(step);
                    const isActive = currentStepIndex <= stepIndex;

                    return (
                        <Box key={step} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, flex: 1 }}>
                            <Badge
                                badgeContent={isActive ? '✓' : index + 1}
                                color={isActive ? 'success' : 'default'}
                                sx={{ mb: 1 }}
                            >
                                <Box
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        bgcolor: isActive ? `${stepConfig.color}20` : 'grey.100',
                                        color: isActive ? stepConfig.color : 'grey.400',
                                        border: `2px solid ${isActive ? stepConfig.color : 'grey.400'}`
                                    }}
                                >
                                    {stepConfig.icon}
                                </Box>
                            </Badge>
                            <Typography
                                variant="caption"
                                sx={{
                                    fontWeight: isActive ? 'bold' : 'normal',
                                    color: isActive ? stepConfig.color : 'text.secondary',
                                    textAlign: 'center'
                                }}
                            >
                                {stepConfig.label}
                            </Typography>
                        </Box>
                    );
                })}
            </Box>
            <Divider
                sx={{
                    position: 'absolute',
                    top: 16,
                    left: '10%',
                    right: '10%',
                    zIndex: 1
                }}
            />
        </Box>
    );
};

// Contact Details Modal Component
const ContactDetailsModal = ({ open, onClose, contact, onReply, onStatusUpdate, onDelete, actionLoading }) => {
    const { showSnackbar } = useOutletContext();
    const [activeTab, setActiveTab] = useState(0);
    const [replyMessage, setReplyMessage] = useState('');
    const [adminNote, setAdminNote] = useState('');

    useEffect(() => {
        if (open && contact) {
            setReplyMessage('');
            setAdminNote(contact.adminNote || '');
        }
    }, [open, contact]);

    const handleSendReply = async () => {
        if (!replyMessage.trim()) {
            showSnackbar('Please enter a reply message', 'error');
            return;
        }

        try {
            await onReply(contact._id, replyMessage);
            setReplyMessage('');
            showSnackbar('Reply sent successfully!', 'success');
        } catch (error) {
            showSnackbar(error.message || 'Failed to send reply', 'error');
        }
    };

    const handleStatusUpdate = async (status) => {
        try {
            await onStatusUpdate(contact._id, status, adminNote);
            showSnackbar(`Status updated to ${status}`, 'success');
        } catch (error) {
            showSnackbar('Failed to update status', 'error');
        }
    };

    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    const handleDelete = async () => {
        try {
            await onDelete(contact._id);
            setDeleteConfirmOpen(false);
            onClose();
        } catch (error) {
            showSnackbar('Failed to delete contact', 'error');
        }
    };

    const handlePrint = () => {
        const printContent = document.createElement('div');
        printContent.innerHTML = `
            <html>
                <head>
                    <title>Contact Details - ${contact.name}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        h1 { color: #333; }
                        .section { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
                        .label { font-weight: bold; color: #666; }
                        .value { margin-bottom: 10px; }
                    </style>
                </head>
                <body>
                    <h1>Contact Details</h1>
                    <div class="section">
                        <div class="value"><span class="label">Contact ID:</span> #${contact._id?.slice(0, 8).toUpperCase()}</div>
                        <div class="value"><span class="label">Name:</span> ${contact.name}</div>
                        <div class="value"><span class="label">Email:</span> ${contact.email}</div>
                        <div class="value"><span class="label">Phone:</span> ${contact.phone || 'N/A'}</div>
                        <div class="value"><span class="label">Date:</span> ${format(new Date(contact.createdAt), 'PPpp')}</div>
                    </div>
                    <div class="section">
                        <div class="value"><span class="label">Subject:</span> ${contact.subject}</div>
                        <div class="value"><span class="label">Message:</span><br>${contact.message}</div>
                    </div>
                </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent.innerHTML);
        printWindow.document.close();
        printWindow.print();
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    if (!contact) return null;

    const statusConfig = getStatusColor(contact.status);
    const priorityConfig = getPriorityColor(contact.priority || 'medium');
    const timeSince = formatDistanceToNow(new Date(contact.createdAt), { addSuffix: true });
    const isReplying = actionLoading?.reply?.[contact._id];
    const isDeleting = actionLoading?.delete?.[contact._id];
    const isUpdatingStatus = actionLoading?.statusUpdate?.[contact._id];

    const renderOverviewTab = () => (
        <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Email color="primary" /> Contact Details
                    </Typography>
                    <Divider sx={{ mb: 3 }} />

                    <List dense>
                        <ListItem>
                            <ListItemIcon><Person fontSize="small" /></ListItemIcon>
                            <ListItemText
                                primary="Contact ID"
                                secondary={
                                    <Typography variant="body2" fontFamily="monospace">
                                        #{contact._id?.slice(0, 8).toUpperCase()}
                                    </Typography>
                                }
                            />
                        </ListItem>

                        <ListItem>
                            <ListItemIcon><CalendarToday fontSize="small" /></ListItemIcon>
                            <ListItemText
                                primary="Received"
                                secondary={
                                    <Box component="span">
                                        {format(new Date(contact.createdAt), 'PPpp')}
                                        <Typography variant="caption" display="block" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                            {timeSince}
                                        </Typography>
                                    </Box>
                                }
                            />
                        </ListItem>

                        <ListItem>
                            <ListItemIcon>
                                {getPriorityIcon(contact.priority)}
                            </ListItemIcon>
                            <ListItemText
                                primary="Priority"
                                secondary={
                                    <Chip
                                        label={contact.priority || 'medium'}
                                        size="small"
                                        color={priorityConfig}
                                        variant="outlined"
                                    />
                                }
                            />
                        </ListItem>

                        <ListItem>
                            <ListItemIcon>
                                {getStatusIcon(contact.status)}
                            </ListItemIcon>
                            <ListItemText
                                primary="Status"
                                secondary={
                                    <Chip
                                        label={contact.status || 'new'}
                                        size="small"
                                        color={statusConfig}
                                        variant="outlined"
                                    />
                                }
                            />
                        </ListItem>
                    </List>

                    <Divider sx={{ my: 2 }} />
                    <Box>
                        <Typography variant="caption" color="text.secondary" gutterBottom>
                            Admin Notes
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            variant="outlined"
                            size="small"
                            placeholder="Add internal notes about this contact..."
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                            sx={{ mt: 1 }}
                            onBlur={() => {
                                if (adminNote !== contact.adminNote) {
                                    onStatusUpdate(contact._id, contact.status, adminNote);
                                }
                            }}
                            disabled={isUpdatingStatus}
                        />
                    </Box>
                </Paper>
            </Grid>

            <Grid item xs={12} md={8}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3, borderRadius: 2 }}>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Person /> Contact Information
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
                                                {contact.name?.charAt(0).toUpperCase() || 'C'}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight="bold">
                                                    {contact.name || 'Unknown'}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {contact.email || 'No email'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Card>
                                </Grid>
                                {contact.phone && (
                                    <Grid item xs={12} md={6}>
                                        <Card variant="outlined" sx={{ p: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Phone color="action" />
                                                <Box>
                                                    <Typography variant="subtitle2" color="text.secondary">
                                                        Phone Number
                                                    </Typography>
                                                    <Typography variant="body1">
                                                        {contact.phone}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Card>
                                    </Grid>
                                )}
                            </Grid>
                        </Paper>
                    </Grid>

                    <Grid item xs={12}>
                        <Paper sx={{ p: 3, borderRadius: 2 }}>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <ChatBubble /> Message Details
                            </Typography>

                            {contact.subject && (
                                <Card variant="outlined" sx={{ mb: 2, p: 2, bgcolor: 'grey.50' }}>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        Subject
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        {contact.subject}
                                    </Typography>
                                </Card>
                            )}

                            <Card variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Message
                                </Typography>
                                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                    {contact.message}
                                </Typography>
                            </Card>

                            {contact.reply && (
                                <Card variant="outlined" sx={{ mt: 2, p: 2, bgcolor: '#e8f5e9' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <CheckCircle color="success" fontSize="small" />
                                        <Typography variant="subtitle2" color="success.main" fontWeight="bold">
                                            Your Reply
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                                            {format(new Date(contact.repliedAt), 'PPpp')}
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                        {contact.reply}
                                    </Typography>
                                </Card>
                            )}
                        </Paper>
                    </Grid>

                    <Grid item xs={12}>
                        <Paper sx={{ p: 3, borderRadius: 2 }}>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <History /> Contact Timeline
                            </Typography>
                            <ContactTimeline statusUpdates={contact.statusUpdates} currentStatus={contact.status} />
                        </Paper>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );

    const renderReplyTab = () => (
        <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <Reply /> Send Reply
            </Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                    <strong>Original Message from {contact.name}:</strong> "{contact.message.substring(0, 100)}..."
                </Typography>
            </Alert>

            <TextField
                fullWidth
                multiline
                rows={10}
                label="Your Reply"
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder={`Type your reply to ${contact.name}...`}
                disabled={isReplying}
                sx={{ mb: 2 }}
            />

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
                <Email fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                This reply will be sent to: {contact.email}
                {contact.phone && ` | Phone: ${contact.phone}`}
            </Typography>

            <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                    variant="outlined"
                    onClick={() => setReplyMessage('')}
                    disabled={isReplying || !replyMessage.trim()}
                >
                    Clear
                </Button>
                <Button
                    variant="contained"
                    startIcon={isReplying ? <CircularProgress size={20} /> : <Send />}
                    onClick={handleSendReply}
                    disabled={isReplying || !replyMessage.trim()}
                    sx={{ ml: 'auto' }}
                >
                    {isReplying ? 'Sending...' : 'Send Reply'}
                </Button>
            </Box>
        </Paper>
    );

    return (
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
            <Box sx={{
                background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
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
                                color: '#1976D2',
                                fontWeight: 'bold',
                                fontSize: '1.5rem',
                                border: '2px solid rgba(255,255,255,0.5)'
                            }}
                        >
                            <Email />
                        </Avatar>
                        <Box>
                            <Typography variant="h5" fontWeight="bold">
                                Contact #{contact._id?.slice(0, 8).toUpperCase()}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Person sx={{ fontSize: 16 }} />
                                {contact.name || 'Unknown'} • {contact.email || 'No email'}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                <Chip
                                    icon={getStatusIcon(contact.status)}
                                    label={contact.status || 'new'}
                                    size="small"
                                    sx={{
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                        color: 'white',
                                        fontWeight: 'bold'
                                    }}
                                />
                                <Chip
                                    icon={getPriorityIcon(contact.priority)}
                                    label={contact.priority || 'medium'}
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

            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, bgcolor: 'white' }}>
                <Tabs value={activeTab} onChange={handleTabChange}>
                    <Tab label="Overview" icon={<Visibility />} iconPosition="start" />
                    <Tab label="Reply" icon={<Reply />} iconPosition="start" />
                </Tabs>
            </Box>

            <DialogContent dividers sx={{ p: 0, bgcolor: '#f9fafb', maxHeight: 'calc(90vh - 200px)' }}>
                <Box sx={{ p: 3 }}>
                    {activeTab === 0 && renderOverviewTab()}
                    {activeTab === 1 && renderReplyTab()}
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2, bgcolor: 'grey.50', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        color="info"
                        variant="outlined"
                        startIcon={<Print />}
                        onClick={handlePrint}
                    >
                        Print
                    </Button>
                    <Button
                        color="error"
                        variant="outlined"
                        startIcon={isDeleting ? <CircularProgress size={20} /> : <Delete />}
                        onClick={() => setDeleteConfirmOpen(true)}
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </Button>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {contact.status !== 'replied' && contact.status !== 'closed' && (
                        <Button
                            variant="outlined"
                            startIcon={isUpdatingStatus ? <CircularProgress size={20} /> : <CheckCircle />}
                            onClick={() => handleStatusUpdate('replied')}
                            disabled={isUpdatingStatus}
                        >
                            {isUpdatingStatus ? 'Updating...' : 'Mark as Replied'}
                        </Button>
                    )}
                    {contact.status !== 'closed' && (
                        <Button
                            variant="outlined"
                            startIcon={isUpdatingStatus ? <CircularProgress size={20} /> : <Cancel />}
                            onClick={() => handleStatusUpdate('closed')}
                            disabled={isUpdatingStatus}
                        >
                            {isUpdatingStatus ? 'Updating...' : 'Close Ticket'}
                        </Button>
                    )}
                    <Button
                        onClick={onClose}
                        variant="contained"
                        color="primary"
                    >
                        Close
                    </Button>
                </Box>
            </DialogActions>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
            >
                <DialogTitle className="font-bold">
                    Delete Contact Message
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this contact message? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirmOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDelete}
                        color="error"
                        variant="contained"
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Dialog>
    );
};

const AdminContactManagement = () => {
    const { showSnackbar } = useOutletContext();
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState({
        refresh: false,
        reply: {},
        delete: {},
        statusUpdate: {}
    });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [selectedContact, setSelectedContact] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [contactToDelete, setContactToDelete] = useState(null);

    const handleDeleteClick = (contactId) => {
        setContactToDelete(contactId);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!contactToDelete) return;
        await handleDelete(contactToDelete);
        setDeleteDialogOpen(false);
        setContactToDelete(null);
    };
    const userInfo = useSelector(state => state.productReducer.userInfo);

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    useEffect(() => {
        fetchContacts();
    }, [page, statusFilter, priorityFilter, debouncedSearchTerm]);

    const fetchContacts = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/contact`, {
                headers: {
                    Authorization: `Bearer ${userInfo?.token}`
                }
            });
            const data = await response.json();

            if (data.success) {
                const validatedContacts = data.data.map(contact => ({
                    ...contact,
                    createdAt: contact.createdAt || new Date().toISOString(),
                    name: contact.name || 'Unknown',
                    email: contact.email || 'No email',
                    subject: contact.subject || 'No Subject',
                    message: contact.message || 'No message',
                    status: contact.status || 'new',
                    priority: contact.priority || 'medium',
                    adminNote: contact.adminNote || ''
                }));
                setContacts(validatedContacts);
                setTotalPages(Math.ceil(validatedContacts.length / ITEMS_PER_PAGE));
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
            showSnackbar('Failed to load contacts', 'error');
        } finally {
            setLoading(false);
            setActionLoading(prev => ({ ...prev, refresh: false }));
        }
    };

    const handleReply = async (contactId, replyMessage) => {
        setActionLoading(prev => ({ ...prev, reply: { ...prev.reply, [contactId]: true } }));
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/contact/${contactId}/reply`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${userInfo?.token}`
                    },
                    body: JSON.stringify({ reply: replyMessage })
                }
            );
            const data = await response.json();
            if (data.success) {
                fetchContacts();
                return data;
            } else {
                throw new Error(data.message || 'Failed to send reply');
            }
        } finally {
            setActionLoading(prev => ({ ...prev, reply: { ...prev.reply, [contactId]: false } }));
        }
    };

    const handleStatusUpdate = async (contactId, status, adminNote) => {
        setActionLoading(prev => ({ ...prev, statusUpdate: { ...prev.statusUpdate, [contactId]: true } }));
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/contact/${contactId}/status`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${userInfo?.token}`
                    },
                    body: JSON.stringify({ status, adminNote })
                }
            );
            const data = await response.json();
            if (data.success) {
                fetchContacts();
                if (selectedContact && selectedContact._id === contactId) {
                    setSelectedContact(data.data);
                }
                return data;
            } else {
                throw new Error(data.message || 'Failed to update status');
            }
        } finally {
            setActionLoading(prev => ({ ...prev, statusUpdate: { ...prev.statusUpdate, [contactId]: false } }));
        }
    };

    const handleDelete = async (contactId) => {
        setActionLoading(prev => ({ ...prev, delete: { ...prev.delete, [contactId]: true } }));
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/contact/${contactId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${userInfo?.token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                showSnackbar('Contact deleted successfully', 'success');
                fetchContacts();
            }
            return data;
        } finally {
            setActionLoading(prev => ({ ...prev, delete: { ...prev.delete, [contactId]: false } }));
        }
    };

    const handleRefresh = () => {
        setActionLoading(prev => ({ ...prev, refresh: true }));
        fetchContacts();
    };

    const handleFilterReset = () => {
        setStatusFilter('');
        setPriorityFilter('');
        setSearchTerm('');
        setPage(1);
    };

    const handleViewDetails = (contact) => {
        setSelectedContact(contact);
        setDetailsOpen(true);
    };

    const filteredContacts = contacts.filter(contact => {
        const matchesSearch = searchTerm === '' ||
            contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact._id?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === '' || contact.status === statusFilter;
        const matchesPriority = priorityFilter === '' || contact.priority === priorityFilter;
        return matchesSearch && matchesStatus && matchesPriority;
    });

    const paginatedContacts = filteredContacts.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
    );

    const hasActiveFilters = statusFilter || priorityFilter || searchTerm;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <Typography variant="h4" className="font-bold text-gray-800">
                        Contact Management
                    </Typography>
                    <Typography variant="body1" className="text-gray-600">
                        Manage customer inquiries and support requests ({filteredContacts.length} contacts)
                    </Typography>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={handleRefresh}
                        disabled={actionLoading.refresh}
                    >
                        Refresh
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
                            <MenuItem value="new">New</MenuItem>
                            <MenuItem value="read">Read</MenuItem>
                            <MenuItem value="replied">Replied</MenuItem>
                            <MenuItem value="closed">Closed</MenuItem>
                        </TextField>

                        <TextField
                            select
                            label="Priority"
                            value={priorityFilter}
                            onChange={(e) => {
                                setPriorityFilter(e.target.value);
                                setPage(1);
                            }}
                            size="small"
                            style={{ minWidth: 150 }}
                        >
                            <MenuItem value="">All Priority</MenuItem>
                            <MenuItem value="high">High</MenuItem>
                            <MenuItem value="medium">Medium</MenuItem>
                            <MenuItem value="low">Low</MenuItem>
                        </TextField>

                        <TextField
                            label="Search Contacts"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPage(1);
                            }}
                            size="small"
                            style={{ minWidth: 250 }}
                            placeholder="Search by name, email, subject..."
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

            {/* Contacts Table */}
            <Card className="shadow-md rounded-xl">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <CircularProgress />
                        </div>
                    ) : paginatedContacts.length === 0 ? (
                        <div className="text-center py-12">
                            <Typography variant="h6" className="text-gray-500 mb-2">
                                No contacts found
                            </Typography>
                            <Typography variant="body2" className="text-gray-400">
                                {hasActiveFilters
                                    ? 'Try changing your filters or search term'
                                    : 'No contact messages yet'
                                }
                            </Typography>
                        </div>
                    ) : (
                        <>
                            <TableContainer>
                                <Table>
                                    <TableHead className="bg-gray-50">
                                        <TableRow>
                                            <TableCell className="font-bold">Contact ID</TableCell>
                                            <TableCell className="font-bold">Customer</TableCell>
                                            <TableCell className="font-bold">Subject</TableCell>
                                            <TableCell className="font-bold">Priority</TableCell>
                                            <TableCell className="font-bold">Status</TableCell>
                                            <TableCell className="font-bold">Date</TableCell>
                                            <TableCell className="font-bold" align="center">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {paginatedContacts.map((contact) => (
                                            <TableRow
                                                key={contact._id}
                                                className="hover:bg-gray-50"
                                            >
                                                <TableCell>
                                                    <Typography variant="body2" className="font-mono">
                                                        #{contact._id?.slice(0, 8).toUpperCase() || 'N/A'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="bold">
                                                            {contact.name || 'N/A'}
                                                        </Typography>
                                                        <Typography variant="caption" className="text-gray-500">
                                                            {contact.email || 'N/A'}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" noWrap style={{ maxWidth: 200 }}>
                                                        {contact.subject || 'No subject'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={contact.priority || 'medium'}
                                                        color={getPriorityColor(contact.priority)}
                                                        size="small"
                                                        variant="outlined"
                                                        icon={getPriorityIcon(contact.priority)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={contact.status || 'new'}
                                                        color={getStatusColor(contact.status)}
                                                        size="small"
                                                        variant="outlined"
                                                        icon={getStatusIcon(contact.status)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {new Date(contact.createdAt).toLocaleDateString()}
                                                    </Typography>
                                                    <Typography variant="caption" className="text-gray-500">
                                                        {new Date(contact.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex space-x-2 justify-center">
                                                        <Tooltip title="View contact details">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleViewDetails(contact)}
                                                                aria-label={`View contact ${contact._id}`}
                                                            >
                                                                <Visibility fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Delete contact">
                                                            <IconButton
                                                                size="small"
                                                                color="error"
                                                                onClick={() => handleDeleteClick(contact._id)}
                                                                aria-label={`Delete contact ${contact._id}`}
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

            <ContactDetailsModal
                open={detailsOpen}
                onClose={() => setDetailsOpen(false)}
                contact={selectedContact}
                onReply={handleReply}
                onStatusUpdate={handleStatusUpdate}
                onDelete={handleDelete}
                actionLoading={actionLoading}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle className="font-bold">
                    Delete Contact Message
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this contact message? This action cannot be undone.
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

export default AdminContactManagement;