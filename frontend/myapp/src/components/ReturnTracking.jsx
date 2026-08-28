import React, { useState, useEffect } from "react";
import {
  Stepper,
  Step,
  StepLabel,
  Box,
  Typography,
  Paper,
  Container,
  Card,
  CardContent,
  Grid,
  Chip,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import {
  AssignmentReturned as ReturnIcon,
  CheckCircle as CheckCircleIcon,
  LocalShipping as ShippingIcon,
  Inventory as InventoryIcon,
  Payment as PaymentIcon,
  HourglassEmpty as PendingIcon,
  Cancel as CancelIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
} from "@mui/icons-material";
import { format } from "date-fns";

// Custom Step Icon Component for Return Tracking
function CustomStepIcon(props) {
  const { active, completed, icon } = props;

  const stepIcons = [
    <PendingIcon sx={{ fontSize: 16 }} />,
    <CheckCircleIcon sx={{ fontSize: 16 }} />,
    <ShippingIcon sx={{ fontSize: 16 }} />,
    <InventoryIcon sx={{ fontSize: 16 }} />,
    <PaymentIcon sx={{ fontSize: 16 }} />,
  ];

  return (
    <Box
      sx={{
        width: 28,
        height: 28,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: completed
          ? "success.main"
          : active
            ? "primary.main"
            : "grey.300",
        color: active || completed ? "white" : "grey.600",
        fontSize: "0.875rem",
        fontWeight: "bold",
      }}
    >
      {completed ? (
        <CheckIcon sx={{ fontSize: 16 }} />
      ) : (
        stepIcons[icon - 1] || <ReturnIcon sx={{ fontSize: 16 }} />
      )}
    </Box>
  );
}

// Return Tracking Component
const ReturnTracking = ({ request, isFullPage = false }) => {
  // Define steps based on request type
  const getSteps = () => {
    return ["Pending", "Approved", "Pickup Scheduled", "Received", "Completed"];
  };

  const steps = getSteps();

  // Get the actual current step based on request status
  const getCurrentStep = () => {
    switch (request.status) {
      case "Refunded":
      case "Completed":
        return 4; // Completed step
      case "Received":
        return 3;
      case "Picked Up":
        return 2;
      case "Pickup Scheduled":
        return 2;
      case "Approved":
        return 1;
      case "Rejected":
        return -1;
      case "Cancelled":
        return -1;
      default:
        return 0; // Pending
    }
  };

  const currentStep = getCurrentStep();
  const [viewingStep, setViewingStep] = useState(currentStep);

  const isStepComplete = (stepIndex) => {
    if (currentStep === 4) return stepIndex <= 4;
    return stepIndex < currentStep;
  };

  const handleStepClick = (index) => {
    if (index <= currentStep) {
      setViewingStep(index);
    }
  };

  const getStatusDate = (status) => {
    if (!request.statusUpdates) return null;
    const targetStatus =
      status === "Completed"
        ? ["Completed", "Refunded", "Refund Processed", "Exchange Shipped"]
        : [status];
    const update = request.statusUpdates.find(
      (u) => targetStatus.includes(u.status) || u.status === status,
    );
    if (update && update.timestamp) {
      return format(
        new Date(update.timestamp),
        "EEEE, MMMM d, yyyy 'at' h:mm a",
      );
    }
    if (status === "Completed" && request.refundDetails?.processedAt) {
      return format(
        new Date(request.refundDetails.processedAt),
        "EEEE, MMMM d, yyyy 'at' h:mm a",
      );
    }
    return null;
  };

  const getStepContent = (stepIndex) => {
    const stepStatus = steps[stepIndex];
    const stepDate =
      getStatusDate(stepStatus) ||
      (stepIndex === 0
        ? format(new Date(request.createdAt), "EEEE, MMMM d, yyyy 'at' h:mm a")
        : "Awaiting update");

    const stepContents = {
      Pending: {
        title: "Request Submitted",
        description: `Your ${request.type.toLowerCase()} request has been submitted and is awaiting admin review.`,
        date: stepDate,
        icon: <PendingIcon />,
      },
      Approved: {
        title: "Request Approved",
        description: `Your ${request.type.toLowerCase()} request has been approved by our team.`,
        date: stepDate,
        icon: <CheckCircleIcon />,
      },
      "Pickup Scheduled": {
        title: "Pickup Scheduled",
        description: "A pickup has been scheduled for your return item(s).",
        date: stepDate,
        icon: <ShippingIcon />,
      },
      Received: {
        title: "Item Received",
        description: "We have received and inspected your returned item(s).",
        date: stepDate,
        icon: <InventoryIcon />,
      },
      Completed: {
        title:
          request.type === "Exchange"
            ? "Exchange Completed"
            : "Return & Refund Completed",
        description:
          request.type === "Exchange"
            ? "Your exchange request has been completed and replacement item shipped."
            : "Your return has been completed and refund has been processed to your payment method.",
        date: stepDate,
        icon: <CheckCircleIcon />,
      },
    };

    return stepContents[stepStatus] || stepContents["Pending"];
  };

  useEffect(() => {
    setViewingStep(currentStep);
  }, [currentStep]);

  // Handle rejected/cancelled status
  if (request.status === "Rejected" || request.status === "Cancelled") {
    return (
      <Paper
        elevation={0}
        sx={{
          bgcolor: "error.light",
          border: 1,
          borderColor: "error.main",
          borderRadius: 2,
          p: 4,
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            bgcolor: "error.main",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 2,
          }}
        >
          <CancelIcon sx={{ fontSize: 32, color: "white" }} />
        </Box>
        <Typography
          variant="h6"
          sx={{ color: "error.dark", fontWeight: 600, mb: 1 }}
        >
          Request {request.status}
        </Typography>
        <Typography variant="body2" sx={{ color: "error.dark" }}>
          {request.status === "Rejected"
            ? "Your request has been rejected. Please check admin notes for details."
            : "This request has been cancelled."}
        </Typography>
        {request.adminDetails?.note && (
          <Box sx={{ mt: 2, p: 2, bgcolor: "white", borderRadius: 1 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Admin Note:
            </Typography>
            <Typography variant="body2">{request.adminDetails.note}</Typography>
          </Box>
        )}
      </Paper>
    );
  }

  return (
    <Container maxWidth={isFullPage ? "lg" : false} sx={{ p: 0 }}>
      <Paper
        elevation={0}
        sx={{ bgcolor: "grey.50", borderRadius: 2, p: { xs: 2, sm: 4 } }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: { xs: 1, sm: 0 },
            mb: 2,
          }}
        >
          <Typography
            variant="h5"
            sx={{ fontWeight: 600, color: "text.primary" }}
          >
            {request.type} Request Tracking
          </Typography>
          <Chip
            label={request.status}
            color={
              request.status === "Completed" || request.status === "Refunded"
                ? "success"
                : request.status === "Approved"
                  ? "info"
                  : request.status === "Rejected"
                    ? "error"
                    : "warning"
            }
            sx={{ fontWeight: 600 }}
          />
        </Box>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 4 }}>
          Request #{request._id?.slice(0, 8).toUpperCase()} • Submitted on{" "}
          {format(new Date(request.createdAt), "MMMM d, yyyy")}
        </Typography>

        {/* Vertical MUI Stepper Layout */}
        <Grid container spacing={{ xs: 2, md: 4 }}>
          {/* Left Column - Stepper */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={1}
              sx={{ p: { xs: 2, sm: 4 }, bgcolor: "white", borderRadius: 2 }}
            >
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
                        cursor: index <= currentStep ? "pointer" : "default",
                        "& .MuiStepLabel-label": {
                          fontSize: "0.875rem",
                          fontWeight: index === currentStep ? 600 : 400,
                          color:
                            index === currentStep
                              ? "primary.main"
                              : isStepComplete(index)
                                ? "text.primary"
                                : "text.secondary",
                        },
                        "& .MuiStepLabel-label.Mui-completed": {
                          color: "text.primary",
                          fontWeight: 400,
                        },
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
            <Paper
              elevation={0}
              sx={{ bgcolor: "white", borderRadius: 2, p: 3, mb: 3 }}
            >
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor:
                      viewingStep === currentStep
                        ? "primary.light"
                        : "grey.100",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    color:
                      viewingStep === currentStep ? "primary.main" : "grey.600",
                  }}
                >
                  {getStepContent(viewingStep).icon}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                      flexWrap: "wrap",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 600, color: "text.primary" }}
                    >
                      {getStepContent(viewingStep).title}
                    </Typography>
                    {viewingStep === currentStep && (
                      <Box
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          bgcolor: "primary.main",
                          color: "white",
                          borderRadius: 1,
                          fontSize: "0.75rem",
                          fontWeight: 600,
                        }}
                      >
                        CURRENT
                      </Box>
                    )}
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", mb: 2 }}
                  >
                    {getStepContent(viewingStep).description}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      color: "text.secondary",
                      fontSize: "0.875rem",
                    }}
                  >
                    <CalendarIcon sx={{ fontSize: 16, mr: 1 }} />
                    {getStepContent(viewingStep).date}
                  </Box>
                </Box>
              </Box>
            </Paper>

            {/* Additional Info Cards */}
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card sx={{ border: 1, borderColor: "grey.200" }}>
                  <CardContent>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <LocationIcon color="primary" />
                      Pickup Address
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body1" paragraph>
                        <strong>
                          {request.pickupAddress?.street || "N/A"}
                        </strong>
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        paragraph
                      >
                        {request.pickupAddress?.city || ""} -{" "}
                        {request.pickupAddress?.zipCode || ""}
                        <br />
                        {request.pickupAddress?.state || ""}
                        <br />
                        {request.pickupAddress?.country || ""}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mt: 2,
                        }}
                      >
                        <PhoneIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {request.pickupAddress?.mobile || "N/A"}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper
                  sx={{
                    bgcolor: "info.light",
                    height: "100%",
                    p: 3,
                    borderRadius: 2,
                    border: 1,
                    borderColor: "info.main",
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, color: "info.dark", mb: 1 }}
                  >
                    💡 Need Help?
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "info.dark", mb: 2 }}
                  >
                    For any questions about your {request.type.toLowerCase()}{" "}
                    request, contact our customer support.
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Typography
                      variant="body2"
                      sx={{ color: "info.dark", fontWeight: 500 }}
                    >
                      📞 1-800-123-4567
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "info.dark", fontWeight: 500 }}
                    >
                      ✉️ support@example.com
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "info.dark", fontWeight: 500 }}
                    >
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

export default ReturnTracking;
