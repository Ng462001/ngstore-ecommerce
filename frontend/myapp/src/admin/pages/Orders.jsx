// components/Orders.js
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
  Menu,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  Box,
  Tooltip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Paper,
} from "@mui/material";
import {
  Visibility,
  Refresh,
  Edit,
  Close,
  Receipt,
  ArrowDropDown,
  Search,
  Delete,
} from "@mui/icons-material";
import axios from "axios";
import { useNavigate, useOutletContext } from "react-router-dom";

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

const Orders = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useOutletContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status Update State
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Order Details Modal State
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);

  // Delete Order State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  const handleDeleteClick = (orderId) => {
    setOrderToDelete(orderId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/admin/orders/${orderToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(orders.filter((order) => order._id !== orderToDelete));
      setLoading(false);
      setDeleteDialogOpen(false);
      setOrderToDelete(null);
      showSnackbar("Order deleted successfully", "success");
    } catch (err) {
      setLoading(false);
      console.error("Error deleting order:", err);
      showSnackbar(
        err.response?.data?.message || "Failed to delete order",
        "error",
      );
    }
  };

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter Logic
  const filteredOrders = orders.filter((order) => {
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const orderIdMatches = order._id.toLowerCase().includes(q);
      const customerNameMatches = (order.user?.name || "")
        .toLowerCase()
        .includes(q);
      const customerEmailMatches = (order.user?.email || "")
        .toLowerCase()
        .includes(q);
      const productMatches = order.orderItems?.some((item) =>
        (item.name || "").toLowerCase().includes(q),
      );

      if (
        !orderIdMatches &&
        !customerNameMatches &&
        !customerEmailMatches &&
        !productMatches
      ) {
        return false;
      }
    }

    // Order Status filter
    if (statusFilter !== "All") {
      if (
        (order.status || "Pending").toLowerCase() !== statusFilter.toLowerCase()
      ) {
        return false;
      }
    }

    // Payment Status filter
    if (paymentFilter !== "All") {
      const isPaid = order.paymentStatus === "Paid" || order.isPaid === true;
      if (paymentFilter === "Paid" && !isPaid) return false;
      if (paymentFilter === "Unpaid" && isPaid) return false;
    }

    // Date Range filter
    if (startDate) {
      const orderDate = new Date(order.createdAt);
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      if (orderDate < start) return false;
    }
    if (endDate) {
      const orderDate = new Date(order.createdAt);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (orderDate > end) return false;
    }

    return true;
  });

  const getAllowedTransitions = (currentStatus) => {
    const s = currentStatus || "Pending";
    switch (s) {
      case "Pending":
        return ["Processing", "Cancelled"];
      case "Processing":
        return ["Shipped", "Cancelled"];
      case "Shipped":
        return ["Out for delivery"];
      case "Out for delivery":
        return ["Delivered"];
      case "Delivered":
      case "Returned":
      case "Cancelled":
      case "Refunded":
      default:
        return [];
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login to view orders");
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data.orders || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusClick = (event, order) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrder(order);
  };

  const handlePaymentStatus = (status) => {
    switch (status) {
      case "Paid":
        return "success";
      case "Pending":
        return "warning";
      case "Failed":
        return "error";
      default:
        return "default";
    }
  };

  const handleStatusClose = () => {
    setAnchorEl(null);
    setSelectedOrder(null);
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!selectedOrder) return;

    const orderToUpdate = selectedOrder;
    handleStatusClose();

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const isNowPaid =
        newStatus === "Delivered" ||
        orderToUpdate.isPaid ||
        orderToUpdate.paymentStatus === "Paid";
      const updatedPaymentStatus = isNowPaid
        ? "Paid"
        : orderToUpdate.paymentStatus || "Pending";

      const res = await axios.put(
        `${API_URL}/admin/orders/${orderToUpdate._id}/status`,
        {
          status: newStatus,
          notifyCustomer: true,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // Update local state
      setOrders(
        orders.map((order) =>
          order._id === orderToUpdate._id
            ? {
                ...order,
                ...(res.data || {}),
                status: newStatus,
                isDelivered:
                  newStatus === "Delivered" ? true : order.isDelivered,
                isPaid: isNowPaid,
                paymentStatus: updatedPaymentStatus,
              }
            : order,
        ),
      );
      setLoading(false);
      showSnackbar(`Successfully updated status to ${newStatus}`, "success");
    } catch (err) {
      setLoading(false);
      console.error("Error updating status:", err);
      showSnackbar("Failed to update status", "error");
    }
  };

  const handleViewOrder = (order) => {
    setViewOrder(order);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setViewOrder(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "success";
      case "Out for delivery":
        return "primary";
      case "Shipped":
        return "info";
      case "Processing":
        return "warning";
      case "Cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
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
            Order Management
          </Typography>
          <Typography variant="body2" sx={{ color: "#6B6862", mt: 0.5 }}>
            Manage and track customer orders ({filteredOrders.length} of{" "}
            {orders.length} orders)
          </Typography>
        </div>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={fetchOrders}
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

      {error && (
        <div className="bg-error/10 border border-error/30 text-error px-4 py-3 rounded-2xl">
          Error loading orders: {error}
        </div>
      )}

      {/* Filter Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: "20px",
          border: "1px solid #E7E4DD",
          bgcolor: "#FFFFFF",
          boxShadow: "0 4px 20px -2px rgba(28, 27, 25, 0.05)",
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              label="Search"
              placeholder="Search Order ID, product, customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ color: "#6B6862", mr: 1 }} />,
                sx: { borderRadius: "12px" },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Order Status</InputLabel>
              <Select
                value={statusFilter}
                label="Order Status"
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={{ borderRadius: "12px" }}
              >
                <MenuItem value="All">All Statuses</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Shipped">Shipped</MenuItem>
                <MenuItem value="Out for delivery">Out for Delivery</MenuItem>
                <MenuItem value="Delivered">Delivered</MenuItem>
                <MenuItem value="Cancelled">Cancelled</MenuItem>
                <MenuItem value="Returned">Returned</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Payment</InputLabel>
              <Select
                value={paymentFilter}
                label="Payment"
                onChange={(e) => setPaymentFilter(e.target.value)}
                sx={{ borderRadius: "12px" }}
              >
                <MenuItem value="All">All Payment</MenuItem>
                <MenuItem value="Paid">Paid</MenuItem>
                <MenuItem value="Unpaid">Unpaid</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Start Date"
              InputLabelProps={{ shrink: true }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputProps={{ sx: { borderRadius: "12px" } }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="End Date"
              InputLabelProps={{ shrink: true }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputProps={{ sx: { borderRadius: "12px" } }}
            />
          </Grid>
        </Grid>

        {/* Clear Filters */}
        {(searchQuery ||
          statusFilter !== "All" ||
          paymentFilter !== "All" ||
          startDate ||
          endDate) && (
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button
              size="small"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("All");
                setPaymentFilter("All");
                setStartDate("");
                setEndDate("");
              }}
              sx={{ textTransform: "none", fontWeight: 600, color: "#B3413B" }}
            >
              Clear Filters
            </Button>
          </Box>
        )}
      </Paper>

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
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Typography sx={{ color: "#6B6862" }}>
                {orders.length === 0
                  ? "No orders found"
                  : "No orders found matching the filter criteria"}
              </Typography>
            </div>
          ) : (
            <TableContainer>
              <Table>
                <TableHead
                  sx={{ bgcolor: "#FAF9F6", borderBottom: "1px solid #E7E4DD" }}
                >
                  <TableRow>
                    <TableCell
                      sx={{
                        fontFamily: '"Playfair Display", Georgia, serif',
                        fontWeight: 600,
                        color: "#1C1B19",
                      }}
                    >
                      Order ID
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
                      Date
                    </TableCell>
                    <TableCell
                      sx={{
                        fontFamily: '"Playfair Display", Georgia, serif',
                        fontWeight: 600,
                        color: "#1C1B19",
                      }}
                    >
                      Amount
                    </TableCell>
                    <TableCell
                      sx={{
                        fontFamily: '"Playfair Display", Georgia, serif',
                        fontWeight: 600,
                        color: "#1C1B19",
                      }}
                    >
                      Items
                    </TableCell>
                    <TableCell
                      sx={{
                        fontFamily: '"Playfair Display", Georgia, serif',
                        fontWeight: 600,
                        color: "#1C1B19",
                      }}
                    >
                      Payment
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
                      align="center"
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow
                      key={order._id}
                      sx={{
                        "&:hover": { bgcolor: "#FAF9F6" },
                        borderBottom: "1px solid #E7E4DD",
                      }}
                    >
                      <TableCell>
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 600, color: "#1C1B19" }}
                        >
                          #{order._id.substring(0, 8).toUpperCase()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <div>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: "#1C1B19" }}
                          >
                            {order.user?.name ||
                              order.shippingAddress?.city ||
                              "N/A"}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: "#6B6862" }}
                          >
                            {order.user?.email ||
                              order.shippingAddress?.mobile ||
                              ""}
                          </Typography>
                        </div>
                      </TableCell>
                      <TableCell sx={{ color: "#6B6862" }}>
                        {formatDate(order.createdAt)}
                      </TableCell>
                      <TableCell sx={{ color: "#B8925A", fontWeight: 700 }}>
                        ₹{order.totalPrice?.toFixed(2) || "0.00"}
                      </TableCell>
                      <TableCell sx={{ color: "#1C1B19", fontWeight: 600 }}>
                        {order.orderItems?.length || 0}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={order.paymentStatus}
                          size="small"
                          color={handlePaymentStatus(order.paymentStatus)}
                        />
                      </TableCell>
                      <TableCell>
                        {getAllowedTransitions(order.status).length > 0 ? (
                          <Chip
                            label={order.status || "Pending"}
                            color={getStatusColor(order.status)}
                            onClick={(e) => handleStatusClick(e, order)}
                            onDelete={(e) => handleStatusClick(e, order)}
                            deleteIcon={
                              <ArrowDropDown style={{ fontSize: 16 }} />
                            }
                            variant="outlined"
                            className="cursor-pointer hover:shadow-sm"
                          />
                        ) : (
                          <Chip
                            label={order.status || "Pending"}
                            color={getStatusColor(order.status)}
                            variant="outlined"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2 justify-center">
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() =>
                                navigate(`/admin/order/${order._id}`)
                              }
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="View Receipt">
                            <IconButton
                              size="small"
                              onClick={() => handleViewOrder(order)}
                            >
                              <Receipt fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Order">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteClick(order._id)}
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
          )}
        </CardContent>
      </Card>

      {/* Status Update Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleStatusClose}
      >
        {selectedOrder &&
          getAllowedTransitions(selectedOrder.status).map((nextStatus) => (
            <MenuItem
              key={nextStatus}
              onClick={() => handleStatusUpdate(nextStatus)}
            >
              {nextStatus}
            </MenuItem>
          ))}
      </Menu>

      {/* Order Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">
              Order Details #{viewOrder?._id?.substring(0, 8)}
            </Typography>
            <IconButton onClick={handleCloseDetails} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {viewOrder && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Customer Information
                </Typography>
                <Typography variant="body2">
                  Name: {viewOrder.user?.name || "N/A"}
                </Typography>
                <Typography variant="body2">
                  Email: {viewOrder.user?.email || "N/A"}
                </Typography>
                <Box mt={2}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                  >
                    Shipping Address
                  </Typography>
                  <Typography variant="body2">
                    {viewOrder.shippingAddress?.street}
                  </Typography>
                  <Typography variant="body2">
                    {viewOrder.shippingAddress?.city},{" "}
                    {viewOrder.shippingAddress?.state}{" "}
                    {viewOrder.shippingAddress?.zipCode}
                  </Typography>
                  <Typography variant="body2">
                    {viewOrder.shippingAddress?.country}
                  </Typography>
                  <Typography variant="body2">
                    Phone: {viewOrder.shippingAddress?.mobile}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Order Summary
                </Typography>
                <Typography variant="body2">
                  Date: {formatDate(viewOrder.createdAt)}
                </Typography>
                <Typography variant="body2">
                  Status:{" "}
                  <span
                    className={`font-medium text-${getStatusColor(viewOrder.status)}-600`}
                  >
                    {viewOrder.status}
                  </span>
                </Typography>
                <Typography variant="body2">
                  Payment Method: {viewOrder.paymentMethod}
                </Typography>
                <Typography variant="body2">
                  Payment Status: {viewOrder.paymentStatus}
                </Typography>
                <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Items Price:</Typography>
                    <Typography variant="body2">
                      ₹
                      {viewOrder.orderItems
                        .reduce(
                          (total, item) => total + item.price * item.quantity,
                          0,
                        )
                        .toFixed(2) || "0.00"}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Tax:</Typography>
                    <Typography variant="body2">
                      ₹{viewOrder.taxPrice?.toFixed(2) || "0.00"}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Shipping:</Typography>
                    <Typography variant="body2">
                      ₹{viewOrder.shippingPrice?.toFixed(2) || "0.00"}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="subtitle2">Total:</Typography>
                    <Typography variant="subtitle2">
                      ₹{viewOrder.totalPrice?.toFixed(2) || "0.00"}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Order Items
                </Typography>
                <TableContainer className="border rounded-lg">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell>Color</TableCell>
                        <TableCell>Size</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="right">Qty</TableCell>
                        <TableCell align="right">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {viewOrder.orderItems?.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={2}>
                              <img
                                src={
                                  item.image && item.image.startsWith("http")
                                    ? item.image
                                    : `${import.meta.env.VITE_API_URL}${item.image || ""}`
                                }
                                alt={item.name}
                                style={{
                                  width: 40,
                                  height: 40,
                                  objectFit: "cover",
                                  borderRadius: 4,
                                }}
                              />
                              <Typography variant="body2">
                                {item.name}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{item.selectedColor || "-"}</TableCell>
                          <TableCell>{item.selectedSize || "-"}</TableCell>
                          <TableCell align="right">
                            ₹{item.price?.toFixed(2)}
                          </TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>

                          <TableCell align="right">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle className="font-bold">Delete Order</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this order? This action cannot be
            undone.
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

export default Orders;
