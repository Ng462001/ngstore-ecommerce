'use client'

import { useState, useEffect } from 'react'
import { Stepper, Step, StepLabel, Box, Typography, Paper, Container, Card, CardContent, Grid, Divider, Chip } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import {
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Store as StoreIcon,
  LocalShipping as ShippingIcon,
  DirectionsBike as BikeIcon,
  Home as HomeIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  AssignmentReturned as ReturnIcon
} from '@mui/icons-material'

// Custom Step Icon Component for Order Tracking
function CustomStepIcon(props) {
  const { active, completed, icon } = props;

  const stepIcons = [
    <AssignmentIcon sx={{ fontSize: 16 }} />,
    <CheckCircleIcon sx={{ fontSize: 16 }} />,
    <StoreIcon sx={{ fontSize: 16 }} />,
    <ShippingIcon sx={{ fontSize: 16 }} />,
    <BikeIcon sx={{ fontSize: 16 }} />,
    <HomeIcon sx={{ fontSize: 16 }} />,
    <ReturnIcon sx={{ fontSize: 16 }} />
  ]

  return (
    <Box
      sx={{
        width: 28,
        height: 28,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: completed ? 'success.main' : active ? 'primary.main' : 'grey.300',
        color: active || completed ? 'white' : 'grey.600',
        fontSize: '0.875rem',
        fontWeight: 'bold',
      }}
    >
      {completed ? <CheckIcon sx={{ fontSize: 16 }} /> : (stepIcons[icon - 1] || <ReturnIcon sx={{ fontSize: 16 }} />)}
    </Box>
  );
}

