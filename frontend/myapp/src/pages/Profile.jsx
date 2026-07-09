import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import AddressCard from '../components/AddressCard'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { loginUser, logoutUser } from '../Redux/action/action'

import UserRequests from '../components/UserRequests'

const Profile = () => {
    const [user, setUser] = useState(null)
    const [activeTab, setActiveTab] = useState('profile')
    const [isEditing, setIsEditing] = useState(false)
    const [editedUser, setEditedUser] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [orderStats, setOrderStats] = useState({
        totalOrders: 0,
        completedOrders: 0,
        pendingOrders: 0
    })
    const navigate = useNavigate()
    const location = useLocation()
    const userInfo = useSelector(state => state.productReducer.userInfo)
    const dispatch = useDispatch()

    // Handle tab query parameter
    useEffect(() => {
        const params = new URLSearchParams(location.search)
        const tab = params.get('tab')
        if (tab && ['profile', 'address', 'password', 'requests'].includes(tab)) {
            setActiveTab(tab)
        }
    }, [location.search])

    useEffect(() => {
        if (!userInfo) {
            navigate('/login')
            return
        }
        fetchProfile()
        fetchOrderStats()
    }, [userInfo, navigate])

    const fetchProfile = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/me`, {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            })
            const data = await response.json()
            if (response.ok) {
                setUser(data)
                setEditedUser({
                    name: data.name || '',
                    email: data.email || '',
                    phone: data.phone || '',
                })
            } else {
                console.error('Failed to fetch profile')
                toast.error('Failed to load profile')
            }
        } catch (error) {
            console.error('Error fetching profile:', error)
            toast.error('Error loading profile')
        } finally {
            setIsLoading(false)
        }
    }

    const fetchOrderStats = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/stats`, {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            })
            console.log(response)
            if (response.ok) {
                const data = await response.json()
                console.log(data)
                setOrderStats(data)
            }
        } catch (error) {
            console.error('Error fetching order stats:', error)
        }
    }

    const handleEditClick = () => {
        setIsEditing(true)
    }

    const handleCancelEdit = () => {
        setIsEditing(false)
        setEditedUser({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
        })
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setEditedUser(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`,
                },
                body: JSON.stringify(editedUser)
            })

            const data = await response.json()

            if (response.ok) {
                setUser(data)
                setIsEditing(false)
                toast.success('Profile updated successfully!')

                // Update Redux store
                dispatch(loginUser(data))

            } else {
                toast.error(data.message || 'Failed to update profile')
            }
        } catch (error) {
            console.error('Error updating profile:', error)
            toast.error('Error updating profile')
        } finally {
            setIsLoading(false)
        }
    }

    const handlePasswordChange = async (e) => {
        e.preventDefault()
        const currentPassword = e.target.currentPassword.value
        const newPassword = e.target.newPassword.value
        const confirmPassword = e.target.confirmPassword.value

        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match')
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`,
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
            })

            const data = await response.json()

            if (response.ok) {
                toast.success('Password changed successfully!')
                e.target.reset()
            } else {
                toast.error(data.message || 'Failed to change password')
            }
        } catch (error) {
            console.error('Error changing password:', error)
            toast.error('Error changing password')
        } finally {
            setIsLoading(false)
        }
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-600">Loading your profile...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
                    <p className="text-gray-600">Manage your personal information and preferences</p>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-4">
                        <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-6">
                            {/* User Avatar */}
                            <div className="text-center mb-6">
                                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <h2 className="font-semibold text-gray-900">{user.name}</h2>
                                <p className="text-sm text-gray-500">{user.email}</p>
                                <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                    {user.role}
                                </span>
                            </div>

                            {/* Navigation Tabs */}
                            <nav className="space-y-2 mb-6">
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'profile'
                                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Personal Info
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('address')}
                                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'address'
                                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        My Addresses
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('password')}
                                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'password'
                                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        Change Password
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('requests')}
                                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'requests'
                                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                        </svg>
                                        My Requests
                                    </div>
                                </button>
                            </nav>

                            {/* Logout Button */}
                            <button
                                onClick={() => {
                                    dispatch(logoutUser())
                                    navigate('/login')
                                }}
                                className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                            >
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Logout
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-8">
                        {/* Profile Information */}
                        {activeTab === 'profile' && (
                            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="text-lg font-semibold text-white">Personal Information</h3>
                                            <p className="text-blue-100 text-sm">Your basic profile details</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    {isEditing ? (
                                        <form onSubmit={handleSubmit}>
                                            <div className="space-y-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-gray-700">Full Name</label>
                                                        <input
                                                            type="text"
                                                            name="name"
                                                            value={editedUser.name}
                                                            onChange={handleInputChange}
                                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                            required
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-gray-700">Email Address</label>
                                                        <input
                                                            type="email"
                                                            name="email"
                                                            value={editedUser.email}
                                                            onChange={handleInputChange}
                                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                            required
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-gray-700">Phone Number</label>
                                                        <input
                                                            type="tel"
                                                            name="phone"
                                                            value={editedUser.phone || ''}
                                                            onChange={handleInputChange}
                                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex justify-end space-x-4 pt-4">
                                                    <button
                                                        type="button"
                                                        onClick={handleCancelEdit}
                                                        className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200"
                                                        disabled={isLoading}
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
                                                        disabled={isLoading}
                                                    >
                                                        {isLoading ? (
                                                            <div className="flex items-center">
                                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                                Saving...
                                                            </div>
                                                        ) : 'Save Changes'}
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-1">
                                                    <label className="text-sm font-medium text-gray-500">Full Name</label>
                                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                        <p className="text-gray-900 font-medium">{user.name}</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-sm font-medium text-gray-500">Email Address</label>
                                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                        <p className="text-gray-900 font-medium">{user.email}</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-sm font-medium text-gray-500">Phone Number</label>
                                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                        <p className="text-gray-900 font-medium">{user.phone || 'Not provided'}</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-sm font-medium text-gray-500">Account Role</label>
                                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 capitalize">
                                                            {user.role}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-sm font-medium text-gray-500">Member Since</label>
                                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                        <p className="text-gray-900 font-medium">
                                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            }) : 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-sm font-medium text-gray-500">Last Updated</label>
                                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                        <p className="text-gray-900 font-medium">
                                                            {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            }) : 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>

                                            </div>
                                            <div className="flex justify-end space-x-4 ">
                                                <button
                                                    onClick={handleEditClick}
                                                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:bg-blue-500/80 transition-all duration-200"
                                                >
                                                    Edit Profile
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Address Section */}
                        {activeTab === 'address' && (
                            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                                <div className="bg-gradient-to-r from-green-500 to-teal-600 px-6 py-4">
                                    <h3 className="text-lg font-semibold text-white">My Addresses</h3>
                                    <p className="text-green-100 text-sm">Manage your delivery addresses</p>
                                </div>
                                <div className="p-6">
                                    <AddressCard />
                                </div>
                            </div>
                        )}

                        {/* Change Password Section */}
                        {activeTab === 'password' && (
                            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                                <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-4">
                                    <h3 className="text-lg font-semibold text-white">Change Password</h3>
                                    <p className="text-amber-100 text-sm">Update your account password</p>
                                </div>
                                <div className="p-6">
                                    <form onSubmit={handlePasswordChange}>
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Current Password</label>
                                                <input
                                                    type="password"
                                                    name="currentPassword"
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">New Password</label>
                                                <input
                                                    type="password"
                                                    name="newPassword"
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                                                    required
                                                    minLength="6"
                                                />
                                                <p className="text-xs text-gray-500">Minimum 6 characters</p>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
                                                <input
                                                    type="password"
                                                    name="confirmPassword"
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                                                    required
                                                    minLength="6"
                                                />
                                            </div>

                                            <div className="flex justify-end pt-4">
                                                <button
                                                    type="submit"
                                                    className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all duration-200 disabled:opacity-50"
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? (
                                                        <div className="flex items-center">
                                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                            Updating...
                                                        </div>
                                                    ) : 'Change Password'}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Requests Section */}
                        {activeTab === 'requests' && (
                            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                                <div className="bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-4">
                                    <h3 className="text-lg font-semibold text-white">Support & Returns</h3>
                                    <p className="text-cyan-100 text-sm">Track your tickets and return requests</p>
                                </div>
                                <div className="p-6">
                                    <UserRequests requestId={new URLSearchParams(location.search).get('requestId')} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-50 rounded-xl mr-4">
                                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Orders</p>
                                <p className="text-2xl font-bold text-gray-900">{orderStats.totalOrders}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center">
                            <div className="p-3 bg-green-50 rounded-xl mr-4">
                                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Completed</p>
                                <p className="text-2xl font-bold text-gray-900">{orderStats.completedOrders}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center">
                            <div className="p-3 bg-purple-50 rounded-xl mr-4">
                                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Pending</p>
                                <p className="text-2xl font-bold text-gray-900">{orderStats.pendingOrders}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profile