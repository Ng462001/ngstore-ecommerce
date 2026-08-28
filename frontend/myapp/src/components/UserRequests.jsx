import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Divider,
  IconButton,
} from "@mui/material";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  Assignment,
  Sync as SyncIcon,
  Visibility,
  Close as CloseIcon,
} from "@mui/icons-material";
import UserReturnDetailsModal from "./UserReturnDetailsModal";

const UserRequests = ({ requestId }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [tickets, setTickets] = useState([]);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(false);
  const userInfo = useSelector((state) => state.productReducer.userInfo);

  // Support Response
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [openDialog, setOpenDialog] = useState(false);

  // Return Details
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [openReturnDialog, setOpenReturnDialog] = useState(false);

  useEffect(() => {
    if (activeTab === 0) {
      fetchTickets();
    } else {
      fetchReturns();
    }
  }, [activeTab]);

  // Fetch returns immediately if requestId is provided
  useEffect(() => {
    if (requestId) {
      fetchReturns();
    }
  }, [requestId]);

  // Handle requestId from URL parameter
  useEffect(() => {
    if (requestId && returns.length > 0) {
      const returnRequest = returns.find((r) => r._id === requestId);
      if (returnRequest) {
        setSelectedReturn(returnRequest);
        setOpenReturnDialog(true);
        setActiveTab(1); // Switch to Returns tab
      }
    }
  }, [requestId, returns]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/support/my-tickets`,
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        },
      );
      const data = await response.json();
      if (data.success) {
        setTickets(data.tickets);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/return-exchange/my-requests`,
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        },
      );
      const data = await response.json();
      if (data.success) {
        setReturns(data.requests);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendResponse = async () => {
    if (!responseMessage.trim()) return;
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/support/${selectedTicket._id}/response`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userInfo.token}`,
          },
          body: JSON.stringify({ message: responseMessage }),
        },
      );
      const data = await response.json();
      if (data.success) {
        toast.success("Reply sent");
        setResponseMessage("");
        // Update local state with new response
        const updatedTicket = {
          ...selectedTicket,
          responses: [...selectedTicket.responses, data.newResponse],
        };
        setSelectedTicket(updatedTicket); // Update modal view

        // Update list view
        setTickets((prev) =>
          prev.map((t) => (t._id === updatedTicket._id ? updatedTicket : t)),
        );
      }
    } catch (error) {
      toast.error("Failed to send reply");
    }
  };

  return (
    <Paper elevation={0} sx={{ p: 0, bgcolor: "transparent" }}>
      <Box sx={{ borderBottom: "1px solid #E7E4DD", mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          TabIndicatorProps={{ style: { backgroundColor: "#B8925A" } }}
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              color: "#6B6862",
            },
            "& .Mui-selected": { color: "#B8925A !important" },
          }}
        >
          <Tab
            label="Support Tickets"
            icon={<Assignment fontSize="small" />}
            iconPosition="start"
          />
          <Tab
            label="Returns & Exchanges"
            icon={<SyncIcon fontSize="small" />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Support Tickets Tab */}
      {activeTab === 0 && (
        <Box>
          {tickets.length === 0 && !loading ? (
            <Typography sx={{ textAlign: "center", py: 6, color: "#6B6862" }}>
              You haven't submitted any support tickets yet.
            </Typography>
          ) : (
            tickets.map((ticket) => (
              <Paper
                elevation={0}
                key={ticket._id}
                sx={{
                  p: 3,
                  mb: 2.5,
                  borderRadius: "16px",
                  bgcolor: "#FFFFFF",
                  border: "1px solid #E7E4DD",
                  boxShadow: "0 4px 16px -2px rgba(28, 27, 25, 0.04)",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", sm: "flex-start" },
                    gap: { xs: 1, sm: 0 },
                    mb: 2,
                  }}
                >
                  <Box sx={{ width: { xs: "100%", sm: "auto" } }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 1,
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          fontFamily: '"Playfair Display", Georgia, serif',
                          fontWeight: 600,
                          fontSize: "1.1rem",
                          mb: 0.5,
                          color: "#1C1B19",
                        }}
                      >
                        {ticket.subject}
                      </Typography>
                      <Box sx={{ display: { xs: "block", sm: "none" } }}>
                        <Chip
                          label={ticket.status}
                          color={
                            ticket.status === "Resolved"
                              ? "success"
                              : ticket.status === "Closed"
                                ? "default"
                                : "primary"
                          }
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        flexWrap: "wrap",
                      }}
                    >
                      <Typography variant="caption" sx={{ color: "#6B6862" }}>
                        Ticket Id: #{ticket._id.slice(0, 8).toUpperCase()}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#6B6862" }}>
                        • {new Date(ticket.createdAt).toLocaleDateString()}
                      </Typography>
                      <Chip
                        label={ticket.category}
                        size="small"
                        variant="outlined"
                        sx={{
                          height: 20,
                          fontSize: "0.7rem",
                          borderColor: "#E7E4DD",
                          color: "#6B6862",
                        }}
                      />
                    </Box>
                  </Box>
                  <Box sx={{ display: { xs: "none", sm: "block" } }}>
                    <Chip
                      label={ticket.status}
                      color={
                        ticket.status === "Resolved"
                          ? "success"
                          : ticket.status === "Closed"
                            ? "default"
                            : "primary"
                      }
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                </Box>
                <Typography
                  variant="body2"
                  sx={{ color: "#6B6862", mb: 2, wordBreak: "break-word" }}
                >
                  {ticket.message.substring(0, 100)}...
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setSelectedTicket(ticket);
                    setOpenDialog(true);
                  }}
                  sx={{
                    width: { xs: "100%", sm: "auto" },
                    borderRadius: "10px",
                    textTransform: "none",
                    fontWeight: 600,
                    borderColor: "#B8925A",
                    color: "#B8925A",
                    "&:hover": { borderColor: "#9E7B47", bgcolor: "#F7F3EC" },
                  }}
                >
                  View Conversation ({ticket.responses.length})
                </Button>
              </Paper>
            ))
          )}
        </Box>
      )}

      {/* Returns Tab */}
      {activeTab === 1 && (
        <Box>
          {returns.length === 0 && !loading ? (
            <Typography sx={{ textAlign: "center", py: 6, color: "#6B6862" }}>
              No return or exchange requests found.
            </Typography>
          ) : (
            returns.map((req) => (
              <Paper
                elevation={0}
                key={req._id}
                sx={{
                  p: 3,
                  mb: 2.5,
                  borderRadius: "16px",
                  bgcolor: "#FFFFFF",
                  border: "1px solid #E7E4DD",
                  boxShadow: "0 4px 16px -2px rgba(28, 27, 25, 0.04)",
                }}
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
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontFamily: '"Playfair Display", Georgia, serif',
                        fontWeight: 600,
                        color: "#1C1B19",
                      }}
                    >
                      {req.type} Request
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#6B6862" }}>
                      Order: #
                      {req.order?._id
                        ? req.order._id.slice(0, 8).toUpperCase()
                        : "N/A"}{" "}
                      • {new Date(req.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Chip
                    label={req.status}
                    color={
                      req.status === "Completed" || req.status === "Refunded"
                        ? "success"
                        : req.status === "Rejected" ||
                            req.status === "Cancelled"
                          ? "error"
                          : req.status === "Approved"
                            ? "info"
                            : "warning"
                    }
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
                <Divider sx={{ my: 1 }} />

                <Box sx={{ mt: 2 }}>
                  {req.items.map((item, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        justifyContent: "space-between",
                        alignItems: { xs: "flex-start", sm: "center" },
                        gap: { xs: 0.5, sm: 0 },
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2">
                        {item.name} (x{item.quantity})
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.reason}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    justifyContent: { xs: "stretch", sm: "flex-end" },
                  }}
                >
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => {
                      setSelectedReturn(req);
                      setOpenReturnDialog(true);
                    }}
                    sx={{ width: { xs: "100%", sm: "auto" } }}
                  >
                    View Details
                  </Button>
                </Box>
              </Paper>
            ))
          )}
        </Box>
      )}

      {/* Ticket Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        disableScrollLock
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            m: { xs: 1.5, sm: 2 },
            maxHeight: { xs: "calc(100% - 24px)", sm: "calc(100% - 64px)" },
            width: { xs: "calc(100% - 24px)", sm: "auto" },
          },
        }}
      >
        {selectedTicket && (
          <>
            <DialogTitle
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <Box>
                {selectedTicket.subject}
                <Typography
                  variant="caption"
                  display="block"
                  color="text.secondary"
                >
                  Ticket Id: #{selectedTicket._id.slice(0, 8).toUpperCase()}
                </Typography>
              </Box>
              <IconButton
                onClick={() => setOpenDialog(false)}
                size="small"
                sx={{
                  color: "grey.500",
                  display: { xs: "inline-flex", sm: "none" },
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}
              >
                <Box
                  sx={{
                    alignSelf: "flex-start",
                    maxWidth: { xs: "92%", sm: "85%" },
                    bgcolor: "grey.100",
                    p: 2,
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body2">
                    {selectedTicket.message}
                  </Typography>
                  <Typography
                    variant="caption"
                    display="block"
                    sx={{ mt: 1, opacity: 0.7 }}
                  >
                    You • {new Date(selectedTicket.createdAt).toLocaleString()}
                  </Typography>
                </Box>

                {selectedTicket.responses.map((resp, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      alignSelf:
                        resp.senderRole === "User" ? "flex-start" : "flex-end",
                      maxWidth: { xs: "92%", sm: "85%" },
                      bgcolor:
                        resp.senderRole === "User"
                          ? "grey.100"
                          : "primary.light",
                      color:
                        resp.senderRole === "User" ? "text.primary" : "white",
                      p: 2,
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="body2">{resp.message}</Typography>
                    <Typography
                      variant="caption"
                      display="block"
                      sx={{ mt: 1, opacity: 0.7 }}
                    >
                      {resp.senderRole} •{" "}
                      {new Date(resp.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {selectedTicket.status !== "Closed" && (
                <Box>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="Type your reply..."
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                    sx={{ mb: 1 }}
                  />
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleSendResponse}
                    disabled={!responseMessage.trim()}
                  >
                    Send Reply
                  </Button>
                </Box>
              )}
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* Return Request Details Modal */}
      <UserReturnDetailsModal
        open={openReturnDialog}
        onClose={() => setOpenReturnDialog(false)}
        request={selectedReturn}
      />
    </Paper>
  );
};

export default UserRequests;
