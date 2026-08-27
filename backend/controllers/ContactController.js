const Contact = require("../model/Contact");
const mongoose = require("mongoose");
const emailService = require("../services/emailService");

class ContactController {
  // Create new contact message
  static createContact = async (req, res) => {
    try {
      const { name, email, phone, subject, message } = req.body;

      // Validate required fields
      if (!name || !email || !message) {
        return res.status(400).json({
          success: false,
          message: "Name, email, and message are required",
        });
      }

      // Create contact entry
      const contact = new Contact({
        name,
        email,
        phone,
        subject,
        message,
      });

      await contact.save();

      // Send confirmation email to customer (async, don't wait)
      emailService
        .sendContactConfirmation({
          name,
          email,
          phone,
          subject,
          message,
        })
        .catch((err) =>
          console.error("Failed to send confirmation email:", err),
        );

      // Send notification to admin (async, don't wait)
      emailService
        .sendAdminNotification({
          name,
          email,
          phone,
          subject,
          message,
        })
        .catch((err) =>
          console.error("Failed to send admin notification:", err),
        );

      res.status(201).json({
        success: true,
        message:
          "Your message has been sent successfully. We will get back to you soon!",
        data: contact,
      });
    } catch (error) {
      console.error("Create contact error:", error);

      if (error.name === "ValidationError") {
        const errors = Object.values(error.errors).map((err) => err.message);
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors,
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to send message. Please try again later.",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  };

  static getAllContacts = async (req, res) => {
    try {
      const { page = 1, limit = 10, status, search } = req.query;

      // Build filter object
      const filter = {};

      if (status && status !== "all") {
        filter.status = status;
      }

      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { subject: { $regex: search, $options: "i" } },
          { message: { $regex: search, $options: "i" } },
        ];
      }

      // Execute query with pagination
      const contacts = await Contact.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .select("-__v");

      // Get total count for pagination
      const total = await Contact.countDocuments(filter);

      res.json({
        success: true,
        data: contacts,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      console.error("Get all contacts error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch contact messages",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  };

  static updateContactStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const { status, adminNotes, adminNote } = req.body;
      const finalNotes = adminNotes !== undefined ? adminNotes : adminNote;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid contact ID format",
        });
      }

      const contact = await Contact.findById(id);

      if (!contact) {
        return res.status(404).json({
          success: false,
          message: "Contact message not found",
        });
      }

      if (status) {
        contact.status = status;
      }

      if (finalNotes !== undefined) {
        contact.adminNotes = finalNotes;
      }

      await contact.save();

      res.json({
        success: true,
        message: "Contact status updated successfully",
        data: contact,
      });
    } catch (error) {
      console.error("Update contact status error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update contact status",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  };

  static replyToContact = async (req, res) => {
    try {
      const { id } = req.params;
      const { reply } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid contact ID format",
        });
      }

      if (!reply) {
        return res.status(400).json({
          success: false,
          message: "Reply message is required",
        });
      }

      const contact = await Contact.findById(id);

      if (!contact) {
        return res.status(404).json({
          success: false,
          message: "Contact message not found",
        });
      }

      if (!contact.replies) {
        contact.replies = [];
      }
      contact.replies.push({
        message: reply,
        sender: req.user?.name || "Support Team",
        repliedBy: req.user?._id,
        createdAt: new Date(),
      });

      contact.reply = reply;
      contact.repliedAt = new Date();
      contact.status = "replied";
      contact.repliedBy = req.user._id;

      await contact.save();

      // Send reply email to customer
      const emailResult = await emailService.sendReplyEmail(
        {
          name: contact.name,
          email: contact.email,
          subject: contact.subject,
          message: contact.message,
        },
        reply,
      );

      if (!emailResult.success) {
        console.error("Failed to send reply email:", emailResult.error);
        // Still return success for the reply, but note email failure
        return res.json({
          success: true,
          message:
            "Reply saved but email notification failed. Please contact the customer directly.",
          data: contact,
          emailSent: false,
        });
      }

      res.json({
        success: true,
        message: "Reply sent successfully and email notification delivered",
        data: contact,
        emailSent: true,
      });
    } catch (error) {
      console.error("Reply to contact error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send reply",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  };

  static deleteContact = async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid contact ID format",
        });
      }

      const contact = await Contact.findByIdAndDelete(id);

      if (!contact) {
        return res.status(404).json({
          success: false,
          message: "Contact message not found",
        });
      }

      res.json({
        success: true,
        message: "Contact message deleted successfully",
        data: contact,
      });
    } catch (error) {
      console.error("Delete contact error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete contact message",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  };
}

module.exports = ContactController;
