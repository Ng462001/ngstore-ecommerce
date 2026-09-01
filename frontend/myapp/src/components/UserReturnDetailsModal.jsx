import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Divider,
  Grid,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Card,
  CardContent,
  Alert,
  IconButton,
} from "@mui/material";
import {
  Close,
  AssignmentReturn,
  CheckCircle,
  Check as CheckIcon,
  Cancel,
  Schedule,
  LocalShipping,
  ArrowBack,
  ArrowForward,
  ShoppingBag,
  LocationOn,
  TrackChanges,
  Phone,
} from "@mui/icons-material";
import { format } from "date-fns";
import ReturnTracking from "./ReturnTracking";

// Status configuration
const getStatusConfig = (status) => {
  const statusMap = {
    Pending: {
      color: "warning",
      bgColor: "#fff3e0",
      textColor: "#f57c00",
      icon: <AssignmentReturn />,
    },
    Approved: {
      color: "info",
      bgColor: "#e3f2fd",
      textColor: "#1565c0",
      icon: <CheckCircle />,
    },
    Rejected: {
      color: "error",
      bgColor: "#ffebee",
      textColor: "#c62828",
      icon: <Cancel />,
    },
    "Pickup Scheduled": {
      color: "primary",
      bgColor: "#e8eaf6",
      textColor: "#3949ab",
      icon: <Schedule />,
    },
    Received: {
      color: "secondary",
      bgColor: "#f3e5f5",
      textColor: "#7b1fa2",
      icon: <LocalShipping />,
    },
    Completed: {
      color: "success",
      bgColor: "#e8f5e9",
      textColor: "#2e7d32",
      icon: <CheckCircle />,
    },
  };
  return statusMap[status] || statusMap["Pending"];
};

const getTypeConfig = (type) => {
  const typeMap = {
    Return: {
      color: "secondary",
      bgColor: "#f3e5f5",
      textColor: "#7b1fa2",
      icon: <ArrowBack />,
    },
    Exchange: {
      color: "primary",
      bgColor: "#e3f2fd",
      textColor: "#1565c0",
      icon: <ArrowForward />,
    },
  };
  return typeMap[type] || typeMap["Return"];
};

const getItemResolution = (item, request) => {
  if (item?.resolution) return item.resolution;
  if (!request) return "Pending Review";
  if (request.status === "Completed" || request.status === "Refunded") {
    return request.type === "Exchange" ? "Exchanged" : "Refunded";
  }
  if (request.status === "Rejected") {
    return "Rejected";
  }
  if (
    [
      "Approved",
      "Pickup Scheduled",
      "Picked Up",
      "Received",
      "Processing",
    ].includes(request.status)
  ) {
    return request.type === "Exchange"
      ? "Approved for Exchange"
      : "Approved for Refund";
  }
  return "Pending Review";
};

const getItemResolutionColor = (resolution) => {
  switch (resolution) {
    case "Refunded":
    case "Exchanged":
      return "success";
    case "Approved for Refund":
    case "Approved for Exchange":
      return "info";
    case "Rejected":
      return "error";
    default:
      return "warning";
  }
};

