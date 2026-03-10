import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'

const AddressCard = ({ onSelect, selectedId }) => {
    const [addresses, setAddresses] = useState([])
    const [isEditing, setIsEditing] = useState(false)
    const [selectedAddressId, setSelectedAddressId] = useState(null)
    const [formData, setFormData] = useState({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        mobile: ''
    })

    const userInfo = useSelector(state => state.productReducer.userInfo)

    useEffect(() => {
        if (userInfo) {
            fetchAddresses()
        }
    }, [userInfo])

    const fetchAddresses = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/me`, {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            })
            const data = await response.json()
            if (data.addresses) {
                setAddresses(data.addresses)
                // If in selection mode and no address selected, select the first one
                if (onSelect && data.addresses.length > 0 && !selectedId) {
                    onSelect(data.addresses[0])
                }
            }
        } catch (error) {
            console.error('Error fetching addresses:', error)
        }
    }

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const url = selectedAddressId
                ? `${import.meta.env.VITE_API_URL}/api/users/address/${selectedAddressId}`
                : `${import.meta.env.VITE_API_URL}/api/users/address`

            const method = selectedAddressId ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`,
                },
                body: JSON.stringify(formData),
            })
            if (response.ok) {
                const updatedAddresses = await response.json()
                setAddresses(updatedAddresses)
                setIsEditing(false)
                setSelectedAddressId(null)
                setFormData({
                    street: '',
                    city: '',
                    state: '',
                    zipCode: '',
                    country: '',
                    mobile: ''
                })
                // If in selection mode, select the newly added/updated address
                if (onSelect) {
                    const newAddress = updatedAddresses[updatedAddresses.length - 1]
                    onSelect(newAddress)
                }
            }
        } catch (error) {
            console.error('Error saving address:', error)
        }
    }

    const handleDelete = async (addressId) => {
        if (!window.confirm('Are you sure you want to delete this address?')) return

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/address/${addressId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            })
            if (response.ok) {
                const updatedAddresses = await response.json()
                setAddresses(updatedAddresses)
                if (onSelect && selectedId === addressId) {
                    onSelect(null) // Deselect if deleted
                }
            }
        } catch (error) {
            console.error('Error deleting address:', error)
        }
    }

    const handleEdit = (address) => {
        setFormData({
            street: address.street,
            city: address.city,
            state: address.state,
            zipCode: address.zipCode,
            country: address.country,
            mobile: address.mobile
        })
        setSelectedAddressId(address._id)
        setIsEditing(true)
    }

    if (!userInfo) {
        return <div className="text-gray-600">Please log in to view/add address.</div>
    }

    if (isEditing) {
        return (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">{selectedAddressId ? 'Edit Address' : 'Add Address'}</h3>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                        type="text"
                        name="street"
                        placeholder="Street Address"
                        value={formData.street}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            type="text"
                            name="city"
                            placeholder="City"
                            value={formData.city}
                            onChange={handleInputChange}
                            required
                            className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                        <input
                            type="text"
                            name="state"
                            placeholder="State"
                            value={formData.state}
                            onChange={handleInputChange}
                            required
                            className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            type="text"
                            name="zipCode"
                            placeholder="Zip Code"
                            value={formData.zipCode}
                            onChange={handleInputChange}
                            required
                            className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                        <input
                            type="text"
                            name="country"
                            placeholder="Country"
                            value={formData.country}
                            onChange={handleInputChange}
                            required
                            className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                    </div>
                    <input
                        type="text"
                        name="mobile"
                        placeholder="Mobile Number"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                    <div className="flex gap-2">
                        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                            Save Address
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setIsEditing(false)
                                setSelectedAddressId(null)
                            }}
                            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {addresses.map((address) => (
                <div
                    key={address._id}
                    className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow relative cursor-pointer ${selectedId === address._id ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200'}`}
                    onClick={() => onSelect && onSelect(address)}
                >
                    <div className="space-y-2">
                        <div className="flex justify-between items-start">
                            <h3 className="text-lg font-semibold text-gray-800">{userInfo.name}</h3>
                            {onSelect && selectedId === address._id && (
                                <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded">Selected</span>
                            )}
                        </div>
                        <div className="text-gray-600 text-sm">
                            <p>{address.street}</p>
                            <p>{address.city}, {address.state} {address.zipCode}</p>
                            <p>{address.country}</p>
                        </div>
                        <div className="text-gray-600 text-sm">
                            <span className="font-medium">Phone:</span> {address.mobile}
                        </div>
                        <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                            <button
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                onClick={() => handleEdit(address)}
                            >
                                Edit
                            </button>
                            <button
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                                onClick={() => handleDelete(address._id)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            ))}
            <button
                onClick={() => {
                    setFormData({
                        street: '',
                        city: '',
                        state: '',
                        zipCode: '',
                        country: '',
                        mobile: ''
                    })
                    setSelectedAddressId(null)
                    setIsEditing(true)
                }}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-indigo-500 hover:text-indigo-500 transition-colors"
            >
                + Add New Address
            </button>
        </div>
    )
}

export default AddressCard