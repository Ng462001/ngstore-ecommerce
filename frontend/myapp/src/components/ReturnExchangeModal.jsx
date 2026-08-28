import React, { useState, useEffect } from 'react'
import {
    Modal,
    Box,
    Typography,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Paper,
    IconButton,
    Chip,
    Stack,
    List,
    Checkbox,
    Card,
    CardContent,
    Alert,
    CircularProgress
} from '@mui/material'
import {
    Close as CloseIcon,
    AssignmentReturn as ReturnIcon,
    SwapHoriz as ExchangeIcon,
    PhotoCamera as CameraIcon,
    Delete as DeleteIcon,
    CheckCircle as CheckCircleIcon,
    LocalShipping as ShippingIcon,
    Payments as PaymentsIcon,
    Inventory as InventoryIcon
} from '@mui/icons-material'

const ReturnExchangeModal = ({ open, onClose, order, user, onRequestSubmitted }) => {
    const [activeStep, setActiveStep] = useState(0) // 0: Type, 1: Items, 2: Reason, 3: Success
    const [requestType, setRequestType] = useState('') // 'return' or 'exchange'
    const [selectedItems, setSelectedItems] = useState([])
    const [selectedReason, setSelectedReason] = useState('')
    const [customReason, setCustomReason] = useState('')
    const [quantity, setQuantity] = useState(1)
    const [images, setImages] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [exchangePreference, setExchangePreference] = useState('')
    const [additionalNotes, setAdditionalNotes] = useState('')

    const returnReasons = [
        { value: 'damaged', label: 'Product Damaged/Defective' },
        { value: 'wrong_item', label: 'Wrong Item Received' },
        { value: 'quality', label: 'Poor Quality' },
        { value: 'size', label: 'Size Issue' },
        { value: 'color', label: 'Color Issue' },
        { value: 'not_as_described', label: 'Product Not as Described' },
        { value: 'received_late', label: 'Received After Need' },
        { value: 'changed_mind', label: 'Changed Mind/No Longer Needed' },
        { value: 'other', label: 'Other' }
    ]

    // Initialize with first item selected when modal opens
    useEffect(() => {
        if (open && order?.orderItems?.length > 0 && selectedItems.length === 0) {
            // Default to selecting the first eligible item if possible, or just the first item
            setSelectedItems([order.orderItems[0]._id])
            setQuantity(1)
        }
    }, [open, order, selectedItems])

    const handleItemSelect = (itemId) => {
        // Enforce single selection to match global quantity state
        if (selectedItems.includes(itemId)) {
            setSelectedItems([])
        } else {
            setSelectedItems([itemId])
            setQuantity(1) // Reset quantity for new selection
            setExchangePreference('') // Reset exchange preference
            setAdditionalNotes('') // Reset additional notes
        }
    }

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files)
        const validFiles = files.filter(file => file.type.startsWith('image/'))
        setImages([...images, ...validFiles.slice(0, 3 - images.length)])
    }

    const removeImage = (index) => {
        setImages(images.filter((_, i) => i !== index))
    }

    const getSelectedItemDetails = () => {
        if (!order?.orderItems || selectedItems.length === 0) return null
        return order.orderItems.find(item => item._id === selectedItems[0])
    }

    const isItemEligible = (item) => {
        if (!order) return false
        // Must be delivered to be eligible for return/exchange
        if (order.status !== 'Delivered') return false

        const deliveryDate = order.deliveredAt
            ? new Date(order.deliveredAt)
            : (order.updatedAt ? new Date(order.updatedAt) : new Date())
        const currentDate = new Date()
        const daysDifference = (currentDate - deliveryDate) / (1000 * 60 * 60 * 24)
        return daysDifference <= 10 // 10-day return window
    }

    const hasEligibleItems = () => {
        if (!order?.orderItems) return false
        return order.orderItems.some(item => isItemEligible(item))
    }

    const getAvailableSizes = () => {
        const selectedItem = getSelectedItemDetails()
        if (!selectedItem?.availableSizes) return []
        // Return sizes from the product, excluding the currently selected size
        return selectedItem.availableSizes.filter(size => size !== selectedItem.selectedSize)
    }

    const inferCondition = (reason) => {
        const damageReasons = ['damaged', 'quality', 'not_as_described', 'broken']
        if (damageReasons.includes(reason)) return 'Damaged'
        if (reason === 'wrong_item') return 'Wrong Item'
        return 'Opened'
    }

    const handleSubmit = async () => {
        setLoading(true)
        setError('')

        try {
            // Validate
            if (selectedItems.length === 0) {
                throw new Error('Please select an item')
            }

            if (!selectedReason) {
                throw new Error('Please select a reason')
            }

            if (selectedReason === 'other' && !customReason.trim()) {
                throw new Error('Please specify the reason')
            }

            if (requestType === 'exchange' && !exchangePreference.trim()) {
                throw new Error('Please specify what you want in exchange')
            }

            const condition = inferCondition(selectedReason)
            const itemsToSubmit = selectedItems.map(itemId => {
                const item = order.orderItems.find(i => i._id === itemId)
                return {
                    product: item.product,
                    name: item.name,
                    image: item.image || item.images?.[0]?.src || '',
                    quantity: quantity,
                    price: item.price,
                    reason: selectedReason === 'other' ? customReason : selectedReason,
                    condition: condition,
                }
            })

            const formData = new FormData()
            formData.append('orderId', order._id)
            formData.append('type', requestType === 'return' ? 'Return' : 'Exchange')
            formData.append('items', JSON.stringify(itemsToSubmit))
            // Ensure pickup address is valid
            const pickupAddr = {
                fullName: order.shippingAddress?.fullName || user?.name || 'Customer',
                street: order.shippingAddress?.street || 'N/A',
                city: order.shippingAddress?.city || 'N/A',
                state: order.shippingAddress?.state || 'N/A',
                zipCode: order.shippingAddress?.zipCode || 'N/A',
                country: order.shippingAddress?.country || 'India',
                mobile: order.shippingAddress?.mobile || user?.phone || ''
            }
            formData.append('pickupAddress', JSON.stringify(pickupAddr))

            if (requestType === 'exchange') {
                const exchangeDetails = {
                    newProduct: exchangePreference + (additionalNotes ? ` - ${additionalNotes}` : '')
                }
                formData.append('exchangeDetails', JSON.stringify(exchangeDetails))
            }

            images.forEach(image => {
                formData.append('images', image)
            })

            // Get token from user prop or localStorage
            const token = user?.token || JSON.parse(localStorage.getItem('userInfo'))?.token
            if (!token) throw new Error('You must be logged in')

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/return-exchange`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            })

            const data = await response.json()
            if (!data.success) throw new Error(data.message || 'Failed to submit request')

            if (onRequestSubmitted) {
                onRequestSubmitted()
            }
            setActiveStep(3)
        } catch (err) {
            console.error(err)
            setError(err.message || 'Failed to submit request')
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        if (activeStep === 3 && onRequestSubmitted) {
            onRequestSubmitted()
        }
        setActiveStep(0)
        setRequestType('')
        setSelectedItems([])
        setSelectedReason('')
        setCustomReason('')
        setQuantity(1)
        setImages([])
        setError('')
        setExchangePreference('')
        setAdditionalNotes('')
        onClose()
    }

    const renderStep = () => {
        switch (activeStep) {
            case 0: // Select type
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Select Request Type
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            Please choose whether you want to return or exchange items from your order.
                        </Typography>

                        <Grid container spacing={3} sx={{ mt: 2 }}>
                            <Grid item xs={12} sm={6}>
                                <Paper
                                    elevation={requestType === 'return' ? 3 : 1}
                                    sx={{
                                        p: 3,
                                        cursor: 'pointer',
                                        border: 2,
                                        borderColor: requestType === 'return' ? 'primary.main' : 'transparent',
                                        '&:hover': { borderColor: 'primary.main' }
                                    }}
                                    onClick={() => setRequestType('return')}
                                >
                                    <Box sx={{ textAlign: 'center' }}>
                                        <ReturnIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                                        <Typography variant="h6" gutterBottom>
                                            Return Item
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Get refund for your purchase
                                        </Typography>
                                        <Box sx={{ mt: 2 }}>
                                            <Chip label="Refund to Original Payment" size="small" />
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                                Processing time: 5-7 business days
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Paper
                                    elevation={requestType === 'exchange' ? 3 : 1}
                                    sx={{
                                        p: 3,
                                        cursor: 'pointer',
                                        border: 2,
                                        borderColor: requestType === 'exchange' ? 'primary.main' : 'transparent',
                                        '&:hover': { borderColor: 'primary.main' }
                                    }}
                                    onClick={() => setRequestType('exchange')}
                                >
                                    <Box sx={{ textAlign: 'center' }}>
                                        <ExchangeIcon sx={{ fontSize: 60, color: 'secondary.main', mb: 2 }} />
                                        <Typography variant="h6" gutterBottom>
                                            Exchange Item
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Replace with different size/color
                                        </Typography>
                                        <Box sx={{ mt: 2 }}>
                                            <Chip label="Free Replacement" size="small" color="secondary" />
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                                Usually delivered in 3-5 days
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>

                        <Box sx={{ mt: 4, p: 2, bgcolor: 'info.50', borderRadius: 1 }}>
                            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                Return Policy Summary
                            </Typography>
                            <Stack spacing={1}>
                                <Typography variant="body2">
                                    • 10-day return window from delivery date
                                </Typography>
                                <Typography variant="body2">
                                    • Products must be in original condition with tags
                                </Typography>
                                <Typography variant="body2">
                                    • Free pickup for returns/exchanges
                                </Typography>
                                <Typography variant="body2">
                                    • Refunds processed in 5-7 business days
                                </Typography>
                            </Stack>
                        </Box>

                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                variant="contained"
                                disabled={!requestType}
                                onClick={() => setActiveStep(1)}
                            >
                                Continue
                            </Button>
                        </Box>
                    </Box>
                )

            case 1: { // Select items
                const selectedItem = getSelectedItemDetails()
                const eligibleItemsExist = hasEligibleItems()

                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Select Item to {requestType === 'return' ? 'Return' : 'Exchange'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            Choose the item from your order that you want to {requestType === 'return' ? 'return' : 'exchange'}.
                        </Typography>

                        {!eligibleItemsExist && (
                            <Alert severity="error" sx={{ mb: 3 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    No Eligible Items
                                </Typography>
                                <Typography variant="body2">
                                    The 10-day return/exchange window has expired for all items in this order.
                                    Returns and exchanges must be initiated within 10 days of delivery.
                                </Typography>
                            </Alert>
                        )}

                        <List>
                            {order.orderItems.map((item, index) => {
                                const eligible = isItemEligible(item)
                                const isSelected = selectedItems.includes(item._id)
                                return (
                                    <Paper
                                        key={item._id}
                                        sx={{
                                            mb: 2,
                                            p: 2,
                                            border: isSelected ? 2 : 1,
                                            borderColor: isSelected ? 'primary.main' : 'divider',
                                            bgcolor: isSelected ? 'action.hover' : 'background.paper',
                                            opacity: eligible ? 1 : 0.6
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Checkbox
                                                checked={isSelected}
                                                onChange={() => handleItemSelect(item._id)}
                                                disabled={!eligible}
                                            />
                                            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                                {item.image && (
                                                    <img
                                                        src={item.image.startsWith('http') ? item.image : `${import.meta.env.VITE_API_URL}${item.image}`}
                                                        alt={item.name}
                                                        style={{ width: 60, height: 60, objectFit: 'cover', marginRight: 16, borderRadius: 4 }}
                                                    />
                                                )}
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="subtitle2" fontWeight="bold">
                                                        {item.name}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Qty: {item.quantity} • {item.selectedSize ? `Size: ${item.selectedSize}` : ''} {item.selectedColor ? `• Color: ${item.selectedColor}` : ''}
                                                    </Typography>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        ₹{item.price}
                                                    </Typography>
                                                    {!eligible && (
                                                        <Typography variant="caption" color="error">
                                                            Not eligible - 10-day window expired
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Paper>
                                )
                            })}
                        </List>

                        {selectedItem && (
                            <Box sx={{ mt: 3 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Return Quantity
                                </Typography>
                                <Paper sx={{ p: 2 }}>
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid item xs={6}>
                                            <TextField
                                                fullWidth
                                                label="Quantity"
                                                type="number"
                                                value={quantity}
                                                size="small"
                                                onChange={(e) => {
                                                    const value = Math.max(1, Math.min(selectedItem.quantity, parseInt(e.target.value) || 1))
                                                    setQuantity(value)
                                                }}
                                                InputProps={{
                                                    inputProps: { min: 1, max: selectedItem.quantity }
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">
                                                Refund Amount: <strong>₹{selectedItem.price * quantity}</strong>
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Box>
                        )}

                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                            <Button onClick={() => setActiveStep(0)}>
                                Back
                            </Button>
                            <Button
                                variant="contained"
                                disabled={selectedItems.length === 0 || !eligibleItemsExist}
                                onClick={() => setActiveStep(2)}
                            >
                                Continue
                            </Button>
                        </Box>
                    </Box>
                );
            }

            case 2: // Select reason and details
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Reason & Details
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            Please provide details for your {requestType === 'return' ? 'return' : 'exchange'}.
                        </Typography>

                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <InputLabel>Select Reason</InputLabel>
                            <Select
                                value={selectedReason}
                                label="Select Reason"
                                onChange={(e) => setSelectedReason(e.target.value)}
                            >
                                {returnReasons.map((reason) => (
                                    <MenuItem key={reason.value} value={reason.value}>
                                        {reason.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {selectedReason === 'other' && (
                            <TextField
                                fullWidth
                                label="Please specify"
                                value={customReason}
                                onChange={(e) => setCustomReason(e.target.value)}
                                multiline
                                rows={2}
                                sx={{ mb: 3 }}
                            />
                        )}

                        {requestType === 'exchange' && (
                            <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Exchange Preference
                                </Typography>
                                {getAvailableSizes().length > 0 ? (
                                    <Box>
                                        <FormControl fullWidth sx={{ mb: 2 }}>
                                            <InputLabel>Select Size</InputLabel>
                                            <Select
                                                value={exchangePreference}
                                                label="Select Size"
                                                onChange={(e) => setExchangePreference(e.target.value)}
                                            >
                                                {getAvailableSizes().map((size) => (
                                                    <MenuItem key={size} value={`Size ${size}`}>
                                                        Size {size}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                                            Available sizes for this product. You can also specify additional preferences below.
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            label="Additional Preferences (Optional)"
                                            placeholder="e.g. Different color preference"
                                            value={additionalNotes}
                                            onChange={(e) => setAdditionalNotes(e.target.value)}
                                            helperText="Any additional preferences or notes"
                                            multiline
                                            rows={2}
                                        />
                                    </Box>
                                ) : (
                                    <TextField
                                        fullWidth
                                        label="What would you like in exchange?"
                                        placeholder="e.g. Same product in Size XL, Blue"
                                        value={exchangePreference}
                                        onChange={(e) => setExchangePreference(e.target.value)}
                                        helperText="Please specify what you'd like in exchange"
                                        multiline
                                        rows={2}
                                    />
                                )}
                            </Box>
                        )}

                        {/* Image Upload */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Upload Photos (Optional but Recommended)
                            </Typography>

                            <input
                                accept="image/*"
                                style={{ display: 'none' }}
                                id="image-upload"
                                type="file"
                                multiple
                                onChange={handleImageUpload}
                            />
                            <label htmlFor="image-upload">
                                <Button
                                    variant="outlined"
                                    component="span"
                                    startIcon={<CameraIcon />}
                                    disabled={images.length >= 3}
                                    size="small"
                                >
                                    Add Photos ({images.length}/3)
                                </Button>
                            </label>

                            {images.length > 0 && (
                                <Box sx={{ mt: 2 }}>
                                    <Grid container spacing={1}>
                                        {images.map((image, index) => (
                                            <Grid item key={index}>
                                                <Box sx={{ position: 'relative' }}>
                                                    <img
                                                        src={URL.createObjectURL(image)}
                                                        alt={`Upload ${index + 1}`}
                                                        style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 4, border: '1px solid #ddd' }}
                                                    />
                                                    <IconButton
                                                        size="small"
                                                        sx={{
                                                            position: 'absolute',
                                                            top: -8,
                                                            right: -8,
                                                            bgcolor: 'error.main',
                                                            color: 'white',
                                                            padding: 0.5,
                                                            '&:hover': { bgcolor: 'error.dark' }
                                                        }}
                                                        onClick={() => removeImage(index)}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            )}
                        </Box>

                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}

                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                            <Button onClick={() => setActiveStep(1)}>
                                Back
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleSubmit}
                                disabled={loading || !selectedReason || (selectedReason === 'other' && !customReason.trim()) || (requestType === 'exchange' && !exchangePreference.trim())}
                                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                            >
                                {loading ? 'Submitting...' : 'Submit Request'}
                            </Button>
                        </Box>
                    </Box>
                )

            case 3: // Success
                return (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                        <Typography variant="h5" gutterBottom>
                            Request Submitted!
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                            Your {requestType === 'return' ? 'return' : 'exchange'} request has been received.
                        </Typography>

                        <Paper sx={{ p: 3, my: 3, textAlign: 'left', bgcolor: 'grey.50' }}>
                            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                What Happens Next?
                            </Typography>
                            <Stack spacing={2} sx={{ mt: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <ShippingIcon color="primary" />
                                    <Box>
                                        <Typography variant="subtitle2">1. Pickup</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            We'll schedule a pickup within 2-3 business days.
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <InventoryIcon color="primary" />
                                    <Box>
                                        <Typography variant="subtitle2">2. Inspection</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Items will be inspected at our facility.
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <PaymentsIcon color="primary" />
                                    <Box>
                                        <Typography variant="subtitle2">3. {requestType === 'return' ? 'Refund' : 'Replacement'}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {requestType === 'return'
                                                ? 'Refund processed to original source.'
                                                : 'Replacement item shipped to you.'}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Stack>
                        </Paper>

                        <Box sx={{ mt: 4 }}>
                            <Button variant="contained" onClick={handleClose}>
                                Done
                            </Button>
                        </Box>
                    </Box>
                )
        }
    }

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="return-exchange-modal"
        >
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: { xs: '95%', sm: '600px', md: '700px' },
                maxHeight: '90vh',
                bgcolor: '#FFFFFF',
                borderRadius: '24px',
                border: '1px solid #E7E4DD',
                boxShadow: '0 20px 50px rgba(0,0,0,0.12)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Header */}
                <Box sx={{
                    p: 2.5,
                    px: 3,
                    borderBottom: '1px solid #E7E4DD',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    bgcolor: '#FAF9F6',
                    color: '#1C1B19'
                }}>
                    <Typography variant="h6" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {activeStep < 3 && requestType === 'return' && <ReturnIcon sx={{ color: '#B8925A' }} />}
                        {activeStep < 3 && requestType === 'exchange' && <ExchangeIcon sx={{ color: '#B8925A' }} />}
                        {activeStep < 3
                            ? (requestType ? `${requestType === 'return' ? 'Return' : 'Exchange'} Request` : 'Start Request')
                            : 'Request Submitted'}
                    </Typography>
                    {activeStep < 3 && (
                        <IconButton onClick={handleClose} sx={{ color: '#6B6862', '&:hover': { color: '#1C1B19', bgcolor: '#F3F1EC' } }}>
                            <CloseIcon />
                        </IconButton>
                    )}
                </Box>

                {/* Progress Steps */}
                {activeStep < 3 && (
                    <Box sx={{ px: 3, pt: 2, pb: 1.5, borderBottom: '1px solid #E7E4DD', bgcolor: '#FAF9F6' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-around', maxWidth: 400, mx: 'auto' }}>
                            {['Type', 'Items', 'Details'].map((step, index) => (
                                <Box key={step} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <Box
                                        sx={{
                                            width: 30,
                                            height: 30,
                                            borderRadius: '50%',
                                            bgcolor: activeStep >= index ? '#B8925A' : '#F3F1EC',
                                            color: activeStep >= index ? 'white' : '#6B6862',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 600,
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        {index + 1}
                                    </Box>
                                    <Typography variant="caption" sx={{ mt: 0.5, fontWeight: activeStep >= index ? 600 : 400, color: activeStep >= index ? '#1C1B19' : '#6B6862' }}>
                                        {step}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                )}

                {/* Content */}
                <Box sx={{
                    p: 3.5,
                    overflow: 'auto',
                    flex: 1
                }}>
                    {renderStep()}
                </Box>
            </Box>
        </Modal>
    )
}

export default ReturnExchangeModal