// Status Stepper Component
const StatusStepper = ({ status, type, request }) => {
  const statusFlow = [
    "Pending",
    "Approved",
    "Pickup Scheduled",
    "Received",
    "Completed",
  ];

  let currentIndex = statusFlow.indexOf(status);
  if (
    currentIndex === -1 &&
    (status === "Completed" || status === "Refunded")
  ) {
    currentIndex = 4;
  }

  const getStatusDate = (stepStatus) => {
    if (!request) return null;
    try {
      if (stepStatus === "Pending") {
        return format(new Date(request.createdAt), "dd MMM yyyy, h:mm a");
      }
      if (request.statusUpdates) {
        const targetStatuses =
          stepStatus === "Completed" || stepStatus === "Refunded"
            ? ["Completed", "Refunded"]
            : [stepStatus];
        const update = request.statusUpdates.find((u) =>
          targetStatuses.includes(u.status),
        );
        if (update && update.timestamp) {
          return format(new Date(update.timestamp), "dd MMM yyyy, h:mm a");
        }
      }
      if (
        stepStatus === request.status ||
        ((stepStatus === "Completed" || stepStatus === "Refunded") &&
          (request.status === "Completed" || request.status === "Refunded"))
      ) {
        return format(new Date(request.updatedAt), "dd MMM yyyy, h:mm a");
      }
    } catch (e) {
      return null;
    }
    return null;
  };

  return (
    <Box
      sx={{
        position: "relative",
        mt: { xs: 1.5, sm: 2 },
        px: { xs: 0.5, sm: 1 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        {statusFlow.map((stepStatus, index) => {
          const stepConfig = getStatusConfig(stepStatus);
          const isDone =
            index < currentIndex ||
            (index === currentIndex && currentIndex === 4);
          const isCurrent = index === currentIndex;
          const stepDate = getStatusDate(stepStatus);

          return (
            <Box
              key={stepStatus}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                zIndex: 2,
                flex: 1,
              }}
            >
              <Box
                sx={{
                  width: { xs: 26, sm: 32 },
                  height: { xs: 26, sm: 32 },
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor:
                    isDone || isCurrent ? stepConfig.bgColor : "grey.100",
                  color:
                    isDone || isCurrent ? stepConfig.textColor : "grey.400",
                  border: `2px solid ${isDone || isCurrent ? stepConfig.textColor : "grey.300"}`,
                  mb: { xs: 0.5, sm: 1 },
                  "& svg": {
                    fontSize: { xs: 14, sm: 18 },
                  },
                }}
              >
                {stepConfig.icon}
              </Box>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: isCurrent ? "bold" : "normal",
                  color: isCurrent
                    ? stepConfig.textColor
                    : isDone
                      ? "text.primary"
                      : "text.disabled",
                  textAlign: "center",
                  maxWidth: { xs: 58, sm: 60 },
                  fontSize: { xs: "0.625rem", sm: "0.7rem" },
                  lineHeight: 1.15,
                }}
              >
                {stepStatus}
              </Typography>
              {stepDate && (
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: { xs: "0.55rem", sm: "0.65rem" },
                    color: "text.secondary",
                    mt: 0.5,
                    textAlign: "center",
                    maxWidth: { xs: 58, sm: 70 },
                    display: { xs: "none", sm: "block" },
                  }}
                >
                  {stepDate}
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>
      <Divider
        sx={{
          position: "absolute",
          top: { xs: 13, sm: 16 },
          left: { xs: 12, sm: 16 },
          right: { xs: 12, sm: 16 },
          zIndex: 1,
          borderColor: "grey.300",
          borderBottomWidth: 2,
          "&::after": {
            content: '""',
            position: "absolute",
            top: -2,
            left: 0,
            width: `${currentIndex === -1 ? 0 : (currentIndex / (statusFlow.length - 1)) * 100}%`,
            height: 2,
            bgcolor: "primary.main",
            transition: "width 0.3s ease",
          },
        }}
      />
    </Box>
  );
};

const UserReturnDetailsModal = ({ open, onClose, request }) => {
  const [activeTab, setActiveTab] = useState(0);

  if (!request) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "PPpp");
    } catch (e) {
      return "Invalid Date";
    }
  };

  const statusConfig = getStatusConfig(request.status);
  const typeConfig = getTypeConfig(request.type);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: { xs: "16px", sm: "24px" },
          bgcolor: "#FFFFFF",
          border: "1px solid #E7E4DD",
          boxShadow: "0 20px 50px rgba(0,0,0,0.12)",
          overflow: "hidden",
          m: { xs: 1, sm: 2 },
          maxHeight: { xs: "calc(100% - 24px)", sm: "calc(100% - 64px)" },
        },
      }}
    >
      <DialogTitle
        sx={{
          m: 0,
          p: { xs: 2, sm: 2.5 },
          px: { xs: 2, sm: 3 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: "#FAF9F6",
          borderBottom: "1px solid #E7E4DD",
          gap: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 1, sm: 1.5 },
            flexWrap: "wrap",
            flex: 1,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: "#1C1B19",
              fontSize: { xs: "0.95rem", sm: "1.25rem" },
            }}
          >
            Request Details #{request._id?.slice(0, 8).toUpperCase()}
          </Typography>
          <Chip
            label={request.type}
            size="small"
            sx={{
              bgcolor: typeConfig.bgColor,
              color: typeConfig.textColor,
              fontWeight: 600,
              fontSize: { xs: "0.7rem", sm: "0.8125rem" },
              height: { xs: 22, sm: 24 },
            }}
          />
          <Chip
            label={request.status}
            size="small"
            sx={{
              bgcolor: statusConfig.bgColor,
              color: statusConfig.textColor,
              fontWeight: 600,
              fontSize: { xs: "0.7rem", sm: "0.8125rem" },
              height: { xs: 22, sm: 24 },
            }}
          />
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: "#6B6862",
            flexShrink: 0,
            "&:hover": { color: "#1C1B19", bgcolor: "#F3F1EC" },
          }}
        >
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ borderBottom: "1px solid #E7E4DD", bgcolor: "#FAF9F6" }}>
          <Tabs
            value={activeTab}
            onChange={(e, v) => setActiveTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            TabIndicatorProps={{ style: { backgroundColor: "#B8925A" } }}
            sx={{
              minHeight: { xs: 40, sm: 48 },
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                color: "#6B6862",
                minHeight: { xs: 40, sm: 48 },
                fontSize: { xs: "0.8rem", sm: "0.875rem" },
                px: { xs: 1.5, sm: 2 },
                py: { xs: 1, sm: 1.5 },
              },
              "& .Mui-selected": { color: "#B8925A !important" },
            }}
          >
            <Tab label="Overview" />
            <Tab label="Tracking" />
            <Tab label="Items" />
            <Tab label="Attachments" />
          </Tabs>
        </Box>

        <Box sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
          {activeTab === 0 && (
            <Grid container spacing={{ xs: 2, md: 3 }}>
              <Grid item xs={12}>
                {/* Status Stepper */}
                <Paper
                  variant="outlined"
                  sx={{
                    p: { xs: 2, sm: 3 },
                    mb: { xs: 2, md: 3 },
                    bgcolor: "grey.50",
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <TrackChanges fontSize="small" /> Status Timeline
                  </Typography>
                  <StatusStepper
                    status={request.status}
                    type={request.type}
                    request={request}
                  />
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper
                  variant="outlined"
                  sx={{ p: { xs: 2, sm: 2 }, borderRadius: 2, height: "100%" }}
                >
                  <Typography
                    variant="subtitle2"
                    gutterBottom
                    color="text.secondary"
                  >
                    Request Information
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      mt: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="body2">Type</Typography>
                      <Chip
                        label={request.type}
                        size="small"
                        icon={typeConfig.icon}
                        sx={{
                          bgcolor: typeConfig.bgColor,
                          color: typeConfig.textColor,
                        }}
                      />
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="body2">Current Status</Typography>
                      <Chip
                        label={request.status}
                        size="small"
                        sx={{
                          bgcolor: statusConfig.bgColor,
                          color: statusConfig.textColor,
                        }}
                      />
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Typography variant="body2">Created On</Typography>
                      <Typography
                        variant="body2"
                        fontWeight="medium"
                        sx={{ textAlign: "right" }}
                      >
                        {formatDate(request.createdAt)}
                      </Typography>
                    </Box>
                    {request.order && (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography variant="body2">Order ID</Typography>
                        <Typography variant="body2" fontFamily="monospace">
                          #{request.order._id?.slice(0, 8).toUpperCase()}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {request.refundDetails &&
                    request.refundDetails.amount > 0 && (
                      <Box
                        sx={{
                          mt: 3,
                          p: 2,
                          bgcolor: "#e8f5e9",
                          borderRadius: 2,
                          border: "1px solid #a5d6a7",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          color="success.dark"
                          gutterBottom
                          fontWeight="bold"
                        >
                          Refund Summary
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mt: 1,
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            Amount Refunded:
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            color="success.dark"
                          >
                            ₹
                            {Number(
                              request.refundDetails.amount || 0,
                            ).toLocaleString("en-IN", {
                              maximumFractionDigits: 2,
                            })}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mt: 0.5,
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            Method:
                          </Typography>
                          <Typography variant="body2">
                            {request.refundDetails.method || "Original Payment"}
                          </Typography>
                        </Box>
                        {request.refundDetails.status && (
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              mt: 0.5,
                              alignItems: "center",
                            }}
                          >
                            <Typography variant="body2" color="text.secondary">
                              Status:
                            </Typography>
                            <Chip
                              label={request.refundDetails.status}
                              size="small"
                              color="success"
                            />
                          </Box>
                        )}
                      </Box>
                    )}

                  {request.adminDetails?.note && (
                    <Box
                      sx={{
                        mt: 3,
                        p: 2,
                        bgcolor: "warning.light",
                        borderRadius: 1,
                        border: "1px dashed orange",
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        color="warning.dark"
                        gutterBottom
                      >
                        Note from Support:
                      </Typography>
                      <Typography variant="body2" color="text.primary">
                        {request.adminDetails.note}
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper
                  variant="outlined"
                  sx={{ p: { xs: 2, sm: 2 }, borderRadius: 2, height: "100%" }}
                >
                  <Typography
                    variant="subtitle2"
                    gutterBottom
                    color="text.secondary"
                  >
                    Pickup Address
                  </Typography>
                  {request.pickupAddress ? (
                    <Box sx={{ mt: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <LocationOn color="primary" fontSize="small" />
                        <Typography variant="body2" fontWeight="bold">
                          {request.pickupAddress.fullName || "User"}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ ml: { xs: 2, sm: 3.5 } }}
                      >
                        {request.pickupAddress.street}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ ml: { xs: 2, sm: 3.5 } }}
                      >
                        {request.pickupAddress.city},{" "}
                        {request.pickupAddress.state}{" "}
                        {request.pickupAddress.zipCode}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ ml: { xs: 2, sm: 3.5 } }}
                      >
                        {request.pickupAddress.country}
                      </Typography>
                      {request.pickupAddress.mobile && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            ml: { xs: 2, sm: 3.5 },
                            mt: 1,
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <Phone fontSize="inherit" />{" "}
                          {request.pickupAddress.mobile}
                        </Typography>
                      )}
                    </Box>
                  ) : (
                    <Alert severity="warning" sx={{ mt: 1 }}>
                      Pickup details not available.
                    </Alert>
                  )}
                </Paper>
              </Grid>
            </Grid>
          )}

          {activeTab === 1 && (
            <Box sx={{ mt: { xs: -1, sm: -2 } }}>
              <ReturnTracking request={request} isFullPage={false} />
            </Box>
          )}

          {activeTab === 2 && (
            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{
                overflowX: "auto",
                borderRadius: 2,
                "&::-webkit-scrollbar": { height: 6 },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#E7E4DD",
                  borderRadius: 3,
                },
              }}
            >
              <Table sx={{ minWidth: { xs: 540, sm: "100%" } }}>
                <TableHead sx={{ bgcolor: "grey.50" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      Qty
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Condition</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Reason</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Resolution</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {request.items?.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            minWidth: 160,
                          }}
                        >
                          <Avatar
                            src={
                              item.image
                                ? item.image.startsWith("http")
                                  ? item.image
                                  : `${import.meta.env.VITE_API_URL}${item.image}`
                                : undefined
                            }
                            variant="rounded"
                            sx={{
                              width: { xs: 36, sm: 40 },
                              height: { xs: 36, sm: 40 },
                            }}
                          >
                            <ShoppingBag />
                          </Avatar>
                          <Box>
                            <Typography
                              variant="body2"
                              fontWeight="medium"
                              sx={{
                                fontSize: { xs: "0.8rem", sm: "0.875rem" },
                                lineHeight: 1.3,
                              }}
                            >
                              {item.name}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="center">{item.quantity}</TableCell>
                      <TableCell>
                        <Chip
                          label={item.condition}
                          size="small"
                          color={
                            item.condition === "New" ? "success" : "default"
                          }
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
                        >
                          {item.reason}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const res = getItemResolution(item, request);
                          return (
                            <Chip
                              label={res}
                              size="small"
                              color={getItemResolutionColor(res)}
                            />
                          );
                        })()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {activeTab === 3 && (
            <Box>
              {!request.images || request.images.length === 0 ? (
                <Alert severity="info">
                  No proof images uploaded for this request.
                </Alert>
              ) : (
                <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                  {request.images.map((img, idx) => (
                    <Grid item xs={12} sm={6} md={4} key={idx}>
                      <Card variant="outlined" sx={{ borderRadius: 2 }}>
                        <Box
                          component="img"
                          src={
                            img.startsWith("http")
                              ? img
                              : `${import.meta.env.VITE_API_URL}${img}`
                          }
                          sx={{
                            width: "100%",
                            height: { xs: 180, sm: 200 },
                            objectFit: "cover",
                          }}
                          alt={`Proof ${idx + 1}`}
                        />
                        <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                          <Typography variant="caption" color="text.secondary">
                            Attachment {idx + 1}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          p: { xs: 1.5, sm: 2 },
          px: { xs: 2, sm: 3 },
          borderTop: "1px solid #E7E4DD",
        }}
      >
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            bgcolor: "#1C1B19",
            color: "#FFF",
            borderRadius: "12px",
            textTransform: "none",
            fontWeight: 600,
            px: 3,
            "&:hover": { bgcolor: "#000" },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserReturnDetailsModal;
