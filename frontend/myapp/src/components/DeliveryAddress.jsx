import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Divider,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material'
import { Add, Edit, Delete, LocationOn } from '@mui/icons-material'
import { useSelector } from 'react-redux'

const DeliveryAddress = ({ onNext, onAddressSelect, selectedAddress }) => {
  const [addresses, setAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    mobile: ''
  })

  const [errors, setErrors] = useState({})
  const userInfo = useSelector(state => state.productReducer?.userInfo)

  // Fetch addresses from database
  useEffect(() => {
    if (userInfo) {
      fetchAddresses()
    } else {
      setLoading(false)
    }
  }, [userInfo])

  const fetchAddresses = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch addresses')
      }

      const data = await response.json()
      if (data.addresses) {
        setAddresses(data.addresses)
        // Auto-select the first address if none selected
        if (data.addresses.length > 0 && !selectedAddress) {
          const firstAddress = data.addresses[0]
          setSelectedAddressId(firstAddress._id)
          if (onAddressSelect) {
            onAddressSelect(firstAddress)
          }
        } else if (selectedAddress) {
          setSelectedAddressId(selectedAddress._id)
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error)
      setError('Failed to load addresses. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.street.trim()) newErrors.street = 'Street address is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.state.trim()) newErrors.state = 'State is required'
    if (!formData.zipCode.trim()) newErrors.zipCode = 'Zip code is required'
    if (!formData.country.trim()) newErrors.country = 'Country is required'
    if (!formData.mobile.trim()) newErrors.mobile = 'Mobile number is required'

    // Mobile validation
    const mobileRegex = /^\+?[\d\s-()]{10,}$/
    if (formData.mobile && !mobileRegex.test(formData.mobile)) {
      newErrors.mobile = 'Please enter a valid mobile number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      const url = isEditing
        ? `${import.meta.env.VITE_API_URL}/api/users/address/${selectedAddressId}`
        : `${import.meta.env.VITE_API_URL}/api/users/address`

      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to save address')
      }

      const updatedAddresses = await response.json()
      setAddresses(updatedAddresses)

      // Select the newly added/updated address
      const newAddress = isEditing
        ? updatedAddresses.find(addr => addr._id === selectedAddressId)
        : updatedAddresses[updatedAddresses.length - 1]

      setSelectedAddressId(newAddress._id)
      if (onAddressSelect) {
        onAddressSelect(newAddress)
      }

      // Reset form
      setFormData({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        mobile: ''
      })
      setIsAddingNew(false)
      setIsEditing(false)
      setSelectedAddressId(null)

    } catch (error) {
      console.error('Error saving address:', error)
      setError('Failed to save address. Please try again.')
    }
  }

  const handleAddressSelect = (addressId) => {
    setSelectedAddressId(addressId)
    const address = addresses.find(addr => addr._id === addressId)
    if (onAddressSelect && address) {
      onAddressSelect(address)
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
    setIsAddingNew(true)
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

      if (!response.ok) {
        throw new Error('Failed to delete address')
      }

      const updatedAddresses = await response.json()
      setAddresses(updatedAddresses)

      // If deleting selected address, select another one or clear selection
      if (addressId === selectedAddressId) {
        if (updatedAddresses.length > 0) {
          const newSelected = updatedAddresses[0]
          setSelectedAddressId(newSelected._id)
          if (onAddressSelect) {
            onAddressSelect(newSelected)
          }
        } else {
          setSelectedAddressId(null)
          if (onAddressSelect) {
            onAddressSelect(null)
          }
        }
      }

    } catch (error) {
      console.error('Error deleting address:', error)
      setError('Failed to delete address. Please try again.')
    }
  }

  const handleContinueToPayment = () => {
    if (!selectedAddressId) {
      alert('Please select a delivery address')
      return
    }

    if (onNext) {
      onNext()
    }
  }

  const cancelForm = () => {
    setFormData({
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      mobile: ''
    })
    setIsAddingNew(false)
    setIsEditing(false)
    setSelectedAddressId(null)
  }

  if (!userInfo) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          Please log in to manage your addresses
        </Typography>
      </Box>
    )
  }

  if (loading) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', textAlign: 'center', py: 4 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading addresses...
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Delivery Address
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Choose where you'd like to receive your order
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Address List - Left Side */}
        <Grid item xs={12} md={4}>
          <Paper elevation={1} sx={{ p: 3, height: 'fit-content' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="600">
                Saved Addresses
              </Typography>
              <Button
                startIcon={<Add />}
                onClick={() => setIsAddingNew(true)}
                variant="outlined"
                size="small"
                disabled={isAddingNew}
              >
                Add New
              </Button>
            </Box>

            {addresses.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <LocationOn sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  No addresses saved yet
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => setIsAddingNew(true)}
                  sx={{ mt: 2 }}
                >
                  Add Your First Address
                </Button>
              </Box>
            ) : (
              <FormControl component="fieldset" sx={{ width: '100%' }}>
                <RadioGroup
                  value={selectedAddressId}
                  onChange={(e) => handleAddressSelect(e.target.value)}
                >
                  {addresses.map((address) => (
                    <Card
                      key={address._id}
                      sx={{
                        mb: 2,
                        border: selectedAddressId === address._id ? 2 : 1,
                        borderColor: selectedAddressId === address._id ? 'primary.main' : 'divider',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleAddressSelect(address._id)}
                    >
                      <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          <Radio
                            value={address._id}
                            checked={selectedAddressId === address._id}
                          />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" fontWeight="600">
                              {userInfo.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              {address.street}<br />
                              {address.city}, {address.state} {address.zipCode}<br />
                              {address.country}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              📞 {address.mobile}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1, mt: 2, justifyContent: 'flex-end' }}>
                          <Button
                            size="small"
                            startIcon={<Edit />}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEdit(address)
                            }}
                          >
                            Edit
                          </Button>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(address._id)
                            }}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </RadioGroup>
              </FormControl>
            )}

            {/* Continue Button */}
            {addresses.length > 0 && (
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleContinueToPayment}
                startIcon={<LocationOn />}
                sx={{ mt: 3, py: 1.5 }}
                disabled={!selectedAddressId}
              >
                Deliver to This Address
              </Button>
            )}
          </Paper>
        </Grid>

        {/* Add/Edit Address Form - Right Side */}
        <Grid item xs={12} md={8}>
          {(isAddingNew || isEditing) && (
            <Paper elevation={1} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="600">
                {isEditing ? 'Edit Address' : 'Add New Address'}
              </Typography>

              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      label="Street Address"
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      error={!!errors.street}
                      helperText={errors.street}
                      placeholder="Enter your street address"
                      multiline
                      rows={2}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="City"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      error={!!errors.city}
                      helperText={errors.city}
                      placeholder="Enter your city"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="State/Province"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      error={!!errors.state}
                      helperText={errors.state}
                      placeholder="Enter your state/province"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="Zip/Postal Code"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      error={!!errors.zipCode}
                      helperText={errors.zipCode}
                      placeholder="Enter your zip code"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="Country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      error={!!errors.country}
                      helperText={errors.country}
                      placeholder="Enter your country"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      label="Mobile Number"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      error={!!errors.mobile}
                      helperText={errors.mobile}
                      placeholder="+1 (555) 123-4567"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        type="submit"
                        variant="contained"
                      >
                        {isEditing ? 'Update Address' : 'Save Address'}
                      </Button>
                      <Button
                        onClick={cancelForm}
                        variant="outlined"
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          )}

          {!isAddingNew && !isEditing && addresses.length > 0 && (
            <Paper elevation={1} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                Select an address from the list or add a new one
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  )
}

export default DeliveryAddress