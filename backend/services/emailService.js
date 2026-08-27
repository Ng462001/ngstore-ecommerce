const nodemailer = require('nodemailer');

/**
 * Base HTML template helper to standardise styling and prevent duplication.
 */
const getBaseTemplate = (title, headerSubtitle, contentHtml, headerGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)') => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background-color: #f7fafc;
                color: #2d3748;
                line-height: 1.6;
                padding: 20px;
            }
            
            .email-container {
                max-width: 600px;
                margin: 0 auto;
                background: white;
                border-radius: 20px;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0,0,0,0.05);
                border: 1px solid #e2e8f0;
            }
            
            .header {
                background: ${headerGradient};
                padding: 40px 30px;
                text-align: center;
                color: white;
            }
            
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 700;
                letter-spacing: -0.5px;
            }
            
            .header p {
                margin: 10px 0 0;
                font-size: 16px;
                color: rgba(255,255,255,0.9);
            }
            
            .content {
                padding: 40px 30px;
                background: #ffffff;
            }
            
            .footer {
                background: #1a202c;
                padding: 30px;
                text-align: center;
                color: #a0aec0;
                font-size: 14px;
                border-top: 1px solid #2d3748;
            }
            
            .footer a {
                color: #667eea;
                text-decoration: none;
            }
            
            .footer-copyright {
                margin-top: 20px;
                font-size: 12px;
                color: #718096;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <h1>${title}</h1>
                ${headerSubtitle ? `<p>${headerSubtitle}</p>` : ''}
            </div>
            <div class="content">
                ${contentHtml}
            </div>
            <div class="footer">
                <p>Need help? Contact us at <a href="mailto:${process.env.SUPPORT_EMAIL || 'ngtech2026@gmail.com'}">${process.env.SUPPORT_EMAIL || 'ngtech2026@gmail.com'}</a></p>
                <p class="footer-copyright">
                    © ${new Date().getFullYear()} ${process.env.COMPANY_NAME || 'NGSTORE'}. All rights reserved.<br>
                    VIPL IT Park, No. 43, Parsodi, Gayatri Nagar, Trimurtee Nagar, Nagpur, Maharashtra 440022, India
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
};

