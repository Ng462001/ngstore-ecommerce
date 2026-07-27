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
            <div className="flex justify-between items-center">
                <div>
                    <Typography variant="h4" className="font-bold text-gray-800">
                        Customers
                    </Typography>
                    <Typography variant="body1" className="text-gray-600">
                        Manage your customer database ({customers.users?.length || 0} customers)
                    </Typography>
                </div>
                <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={fetchCustomers}
                >
                    Refresh
                </Button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    Error loading customers: {error}
                </div>
            )}

            <Card className="shadow-md rounded-xl">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <CircularProgress />
                        </div>
                    ) : !customers.users || customers.users.length === 0 ? (
                        <div className="text-center py-12">
                            <Typography className="text-gray-500">
                                No customers found
                            </Typography>
                        </div>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead className="bg-gray-50">
                                    <TableRow>
                                        <TableCell className="font-bold">Customer</TableCell>
                                        <TableCell className="font-bold">Email</TableCell>
                                        <TableCell className="font-bold">Orders</TableCell>
                                        <TableCell className="font-bold">Total Spent</TableCell>
                                        <TableCell className="font-bold">Join Date</TableCell>
                                        <TableCell className="font-bold">Status</TableCell>
                                        <TableCell className="font-bold" >Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {customers.users.map((customer) => (
                                        <TableRow key={customer._id} className="hover:bg-gray-50">
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <Avatar className="w-8 h-8 mr-3 bg-blue-500">
                                                        {customer.name?.charAt(0).toUpperCase() || 'U'}
                                                    </Avatar>
                                                    <Typography variant="body1" className="font-medium">
                                                        {customer.name || 'Unknown'}
                                                    </Typography>
                                                </div>
                                            </TableCell>
                                            <TableCell>{customer.email}</TableCell>
                                            <TableCell>{customer.orderCount || 0}</TableCell>
                                            <TableCell>₹{customer.totalSpent || '0.00'}</TableCell>
                                            <TableCell>{formatDate(customer.createdAt)}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={customer.status || 'Active'}
                                                    size="small"
                                                    color={customer.status === 'Active' ? 'success' : 'default'}
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex space-x-2">
                                                    <Tooltip title="View Customer Details">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleViewCustomer(customer)}
                                                        >
                                                            <Visibility fontSize='small' />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete Customer">
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() => handleDeleteCustomer(customer._id)}
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