// Order Tracking Component
const OrderTracking = ({ order, isFullPage = false, returnRequest = null }) => {
  // Add "Returned" step if there's a return request
  const baseSteps = ['Order Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered']
  const steps = returnRequest ? [...baseSteps, 'Returned'] : baseSteps

  // Get the actual current step based on order status
  const getCurrentStep = () => {
    // If there's a return request, show the return step
    if (returnRequest) {
      return 5; // Return step index
    }

    switch (order.status) {
      case 'Delivered': return 4;
      case 'Out for delivery': return 3;
      case 'Shipped': return 2;
      case 'Processing': return 1;
      case 'Cancelled': return -1;
      default: return 0;
    }
  };

  const currentStep = getCurrentStep();
  const [viewingStep, setViewingStep] = useState(currentStep);

  const isStepComplete = (stepIndex) => {
    if (returnRequest && stepIndex <= 5) {
      return stepIndex <= currentStep;
    }
    if (order.status === 'Delivered') {
      return stepIndex <= currentStep;
    }
    return stepIndex < currentStep;
  };

  const handleStepClick = (index) => {
    if (index <= currentStep) {
      setViewingStep(index);
    }
  };

  const getStepContent = (stepIndex) => {
    const stepContents = [
      {
        title: "Order Placed",
        description: "Your order has been successfully placed.",
        date: new Date(order.createdAt).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        icon: <AssignmentIcon />
      },
      {
        title: "Processing",
        description: "Your order is being processed and packed at our facility.",
        date: order.processingAt
          ? new Date(order.processingAt).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
          : "Processing will begin soon",
        icon: <StoreIcon />
      },
      {
        title: "Shipped",
        description: "Your order has been shipped and is on its way to you.",
        date: order.shippedAt
          ? new Date(order.shippedAt).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
          : "Awaiting shipment",
        icon: <ShippingIcon />
      },
      {
        title: "Out for Delivery",
        description: "Your order is out for delivery and will reach you today.",
        date: order.outForDeliveryAt
          ? new Date(order.outForDeliveryAt).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
          : "Will be out for delivery soon",
        icon: <BikeIcon />
      },
      {
        title: "Delivered",
        description: "Your order has been delivered successfully.",
        date: order.deliveredAt
          ? new Date(order.deliveredAt).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
          : "Expected delivery soon",
        icon: <HomeIcon />
      },
      {
        title: "Returned",
        description: returnRequest ? `${returnRequest.type} request has been ${returnRequest.status.toLowerCase()}.` : "Product return initiated.",
        date: returnRequest?.createdAt
          ? new Date(returnRequest.createdAt).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
          : "Return pending",
        icon: <ReturnIcon />
      }
    ];

    return stepContents[stepIndex] ? stepContents[stepIndex] : stepContents[stepContents.length - 1];
  };

  useEffect(() => {
    setViewingStep(currentStep);
  }, [currentStep]);

  if (order.status === 'Cancelled') {
    return (
      <Paper
        elevation={0}
        sx={{
          bgcolor: 'error.light',
          border: 1,
          borderColor: 'error.main',
          borderRadius: 2,
          p: 4,
          textAlign: 'center'
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            bgcolor: 'error.main',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2
          }}
        >
          <svg width="32" height="32" fill="white" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Box>
        <Typography variant="h6" sx={{ color: 'error.dark', fontWeight: 600, mb: 1 }} component="div">
          Order Cancelled
        </Typography>
        <Typography variant="body2" sx={{ color: 'error.dark' }} component="div">
          This order has been cancelled. Please contact customer support for more details.
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ color: 'error.dark', fontStyle: 'italic' }} component="div">
            Order was placed on {new Date(order.createdAt).toLocaleDateString()}
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Container maxWidth={isFullPage ? "lg" : false} sx={{ p: 0 }}>
      <Paper elevation={0} sx={{ bgcolor: 'grey.50', borderRadius: 2, p: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary', mb: 2 }} component="div">
          Order Tracking
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }} component="div">
          Order #{order._id.substring(0, 8).toUpperCase()} • Placed on {new Date(order.createdAt).toLocaleDateString()}
        </Typography>

        {/* Vertical MUI Stepper Layout */}
        <Grid container spacing={4}>
          {/* Left Column - Stepper */}
          <Grid item xs={12} md={4}>
            <Paper elevation={1} sx={{ p: 4, bgcolor: 'white', borderRadius: 2 }}>
              <Stepper
                activeStep={currentStep}
                orientation="vertical"
                sx={{ mb: 2 }}
              >
                {steps.map((label, index) => (
                  <Step key={label} completed={isStepComplete(index)}>
                    <StepLabel
                      StepIconComponent={CustomStepIcon}
                      onClick={() => handleStepClick(index)}
                      sx={{
                        cursor: index <= currentStep ? 'pointer' : 'default',
                        '& .MuiStepLabel-label': {
                          fontSize: '0.875rem',
                          fontWeight: index === currentStep ? 600 : 400,
                          color: index === currentStep ? 'primary.main' :
                            isStepComplete(index) ? 'text.primary' : 'text.secondary'
                        },
                        '& .MuiStepLabel-label.Mui-completed': {
                          color: 'text.primary',
                          fontWeight: 400
                        }
                      }}
                    >
                      {label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Paper>
          </Grid>

          {/* Right Column - Content */}
          <Grid item xs={12} md={8}>
            {/* Current Step Content */}
            <Paper elevation={0} sx={{ bgcolor: 'white', borderRadius: 2, p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: viewingStep === currentStep ? 'primary.light' : 'grey.100',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: viewingStep === currentStep ? 'primary.main' : 'grey.600'
                  }}
                >
                  {getStepContent(viewingStep).icon}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }} component="div">
                      {getStepContent(viewingStep).title}
                    </Typography>
                    {viewingStep === currentStep && (
                      <Box
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          bgcolor: 'primary.main',
                          color: 'white',
                          borderRadius: 1,
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}
                        component="div"
                      >
                        LIVE
                      </Box>
                    )}
                  </Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }} component="div">
                    {getStepContent(viewingStep).description}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', fontSize: '0.875rem' }} component="div">
                    <CalendarIcon sx={{ fontSize: 16, mr: 1 }} />
                    {getStepContent(viewingStep).date}
                  </Box>
                </Box>
              </Box>
            </Paper>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card sx={{ border: 1, borderColor: 'grey.200' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationIcon color="primary" />
                      Shipping Address
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body1" paragraph>
                        <strong>{order.shippingAddress.street || 'N/A'}</strong>
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {order.shippingAddress.city || ''} - {order.shippingAddress.zipCode || ''}<br /> {order.shippingAddress.state || ''}
                        <br />
                        {order.shippingAddress.country || ''}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                        <PhoneIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {order.shippingAddress.mobile || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ bgcolor: 'info.light', height: '100%', p: 3, borderRadius: 2, border: 1, borderColor: 'info.main' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'info.dark', mb: 1 }} component="div">
                    💡 Need Help?
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'info.dark', mb: 2 }} component="div">
                    For any questions about your order, contact our customer support.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }} component="div">
                    <Typography variant="body2" sx={{ color: 'info.dark', fontWeight: 500 }} component="span">
                      📞 1-800-123-4567
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'info.dark', fontWeight: 500 }} component="span">
                      ✉️ support@example.com
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'info.dark', fontWeight: 500 }} component="span">
                      🕒 Mon-Fri: 9AM-6PM
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default OrderTracking;