class EmailService {
    constructor() {
        // Create reusable transporter
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false,
            localAddress: '0.0.0.0',
            requireTLS: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            },
            connectionTimeout: 30000,
            greetingTimeout: 30000,
            socketTimeout: 30000,
        })
    }

    // Send Mail
    async sendEmail(options) {
        try {
            if (!options || !options.email || typeof options.email !== 'string' || !options.email.trim()) {
                console.warn('sendEmail skipped: No recipient email address provided.');
                return { success: false, error: 'Recipient email address is required' };
            }

            if (process.env.BREVO_API_KEY) {
                try {
                    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
                        method: 'POST',
                        headers: {
                            'accept': 'application/json',
                            'api-key': process.env.BREVO_API_KEY,
                            'content-type': 'application/json'
                        },
                        body: JSON.stringify({
                            sender: {
                                name: process.env.COMPANY_NAME,
                                email: process.env.EMAIL_USER
                            },
                            to: [
                                {
                                    email: options.email
                                }
                            ],
                            subject: options.subject,
                            textContent: options.message,
                            htmlContent: options.html
                        })
                    });

                    const responseData = await response.json();
                    console.log(responseData);
                    if (!response.ok) {
                        throw new Error(responseData.message || `Brevo HTTP Error: ${response.status}`);
                    }
                    console.log('Message sent via Brevo: %s', responseData.messageId || 'Success');
                    return { success: true, messageId: responseData.messageId || 'Success' };
                } catch (brevoError) {
                    console.warn('Brevo API failed, falling back to SMTP:', brevoError.message);
                }
            }


            // Option 3: Standard SMTP Fallback
            const mailOptions = {
                from: `"${process.env.COMPANY_NAME || 'NGSTORE'}" <${process.env.EMAIL_USER}>`,
                to: options.email,
                subject: options.subject,
                text: options.message,
                html: options.html
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('Message sent via SMTP: %s', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Error sending email:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send email verification link during registration.
     */
    async sendVerificationEmail(user, verifyUrl) {
        const plainMessage = `
Welcome to Our Platform, ${user.name}!

Thanks for registering with us. Please verify your email address to activate your account.

Account Details:
- Name: ${user.name}
- Email: ${user.email}
- Role: ${user.role || 'User'}

Click the following link to verify your email (expires in 24 hours):
${verifyUrl}

If you didn't create an account with us, please ignore this email.
        `;

        const htmlMessage = getBaseTemplate(
            '✨ Welcome Aboard!',
            "Let's get your account verified",
            `
            <div style="font-size: 18px; font-weight: 600; color: #1a1a1a; margin-bottom: 15px;">
                Hello ${user.name}! 👋
            </div>
            <p style="color: #4a5568; font-size: 16px; margin-bottom: 25px;">
                Thanks for registering with us! We're excited to have you on board. Please verify your email address to activate your account and get started.
            </p>
            
            <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 12px; padding: 20px; margin-bottom: 25px; border: 1px solid rgba(102, 126, 234, 0.1);">
                <div style="margin-bottom: 10px; font-size: 15px; color: #4a5568;"><strong style="color: #2d3748;">Name:</strong> ${user.name}</div>
                <div style="margin-bottom: 10px; font-size: 15px; color: #4a5568;"><strong style="color: #2d3748;">Email:</strong> ${user.email}</div>
                <div style="font-size: 15px; color: #4a5568;"><strong style="color: #2d3748;">Account:</strong> ${user.role || 'User'}</div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white !important; text-decoration: none; padding: 16px 32px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                    🔐 Verify Email Address
                </a>
            </div>
            
            <div style="background: #fff8e7; border-left: 4px solid #fbbf24; padding: 15px; margin: 25px 0; border-radius: 8px; color: #92400e; font-size: 14px;">
                <strong>⏰ Time-sensitive:</strong> This verification link will expire in 24 hours for security reasons.
            </div>
            
            <div style="background: #f8fafc; border-radius: 12px; padding: 15px; border: 1px solid #e2e8f0; word-break: break-all; font-size: 13px; color: #718096;">
                <strong style="color: #2d3748; display: block; margin-bottom: 5px;">🔗 Or copy this link:</strong>
                ${verifyUrl}
            </div>
            `
        );

        return this.sendEmail({
            email: user.email,
            subject: '🎉 Welcome! Please verify your email address',
            message: plainMessage,
            html: htmlMessage
        });
    }

    /**
     * Send password reset request email.
     */
    async sendPasswordResetEmail(user, resetUrl) {
        const plainMessage = `
Hello ${user.name || 'User'},

We received a request to reset the password for your account. If you didn't make this request, please ignore this email.

Click the link below to reset your password (valid for 10 minutes):
${resetUrl}

For security:
- Use a strong password
- Never share this link
- Contact support if you didn't request this
        `;

        const htmlMessage = getBaseTemplate(
            'Password Reset Request',
            'Secure your account',
            `
            <p style="color: #333; font-size: 16px; margin: 0 0 20px;">Hello <strong style="color: #667eea;">${user.name || 'User'}</strong>,</p>
            <p style="color: #666; font-size: 16px; margin: 0 0 20px;">We received a request to reset the password for your account. If you didn't make this request, you can safely ignore this email.</p>
            <p style="color: #666; font-size: 16px; margin: 0 0 25px;">To reset your password, click the button below. This link will expire in <strong style="color: #f59e0b;">10 minutes</strong>.</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-size: 16px; font-weight: 600; box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);">
                    Reset Password
                </a>
            </div>
            
            <div style="background: #f8f9ff; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #333; font-size: 16px; font-weight: 600; margin: 0 0 15px;">🔐 Security Tips</h3>
                <ul style="color: #666; font-size: 14px; margin: 0; padding-left: 20px; line-height: 1.6;">
                    <li style="margin-bottom: 8px;">Use a strong password that you don't use elsewhere</li>
                    <li style="margin-bottom: 8px;">Include numbers, symbols, and mixed case letters</li>
                    <li style="margin-bottom: 8px;">Never share this link with anyone</li>
                </ul>
            </div>
            `
        );

        return this.sendEmail({
            email: user.email,
            subject: '🔐 Reset Your Password - Secure Link Inside',
            message: plainMessage,
            html: htmlMessage
        });
    }

    /**
     * Send contact confirmation email to customer.
     */
    async sendContactConfirmation(contactData) {
        const plainMessage = `
Dear ${contactData.name},

Thank you for contacting us. We have received your message and our team will get back to you as soon as possible.

Your Message:
${contactData.subject ? `Subject: ${contactData.subject}\n` : ''}
${contactData.message}

Best regards,
NGTech Support Team
        `;

        const htmlMessage = getBaseTemplate(
            'Thank You for Contacting Us!',
            "We've received your inquiry",
            `
            <p style="color: #333; font-size: 16px; margin: 0 0 20px;">Dear ${contactData.name},</p>
            <p style="color: #666; font-size: 16px; margin: 0 0 20px;">We have received your message and our team will get back to you as soon as possible.</p>
            
            <div style="background: #f8f9ff; padding: 20px; border-left: 4px solid #2196F3; margin: 20px 0; border-radius: 0 8px 8px 0;">
                <h3 style="color: #2196F3; font-size: 16px; margin: 0 0 10px;">Your Message:</h3>
                ${contactData.subject ? `<p style="margin-bottom: 8px; font-size: 14px; color: #4a5568;"><strong>Subject:</strong> ${contactData.subject}</p>` : ''}
                <p style="white-space: pre-wrap; color: #4a5568; font-size: 14px;">${contactData.message}</p>
            </div>
            
            <p style="color: #666; font-size: 16px; margin: 20px 0;">We typically respond within 24-48 hours during business days.</p>
            <p style="color: #666; font-size: 16px;">If you have any urgent concerns, please don't hesitate to call us at <strong>+1 (234) 567-890</strong>.</p>
            `,
            'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)'
        );

        return this.sendEmail({
            email: contactData.email,
            subject: 'We received your message - NGTech',
            message: plainMessage,
            html: htmlMessage
        });
    }

    /**
     * Send reply email to customer.
     */
    async sendReplyEmail(contactData, replyMessage) {
        const plainMessage = `
Dear ${contactData.name},

Thank you for reaching out to us. Here's our response to your inquiry:

Our Response:
${replyMessage}

Original Message:
${contactData.subject ? `Subject: ${contactData.subject}\n` : ''}
${contactData.message}
        `;

        const htmlMessage = getBaseTemplate(
            'Response to Your Inquiry',
            'NGTech Support Team',
            `
            <p style="color: #333; font-size: 16px; margin: 0 0 20px;">Dear ${contactData.name},</p>
            <p style="color: #666; font-size: 16px; margin: 0 0 20px;">Thank you for reaching out to us. Here's our response to your inquiry:</p>
            
            <div style="background: #f4faf4; padding: 20px; border-left: 4px solid #4CAF50; margin: 20px 0; border-radius: 0 8px 8px 0;">
                <h3 style="color: #4CAF50; font-size: 16px; margin: 0 0 10px;">Our Response:</h3>
                <p style="white-space: pre-wrap; color: #2e7d32; font-size: 15px;">${replyMessage}</p>
            </div>
            
            <div style="background: #f8fafc; padding: 20px; border-left: 4px solid #90a4ae; margin: 20px 0; border-radius: 0 8px 8px 0; font-size: 14px;">
                <h4 style="color: #607d8b; margin-bottom: 8px;">Your Original Message:</h4>
                ${contactData.subject ? `<p style="margin-bottom: 8px; color: #4a5568;"><strong>Subject:</strong> ${contactData.subject}</p>` : ''}
                <p style="white-space: pre-wrap; color: #4a5568;">${contactData.message}</p>
            </div>
            
            <p style="color: #666; font-size: 16px; margin-top: 20px;">If you have any further questions, please feel free to reply to this email or contact us again.</p>
            `,
            'linear-gradient(135deg, #4CAF50 30%, #81C784 90%)'
        );

        return this.sendEmail({
            email: contactData.email,
            subject: `Response to your inquiry: ${contactData.subject || 'Your inquiry'}`,
            message: plainMessage,
            html: htmlMessage
        });
    }

    /**
     * Send notification to admin about new contact.
     */
    async sendAdminNotification(contactData) {
        const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
        const plainMessage = `
🔔 New Contact Message:
Name: ${contactData.name}
Email: ${contactData.email}
Phone: ${contactData.phone || 'N/A'}
Subject: ${contactData.subject || 'N/A'}
Date: ${new Date().toLocaleString()}

Message:
${contactData.message}
        `;

        const htmlMessage = getBaseTemplate(
            '🔔 New Contact Message',
            'Incoming visitor inquiry',
            `
            <div style="background: #fffbf5; border-radius: 12px; border: 1px solid #ffe8cc; padding: 20px; margin-bottom: 25px;">
                <div style="padding: 8px 0; border-bottom: 1px solid #ffe8cc; font-size: 15px;">
                    <strong style="color: #666;">Name:</strong> ${contactData.name}
                </div>
                <div style="padding: 8px 0; border-bottom: 1px solid #ffe8cc; font-size: 15px;">
                    <strong style="color: #666;">Email:</strong> ${contactData.email}
                </div>
                ${contactData.phone ? `
                <div style="padding: 8px 0; border-bottom: 1px solid #ffe8cc; font-size: 15px;">
                    <strong style="color: #666;">Phone:</strong> ${contactData.phone}
                </div>
                ` : ''}
                ${contactData.subject ? `
                <div style="padding: 8px 0; border-bottom: 1px solid #ffe8cc; font-size: 15px;">
                    <strong style="color: #666;">Subject:</strong> ${contactData.subject}
                </div>
                ` : ''}
                <div style="padding: 8px 0; font-size: 15px;">
                    <strong style="color: #666;">Date:</strong> ${new Date().toLocaleString()}
                </div>
            </div>
            
            <div style="background: #ffffff; padding: 20px; border-left: 4px solid #FF9800; margin: 20px 0; border-radius: 0 8px 8px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <h3 style="color: #FF9800; font-size: 16px; margin: 0 0 10px;">Message:</h3>
                <p style="white-space: pre-wrap; color: #4a5568; font-size: 14px;">${contactData.message}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.ADMIN_PANEL_URL || 'http://localhost:5173/admin'}/contacts" 
                   style="display: inline-block; padding: 12px 30px; background: #FF9800; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 15px;">
                    View in Admin Panel
                </a>
            </div>
            `,
            'linear-gradient(135deg, #FF9800 30%, #FFB74D 90%)'
        );

        return this.sendEmail({
            email: adminEmail,
            subject: `New Contact Message from ${contactData.name}`,
            message: plainMessage,
            html: htmlMessage
        });
    }

    /**
     * Send order status update email to the customer.
     */
    async sendOrderStatusEmail(order, oldStatus, newStatus, notes) {
        if (!order) return { success: false, error: 'Order is required' };

        // Support both signatures:
        // 1. sendOrderStatusEmail(order, newStatus, notes)
        // 2. sendOrderStatusEmail(order, oldStatus, newStatus, notes)
        if (arguments.length === 3 || (!notes && newStatus === undefined)) {
            notes = newStatus;
            newStatus = oldStatus;
            oldStatus = order.status || 'Updated';
        }
        if (!newStatus) {
            newStatus = order.status || 'Updated';
        }

        // Resolve customer details (handle populated and unpopulated order.user)
        let customer = order.user;
        if (!customer || typeof customer !== 'object' || !customer.email) {
            const User = require('../model/User');
            const userId = customer?._id || customer;
            if (userId) {
                try {
                    const fetchedUser = await User.findById(userId).select('name email');
                    if (fetchedUser) customer = fetchedUser;
                } catch (err) {
                    console.error('Error fetching user for order status email:', err.message);
                }
            }
        }

        const customerEmail = customer?.email || order.shippingAddress?.email;
        const customerName = customer?.name || order.shippingAddress?.name || 'Valued Customer';

        if (!customerEmail) {
            console.warn(`Order #${order._id || 'Unknown'}: No recipient email found, skipping status email.`);
            return { success: false, error: 'Recipient email not found' };
        }

        // Map status to user friendly titles, messages, and colors/gradients
        const statusDetails = {
            'Pending': {
                title: 'Order Received 📦',
                subtitle: 'We have received your order',
                message: 'Thank you for your order! We have received your request and it is currently pending confirmation. We will notify you as soon as your order status changes.',
                color: '#FFB020',
                gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
            },
            'Confirmed': {
                title: 'Order Confirmed 🎉',
                subtitle: 'Your order has been confirmed',
                message: 'Great news! Your order has been confirmed and we are getting it ready for processing. You will receive another update when it ships.',
                color: '#3b82f6',
                gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
            },
            'Processing': {
                title: 'Order Processing ⚙️',
                subtitle: 'Your order is being prepared',
                message: 'Your order is currently being processed and prepared by our warehouse team. We are working hard to ship it out to you as quickly as possible.',
                color: '#5048E5',
                gradient: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)'
            },
            'Shipped': {
                title: 'Order Shipped! 🚚',
                subtitle: 'Your package is on its way',
                message: 'Exciting news! Your order has been shipped and is on its way. You can track your shipment using the tracking information below.',
                color: '#2196F3',
                gradient: 'linear-gradient(135deg, #3b82f6 0%, #0284c7 100%)'
            },
            'Out for delivery': {
                title: 'Out for Delivery 🛵',
                subtitle: 'Your order will arrive today',
                message: 'Get ready! Your order is out for delivery with our courier partner and will reach your address today.',
                color: '#FF6B6B',
                gradient: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)'
            },
            'Delivered': {
                title: 'Order Delivered! 🎁',
                subtitle: 'Your order has arrived',
                message: 'Success! Your order has been successfully delivered to your shipping address. We hope you love your new items! Thank you for shopping with us.',
                color: '#36B37E',
                gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)'
            },
            'Cancelled': {
                title: 'Order Cancelled ❌',
                subtitle: 'Your order has been cancelled',
                message: 'We regret to inform you that your order has been cancelled. If this was a mistake or you have any questions, please contact our support team.',
                color: '#FF5630',
                gradient: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)'
            },
            'Returned': {
                title: 'Order Returned ↩️',
                subtitle: 'We received your return package',
                message: 'This email is to confirm that we have received the return package for your order. We are reviewing the returned items and will process any applicable refund shortly.',
                color: '#6554C0',
                gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)'
            },
            'Refunded': {
                title: 'Refund Processed 💰',
                subtitle: 'Your refund has been issued',
                message: 'We have processed a refund for your order. The refunded amount will be credited back to your original payment method. Depending on your financial institution, this may take 5-10 business days to appear in your account.',
                color: '#00B8D9',
                gradient: 'linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)'
            }
        };

        const details = statusDetails[newStatus] || {
            title: `Order Update: ${newStatus}`,
            subtitle: `Status changed to ${newStatus}`,
            message: `Your order status has been updated to ${newStatus}.`,
            color: '#667eea',
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        };

        const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
        const getImageUrl = (imagePath) => {
            if (!imagePath) return '';
            if (imagePath.startsWith('http')) return imagePath;
            return `${backendUrl.replace(/\/$/, '')}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
        };

        // Construct items table HTML
        let itemsHtml = '';
        if (order.orderItems && order.orderItems.length > 0) {
            itemsHtml = `
            <div style="margin: 30px 0;">
                <h3 style="color: #2d3748; font-size: 16px; margin-bottom: 15px; border-bottom: 2px solid #edf2f7; padding-bottom: 8px;">Order Summary</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 1px solid #edf2f7; text-align: left;">
                            <th style="padding: 10px 5px; color: #718096; font-size: 13px; font-weight: 600;">Product</th>
                            <th style="padding: 10px 5px; color: #718096; font-size: 13px; font-weight: 600; text-align: center;">Qty</th>
                            <th style="padding: 10px 5px; color: #718096; font-size: 13px; font-weight: 600; text-align: right;">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.orderItems.map(item => `
                            <tr style="border-bottom: 1px solid #edf2f7;">
                                <td style="padding: 12px 5px; vertical-align: middle;">
                                    <div style="display: flex; align-items: center;">
                                        <img src="${getImageUrl(item.image)}" alt="${item.name}" style="width: 45px; height: 45px; border-radius: 8px; object-fit: cover; margin-right: 12px; border: 1px solid #e2e8f0;" />
                                        <div>
                                            <div style="font-weight: 600; font-size: 14px; color: #2d3748;">${item.name}</div>
                                            ${item.selectedColor || item.selectedSize ? `
                                                <div style="font-size: 12px; color: #718096; margin-top: 2px;">
                                                    ${item.selectedColor ? `<span style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; margin-right: 4px;">Color: ${item.selectedColor}</span>` : ''} 
                                                    ${item.selectedSize ? `<span style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">Size: ${item.selectedSize}</span>` : ''}
                                                </div>
                                            ` : ''}
                                        </div>
                                    </div>
                                </td>
                                <td style="padding: 12px 5px; text-align: center; font-size: 14px; color: #4a5568; vertical-align: middle;">
                                    ${item.quantity}
                                </td>
                                <td style="padding: 12px 5px; text-align: right; font-weight: 600; font-size: 14px; color: #2d3748; vertical-align: middle;">
                                    ₹${item.price}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            `;
        }

        // Construct pricing summary HTML
        const subtotal = order.subtotalPrice || (order.orderItems || []).reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const pricingHtml = `
        <div style="background: #f8fafc; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0; margin-top: 20px;">
            <table style="width: 100%; font-size: 14px; color: #4a5568; border-collapse: collapse;">
                <tr>
                    <td style="padding: 4px 0; color: #718096;">Subtotal</td>
                    <td style="padding: 4px 0; text-align: right; font-weight: 500; color: #2d3748;">₹${subtotal}</td>
                </tr>
                ${order.shippingPrice ? `
                <tr>
                    <td style="padding: 4px 0; color: #718096;">Shipping</td>
                    <td style="padding: 4px 0; text-align: right; font-weight: 500; color: #2d3748;">₹${order.shippingPrice}</td>
                </tr>
                ` : ''}
                ${order.taxPrice ? `
                <tr>
                    <td style="padding: 4px 0; color: #718096;">Tax</td>
                    <td style="padding: 4px 0; text-align: right; font-weight: 500; color: #2d3748;">₹${order.taxPrice}</td>
                </tr>
                ` : ''}
                ${order.discountPrice ? `
                <tr>
                    <td style="padding: 4px 0; color: #718096;">Discount</td>
                    <td style="padding: 4px 0; text-align: right; font-weight: 500; color: #e53e3e;">-₹${order.discountPrice}</td>
                </tr>
                ` : ''}
                <tr style="border-top: 1px solid #edf2f7;">
                    <td style="padding: 10px 0 0; font-size: 16px; font-weight: 700; color: #2d3748;">Total</td>
                    <td style="padding: 10px 0 0; text-align: right; font-size: 18px; font-weight: 700; color: #667eea;">₹${order.totalPrice}</td>
                </tr>
            </table>
        </div>
        `;

        // Tracking URL Section
        let shippingHtml = '';
        if (newStatus === 'Shipped' && (order.trackingNumber || order.shippingCarrier)) {
            shippingHtml = `
            <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 25px 0;">
                <h4 style="color: #166534; font-size: 15px; margin: 0 0 10px; font-weight: 600;">📦 Shipment & Tracking Information</h4>
                ${order.shippingCarrier ? `<p style="margin: 0 0 5px; font-size: 14px; color: #14532d;"><strong>Carrier:</strong> ${order.shippingCarrier}</p>` : ''}
                ${order.trackingNumber ? `<p style="margin: 0 0 10px; font-size: 14px; color: #14532d;"><strong>Tracking Number:</strong> <code style="background: white; padding: 2px 6px; border-radius: 4px; border: 1px solid #bbf7d0;">${order.trackingNumber}</code></p>` : ''}
                ${order.trackingUrl ? `
                <div style="margin-top: 15px;">
                    <a href="${order.trackingUrl}" target="_blank" style="display: inline-block; background: #166534; color: white !important; text-decoration: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; font-size: 13px;">
                        🔗 Track Shipment
                    </a>
                </div>
                ` : ''}
            </div>
            `;
        }

        // Shipping Address Section
        let addressHtml = '';
        if (order.shippingAddress) {
            addressHtml = `
            <div style="margin-top: 25px; border-top: 1px solid #edf2f7; padding-top: 20px;">
                <h4 style="color: #2d3748; font-size: 14px; margin-bottom: 8px; font-weight: 600;">📍 Delivery Details</h4>
                <p style="color: #4a5568; font-size: 14px; margin: 0; line-height: 1.5;">
                    <strong>Address:</strong> ${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}, ${order.shippingAddress.country}<br/>
                    <strong>Phone:</strong> ${order.shippingAddress.mobile}
                </p>
            </div>
            `;
        }

        // Notes / Instructions section
        let notesHtml = '';
        if (notes) {
            notesHtml = `
            <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 25px 0; border-radius: 0 8px 8px 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                <strong>💡 Note from Support:</strong><br/>
                ${notes}
            </div>
            `;
        }

        const plainMessage = `
Hello ${customerName},

${details.message}

Order Details:
- Order ID: #${order._id.toString().toUpperCase()}
- Current Status: ${newStatus}
${notes ? `- Note: ${notes}\n` : ''}
- Total Price: ₹${order.totalPrice}

Track your order details here:
${process.env.FRONTEND_URL || 'http://localhost:5173'}/order-details/${order._id}
        `;

        const htmlMessage = getBaseTemplate(
            details.title,
            details.subtitle,
            `
            <div style="text-align: center; margin-bottom: 25px;">
                <span style="display: inline-block; padding: 8px 18px; background-color: ${details.color}15; color: ${details.color}; font-weight: 700; border-radius: 50px; font-size: 13px; border: 1px solid ${details.color}30; text-transform: uppercase; letter-spacing: 0.8px;">
                    ${newStatus}
                </span>
            </div>
            
            <div style="font-size: 18px; font-weight: 600; color: #1a1a1a; margin-bottom: 15px;">
                Hello ${customerName}! 👋
            </div>
            <p style="color: #4a5568; font-size: 15px; margin-bottom: 25px; line-height: 1.6;">
                ${details.message}
            </p>
            
            ${notesHtml}
            ${shippingHtml}
            
            <div style="background: #ffffff; border-radius: 12px; padding: 20px; margin-bottom: 25px; border: 1px solid #edf2f7;">
                <div style="margin-bottom: 8px; font-size: 14px; color: #4a5568;"><strong style="color: #2d3748;">Order ID:</strong> #${order._id.toString().toUpperCase()}</div>
                <div style="margin-bottom: 8px; font-size: 14px; color: #4a5568;"><strong style="color: #2d3748;">Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}</div>
                <div style="margin-bottom: 8px; font-size: 14px; color: #4a5568;"><strong style="color: #2d3748;">Payment:</strong> ${order.paymentMethod} (${order.paymentStatus})</div>
                ${addressHtml}
            </div>
            
            ${itemsHtml}
            ${pricingHtml}
            
            <div style="text-align: center; margin: 35px 0 10px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/order-details/${order._id}" style="display: inline-block; background: ${details.gradient}; color: white !important; text-decoration: none; padding: 15px 35px; border-radius: 50px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 15px ${details.color}40; letter-spacing: -0.2px;">
                    📦 View Order Details
                </a>
            </div>
            `,
            details.gradient
        );

        return this.sendEmail({
            email: customerEmail,
            subject: `Update on Order #${order._id.toString().substring(0, 8).toUpperCase()}: ${newStatus}`,
            message: plainMessage,
            html: htmlMessage
        });
    }

    /**
     * Send email reply to customer's contact message.
     */
    async sendReplyEmail(contact, replyText) {
        if (!contact?.email) {
            return { success: false, error: 'Customer email is missing' };
        }

        const plainMessage = `
Hello ${contact.name || 'Valued Customer'},

Thank you for reaching out to us. Here is the response to your inquiry:

"${replyText}"

---
Your Original Message:
Subject: ${contact.subject || 'Inquiry'}
Message: ${contact.message || ''}

If you have any further questions, feel free to reply to this email.

Best regards,
${process.env.COMPANY_NAME || 'NGSTORE'} Support Team
        `;

        const htmlMessage = getBaseTemplate(
            '💬 Response to Your Inquiry',
            `Re: ${contact.subject || 'Contact Support'}`,
            `
            <div style="font-size: 18px; font-weight: 600; color: #1a1a1a; margin-bottom: 15px;">
                Hello ${contact.name || 'Customer'}! 👋
            </div>
            <p style="color: #4a5568; font-size: 15px; margin-bottom: 20px; line-height: 1.6;">
                Thank you for getting in touch with us. Our support team has reviewed your inquiry and replied below:
            </p>
            
            <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 18px; margin-bottom: 25px; border-radius: 8px; color: #166534; font-size: 15px; line-height: 1.6;">
                <strong style="display: block; margin-bottom: 6px; color: #14532d;">Our Response:</strong>
                ${replyText.replace(/\n/g, '<br>')}
            </div>
            
            <div style="background: #f8fafc; border-radius: 12px; padding: 18px; margin-bottom: 25px; border: 1px solid #e2e8f0;">
                <div style="font-size: 13px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">
                    Your Original Message
                </div>
                ${contact.subject ? `<div style="margin-bottom: 6px; font-size: 14px; color: #334155;"><strong>Subject:</strong> ${contact.subject}</div>` : ''}
                <div style="font-size: 14px; color: #475569; font-style: italic;">"${contact.message || ''}"</div>
            </div>
            
            <p style="color: #64748b; font-size: 14px; margin-top: 20px;">
                If you have any further questions or need additional assistance, simply reply to this email or visit our store.
            </p>
            `
        );

        return this.sendEmail({
            email: contact.email,
            subject: `Response to: ${contact.subject || 'Your Support Inquiry'}`,
            message: plainMessage,
            html: htmlMessage
        });
    }

    /**
     * Send confirmation email when a user submits contact form.
     */
    async sendContactConfirmation(contact) {
        if (!contact?.email) return { success: false, error: 'Email missing' };

        const plainMessage = `
Hello ${contact.name || 'Customer'},

We have received your message regarding "${contact.subject || 'General Inquiry'}". Our support team is reviewing it and will respond to you shortly.

Best regards,
${process.env.COMPANY_NAME || 'NGSTORE'}
        `;

        const htmlMessage = getBaseTemplate(
            '📨 Message Received',
            'We have received your inquiry',
            `
            <div style="font-size: 18px; font-weight: 600; color: #1a1a1a; margin-bottom: 15px;">
                Hello ${contact.name || 'Customer'}! 👋
            </div>
            <p style="color: #4a5568; font-size: 15px; margin-bottom: 20px; line-height: 1.6;">
                Thank you for contacting us! We have received your inquiry regarding <strong>"${contact.subject || 'Support'}"</strong>. Our team will review your message and get back to you as soon as possible.
            </p>
            `
        );

        return this.sendEmail({
            email: contact.email,
            subject: `We received your message: ${contact.subject || 'Inquiry'}`,
            message: plainMessage,
            html: htmlMessage
        });
    }

    /**
     * Send notification to Admin when a new contact inquiry arrives.
     */
    async sendAdminNotification(contact) {
        const adminEmail = process.env.EMAIL_USER;
        if (!adminEmail) return { success: false, error: 'Admin email not configured' };

        const plainMessage = `
New Contact Inquiry Received:

Name: ${contact.name}
Email: ${contact.email}
Phone: ${contact.phone || 'N/A'}
Subject: ${contact.subject || 'N/A'}
Message: ${contact.message}
        `;

        const htmlMessage = getBaseTemplate(
            '🔔 New Contact Message',
            `Inquiry from ${contact.name}`,
            `
            <div style="background: #f8fafc; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0;">
                <div style="margin-bottom: 8px;"><strong>From:</strong> ${contact.name} (&lt;${contact.email}&gt;)</div>
                <div style="margin-bottom: 8px;"><strong>Phone:</strong> ${contact.phone || 'N/A'}</div>
                <div style="margin-bottom: 8px;"><strong>Subject:</strong> ${contact.subject || 'N/A'}</div>
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
                    <strong>Message:</strong>
                    <p style="margin-top: 5px; color: #334155; white-space: pre-wrap;">${contact.message}</p>
                </div>
            </div>
            `
        );

        return this.sendEmail({
            email: adminEmail,
            subject: `🔔 New Contact Inquiry: ${contact.subject || contact.name}`,
            message: plainMessage,
            html: htmlMessage
        });
    }
}

module.exports = new EmailService();
