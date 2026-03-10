'use client'

import { useState, useEffect } from 'react'
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
    RadioGroup,
    FormControlLabel,
    Radio,
    Chip,
    Divider,
    Alert,
    CircularProgress,
    Stack,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Snackbar,
    List,
    ListItem,
    ListItemText,
    Avatar,
    Badge
} from '@mui/material'
import {
    Close as CloseIcon,
    Chat as ChatIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    Help as HelpIcon,
    Description as DescriptionIcon,
    LocalShipping as ShippingIcon,
    Payment as PaymentIcon,
    AssignmentReturn as ReturnIcon,
    AccountCircle as AccountIcon,
    ExpandMore as ExpandMoreIcon,
    CheckCircle as CheckCircleIcon,
    Pending as PendingIcon,
    Assignment as AssignmentIcon,
    Notifications as NotificationsIcon
} from '@mui/icons-material'
import axios from 'axios'

const SupportModal = ({ open, onClose, order, user, token }) => {
    const [activeStep, setActiveStep] = useState(0) // 0: Options, 1: Form, 2: Success
    const [selectedOption, setSelectedOption] = useState('')
    const [queryType, setQueryType] = useState('')
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        category: '',
        priority: 'Medium',
        attachments: []
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [ticketId, setTicketId] = useState('')
    const [userTickets, setUserTickets] = useState([])
    const [showMyTickets, setShowMyTickets] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)

    // Map frontend categories to backend categories
    const categoryMap = {
        'order': 'Order Issue',
        'shipping': 'Order Issue',
        'payment': 'Payment',
        'return': 'Order Issue',
        'account': 'Other'
    }

    const supportOptions = [
        {
            id: 'order',
            title: 'Order Related',
            icon: <DescriptionIcon />,
            category: 'Order Issue',
            subOptions: [
                { value: 'order_status', label: 'Order Status & Tracking' },
                { value: 'order_cancel', label: 'Cancel Order' },
                { value: 'order_modify', label: 'Modify Order' },
                { value: 'order_delay', label: 'Order Delay' }
            ]
        },
        {
            id: 'shipping',
            title: 'Shipping & Delivery',
            icon: <ShippingIcon />,
            category: 'Order Issue',
            subOptions: [
                { value: 'delivery_time', label: 'Delivery Time' },
                { value: 'shipping_address', label: 'Shipping Address Change' },
                { value: 'damaged_product', label: 'Damaged Product Received' },
                { value: 'missing_items', label: 'Missing Items' }
            ]
        },
        {
            id: 'payment',
            title: 'Payment Issues',
            icon: <PaymentIcon />,
            category: 'Payment',
            subOptions: [
                { value: 'refund_status', label: 'Refund Status' },
                { value: 'payment_failed', label: 'Payment Failed' },
                { value: 'double_charge', label: 'Double Charge' },
                { value: 'payment_method', label: 'Payment Method Help' }
            ]
        },
        {
            id: 'return',
            title: 'Return & Refund',
            icon: <ReturnIcon />,
            category: 'Order Issue',
            subOptions: [
                { value: 'return_request', label: 'Return Request' },
                { value: 'refund_time', label: 'Refund Timeframe' },
                { value: 'return_pickup', label: 'Return Pickup' },
                { value: 'exchange_product', label: 'Exchange Product' }
            ]
        },
        {
            id: 'account',
            title: 'Account & Security',
            icon: <AccountIcon />,
            category: 'Other',
            subOptions: [
                { value: 'account_access', label: 'Account Access' },
                { value: 'profile_update', label: 'Profile Update' },
                { value: 'security_concern', label: 'Security Concern' },
                { value: 'delete_account', label: 'Delete Account' }
            ]
        }
    ]

    const commonQueries = [
        { label: 'Where is my order?', query: 'order_status', category: 'Order Issue' },
        { label: 'How to cancel order?', query: 'order_cancel', category: 'Order Issue' },
        { label: 'Refund not received', query: 'refund_status', category: 'Payment' },
        { label: 'Product damaged', query: 'damaged_product', category: 'Order Issue' },
        { label: 'Change delivery address', query: 'shipping_address', category: 'Order Issue' },
        { label: 'Return pickup schedule', query: 'return_pickup', category: 'Order Issue' }
    ]

    const faqs = [
        {
            question: 'How long does it take to get a refund?',
            answer: 'Refunds are typically processed within 5-7 business days after we receive the returned product. The exact time depends on your payment method and bank.'
        },
        {
            question: 'Can I change my shipping address after placing an order?',
            answer: 'Yes, you can change the shipping address before the order is shipped. Go to your order details and click "Change Address" if available.'
        },
        {
            question: 'What should I do if I receive a damaged product?',
            answer: 'Take photos of the damaged product and packaging. Then contact support immediately. We will arrange for a replacement or refund.'
        },
        {
            question: 'How do I track my order?',
            answer: 'You can track your order from the Order Details page. We send regular updates via email and SMS.'
        }
    ]

    // Fetch user tickets when modal opens
    useEffect(() => {
        if (open && user && token) {
            fetchUserTickets()
        }
    }, [open, user, token])

    const fetchUserTickets = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/support/my-tickets`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (response.data.success) {
                setUserTickets(response.data.tickets)

                // Calculate unread messages
                let count = 0
                response.data.tickets.forEach(ticket => {
                    ticket.responses?.forEach(response => {
                        if (response.senderRole === 'Admin' && !response.read) {
                            count++
                        }
                    })
                })
                setUnreadCount(count)
            }
        } catch (error) {
            console.error('Error fetching tickets:', error)
        }
    }

    const handleOptionSelect = (optionId, subOption = null) => {
        const selectedSupportOption = supportOptions.find(opt => opt.id === optionId)

        setSelectedOption(optionId)
        if (subOption) {
            setQueryType(subOption.value)
            setFormData(prev => ({
                ...prev,
                subject: `${selectedSupportOption?.title} - ${subOption.label}`,
                message: `Order #${order?._id?.substring(0, 8).toUpperCase() || 'N/A'}\n\nIssue: ${subOption.label}\n\n`,
                category: selectedSupportOption?.category || 'Other'
            }))
        } else {
            setFormData(prev => ({
                ...prev,
                category: selectedSupportOption?.category || 'Other'
            }))
        }
        setActiveStep(1)
    }

    const handleQuickQuery = (query) => {
        const quickQuery = commonQueries.find(q => q.query === query)
        setQueryType(query)
        setFormData(prev => ({
            ...prev,
            subject: quickQuery?.label || 'Quick Query',
            message: `Order #${order?._id?.substring(0, 8).toUpperCase() || 'N/A'}\n\nQuery: ${quickQuery?.label || ''}\n\n`,
            category: quickQuery?.category || 'Other'
        }))
        setActiveStep(1)
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files)

        // Validate file size (5MB limit)
        const validFiles = files.filter(file => file.size <= 5 * 1024 * 1024)

        if (validFiles.length !== files.length) {
            setError('Some files exceed 5MB limit and were not added')
        }

        setFormData(prev => ({
            ...prev,
            attachments: [...prev.attachments, ...validFiles.slice(0, 3 - prev.attachments.length)] // Limit to 3 files
        }))
    }

    const removeAttachment = (index) => {
        setFormData(prev => ({
            ...prev,
            attachments: prev.attachments.filter((_, i) => i !== index)
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        // Validate form
        if (!formData.subject.trim() || !formData.message.trim()) {
            setError('Subject and message are required')
            setLoading(false)
            return
        }

        try {
            const formDataToSend = new FormData()

            // Add all form data
            Object.keys(formData).forEach(key => {
                if (key === 'attachments') {
                    formData.attachments.forEach(file => {
                        formDataToSend.append('files', file)
                    })
                } else if (key !== 'attachments' && formData[key]) {
                    formDataToSend.append(key, formData[key])
                }
            })

            // Add order reference if available
            if (order?._id) {
                formDataToSend.append('order', order._id)
            }

            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/support/create-ticket`,
                formDataToSend,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            )

            if (response.data.success) {
                setTicketId(response.data.ticket._id)
                setSuccess('Support ticket created successfully!')
                setActiveStep(2)
                fetchUserTickets() // Refresh tickets list
            } else {
                throw new Error(response.data.message || 'Failed to create ticket')
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to submit support request')
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setActiveStep(0)
        setSelectedOption('')
        setQueryType('')
        setFormData({
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
            subject: '',
            message: '',
            category: '',
            priority: 'Medium',
            attachments: []
        })
        setError('')
        setSuccess('')
        setTicketId('')
        setShowMyTickets(false)
        onClose()
    }

    const handleViewTicket = (ticketId) => {
        window.open(`/support/ticket/${ticketId}`, '_blank')
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'Open': return 'warning'
            case 'In Progress': return 'info'
            case 'Resolved': return 'success'
            case 'Closed': return 'default'
            default: return 'default'
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Open': return <PendingIcon color="warning" />
            case 'In Progress': return <PendingIcon color="info" />
            case 'Resolved': return <CheckCircleIcon color="success" />
            case 'Closed': return <CheckCircleIcon color="disabled" />
            default: return <PendingIcon />
        }
    }

    const renderMyTickets = () => (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AssignmentIcon />
                    My Support Tickets
                </Typography>
                <Button
                    variant="outlined"
                    onClick={() => setShowMyTickets(false)}
                    startIcon={<HelpIcon />}
                >
                    New Ticket
                </Button>
            </Box>

            {userTickets.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                        No support tickets yet
                    </Typography>
                    <Button
                        variant="contained"
                        sx={{ mt: 2 }}
                        onClick={() => setShowMyTickets(false)}
                    >
                        Create Your First Ticket
                    </Button>
                </Paper>
            ) : (
                <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                    {userTickets.map((ticket) => (
                        <ListItem
                            key={ticket._id}
                            sx={{
                                mb: 1,
                                bgcolor: 'background.paper',
                                borderRadius: 1,
                                border: 1,
                                borderColor: 'grey.200',
                                cursor: 'pointer',
                                '&:hover': {
                                    bgcolor: 'grey.50'
                                }
                            }}
                            onClick={() => handleViewTicket(ticket._id)}
                        >
                            <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                                <AssignmentIcon />
                            </Avatar>
                            <ListItemText
                                primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="subtitle2" noWrap>
                                            {ticket.subject}
                                        </Typography>
                                        <Chip
                                            size="small"
                                            label={ticket.status}
                                            color={getStatusColor(ticket.status)}
                                            icon={getStatusIcon(ticket.status)}
                                        />
                                    </Box>
                                }
                                secondary={
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Ticket ID: #{ticket._id.toUpperCase()}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                                            {new Date(ticket.createdAt).toLocaleDateString()}
                                        </Typography>
                                        {ticket.responses?.some(r => r.senderRole === 'Admin' && !r.read) && (
                                            <Chip
                                                size="small"
                                                label="New Reply"
                                                color="error"
                                                sx={{ ml: 1 }}
                                            />
                                        )}
                                    </Box>
                                }
                            />
                            <Button size="small">View</Button>
                        </ListItem>
                    ))}
                </List>
            )}
        </Box>
    )

    const renderStep = () => {
        if (showMyTickets) {
            return renderMyTickets()
        }

        switch (activeStep) {
            case 0: // Options selection
                return (
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <HelpIcon color="primary" />
                                How can we help you?
                            </Typography>
                            <Button
                                variant="outlined"
                                startIcon={<AssignmentIcon />}
                                onClick={() => setShowMyTickets(true)}
                                sx={{ position: 'relative' }}
                            >
                                My Tickets
                                {unreadCount > 0 && (
                                    <Badge
                                        badgeContent={unreadCount}
                                        color="error"
                                        sx={{
                                            '& .MuiBadge-badge': {
                                                top: -5,
                                                right: -5,
                                            }
                                        }}
                                    />
                                )}
                            </Button>
                        </Box>

                        {/* Quick Help Section */}
                        <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
                            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                Quick Help
                            </Typography>
                            <Grid container spacing={1}>
                                {commonQueries.map((query, index) => (
                                    <Grid item xs={12} sm={6} key={index}>
                                        <Button
                                            variant="outlined"
                                            fullWidth
                                            onClick={() => handleQuickQuery(query.query)}
                                            sx={{ justifyContent: 'flex-start' }}
                                        >
                                            {query.label}
                                        </Button>
                                    </Grid>
                                ))}
                            </Grid>
                        </Paper>

                        {/* Main Support Options */}
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                            Select a category
                        </Typography>
                        <Grid container spacing={2}>
                            {supportOptions.map((option) => (
                                <Grid item xs={12} sm={6} key={option.id}>
                                    <Paper
                                        elevation={selectedOption === option.id ? 2 : 0}
                                        sx={{
                                            p: 2,
                                            cursor: 'pointer',
                                            border: 1,
                                            borderColor: selectedOption === option.id ? 'primary.main' : 'grey.200',
                                            bgcolor: selectedOption === option.id ? 'primary.50' : 'white',
                                            '&:hover': {
                                                borderColor: 'primary.main',
                                                bgcolor: 'primary.50'
                                            }
                                        }}
                                        onClick={() => handleOptionSelect(option.id)}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            {option.icon}
                                            <Typography variant="subtitle1" fontWeight={500}>
                                                {option.title}
                                            </Typography>
                                        </Box>
                                        <Stack spacing={0.5}>
                                            {option.subOptions.map((sub, idx) => (
                                                <Typography
                                                    key={idx}
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{
                                                        pl: 2,
                                                        cursor: 'pointer',
                                                        '&:hover': { color: 'primary.main' }
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleOptionSelect(option.id, sub)
                                                    }}
                                                >
                                                    • {sub.label}
                                                </Typography>
                                            ))}
                                        </Stack>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>

                        {/* FAQ Section */}
                        <Box sx={{ mt: 4 }}>
                            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                Frequently Asked Questions
                            </Typography>
                            {faqs.map((faq, index) => (
                                <Accordion key={index} elevation={0}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography variant="subtitle2">{faq.question}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Typography variant="body2" color="text.secondary">
                                            {faq.answer}
                                        </Typography>
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </Box>

                        {/* Contact Methods */}
                        <Box sx={{ mt: 3, p: 2, bgcolor: 'info.50', borderRadius: 1 }}>
                            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                Other ways to reach us
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        startIcon={<ChatIcon />}
                                        onClick={() => window.open('https://wa.me/919876543210', '_blank')}
                                        color="success"
                                    >
                                        WhatsApp Chat
                                    </Button>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        startIcon={<PhoneIcon />}
                                        href="tel:18002089898"
                                        color="primary"
                                    >
                                        Call Support
                                    </Button>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        startIcon={<EmailIcon />}
                                        href="mailto:support@example.com"
                                        color="secondary"
                                    >
                                        Email Us
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>
                )

            case 1: // Form submission
                return (
                    <Box component="form" onSubmit={handleSubmit}>
                        <Typography variant="h6" gutterBottom>
                            Tell us more about your issue
                        </Typography>

                        {order && (
                            <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Order Information
                                </Typography>
                                <Grid container spacing={1}>
                                    <Grid item xs={6}>
                                        <Typography variant="body2">
                                            <strong>Order ID:</strong> #{order._id?.substring(0, 8).toUpperCase()}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2">
                                            <strong>Status:</strong> {order.status}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2">
                                            <strong>Placed on:</strong> {new Date(order.createdAt).toLocaleDateString()}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2">
                                            <strong>Amount:</strong> ₹{order.totalPrice}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Paper>
                        )}

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Name"
                                    name="name"
                                    value={formData.name || user?.name || ''}
                                    onChange={handleInputChange}
                                    required
                                    error={!formData.name}
                                    helperText={!formData.name ? 'Name is required' : ''}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Phone Number"
                                    name="phone"
                                    value={formData.phone || user?.phone || ''}
                                    onChange={handleInputChange}
                                    required
                                    error={!formData.phone}
                                    helperText={!formData.phone ? 'Phone number is required' : ''}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={formData.email || user?.email || ''}
                                    onChange={handleInputChange}
                                    required
                                    error={!formData.email}
                                    helperText={!formData.email ? 'Email is required' : ''}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleInputChange}
                                    required
                                    error={!formData.subject}
                                    helperText={!formData.subject ? 'Subject is required' : ''}
                                />
                            </Grid>

                            {/* Category Selection */}
                            <Grid item xs={12}>
                                <FormControl fullWidth required>
                                    <InputLabel>Category</InputLabel>
                                    <Select
                                        name="category"
                                        value={formData.category}
                                        label="Category"
                                        onChange={handleInputChange}
                                        error={!formData.category}
                                    >
                                        <MenuItem value="Order Issue">Order Issue</MenuItem>
                                        <MenuItem value="Payment">Payment</MenuItem>
                                        <MenuItem value="Product Inquiry">Product Inquiry</MenuItem>
                                        <MenuItem value="Technical">Technical</MenuItem>
                                        <MenuItem value="Other">Other</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Describe your issue"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    multiline
                                    rows={4}
                                    required
                                    error={!formData.message}
                                    helperText={!formData.message ? 'Message is required' : ''}
                                    placeholder="Please include: \n• Order details \n• Specific issue \n• What you expect \n• Any relevant information"
                                />
                            </Grid>

                            {/* Priority Selection */}
                            <Grid item xs={12}>
                                <FormControl component="fieldset">
                                    <Typography variant="subtitle2" gutterBottom>
                                        Priority
                                    </Typography>
                                    <RadioGroup
                                        row
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleInputChange}
                                    >
                                        <FormControlLabel
                                            value="Low"
                                            control={<Radio size="small" />}
                                            label="Low"
                                        />
                                        <FormControlLabel
                                            value="Medium"
                                            control={<Radio size="small" />}
                                            label="Medium"
                                            defaultChecked
                                        />
                                        <FormControlLabel
                                            value="High"
                                            control={<Radio size="small" />}
                                            label="High"
                                        />
                                        <FormControlLabel
                                            value="Urgent"
                                            control={<Radio size="small" />}
                                            label="Urgent"
                                        />
                                    </RadioGroup>
                                </FormControl>
                            </Grid>

                            {/* Attachments */}
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Attachments (Optional)
                                </Typography>
                                <input
                                    accept="image/*,.pdf,.doc,.docx,.txt"
                                    style={{ display: 'none' }}
                                    id="file-upload"
                                    type="file"
                                    multiple
                                    onChange={handleFileUpload}
                                />
                                <label htmlFor="file-upload">
                                    <Button
                                        variant="outlined"
                                        component="span"
                                        startIcon={<DescriptionIcon />}
                                        disabled={formData.attachments.length >= 3}
                                    >
                                        Add Files ({formData.attachments.length}/3)
                                    </Button>
                                </label>
                                <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                                    Max 3 files, 5MB each. Images, PDF, DOC, TXT
                                </Typography>

                                {formData.attachments.length > 0 && (
                                    <Box sx={{ mt: 2 }}>
                                        {formData.attachments.map((file, index) => (
                                            <Chip
                                                key={index}
                                                label={`${file.name} (${(file.size / 1024).toFixed(1)}KB)`}
                                                onDelete={() => removeAttachment(index)}
                                                sx={{ mr: 1, mb: 1 }}
                                            />
                                        ))}
                                    </Box>
                                )}
                            </Grid>
                        </Grid>

                        {error && (
                            <Alert severity="error" sx={{ mt: 2 }}>
                                {error}
                            </Alert>
                        )}

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                            <Button
                                onClick={() => setActiveStep(0)}
                                disabled={loading}
                            >
                                Back
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={loading || !formData.subject || !formData.message || !formData.category}
                                startIcon={loading ? <CircularProgress size={20} /> : null}
                            >
                                {loading ? 'Submitting...' : 'Submit Request'}
                            </Button>
                        </Box>
                    </Box>
                )

            case 2: // Success
                return (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Box sx={{ color: 'success.main', fontSize: 60, mb: 2 }}>
                            <CheckCircleIcon fontSize="inherit" />
                        </Box>
                        <Typography variant="h6" gutterBottom>
                            Support Request Submitted!
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            Your ticket has been created successfully.
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            Ticket ID: <strong>#{ticketId?.slice(-8).toUpperCase() || 'SUP' + Date.now().toString().slice(-8)}</strong>
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            We will contact you within 24 hours via email or phone.
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
                            <Button
                                variant="outlined"
                                onClick={() => handleClose()}
                            >
                                Close
                            </Button>
                            <Button
                                variant="contained"
                                onClick={() => {
                                    setShowMyTickets(true)
                                    setActiveStep(0)
                                }}
                                startIcon={<AssignmentIcon />}
                            >
                                View My Tickets
                            </Button>
                        </Box>
                    </Box>
                )
        }
    }

    return (
        <>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="support-modal"
                aria-describedby="customer-support-modal"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: { xs: '95%', sm: '90%', md: '800px' },
                    maxHeight: '90vh',
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: 24,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {/* Header */}
                    <Box sx={{
                        p: 2,
                        borderBottom: 1,
                        borderColor: 'divider',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        bgcolor: 'primary.main',
                        color: 'white'
                    }}>
                        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ChatIcon />
                            Customer Support
                        </Typography>
                        <IconButton onClick={handleClose} sx={{ color: 'white' }}>
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    {/* Content */}
                    <Box sx={{
                        p: 3,
                        overflow: 'auto',
                        flex: 1
                    }}>
                        {renderStep()}
                    </Box>

                    {/* Footer */}
                    {activeStep !== 2 && !showMyTickets && (
                        <Box sx={{
                            p: 2,
                            borderTop: 1,
                            borderColor: 'divider',
                            bgcolor: 'grey.50'
                        }}>
                            <Typography variant="caption" color="text.secondary">
                                <strong>Support Hours:</strong> Mon-Sun, 7 AM - 12 AM | <strong>Email:</strong> support@example.com | <strong>Phone:</strong> 1800-208-9898
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Modal>

            {/* Success Snackbar */}
            <Snackbar
                open={!!success}
                autoHideDuration={6000}
                onClose={() => setSuccess('')}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity="success" onClose={() => setSuccess('')}>
                    {success}
                </Alert>
            </Snackbar>
        </>
    )
}

export default SupportModal