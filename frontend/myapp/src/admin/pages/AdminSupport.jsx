// components/AdminSupport.js
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  CircularProgress,
  Pagination,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Tooltip,
  Avatar,
  Alert,
  Paper,
} from "@mui/material";
import {
  Refresh,
  Search,
  Visibility,
  CheckCircle,
  Cancel,
  Chat,
  AttachFile,
  ArrowUpward,
  ArrowDownward,
  Remove,
  Delete,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { useOutletContext } from "react-router-dom";
import SupportTicketDetailsModal from "../components/SupportTicketDetailsModal";

const API_URL = import.meta.env.VITE_API_URL;
const ITEMS_PER_PAGE = 10;

const AdminSupport = () => {
  const { showSnackbar } = useOutletContext();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Delete Ticket State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState(null);

  const handleDeleteClick = (ticketId) => {
    setTicketToDelete(ticketId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/api/support/admin/${ticketToDelete}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${userInfo?.token}`,
          },
        },
      );
      const data = await response.json();
      if (data.success) {
        showSnackbar("Support ticket deleted successfully", "success");
        setTickets(tickets.filter((ticket) => ticket._id !== ticketToDelete));
      } else {
        showSnackbar(data.message || "Failed to delete ticket", "error");
      }
      setDeleteDialogOpen(false);
      setTicketToDelete(null);
    } catch (error) {
      console.error("Error deleting ticket:", error);
      showSnackbar("Failed to delete ticket", "error");
    } finally {
      setLoading(false);
    }
  };
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const userInfo = useSelector((state) => state.productReducer.userInfo);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/support/admin/all`, {
        headers: {
          Authorization: `Bearer ${userInfo?.token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch tickets");
      }

      const data = await response.json();
      if (data.success) {
        setTickets(data.tickets || []);
      } else {
        throw new Error(data.message || "Failed to load tickets");
      }
      setError(null);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      setError(error.message);
      showSnackbar("Failed to load tickets", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (ticketId, status) => {
    setActionLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/support/admin/${ticketId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userInfo?.token}`,
          },
          body: JSON.stringify({ status }),
        },
      );

      const data = await response.json();
      if (data.success) {
        showSnackbar(`Status updated to ${status}`, "success");
        // Update the ticket in state
        setTickets((prevTickets) =>
          prevTickets.map((ticket) =>
            ticket._id === ticketId ? { ...ticket, status } : ticket,
          ),
        );
        if (selectedTicket && selectedTicket._id === ticketId) {
          setSelectedTicket((prev) => ({ ...prev, status }));
        }
        return data.ticket;
      } else {
        throw new Error(data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      showSnackbar("Failed to update status", "error");
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const handleTicketUpdate = async (ticketId, updateData) => {
    if (updateData._id) {
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket._id === ticketId ? updateData : ticket,
        ),
      );
      setSelectedTicket(updateData);
      return updateData;
    }
    if (updateData.status) {
      return await handleUpdateStatus(ticketId, updateData.status);
    }
  };

  const handleSendResponse = async () => {
    if (!responseMessage.trim()) {
      showSnackbar("Please enter a response message", "error");
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/support/${selectedTicket._id}/response`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userInfo?.token}`,
          },
          body: JSON.stringify({ message: responseMessage }),
        },
      );

      const data = await response.json();
      if (data.success) {
        showSnackbar("Response sent successfully", "success");
        setResponseMessage("");
        setSelectedTicket(data.ticket);
        // Update tickets list as well to show new response count or status
        setTickets((prev) =>
          prev.map((t) => (t._id === data.ticket._id ? data.ticket : t)),
        );
      } else {
        throw new Error(data.message || "Failed to send response");
      }
    } catch (error) {
      console.error("Error sending response:", error);
      showSnackbar("Failed to send response", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDetails = (ticket) => {
    setSelectedTicket(ticket);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedTicket(null);
    setResponseMessage("");
  };

  // Filter tickets
  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      !searchTerm ||
      ticket.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket._id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTickets.length / ITEMS_PER_PAGE);
  const paginatedTickets = filteredTickets.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getUserInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getPriorityColor = (priority) => {
    const priorityMap = {
      Low: "success",
      Medium: "info",
      High: "warning",
      Urgent: "error",
    };
    return priorityMap[priority] || "default";
  };

  const getStatusColor = (status) => {
    const statusMap = {
      Open: "error",
      "In Progress": "warning",
      Resolved: "success",
      Closed: "default",
    };
    return statusMap[status] || "default";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Typography
            variant="h4"
            sx={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontWeight: 600,
              color: "#1C1B19",
            }}
          >
            Support Ticket Center
          </Typography>
          <Typography variant="body2" sx={{ color: "#6B6862", mt: 0.5 }}>
            Manage customer support requests ({filteredTickets.length} tickets)
          </Typography>
        </div>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={fetchTickets}
          disabled={actionLoading}
          sx={{
            borderRadius: "12px",
            textTransform: "none",
            fontWeight: 600,
            borderColor: "#E7E4DD",
            color: "#1C1B19",
            bgcolor: "#FFFFFF",
            "&:hover": { bgcolor: "#F7F3EC", borderColor: "#B8925A" },
          }}
        >
          Refresh
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card
        elevation={0}
        sx={{
          borderRadius: "20px",
          border: "1px solid #E7E4DD",
          bgcolor: "#FFFFFF",
          boxShadow: "0 4px 20px -2px rgba(28, 27, 25, 0.05)",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <div className="flex gap-4 flex-wrap">
            <TextField
              select
              label="Status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              size="small"
              style={{ minWidth: 150 }}
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="Open">Open</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Resolved">Resolved</MenuItem>
              <MenuItem value="Closed">Closed</MenuItem>
            </TextField>

            <TextField
              label="Search Tickets"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              size="small"
              style={{ minWidth: 250 }}
              placeholder="Search by subject, customer, or ID..."
              InputProps={{
                startAdornment: <Search sx={{ color: "#6B6862", mr: 1 }} />,
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card
        elevation={0}
        sx={{
          borderRadius: "20px",
          bgcolor: "#FFFFFF",
          border: "1px solid #E7E4DD",
          boxShadow: "0 4px 20px -2px rgba(28, 27, 25, 0.05)",
          overflow: "hidden",
        }}
      >
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <CircularProgress sx={{ color: "#B8925A" }} />
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-12">
              <Typography sx={{ color: "#6B6862" }}>
                No support tickets found
              </Typography>
            </div>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead
                    sx={{
                      bgcolor: "#FAF9F6",
                      borderBottom: "1px solid #E7E4DD",
                    }}
                  >
                    <TableRow>
                      <TableCell
                        sx={{
                          fontFamily: '"Playfair Display", Georgia, serif',
                          fontWeight: 600,
                          color: "#1C1B19",
                        }}
                      >
                        Ticket ID
                      </TableCell>
                      <TableCell
                        sx={{
                          fontFamily: '"Playfair Display", Georgia, serif',
                          fontWeight: 600,
                          color: "#1C1B19",
                        }}
                      >
                        Customer
                      </TableCell>
                      <TableCell
                        sx={{
                          fontFamily: '"Playfair Display", Georgia, serif',
                          fontWeight: 600,
                          color: "#1C1B19",
                        }}
                      >
                        Subject
                      </TableCell>
                      <TableCell
                        sx={{
                          fontFamily: '"Playfair Display", Georgia, serif',
                          fontWeight: 600,
                          color: "#1C1B19",
                        }}
                      >
                        Priority
                      </TableCell>
                      <TableCell
                        sx={{
                          fontFamily: '"Playfair Display", Georgia, serif',
                          fontWeight: 600,
                          color: "#1C1B19",
                        }}
                      >
                        Status
                      </TableCell>
                      <TableCell
                        sx={{
                          fontFamily: '"Playfair Display", Georgia, serif',
                          fontWeight: 600,
                          color: "#1C1B19",
                        }}
                      >
                        Date
                      </TableCell>
                      <TableCell
                        sx={{
                          fontFamily: '"Playfair Display", Georgia, serif',
                          fontWeight: 600,
                          color: "#1C1B19",
                        }}
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedTickets.map((ticket) => (
                      <TableRow
                        key={ticket._id}
                        sx={{
                          "&:hover": { bgcolor: "#FAF9F6" },
                          borderBottom: "1px solid #E7E4DD",
                        }}
                      >
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: "#1C1B19" }}
                          >
                            #{ticket._id?.slice(0, 8).toUpperCase()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                mr: 1.5,
                                bgcolor: "#B8925A",
                                color: "#FFFFFF",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                              }}
                            >
                              {getUserInitials(ticket.user?.name)}
                            </Avatar>
                            <div>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600, color: "#1C1B19" }}
                              >
                                {ticket.user?.name || "Unknown"}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: "#6B6862" }}
                              >
                                {ticket.user?.email || "N/A"}
                              </Typography>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: '"Playfair Display", Georgia, serif',
                              fontWeight: 600,
                              color: "#1C1B19",
                            }}
                            className="truncate max-w-xs"
                          >
                            {ticket.subject}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={ticket.priority}
                            size="small"
                            color={getPriorityColor(ticket.priority)}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={ticket.status}
                            size="small"
                            color={getStatusColor(ticket.status)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <Typography variant="body2">
                              {formatDate(ticket.createdAt)}
                            </Typography>
                            <Typography
                              variant="caption"
                              className="text-gray-500"
                            >
                              {formatTime(ticket.createdAt)}
                            </Typography>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Tooltip title="View ticket details">
                              <IconButton
                                size="small"
                                onClick={() => handleViewDetails(ticket)}
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete ticket">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteClick(ticket._id)}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center py-4">
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                    color="primary"
                    showFirstButton
                    showLastButton
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <SupportTicketDetailsModal
        open={detailsOpen}
        onClose={handleCloseDetails}
        ticket={selectedTicket}
        onSendResponse={handleSendResponse}
        onTicketUpdate={handleTicketUpdate}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle className="font-bold">Delete Support Ticket</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this support ticket? This action
            cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AdminSupport;
