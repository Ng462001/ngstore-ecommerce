// components/Customers.js
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
    Avatar,
    Chip,
    CircularProgress,
    Button,
    Tooltip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import { Refresh, Visibility, Delete } from '@mui/icons-material';
import axios from 'axios';
import toast from 'react-hot-toast';
import CustomerDetailsModal from '../components/CustomerDetailsModal';

const API_URL = import.meta.env.VITE_API_URL;

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState(null);

    const handleDeleteCustomer = (id) => {
        setCustomerToDelete(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/admin/users/${customerToDelete}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchCustomers();
            setDeleteDialogOpen(false);
            setCustomerToDelete(null);
            toast.success('Customer deleted successfully');
        } catch (err) {
            console.error('Error deleting customer:', err);
            toast.error(err.response?.data?.message || err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
                setError('Please login to view customers');
                setLoading(false);
                return;
            }

            const response = await axios.get(`${API_URL}/api/admin/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log(response.data);
            setCustomers(response.data || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching customers:', err);
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleViewCustomer = (customer) => {
        setSelectedCustomer(customer);
        setDetailsOpen(true);
    };

    const handleCloseDetails = () => {
        setDetailsOpen(false);
        setSelectedCustomer(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <Typography variant="h4" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, color: '#1C1B19' }}>
                        Customer Directory
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6B6862', mt: 0.5 }}>
                        Manage your customer database ({customers.users?.length || 0} customers)
                    </Typography>
                </div>
                <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={fetchCustomers}
                    disabled={loading}
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

            {error && (
                <div className="bg-error/10 border border-error/30 text-error px-4 py-3 rounded-2xl">
                    Error loading customers: {error}
                </div>
            )}

            <Card elevation={0} sx={{ borderRadius: '20px', bgcolor: '#FFFFFF', border: '1px solid #E7E4DD', boxShadow: '0 4px 20px -2px rgba(28, 27, 25, 0.05)', overflow: 'hidden' }}>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <CircularProgress sx={{ color: '#B8925A' }} />
                        </div>
                    ) : !customers.users || customers.users.length === 0 ? (
                        <div className="text-center py-12">
                            <Typography sx={{ color: '#6B6862' }}>
                                No customers found
                            </Typography>
                        </div>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead sx={{ bgcolor: '#FAF9F6', borderBottom: '1px solid #E7E4DD' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, color: '#1C1B19' }}>Customer</TableCell>
                                        <TableCell sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, color: '#1C1B19' }}>Email</TableCell>
                                        <TableCell sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, color: '#1C1B19' }}>Orders</TableCell>
                                        <TableCell sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, color: '#1C1B19' }}>Total Spent</TableCell>
                                        <TableCell sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, color: '#1C1B19' }}>Join Date</TableCell>
                                        <TableCell sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, color: '#1C1B19' }}>Status</TableCell>
                                        <TableCell sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, color: '#1C1B19' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {customers.users.map((customer) => (
                                        <TableRow key={customer._id} sx={{ '&:hover': { bgcolor: '#FAF9F6' }, borderBottom: '1px solid #E7E4DD' }}>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <Avatar sx={{ width: 34, height: 34, mr: 1.5, bgcolor: '#B8925A', color: '#FFFFFF', fontSize: '0.875rem', fontWeight: 600 }}>
                                                        {customer.name?.charAt(0).toUpperCase() || 'U'}
                                                    </Avatar>
                                                    <Typography variant="body1" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, color: '#1C1B19' }}>
                                                        {customer.name || 'Unknown'}
                                                    </Typography>
                                                </div>
                                            </TableCell>
                                            <TableCell sx={{ color: '#6B6862' }}>{customer.email}</TableCell>
                                            <TableCell sx={{ color: '#1C1B19', fontWeight: 600 }}>{customer.orderCount || 0}</TableCell>
                                            <TableCell sx={{ color: '#B8925A', fontWeight: 700 }}>₹{customer.totalSpent || '0.00'}</TableCell>
                                            <TableCell sx={{ color: '#6B6862' }}>{formatDate(customer.createdAt)}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={customer.status || 'Active'}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: customer.status === 'Active' ? '#3E7A55/10' : '#F3F1EC',
                                                        color: customer.status === 'Active' ? '#3E7A55' : '#6B6862',
                                                        borderColor: customer.status === 'Active' ? '#3E7A55/30' : '#E7E4DD',
                                                        fontWeight: 600
                                                    }}
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex space-x-1">
                                                    <Tooltip title="View Customer Details">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleViewCustomer(customer)}
                                                            sx={{ color: '#6B6862', '&:hover': { color: '#1C1B19', bgcolor: '#F3F1EC' } }}
                                                        >
                                                            <Visibility fontSize='small' />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete Customer">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleDeleteCustomer(customer._id)}
                                                            sx={{ color: '#B3413B', '&:hover': { color: '#96342E', bgcolor: '#FDF2F2' } }}
                                                        >
                                                            <Delete fontSize='small' />
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

            <CustomerDetailsModal
                open={detailsOpen}
                onClose={handleCloseDetails}
                customer={selectedCustomer}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle className="font-bold">
                    Delete Customer
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this customer? This action cannot be undone.
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

export default Customers;