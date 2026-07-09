// components/Dashboard.js
import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Grid,
    Typography,
    Box,
    LinearProgress,
    CircularProgress,
    Button
} from '@mui/material';
import {
    TrendingUp,
    ShoppingCart,
    Person,
    Inventory,
    Refresh
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL

const StatCard = ({ title, value, change, icon, color, loading, changeType = 'positive' }) => (
    <Card className="shadow-md rounded-xl hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <Typography color="textSecondary" gutterBottom variant="body2" className="font-medium">
                        {title}
                    </Typography>
                    {loading ? (
                        <div className="flex items-center space-x-2">
                            <CircularProgress size={24} />
                            <Typography variant="body2" color="textSecondary">Loading...</Typography>
                        </div>
                    ) : (
                        <>
                            <Typography variant="h4" className="font-bold" style={{ color }}>
                                {value}
                            </Typography>
                            <Typography
                                variant="body2"
                                className={`mt-1 flex items-center ${changeType === 'positive' ? 'text-green-500' : 'text-red-500'
                                    }`}
                            >
                                <TrendingUp
                                    className={`mr-1 ${changeType === 'positive' ? 'text-green-500' : 'text-red-500 rotate-180'
                                        }`}
                                    fontSize="small"
                                />
                                <span>{change}</span>
                                <span className="text-gray-500 ml-1">from last month</span>
                            </Typography>
                        </>
                    )}
                </div>
                <Box
                    className="p-3 rounded-full"
                    style={{ backgroundColor: `${color}15` }}
                >
                    {React.cloneElement(icon, { style: { color } })}
                </Box>
            </div>
        </CardContent>
    </Card>
);

const StatCardSkeleton = () => (
    <Card className="shadow-md rounded-xl">
        <CardContent className="p-6">
            <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            </div>
        </CardContent>
    </Card>
);

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalCustomers: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Please login to view dashboard');
            setLoading(false);
            return;
        }
        fetchDashboardData();

        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchDashboardData, 30000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                setError('Please login to view dashboard');
                return;
            }

            // Use Promise.all for parallel requests
            const [statsRes, productsRes] = await Promise.all([
                axios.get(`${API_URL}/api/admin/stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${API_URL}/api/products?limit=4&sort=rating.average&order=desc`)
            ]);
            console.log(statsRes.data);

            if (statsRes.data) {
                setStats({
                    totalProducts: statsRes.data.overview.totalProducts || 0,
                    totalOrders: statsRes.data.overview.totalOrders || 0,
                    totalRevenue: parseFloat(statsRes.data.overview.totalRevenue) || 0,
                    totalCustomers: statsRes.data.overview.totalUsers || 0
                });

                // Set recent orders
                const recent = (statsRes.data.recentOrders || []).slice(0, 4).map(order => ({
                    mainId: order._id,
                    id: order._id?.substring(0, 8).toUpperCase() || 'N/A',
                    customer: order.user?.name || order.shippingAddress?.city || 'Unknown',
                    date: new Date(order.createdAt).toLocaleDateString(),
                    amount: `₹${(order.totalPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                    status: order.status || 'Processing',
                    items: order.orderItems?.length || 0
                }));
                setRecentOrders(recent);
            }

            // Process top products
            const topProds = (productsRes.data.data || []).map(product => ({
                name: product.name,
                sales: product.rating?.count || 0,
                progress: Math.min((product.rating?.count || 0) * 10, 100)
            }));
            setTopProducts(topProds);
            setError(null);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchDashboardData();
    };

    const handleOrderClick = (orderId) => {
        navigate(`/admin/order/${orderId}`);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Delivered': return 'bg-green-100 text-green-800';
            case 'Shipped': return 'bg-blue-100 text-blue-800';
            case 'Processing': return 'bg-yellow-100 text-yellow-800';
            case 'Cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Format revenue in Indian Rupees format
    const formatRevenue = (amount) => {
        return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex justify-between items-center">
                <div>
                    <Typography variant="h4" className="font-bold text-gray-800">
                        Dashboard
                    </Typography>
                    <Typography variant="body1" className="text-gray-600">
                        Welcome to your e-commerce admin panel
                    </Typography>
                </div>
                <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="normal-case"
                >
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <strong>Error: </strong> {error}
                    <Button
                        color="error"
                        size="small"
                        onClick={() => window.location.href = '/login'}
                        className="ml-2 normal-case"
                    >
                        Login Again
                    </Button>
                </div>
            )}

            {/* Stats Cards */}
            <Grid container spacing={{ xs: 2, md: 3 }}>
                <Grid item xs={12} sm={6} lg={3}>
                    {loading ? (
                        <StatCardSkeleton />
                    ) : (
                        <StatCard
                            title="TOTAL REVENUE"
                            value={formatRevenue(stats.totalRevenue)}
                            change="+12%"
                            icon={<TrendingUp />}
                            color="#4caf50"
                            loading={loading}
                            changeType="positive"
                        />
                    )}
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    {loading ? (
                        <StatCardSkeleton />
                    ) : (
                        <StatCard
                            title="ORDERS"
                            value={stats.totalOrders.toLocaleString()}
                            change="+8%"
                            icon={<ShoppingCart />}
                            color="#2196f3"
                            loading={loading}
                            changeType="positive"
                        />
                    )}
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    {loading ? (
                        <StatCardSkeleton />
                    ) : (
                        <StatCard
                            title="CUSTOMERS"
                            value={stats.totalCustomers.toLocaleString()}
                            change="+16%"
                            icon={<Person />}
                            color="#ff9800"
                            loading={loading}
                            changeType="positive"
                        />
                    )}
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    {loading ? (
                        <StatCardSkeleton />
                    ) : (
                        <StatCard
                            title="PRODUCTS"
                            value={stats.totalProducts.toLocaleString()}
                            change="+3%"
                            icon={<Inventory />}
                            color="#9c27b0"
                            loading={loading}
                            changeType="positive"
                        />
                    )}
                </Grid>
            </Grid>

            {/* Recent Activity & Top Products */}
            <Grid container spacing={4}>
                {/* Recent Orders */}
                <Grid item xs={12} md={8}>
                    <Card className="shadow-md rounded-xl">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <Typography variant="h6" className="font-bold">
                                    Recent Orders
                                </Typography>
                                <Typography
                                    variant="body2"
                                    className="text-blue-600 cursor-pointer hover:underline"
                                    onClick={() => navigate('/admin/orders')}
                                >
                                    View All
                                </Typography>
                            </div>
                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <CircularProgress />
                                </div>
                            ) : recentOrders.length === 0 ? (
                                <Typography className="text-gray-500 text-center py-8">
                                    No orders found
                                </Typography>
                            ) : (
                                <div className="space-y-4">
                                    {recentOrders.map((order) => (
                                        <div
                                            key={order.id}
                                            className="flex justify-between items-center py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                                            onClick={() => handleOrderClick(order.mainId)}
                                        >
                                            <div>
                                                <Typography variant="body1" className="font-medium">
                                                    #{order.id}
                                                </Typography>
                                                <Typography variant="body2" className="text-gray-500">
                                                    {order.customer} • {order.date} • {order.items} items
                                                </Typography>
                                            </div>
                                            <div className="text-right">
                                                <Typography variant="body1" className="font-medium">
                                                    {order.amount}
                                                </Typography>
                                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Top Products */}
                <Grid item xs={12} md={4}>
                    <Card className="shadow-md rounded-xl">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <Typography variant="h6" className="font-bold">
                                    Top Products
                                </Typography>
                                <Typography
                                    variant="body2"
                                    className="text-blue-600 cursor-pointer hover:underline"
                                    onClick={() => navigate('/admin/products')}
                                >
                                    View All
                                </Typography>
                            </div>
                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <CircularProgress />
                                </div>
                            ) : topProducts.length === 0 ? (
                                <Typography className="text-gray-500 text-center py-8">
                                    No products found
                                </Typography>
                            ) : (
                                <div className="space-y-4">
                                    {topProducts.map((product, index) => (
                                        <div key={index} className="space-y-2">
                                            <div className="flex justify-between">
                                                <Typography variant="body2" className="font-medium truncate max-w-[70%]">
                                                    {product.name}
                                                </Typography>
                                                <Typography variant="body2" className="text-gray-500">
                                                    {product.sales} ratings
                                                </Typography>
                                            </div>
                                            <LinearProgress
                                                variant="determinate"
                                                value={product.progress}
                                                className="h-2 rounded-full"
                                                style={{ backgroundColor: '#e5e7eb' }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Quick Stats Footer */}
            {!loading && (
                <Card className="shadow-md rounded-xl">
                    <CardContent className="p-4">
                        <Grid container spacing={2} className="text-center">
                            <Grid item xs={6} sm={3}>
                                <Typography variant="body2" className="text-gray-500">
                                    Avg. Order Value
                                </Typography>
                                <Typography variant="body1" className="font-medium">
                                    {stats.totalOrders > 0 ? formatRevenue(stats.totalRevenue / stats.totalOrders) : '₹0.00'}
                                </Typography>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Typography variant="body2" className="text-gray-500">
                                    Conversion Rate
                                </Typography>
                                <Typography variant="body1" className="font-medium">
                                    {stats.totalCustomers > 0 ? ((stats.totalOrders / stats.totalCustomers) * 100).toFixed(1) : '0'}%
                                </Typography>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Typography variant="body2" className="text-gray-500">
                                    Inventory Value
                                </Typography>
                                <Typography variant="body1" className="font-medium">
                                    {formatRevenue(stats.totalProducts * 500)} {/* Assuming avg product value */}
                                </Typography>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Typography variant="body2" className="text-gray-500">
                                    Customer Satisfaction
                                </Typography>
                                <Typography variant="body1" className="font-medium">
                                    94.2%
                                </Typography>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default Dashboard;