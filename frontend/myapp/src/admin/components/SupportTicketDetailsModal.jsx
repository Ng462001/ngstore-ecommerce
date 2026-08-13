// components/SupportTicketDetailsModal.js
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Chip,
  Divider,
  Grid,
  Avatar,
  Paper,
  Tabs,
  Tab,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Tooltip,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  TextField,
  FormControl,
  MenuItem,
  Select,
  LinearProgress,
  Badge,
  ListItemAvatar,
  ListItemSecondaryAction,
  CardHeader,
} from "@mui/material";
import {
  Close,
  Person,
  Email,
  Phone,
  CalendarToday,
  Chat,
  AttachFile,
  ArrowUpward,
  ArrowDownward,
  Remove,
  CheckCircle,
  Cancel,
  Schedule,
  AccountCircle,
  Block,
  Edit,
  Save,
  Visibility,
  LocalShipping,
  Receipt,
  ShoppingBag,
  Warning,
  Error,
  Info,
  ThumbUp,
  ThumbDown,
  Send,
  Refresh,
  Download,
  Print,
  Timeline,
  Category,
  PriorityHigh,
  Assignment,
  RateReview,
  MarkChatRead,
  Message,
  NoteAdd,
  ContactSupport,
  History,
  Update,
  AccessTime,
} from "@mui/icons-material";
import { format, formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import axios from "axios";

// Support Ticket Details Modal
const SupportTicketDetailsModal = ({
  open,
  onClose,
  ticket,
  onTicketUpdate,
  onSendResponse,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedTicket, setEditedTicket] = useState(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [sendingResponse, setSendingResponse] = useState(false);
  const [ticketHistory, setTicketHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const API_URL = `${import.meta.env.VITE_API_URL}/api`;

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      resetState();
    }
  }, [open]);

  // Initialize when ticket changes
  useEffect(() => {
    if (open && ticket) {
      setEditedTicket({ ...ticket });
      // History fetching removed as it was mock data and not fully implemented in backend/frontend link yet
      // If you want history, we should fetch it from backend or derive from responses
    }
  }, [open, ticket]);

  const fetchTicketHistory = async () => {
    if (!ticket?._id) return;

    try {
      setLoadingHistory(true);
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.token;
      // In a real app, you would have an endpoint for ticket history
      // For now, we'll simulate with the existing data
      const history = [
        {
          action: "Created",
          timestamp: ticket.createdAt,
          user: ticket.user?.name || "Customer",
          details: "Ticket created",
        },
        ...(ticket.responses || []).map((response) => ({
          action: "Response",
          timestamp: response.createdAt,
          user: response.senderRole === "Admin" ? "Support Agent" : "Customer",
          details: response.message.substring(0, 50) + "...",
        })),
      ];
      setTicketHistory(history);
    } catch (error) {
      console.error("Error fetching ticket history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!editedTicket || !ticket?._id) return;

    try {
      setLoading(true);

      // Backend only supports status update via the specific endpoint
      if (editedTicket.status !== ticket.status) {
        if (onTicketUpdate) {
          await onTicketUpdate(ticket._id, { status: editedTicket.status });
        }
      }

      setEditMode(false);
    } catch (error) {
      console.error("Error updating ticket:", error);
      // alert('Error updating ticket: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSendResponseInternal = async () => {
    if (!responseMessage.trim()) {
      return;
    }

    try {
      setSendingResponse(true);
      if (onSendResponse) {
        // AdminSupport.jsx's handleSendResponse uses selectedTicket from state and responseMessage from state
        // But here we are passing arguments? AdminSupport's handleSendResponse is 0 args.
        // Wait, AdminSupport's handleSendResponse uses strict state variables `responseMessage`.
        // We should probably rely on the modal's input and call an API or pass data to the parent.
        // AdminSupport.jsx logic is a bit coupled to its own state.
        // The prompt asked to fix it.
        // AdminSupport handleSendResponse uses its own `responseMessage` state.
        // THIS modal uses its own `responseMessage` state.
        // So calling `onSendResponse()` (which is handleSendResponse from parent) will use PARENT'S empty state.
        // FIX: We need to change how AdminSupport handles this or move the API call here.
        // Given the file structure, it's better to make AdminSupport accept message as arg or just do the fetch here.
        // Accessing the backend directly here seems cleaner given the parent's implementation is flawed for a passed prop.

        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        const token = userInfo?.token;

        const response = await fetch(
          `${API_URL}/support/${ticket._id}/response`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ message: responseMessage }),
          },
        );

        const data = await response.json();
        if (data.success) {
          setResponseMessage("");
          if (onTicketUpdate) onTicketUpdate(ticket._id, { ...data.ticket }); // Update parent
        }
      }
    } catch (error) {
      console.error("Error sending response:", error);
    } finally {
      setSendingResponse(false);
    }
  };

  const resetState = () => {
    setActiveTab(0);
    setEditMode(false);
    setEditedTicket(null);
    setResponseMessage("");
    setTicketHistory([]);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "PPpp");
    } catch (e) {
      return "Invalid Date";
    }
  };

  const formatDistanceToNowSafe = (dateString) => {
    if (!dateString) return "";
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return "";
    }
  };

  const getStatusColor = (status) => {
    const statusMap = {
      Open: { color: "error", bgColor: "#ffebee", textColor: "#c62828" },
      "In Progress": {
        color: "warning",
        bgColor: "#fff3e0",
        textColor: "#f57c00",
      },
      Resolved: { color: "success", bgColor: "#e8f5e9", textColor: "#2e7d32" },
      Closed: { color: "default", bgColor: "#f5f5f5", textColor: "#616161" },
    };
    return statusMap[status] || statusMap["Open"];
  };

  const getPriorityColor = (priority) => {
    const priorityMap = {
      Low: {
        color: "success",
        bgColor: "#e8f5e9",
        textColor: "#2e7d32",
        icon: <ArrowDownward />,
      },
      Medium: {
        color: "info",
        bgColor: "#e3f2fd",
        textColor: "#1565c0",
        icon: <Remove />,
      },
      High: {
        color: "warning",
        bgColor: "#fff3e0",
        textColor: "#f57c00",
        icon: <ArrowUpward />,
      },
      Urgent: {
        color: "error",
        bgColor: "#ffebee",
        textColor: "#c62828",
        icon: <PriorityHigh />,
      },
    };
    return priorityMap[priority] || priorityMap["Medium"];
  };

  const getCategoryColor = (category) => {
    const categoryMap = {
      "Order Issue": {
        color: "success",
        bgColor: "#e8f5e9",
        textColor: "#2e7d32",
      },
      Payment: { color: "secondary", bgColor: "#f3e5f5", textColor: "#7b1fa2" },
      "Product Inquiry": {
        color: "info",
        bgColor: "#e0f7fa",
        textColor: "#00838f",
      },
      Technical: { color: "primary", bgColor: "#e3f2fd", textColor: "#1565c0" },
      Other: { color: "default", bgColor: "#f5f5f5", textColor: "#616161" },
    };
    return categoryMap[category] || categoryMap["Other"];
  };

  const calculateResponseTime = () => {
    if (!ticket || !ticket.createdAt || !ticket.responses) return "N/A";

    const firstResponse = ticket.responses.find(
      (r) => r.senderRole === "Admin",
    );
    if (!firstResponse) return "No response yet";

    const createdAt = new Date(ticket.createdAt);
    const firstResponseTime = new Date(firstResponse.createdAt);
    const diffHours =
      Math.abs(firstResponseTime - createdAt) / (1000 * 60 * 60);

    if (diffHours < 1) {
      return `${Math.round(diffHours * 60)} minutes`;
    } else if (diffHours < 24) {
      return `${Math.round(diffHours)} hours`;
    } else {
      return `${Math.round(diffHours / 24)} days`;
    }
  };

  const renderOverviewTab = () => {
    if (!ticket) return null;

    const displayTicket = editMode ? editedTicket : ticket;
    const statusConfig = getStatusColor(displayTicket.status);
    const priorityConfig = getPriorityColor(displayTicket.priority);
    const categoryConfig = getCategoryColor(displayTicket.category);

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Grid container spacing={3}>
          {/* Ticket Info Card */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 2, height: "100%" }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  mb: 2,
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <Assignment color="primary" /> Ticket Details
                </Typography>
                <Box>
                  <Tooltip title={editMode ? "Cancel Editing" : "Edit Ticket"}>
                    <IconButton
                      size="small"
                      onClick={() => {
                        if (editMode && ticket) {
                          setEditedTicket({ ...ticket });
                        }
                        setEditMode(!editMode);
                      }}
                      sx={{
                        bgcolor: editMode ? "action.selected" : "transparent",
                        "&:hover": { bgcolor: "action.hover" },
                      }}
                    >
                      {editMode ? (
                        <Close fontSize="small" />
                      ) : (
                        <Edit fontSize="small" />
                      )}
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              <Divider sx={{ mb: 3 }} />

              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <AccountCircle fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Ticket ID"
                    secondary={
                      <Typography variant="body2" fontFamily="monospace">
                        #{ticket._id?.slice(0, 8).toUpperCase()}
                      </Typography>
                    }
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <CalendarToday fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Created"
                    secondary={
                      <Box component="span">
                        {formatDate(ticket.createdAt)}
                        {ticket.createdAt && (
                          <Typography
                            variant="caption"
                            display="block"
                            color="text.secondary"
                            sx={{ fontStyle: "italic" }}
                          >
                            {formatDistanceToNowSafe(ticket.createdAt)}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    {displayTicket.status === "Resolved" ? (
                      <CheckCircle color="success" />
                    ) : displayTicket.status === "Closed" ? (
                      <Cancel color="error" />
                    ) : (
                      <Schedule color="warning" />
                    )}
                  </ListItemIcon>
                  {editMode ? (
                    <FormControl fullWidth size="small">
                      <Select
                        value={editedTicket?.status || "Open"}
                        onChange={(e) =>
                          setEditedTicket({
                            ...editedTicket,
                            status: e.target.value,
                          })
                        }
                      >
                        <MenuItem value="Open">Open</MenuItem>
                        <MenuItem value="In Progress">In Progress</MenuItem>
                        <MenuItem value="Resolved">Resolved</MenuItem>
                        <MenuItem value="Closed">Closed</MenuItem>
                      </Select>
                    </FormControl>
                  ) : (
                    <ListItemText
                      primary="Status"
                      secondary={
                        <Chip
                          label={displayTicket.status}
                          size="small"
                          sx={{
                            bgcolor: statusConfig.bgColor,
                            color: statusConfig.textColor,
                            fontWeight: 500,
                          }}
                        />
                      }
                    />
                  )}
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <PriorityHigh fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Priority"
                    secondary={
                      <Chip
                        label={displayTicket.priority}
                        size="small"
                        icon={priorityConfig.icon}
                        sx={{
                          bgcolor: priorityConfig.bgColor,
                          color: priorityConfig.textColor,
                          fontWeight: 500,
                        }}
                      />
                    }
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <Category fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Category"
                    secondary={
                      <Chip
                        label={displayTicket.category}
                        size="small"
                        sx={{
                          bgcolor: categoryConfig.bgColor,
                          color: categoryConfig.textColor,
                          fontWeight: 500,
                        }}
                      />
                    }
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <AccessTime fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Response Time"
                    secondary={calculateResponseTime()}
                  />
                </ListItem>
              </List>

              {/* Admin Notes Section Removed as unused in backend */}

              {editMode && (
                <Box sx={{ mt: 3 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleSaveChanges}
                    disabled={loading || !editedTicket}
                    startIcon={<Save />}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Customer Info & Conversation */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={3}>
              {/* Customer Information */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <Person /> Customer Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined" sx={{ p: 2 }}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          <Avatar
                            sx={{
                              bgcolor: "primary.main",
                              color: "white",
                              width: 50,
                              height: 50,
                            }}
                          >
                            {ticket.user?.name?.charAt(0).toUpperCase() || "U"}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {ticket.user?.name || "Unknown Customer"}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {ticket.user?.email || "No email"}
                            </Typography>
                          </Box>
                        </Box>
                      </Card>
                    </Grid>
                    {ticket.user?.phone && (
                      <Grid item xs={12} md={6}>
                        <Card variant="outlined" sx={{ p: 2 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <Phone color="action" />
                            <Box>
                              <Typography
                                variant="subtitle2"
                                color="text.secondary"
                              >
                                Phone
                              </Typography>
                              <Typography variant="body1">
                                {ticket.user.phone}
                              </Typography>
                            </Box>
                          </Box>
                        </Card>
                      </Grid>
                    )}
                    {ticket.order?._id && (
                      <Grid item xs={12}>
                        <Card variant="outlined" sx={{ p: 2 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <ShoppingBag color="action" />
                            <Box>
                              <Typography
                                variant="subtitle2"
                                color="text.secondary"
                              >
                                Related Order
                              </Typography>
                              <Typography
                                variant="body1"
                                fontFamily="monospace"
                              >
                                #{ticket.order._id.slice(-8).toUpperCase()}
                              </Typography>
                            </Box>
                          </Box>
                        </Card>
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              </Grid>

              {/* Original Message */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <Message /> Original Request
                  </Typography>
                  <Card variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      gutterBottom
                    >
                      {ticket.subject}
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                      {ticket.message}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 2, display: "block" }}
                    >
                      {formatDate(ticket.createdAt)}
                    </Typography>
                  </Card>
                </Paper>
              </Grid>

              {/* Attachments */}
              {ticket.files && ticket.files.length > 0 && (
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, borderRadius: 2 }}>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <AttachFile /> Attachments ({ticket.files.length})
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={2}
                      sx={{ flexWrap: "wrap", gap: 1 }}
                    >
                      {ticket.files.map((file, index) => {
                        const fileUrl = file.startsWith("http")
                          ? file
                          : `${API_URL}${file}`;
                        const isImage = /\.(jpeg|jpg|gif|png|webp)($|\?)/i.test(
                          file,
                        );
                        return (
                          <a
                            key={index}
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ textDecoration: "none" }}
                          >
                            <Card
                              variant="outlined"
                              sx={{
                                p: 1,
                                width: 100,
                                height: 100,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {isImage ? (
                                <Box
                                  component="img"
                                  src={fileUrl}
                                  alt={`Attachment ${index + 1}`}
                                  sx={{
                                    width: "100%",
                                    height: "70%",
                                    objectFit: "cover",
                                    borderRadius: 1,
                                  }}
                                />
                              ) : (
                                <AttachFile
                                  color="action"
                                  sx={{ fontSize: 32 }}
                                />
                              )}
                              <Typography
                                variant="caption"
                                display="block"
                                sx={{
                                  mt: 0.5,
                                  textOverflow: "ellipsis",
                                  overflow: "hidden",
                                  whiteSpace: "nowrap",
                                  width: "90%",
                                  textAlign: "center",
                                }}
                              >
                                File {index + 1}
                              </Typography>
                            </Card>
                          </a>
                        );
                      })}
                    </Stack>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </motion.div>
    );
  };

  const renderConversationTab = () => {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Grid container spacing={3}>
          {/* Conversation Thread */}
          <Grid item xs={12} md={8}>
            <Paper
              sx={{ p: 3, borderRadius: 2, height: "100%", minHeight: 500 }}
            >
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}
              >
                <Chat /> Conversation ({ticket.responses?.length || 0})
              </Typography>

              <Box sx={{ maxHeight: 400, overflow: "auto", pr: 2 }}>
                {!ticket.responses || ticket.responses.length === 0 ? (
                  <Alert severity="info" sx={{ mb: 3 }}>
                    No replies yet. Be the first to respond to this ticket.
                  </Alert>
                ) : (
                  <Stack spacing={2}>
                    {ticket.responses.map((response, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection:
                              response.senderRole === "Admin"
                                ? "row-reverse"
                                : "row",
                            alignItems: "flex-start",
                            gap: 2,
                          }}
                        >
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              bgcolor:
                                response.senderRole === "Admin"
                                  ? "primary.main"
                                  : "grey.500",
                            }}
                          >
                            {response.senderRole === "Admin"
                              ? "A"
                              : ticket.user?.name?.charAt(0).toUpperCase() ||
                                "U"}
                          </Avatar>
                          <Card
                            sx={{
                              maxWidth: "70%",
                              bgcolor:
                                response.senderRole === "Admin"
                                  ? "primary.light"
                                  : "grey.100",
                              borderTopLeftRadius:
                                response.senderRole === "Admin" ? 12 : 2,
                              borderTopRightRadius:
                                response.senderRole === "Admin" ? 2 : 12,
                              p: 2,
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mb: 1,
                              }}
                            >
                              <Typography
                                variant="subtitle2"
                                fontWeight="bold"
                                sx={{ paddingRight: 1 }}
                              >
                                {response.senderRole === "Admin"
                                  ? "Support Agent"
                                  : ticket.user?.name || "Customer"}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {formatDate(response.createdAt)}
                              </Typography>
                            </Box>
                            <Typography
                              variant="body2"
                              sx={{ whiteSpace: "pre-wrap" }}
                            >
                              {response.message}
                            </Typography>
                          </Card>
                        </Box>
                      </motion.div>
                    ))}
                  </Stack>
                )}
              </Box>

              {/* Reply Box */}
              <Box sx={{ mt: 4 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Send Response
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Type your response here..."
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => setResponseMessage("")}
                    disabled={!responseMessage.trim()}
                  >
                    Clear
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSendResponseInternal}
                    disabled={!responseMessage.trim() || sendingResponse}
                    startIcon={<Send />}
                  >
                    {sendingResponse ? "Sending..." : "Send Response"}
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <Update /> Quick Actions
                </Typography>
                <Stack spacing={1}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircle />}
                    fullWidth
                    onClick={() =>
                      onTicketUpdate &&
                      onTicketUpdate(ticket._id, { status: "Resolved" })
                    }
                    disabled={ticket.status === "Resolved"}
                  >
                    Mark as Resolved
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Cancel />}
                    fullWidth
                    onClick={() =>
                      onTicketUpdate &&
                      onTicketUpdate(ticket._id, { status: "Closed" })
                    }
                    disabled={ticket.status === "Closed"}
                  >
                    Close Ticket
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    fullWidth
                    onClick={() =>
                      onTicketUpdate &&
                      onTicketUpdate(ticket._id, { status: "In Progress" })
                    }
                    disabled={ticket.status === "In Progress"}
                  >
                    Move to In Progress
                  </Button>
                </Stack>
              </Paper>

              {/* Status Overview */}
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <Timeline /> Status Overview
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Current Status
                    </Typography>
                    <Chip
                      label={ticket.status}
                      sx={{
                        bgcolor: getStatusColor(ticket.status).bgColor,
                        color: getStatusColor(ticket.status).textColor,
                        fontWeight: "bold",
                        mt: 0.5,
                        width: "100%",
                      }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Priority
                    </Typography>
                    <Chip
                      label={ticket.priority}
                      icon={getPriorityColor(ticket.priority).icon}
                      sx={{
                        bgcolor: getPriorityColor(ticket.priority).bgColor,
                        color: getPriorityColor(ticket.priority).textColor,
                        fontWeight: "bold",
                        mt: 0.5,
                        width: "100%",
                      }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Category
                    </Typography>
                    <Chip
                      label={ticket.category}
                      sx={{
                        bgcolor: getCategoryColor(ticket.category).bgColor,
                        color: getCategoryColor(ticket.category).textColor,
                        fontWeight: "bold",
                        mt: 0.5,
                        width: "100%",
                      }}
                    />
                  </Box>
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </motion.div>
    );
  };

  const renderHistoryTab = () => {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}
          >
            <History /> Ticket History
          </Typography>

          {loadingHistory ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : ticketHistory.length === 0 ? (
            <Alert severity="info">No history available for this ticket.</Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: "grey.50" }}>
                  <TableRow>
                    <TableCell>
                      <strong>Action</strong>
                    </TableCell>
                    <TableCell>
                      <strong>User</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Timestamp</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Details</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ticketHistory.map((item, index) => (
                    <TableRow key={index} hover>
                      <TableCell>
                        <Chip
                          label={item.action}
                          size="small"
                          color={
                            item.action === "Created"
                              ? "primary"
                              : item.action === "Response"
                                ? "info"
                                : "default"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Avatar
                            sx={{ width: 24, height: 24, fontSize: "0.75rem" }}
                          >
                            {item.user?.charAt(0)}
                          </Avatar>
                          <Typography variant="body2">{item.user}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(item.timestamp)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDistanceToNowSafe(item.timestamp)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap>
                          {item.details}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </motion.div>
    );
  };

  if (!ticket) return null;

  const statusConfig = getStatusColor(ticket.status);
  const priorityConfig = getPriorityColor(ticket.priority);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "24px",
          maxHeight: "90vh",
          overflow: "hidden",
          bgcolor: "#FFFFFF",
          border: "1px solid #E7E4DD",
          boxShadow: "0 20px 40px -10px rgba(28, 27, 25, 0.15)",
        },
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Box
          sx={{
            bgcolor: "#FAF9F6",
            color: "#1C1B19",
            borderBottom: "1px solid #E7E4DD",
            p: 3,
            position: "relative",
          }}
        >
          <DialogTitle
            sx={{
              p: 0,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: "#B8925A",
                  color: "#FFFFFF",
                  fontWeight: "bold",
                  fontSize: "1.5rem",
                  border: "1px solid #E7E4DD",
                }}
              >
                {ticket.user?.name?.charAt(0).toUpperCase() || "T"}
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  Support Ticket #{ticket._id?.slice(0, 8).toUpperCase()}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    opacity: 0.9,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <AccountCircle sx={{ fontSize: 16 }} />
                  {ticket.user?.name || "Unknown Customer"} •{" "}
                  {ticket.user?.email || "No email"}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                  <Chip
                    label={ticket.status}
                    size="small"
                    sx={{
                      fontWeight: "bold",
                    }}
                  />
                  <Chip
                    icon={priorityConfig.icon}
                    label={ticket.priority}
                    size="small"
                    sx={{
                      fontWeight: "bold",
                    }}
                  />
                </Box>
              </Box>
            </Box>
            <IconButton
              onClick={onClose}
              sx={{
                color: "white",
                bgcolor: "rgba(255,255,255,0.1)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
              }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
        </Box>
      </motion.div>

      {/* Tabs */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          px: 3,
          bgcolor: "white",
        }}
      >
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Overview" icon={<Visibility />} iconPosition="start" />
          <Tab
            label={`Conversation (${ticket.responses?.length || 0})`}
            icon={<Chat />}
            iconPosition="start"
          />
          <Tab label="History" icon={<History />} iconPosition="start" />
        </Tabs>
      </Box>

      <DialogContent
        dividers
        sx={{ p: 0, bgcolor: "#f9fafb", maxHeight: "calc(90vh - 200px)" }}
      >
        <Box sx={{ p: 3 }}>
          {activeTab === 0 && renderOverviewTab()}
          {activeTab === 1 && renderConversationTab()}
          {activeTab === 2 && renderHistoryTab()}
        </Box>
      </DialogContent>

      <DialogActions
        sx={{ p: 2, bgcolor: "grey.50", justifyContent: "space-between" }}
      >
        <Box>
          {editMode && (
            <Button
              onClick={() => {
                setEditMode(false);
                setEditedTicket({ ...ticket });
              }}
              variant="outlined"
              sx={{ mr: 1 }}
            >
              Cancel
            </Button>
          )}
        </Box>
        <Box>
          <Button onClick={onClose} variant="contained" color="primary">
            Close
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default SupportTicketDetailsModal;
