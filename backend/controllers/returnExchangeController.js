const ReturnExchange = require("../model/ReturnExchange");
const Order = require("../model/Order");
const { uploadToCloudinary } = require("../services/cloudinaryService");

class ReturnExchangeController {
  // Request Return/Exchange
  static requestReturnExchange = async (req, res) => {
    try {
      const { orderId, type, items, pickupAddress, bankDetails } = req.body;

      const order = await Order.findById(orderId);
      if (!order)
        return res
          .status(404)
          .json({ success: false, message: "Order not found" });

      if (order.user.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ success: false, message: "Unauthorized" });
      }

      // Check if order is in Delivered status
      if (order.status !== "Delivered") {
        return res.status(400).json({
          success: false,
          message: "Only delivered orders are eligible for return or exchange.",
        });
      }

      // Check 10-day return policy window
      const deliveryDate = order.deliveredAt
        ? new Date(order.deliveredAt)
        : new Date(order.updatedAt);
      const daysSinceDelivery =
        (Date.now() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceDelivery > 10) {
        return res.status(400).json({
          success: false,
          message:
            "The 10-day return/exchange window for this order has expired.",
        });
      }

      // Check if active return request already exists
      const existingRequest = await ReturnExchange.findOne({
        order: orderId,
        status: { $ne: "Cancelled" },
      });
      if (existingRequest) {
        return res.status(400).json({
          success: false,
          message:
            "A return or exchange request already exists for this order.",
        });
      }

      let images = [];
      if (req.files && req.files.length > 0) {
        const uploadPromises = req.files.map((file) =>
          uploadToCloudinary(file.path, "returns"),
        );
        const uploadResults = await Promise.all(uploadPromises);
        images = uploadResults.map((result) => result.secure_url);
      }

      // Parse items if string
      let parsedItems = items;
      if (typeof items === "string") {
        try {
          parsedItems = JSON.parse(items);
        } catch (e) {}
      }

      // Parse pickupAddress if string
      let parsedAddress = pickupAddress;
      if (typeof pickupAddress === "string") {
        try {
          parsedAddress = JSON.parse(pickupAddress);
        } catch (e) {}
      }

      // Parse exchangeDetails if needed (optional)
      let parsedExchangeDetails = {};
      if (req.body.exchangeDetails) {
        if (typeof req.body.exchangeDetails === "string") {
          try {
            parsedExchangeDetails = JSON.parse(req.body.exchangeDetails);
          } catch (e) {}
        } else {
          parsedExchangeDetails = req.body.exchangeDetails;
        }
      }

      const newRequest = await ReturnExchange.create({
        user: req.user._id,
        order: orderId,
        type,
        items: parsedItems,
        images,
        pickupAddress: parsedAddress,
        exchangeDetails:
          type === "Exchange"
            ? { requestedProduct: parsedExchangeDetails.newProduct }
            : undefined,
        refundDetails:
          type === "Return"
            ? { method: bankDetails ? "Bank Transfer" : "Original Payment" }
            : undefined,
      });

      res.status(201).json({ success: true, request: newRequest });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // Get User Requests
  static getUserRequests = async (req, res) => {
    try {
      const requests = await ReturnExchange.find({ user: req.user._id })
        .populate("order", "createdAt totalPrice")
        .sort({ createdAt: -1 });
      res.status(200).json({ success: true, requests });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // Get Requests by Order ID
  static getRequestsByOrderId = async (req, res) => {
    try {
      const requests = await ReturnExchange.find({ order: req.params.orderId })
        .populate("order")
        .populate("items.product")
        .sort({ createdAt: -1 });

      console.log("Requests:", requests);

      // Check if user is authorized to view these requests
      if (requests.length > 0) {
        const firstRequest = requests[0];
        if (
          firstRequest.user.toString() !== req.user._id.toString() &&
          req.user.role !== "admin"
        ) {
          return res
            .status(403)
            .json({ success: false, message: "Unauthorized" });
        }
      }

      res.status(200).json({ success: true, requests });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // Admin: Get All Requests
  static getAllRequests = async (req, res) => {
    try {
      const requests = await ReturnExchange.find()
        .populate("user", "name email")
        .populate("order")
        .sort({ createdAt: -1 });
      res.status(200).json({ success: true, requests });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // Admin: Update Status
  static updateRequestStatus = async (req, res) => {
    try {
      const { status, adminNote, refundAmount } = req.body;
      const request = await ReturnExchange.findById(req.params.id);

      if (!request)
        return res
          .status(404)
          .json({ success: false, message: "Request not found" });

      request.status = status;
      request.statusUpdates.push({
        status,
        timestamp: Date.now(),
        note: adminNote,
      });
      if (!request.adminDetails) request.adminDetails = {};
      if (adminNote) request.adminDetails.note = adminNote;
      if (req.user._id) request.adminDetails.processedBy = req.user._id;

      let computedRefundAmount = refundAmount;

      if ((status === "Completed" || status === "Refunded") && request.type === "Return") {
        if (
          !computedRefundAmount &&
          request.items &&
          request.items.length > 0
        ) {
          computedRefundAmount = request.items.reduce(
            (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
            0,
          );
        }
        if (!request.refundDetails) request.refundDetails = {};
        request.refundDetails.amount = computedRefundAmount || 0;
        request.refundDetails.status = "Processed";
        request.refundDetails.processedAt = Date.now();
      }

      await request.save();

      // Synchronize linked Order status, payment status, inventory restoration & emails
      if (request.order) {
        const order = await Order.findById(request.order);
        if (order) {
          if (status === "Completed" || status === "Refunded") {
            if (request.type === "Return") {
              order.status = "Returned";
              order.returnedAt = order.returnedAt || Date.now();
              order.paymentStatus = "Refunded";
              order.refundedAt = Date.now();

              // Restore inventory stock for returned items
              const Product = require("../model/Product");
              if (request.items && request.items.length > 0) {
                for (const item of request.items) {
                  const productId = item.product?._id || item.product;
                  if (productId) {
                    const product = await Product.findById(productId);
                    if (product) {
                      product.quantity =
                        (product.quantity || 0) + (item.quantity || 1);
                      if (typeof product.sold === "number") {
                        product.sold = Math.max(
                          0,
                          product.sold - (item.quantity || 1),
                        );
                      }
                      await product.save();
                    }
                  }
                }
              }
            }
            await order.save();

            // Dispatch email notification
            try {
              const emailService = require("../services/emailService");
              await emailService.sendOrderStatusEmail(
                order,
                "Refunded",
                adminNote || "Your return & refund request has been completed.",
              );
            } catch (e) {
              console.error("Failed to send status email:", e.message);
            }
          } else if (
            ["Approved", "Pickup Scheduled", "Picked Up", "Received"].includes(
              status,
            )
          ) {
            if (request.type === "Return") {
              order.status = "Returned";
              order.returnedAt = order.returnedAt || Date.now();
              await order.save();
            }
          } else if (status === "Rejected" || status === "Cancelled") {
            order.status = "Delivered";
            await order.save();
          }
        }
      }

      res.status(200).json({ success: true, request });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // Admin: Delete Request
  static deleteRequest = async (req, res) => {
    try {
      const request = await ReturnExchange.findByIdAndDelete(req.params.id);
      if (!request) {
        return res
          .status(404)
          .json({ success: false, message: "Request not found" });
      }
      res.status(200).json({
        success: true,
        message: "Return/Exchange request deleted successfully",
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
}

module.exports = ReturnExchangeController;
