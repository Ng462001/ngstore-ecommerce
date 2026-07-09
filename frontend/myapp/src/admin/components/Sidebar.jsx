// components/Sidebar.js
import React from 'react';
import {
    Dashboard as DashboardIcon,
    ShoppingCart,
    Inventory,
    Star,
    People,
    Store,
    Logout,
    Settings,
    Email
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { logoutUser } from '../../Redux/action/action';
import { useDispatch } from 'react-redux';

const Sidebar = ({ onMobileClose }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch()
    // Extract the current section from the path
    const currentSection = location.pathname.split('/').pop() || 'dashboard';

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
        { id: 'products', label: 'Products', icon: <Inventory />, path: '/admin/products' },
        { id: 'orders', label: 'Orders', icon: <ShoppingCart />, path: '/admin/orders' },
        { id: 'reviews', label: 'Reviews & Ratings', icon: <Star />, path: '/admin/reviews' },
        { id: 'customers', label: 'Customers', icon: <People />, path: '/admin/customers' },
        { id: 'support', label: 'Support', icon: <People />, path: '/admin/support' },
        { id: 'returns', label: 'Returns', icon: <Inventory />, path: '/admin/returns' },
        { id: 'contacts', label: 'Contact Messages', icon: <Email />, path: '/admin/contacts' },
    ];

    const handleItemClick = (path) => {
        navigate(path);
        if (onMobileClose) onMobileClose();
    };

    const handleLogout = () => {
        dispatch(logoutUser())
        navigate('/login');
    };

    return (
        <div className="flex flex-col h-full bg-gradient-to-b from-blue-600 to-indigo-700 text-white">
            {/* Logo */}
            <div className="flex items-center justify-center p-6 border-b border-blue-500">
                <Store className="mr-2" />
                <span className="text-xl font-bold">E-Commerce Admin</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => handleItemClick(item.path)}
                        className={`flex items-center w-full px-4 py-3 text-left rounded-lg transition-all ${currentSection === item.id
                            ? 'bg-white bg-opacity-20 text-white font-medium'
                            : 'text-blue-100 hover:bg-white hover:bg-opacity-10'
                            }`}
                    >
                        <span className="mr-3">{item.icon}</span>
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>

            {/* Bottom Section */}
            <div className="mt-auto p-4 border-t border-blue-500 space-y-2">
                <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 text-left rounded-lg text-blue-100 hover:bg-red-500 hover:bg-opacity-20 transition-all"
                >
                    <Logout className="mr-3" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;