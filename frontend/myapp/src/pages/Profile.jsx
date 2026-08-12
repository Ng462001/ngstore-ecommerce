import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import AddressCard from '../components/AddressCard'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { loginUser, logoutUser } from '../Redux/action/action'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

import UserRequests from '../components/UserRequests'

const Profile = () => {
    const [user, setUser] = useState(null)
    const [activeTab, setActiveTab] = useState('profile')
    const [isEditing, setIsEditing] = useState(false)
    const [editedUser, setEditedUser] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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
        if (name === 'phone') {
            const numericValue = value.replace(/\D/g, '').slice(0, 10)
            setEditedUser(prev => ({
                ...prev,
                [name]: numericValue
            }))
            return
        }
        setEditedUser(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (editedUser.name.trim().length === 0 || editedUser.phone.trim().length === 0) {
            toast.error('Please fill all the fields')
            return
        }

        if (editedUser.phone.length !== 10) {
            toast.error('Phone number must be exactly 10 digits')
            return
        }

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
        <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-10">
                    <h1 className="font-heading text-3xl sm:text-4xl font-semibold text-text-primary mb-2">My Account</h1>
                    <p className="text-text-secondary text-base">Manage your personal information and preferences</p>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-4">
                        <div className="bg-surface rounded-2xl shadow-soft p-4 sm:p-6 sticky top-24 border border-border-light">
                            {/* User Avatar */}
                            <div className="text-center mb-4 sm:mb-6">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-accent rounded-full flex items-center justify-center text-white text-2xl font-heading font-semibold mx-auto mb-3 shadow-soft">
                                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <h2 className="font-heading text-lg font-semibold text-text-primary">{user.name}</h2>
                                <p className="text-xs text-text-secondary">{user.email}</p>
                                <span className="inline-block mt-2 px-3 py-0.5 bg-accent-light text-accent text-xs font-semibold rounded-full border border-accent/20 capitalize">
                                    {user.role}
                                </span>
                            </div>

                            {/* Navigation Tabs */}
                            <nav className="flex lg:flex-col overflow-x-auto gap-2 lg:gap-0 lg:space-y-1.5 mb-4 sm:mb-6 pb-2 lg:pb-0 no-scrollbar">
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`shrink-0 lg:w-full text-left px-4 py-2.5 sm:py-3 rounded-xl transition-all duration-200 ${activeTab === 'profile'
                                        ? 'bg-accent-light text-accent border border-accent/30 font-semibold'
                                        : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary'
                                        }`}
                                >
                                    <div className="flex items-center whitespace-nowrap">
                                        <svg className="w-5 h-5 mr-2 sm:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Personal Info
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('address')}
                                    className={`shrink-0 lg:w-full text-left px-4 py-2.5 sm:py-3 rounded-xl transition-all duration-200 ${activeTab === 'address'
                                        ? 'bg-accent-light text-accent border border-accent/30 font-semibold'
                                        : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary'
                                        }`}
                                >
                                    <div className="flex items-center whitespace-nowrap">
                                        <svg className="w-5 h-5 mr-2 sm:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        My Addresses
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('password')}
                                    className={`shrink-0 lg:w-full text-left px-4 py-2.5 sm:py-3 rounded-xl transition-all duration-200 ${activeTab === 'password'
                                        ? 'bg-accent-light text-accent border border-accent/30 font-semibold'
                                        : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary'
                                        }`}
                                >
                                    <div className="flex items-center whitespace-nowrap">
                                        <svg className="w-5 h-5 mr-2 sm:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        Change Password
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('requests')}
                                    className={`shrink-0 lg:w-full text-left px-4 py-2.5 sm:py-3 rounded-xl transition-all duration-200 ${activeTab === 'requests'
                                        ? 'bg-accent-light text-accent border border-accent/30 font-semibold'
                                        : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary'
                                        }`}
                                >
                                    <div className="flex items-center whitespace-nowrap">
                                        <svg className="w-5 h-5 mr-2 sm:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                            <div className="bg-surface rounded-2xl shadow-soft border border-border-light overflow-hidden">
                                <div className="bg-surface-muted border-b border-border-light px-6 py-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="font-heading text-lg font-semibold text-text-primary">Personal Information</h3>
                                            <p className="text-text-secondary text-xs">Your basic profile details</p>
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
                                                            disabled
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
                                                            pattern='[0-9]{10}'
                                                            maxLength="10"
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
                                                        className="px-6 py-2.5 border border-border-light text-text-secondary font-medium rounded-xl hover:bg-surface-muted transition-all duration-200 text-sm"
                                                        disabled={isLoading}
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        className="px-6 py-2.5 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-all duration-200 text-sm shadow-soft disabled:opacity-50"
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
                                                     <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Full Name</label>
                                                     <div className="p-3 bg-background rounded-xl border border-border-light">
                                                         <p className="text-text-primary font-medium text-sm">{user.name}</p>
                                                     </div>
                                                 </div>

                                                 <div className="space-y-1">
                                                     <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Email Address</label>
                                                     <div className="p-3 bg-background rounded-xl border border-border-light">
                                                         <p className="text-text-primary font-medium text-sm">{user.email}</p>
                                                     </div>
                                                 </div>

                                                 <div className="space-y-1">
                                                     <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Phone Number</label>
                                                     <div className="p-3 bg-background rounded-xl border border-border-light">
                                                         <p className="text-text-primary font-medium text-sm">{user.phone || 'Not provided'}</p>
                                                     </div>
                                                 </div>

                                                 <div className="space-y-1">
                                                     <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Account Role</label>
                                                     <div className="p-3 bg-background rounded-xl border border-border-light flex items-center">
                                                         <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-accent-light text-accent border border-accent/30 capitalize">
                                                             ✨ {user.role || 'customer'}
                                                         </span>
                                                     </div>
                                                 </div>

                                                 <div className="space-y-1">
                                                     <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Member Since</label>
                                                     <div className="p-3 bg-background rounded-xl border border-border-light">
                                                         <p className="text-text-primary font-medium text-sm">
                                                             {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                                                 year: 'numeric',
                                                                 month: 'long',
                                                                 day: 'numeric'
                                                             }) : 'N/A'}
                                                         </p>
                                                     </div>
                                                 </div>

                                                 <div className="space-y-1">
                                                     <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Last Updated</label>
                                                     <div className="p-3 bg-background rounded-xl border border-border-light">
                                                         <p className="text-text-primary font-medium text-sm">
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
                                                    className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-all duration-200 text-sm shadow-soft"
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
                                                <div className="relative">
                                                    <input
                                                        type={showCurrentPassword ? "text" : "password"}
                                                        name="currentPassword"
                                                        className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                    >
                                                        {showCurrentPassword ? (
                                                            <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                                                        ) : (
                                                            <EyeIcon className="h-5 w-5" aria-hidden="true" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">New Password</label>
                                                <div className="relative">
                                                    <input
                                                        type={showNewPassword ? "text" : "password"}
                                                        name="newPassword"
                                                        className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                                                        required
                                                        minLength="6"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                                    >
                                                        {showNewPassword ? (
                                                            <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                                                        ) : (
                                                            <EyeIcon className="h-5 w-5" aria-hidden="true" />
                                                        )}
                                                    </button>
                                                </div>
                                                <p className="text-xs text-gray-500">Minimum 6 characters</p>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
                                                <div className="relative">
                                                    <input
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        name="confirmPassword"
                                                        className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                                                        required
                                                        minLength="6"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    >
                                                        {showConfirmPassword ? (
                                                            <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                                                        ) : (
                                                            <EyeIcon className="h-5 w-5" aria-hidden="true" />
                                                        )}
                                                    </button>
                                                </div>
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
            </div>
        </div>
    )
}

export default Profile