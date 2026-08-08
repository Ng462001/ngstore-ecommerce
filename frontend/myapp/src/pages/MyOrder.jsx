import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { clearCart } from '../Redux/action/action'

export default function OrderHistory() {
    const [orders, setOrders] = useState([])
    const [statusFilter, setStatusFilter] = useState('All')
    const [searchQuery, setSearchQuery] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [loading, setLoading] = useState(true)
    const [returnRequests, setReturnRequests] = useState({})
    const navigate = useNavigate()
    const effectRan = useRef(false)

    const statusOptions = ['All', 'Delivered', 'Out for delivery', 'Pending', 'Shipped', 'Cancelled', 'Returned']
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))

    const dispatch = useDispatch()

    useEffect(() => {
        if (effectRan.current) return;
        effectRan.current = true;

        const query = new URLSearchParams(window.location.search);

        const createPendingOrder = async (orderData) => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${userInfo.token}`,
                    },
                    body: JSON.stringify(orderData),
                });
                if (response.ok) {
                    localStorage.removeItem('pendingOrder');
                    dispatch(clearCart());
                    window.history.replaceState({}, document.title, window.location.pathname);
                }
            } catch (error) {
                console.error(error);
            } finally {
                fetchOrders();
            }
        };

        if (userInfo) {
            if (query.get('success') === 'true') {
                const pendingOrder = localStorage.getItem('pendingOrder');
                if (pendingOrder) {
                    localStorage.removeItem('pendingOrder');
                    createPendingOrder(JSON.parse(pendingOrder));
                } else {
                    fetchOrders();
                }
            } else {
                fetchOrders();
            }
        } else {
            setLoading(false);
        }
    }, [dispatch]);

    const fetchOrders = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/myorders`, {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            })
            const data = await response.json()
            console.log(data)
            if (response.ok) {
                const ordersWithTimeline = data.map(order => ({
                    ...order,
                    confirmedAt: order.confirmedAt || (order.status !== 'Cancelled' && order.status !== 'Returned' ? new Date(Date.now() - 86400000).toISOString() : null),
                    processingAt: order.processingAt || (['Processing', 'Shipped', 'Delivered'].includes(order.status) ? new Date(Date.now() - 43200000).toISOString() : null),
                    shippedAt: order.shippedAt || (['Shipped', 'Delivered'].includes(order.status) ? new Date(Date.now() - 21600000).toISOString() : null),
                    outForDeliveryAt: order.outForDeliveryAt || (order.status === 'Delivered' ? new Date(Date.now() - 7200000).toISOString() : null),
                    deliveredAt: order.deliveredAt || (order.status === 'Delivered' ? new Date().toISOString() : null)
                }))
                setOrders(ordersWithTimeline)

                // Fetch return requests for all orders
                fetchReturnRequests(ordersWithTimeline, userInfo.token)
            }
        } catch (error) {
            console.error('Error fetching orders:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchReturnRequests = async (orders, token) => {
        try {
            const requests = {}

            // Fetch return requests for each order
            await Promise.all(
                orders.map(async (order) => {
                    try {
                        const response = await fetch(
                            `${import.meta.env.VITE_API_URL}/api/return-exchange/order/${order._id}`,
                            {
                                headers: {
                                    'Authorization': `Bearer ${token}`
                                }
                            }
                        )

                        if (response.ok) {
                            const data = await response.json()
                            if (data.success && data.requests && data.requests.length > 0) {
                                requests[order._id] = data.requests[0]
                            }
                        }
                    } catch (err) {
                        console.error(`Error fetching return request for order ${order._id}:`, err)
                    }
                })
            )

            setReturnRequests(requests)
        } catch (error) {
            console.error('Error fetching return requests:', error)
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'Delivered': return 'text-green-600 bg-green-50 border-green-200'
            case 'Out for delivery': return 'text-blue-600 bg-blue-50 border-blue-200'
            case 'Shipped': return 'text-blue-600 bg-blue-50 border-blue-200'
            case 'Processing': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
            case 'Cancelled': return 'text-red-600 bg-red-50 border-red-200'
            case 'Returned': return 'text-purple-600 bg-purple-50 border-purple-200'
            default: return 'text-gray-600 bg-gray-50 border-gray-200'
        }
    }

    const filteredOrders = orders.filter(order => {
        // Status filter
        if (statusFilter !== 'All') {
            const hasReturn = returnRequests[order._id];
            if (statusFilter === 'Returned') {
                if (order.status !== 'Returned' && (!hasReturn || hasReturn.status === 'Rejected' || hasReturn.status === 'Cancelled')) {
                    return false
                }
            } else if (order.status !== statusFilter) {
                return false
            }
        }

        // Search query filter (order no or product name)
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase().trim()
            const matchOrderId = order._id.toLowerCase().includes(query)
            const matchProductName = order.orderItems.some(item =>
                item.name.toLowerCase().includes(query)
            )
            if (!matchOrderId && !matchProductName) {
                return false
            }
        }

        // Date range filter
        if (startDate) {
            const orderDate = new Date(order.createdAt)
            const start = new Date(startDate)
            start.setHours(0, 0, 0, 0)
            if (orderDate < start) {
                return false
            }
        }

        if (endDate) {
            const orderDate = new Date(order.createdAt)
            const end = new Date(endDate)
            end.setHours(23, 59, 59, 999)
            if (orderDate > end) {
                return false
            }
        }

        return true
    })

    const handleClearFilters = () => {
        setStatusFilter('All')
        setSearchQuery('')
        setStartDate('')
        setEndDate('')
    }

    if (!userInfo) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 flex items-center justify-center">
                <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full mx-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
                    <p className="text-gray-600 mb-6">Please log in to access your order history.</p>
                    <Link to="/login" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md">
                        Sign In to Continue
                    </Link>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 flex justify-center items-center">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-600">Loading your orders...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">Order History</h1>
                    <p className="text-gray-600 text-lg">Track and manage all your orders</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Filter Section */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-8 border border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Filters</h2>
                            <div className="space-y-6">
                                {/* Search Filter */}
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 mb-3 uppercase">Search</h3>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Order ID or Product Name"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                        />
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Date Range Filter */}
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 mb-3 uppercase">Date Range</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-xs text-gray-500 block mb-1">Start Date</label>
                                            <input
                                                type="date"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-700"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 block mb-1">End Date</label>
                                            <input
                                                type="date"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-700"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Status Filter */}
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 mb-3 uppercase">Order Status</h3>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-700 bg-white cursor-pointer"
                                    >
                                        {statusOptions.map((status) => {
                                            const count = status === 'All'
                                                ? orders.length
                                                : orders.filter(order => order.status === status).length
                                            return (
                                                <option key={status} value={status}>
                                                    {status} ({count})
                                                </option>
                                            )
                                        })}
                                    </select>
                                </div>
                                <button
                                    onClick={handleClearFilters}
                                    className="w-full py-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors duration-200"
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Order List */}
                    <div className="lg:col-span-3 space-y-6">
                        {filteredOrders.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-sm p-8 text-center border border-gray-100">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m8-8V4a1 1 0 00-1-1h-2a1 1 0 00-1 1v1M9 7h6" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Found</h3>
                                <p className="text-gray-600 mb-6">No orders match your current filter criteria.</p>
                                <Link to="/" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md">
                                    Start Shopping
                                </Link>
                            </div>
                        ) : (
                            filteredOrders.map((order) => (
                                <div key={order._id} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-200">
                                    {/* Order Header - Show Order Items */}
                                    <div className="p-6 border-b border-gray-100">
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <h2 className="text-lg font-semibold text-gray-900">
                                                        Order #{order._id.substring(0, 8).toUpperCase()}
                                                    </h2>
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                                                        {order.status}
                                                    </span>
                                                    {returnRequests[order._id] && (
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border text-purple-700 bg-purple-50 border-purple-200">
                                                            {returnRequests[order._id].type}: {returnRequests[order._id].status}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Order Items Preview */}
                                                <div className="flex items-center space-x-4">
                                                    {order.orderItems.slice(0, 3).map((item, index) => (
                                                        <div key={index} className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
                                                            <div className="w-12 h-12 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200">
                                                                <img src={item.image && item.image.startsWith('http') ? item.image : `${import.meta.env.VITE_API_URL}${item.image || ''}`} className="w-full h-full object-cover" alt={item.name} />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-medium text-gray-900 truncate cursor-pointer" onClick={() => navigate(`/product/${item.product}`)}>{item.name}</p>
                                                                <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{item.price}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {order.orderItems.length > 3 && (
                                                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                                            <p className="text-sm font-medium text-gray-600">
                                                                +{order.orderItems.length - 3} more items
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                <p className="text-sm text-gray-600 mt-4 flex items-center">
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-gray-900">₹{order.totalPrice}</p>
                                                <p className="text-sm text-gray-600">{order.orderItems.length} item{order.orderItems.length > 1 ? 's' : ''}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="p-4 bg-gray-50 flex justify-end">
                                        <button
                                            onClick={() => navigate(`/order-details/${order._id}`)}
                                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:bg-blue-500/80 transition-all duration-200"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}