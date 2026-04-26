const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        // Create transporter
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: process.env.EMAIL_PORT || 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    // Send contact confirmation email to customer
    async sendContactConfirmation(contactData) {
        try {
            const mailOptions = {
                from: `"${process.env.COMPANY_NAME || 'NGTech'}" <${process.env.EMAIL_USER}>`,
                to: contactData.email,
                subject: 'We received your message - NGTech',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                line-height: 1.6;
                                color: #333;
                            }
                            .container {
                                max-width: 600px;
                                margin: 0 auto;
                                padding: 20px;
                            }
                            .header {
                                background: linear-gradient(45deg, #2196F3 30%, #21CBF3 90%);
                                color: white;
                                padding: 30px;
                                text-align: center;
                                border-radius: 10px 10px 0 0;
                            }
                            .content {
                                background: #f9f9f9;
                                padding: 30px;
                                border-radius: 0 0 10px 10px;
                            }
                            .message-box {
                                background: white;
                                padding: 20px;
                                border-left: 4px solid #2196F3;
                                margin: 20px 0;
                            }
                            .footer {
                                text-align: center;
                                margin-top: 30px;
                                padding-top: 20px;
                                border-top: 1px solid #ddd;
                                color: #666;
                                font-size: 14px;
                            }
                            .button {
                                display: inline-block;
                                padding: 12px 30px;
                                background: linear-gradient(45deg, #2196F3 30%, #21CBF3 90%);
                                color: white;
                                text-decoration: none;
                                border-radius: 5px;
                                margin-top: 20px;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>Thank You for Contacting Us!</h1>
                            </div>
                            <div class="content">
                                <p>Dear ${contactData.name},</p>
                                <p>We have received your message and our team will get back to you as soon as possible.</p>
                                
                                <div class="message-box">
                                    <h3>Your Message:</h3>
                                    ${contactData.subject ? `<p><strong>Subject:</strong> ${contactData.subject}</p>` : ''}
                                    <p>${contactData.message}</p>
                                </div>
                                
                                <p>We typically respond within 24-48 hours during business days.</p>
                                
                                <p>If you have any urgent concerns, please don't hesitate to call us at <strong>+1 (234) 567-890</strong>.</p>
                                
                                <div class="footer">
                                    <p>Best regards,<br><strong>NGTech Support Team</strong></p>
                                    <p>This is an automated message. Please do not reply to this email.</p>
                                </div>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('Confirmation email sent:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Error sending confirmation email:', error);
            return { success: false, error: error.message };
        }
    }

    // Send reply email to customer
    async sendReplyEmail(contactData, replyMessage) {
        try {
            const mailOptions = {
                from: `"${process.env.COMPANY_NAME || 'NGTech Support'}" <${process.env.EMAIL_USER}>`,
                to: contactData.email,
                subject: `Response to your inquiry: ${contactData.subject || 'Your inquiry'}`,
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                line-height: 1.6;
                                color: #333;
                            }
                            .container {
                                max-width: 600px;
                                margin: 0 auto;
                                padding: 20px;
                            }
                            .header {
                                background: linear-gradient(45deg, #2196F3 30%, #21CBF3 90%);
                                color: white;
                                padding: 30px;
                                text-align: center;
                                border-radius: 10px 10px 0 0;
                            }
                            .content {
                                background: #f9f9f9;
                                padding: 30px;
                                border-radius: 0 0 10px 10px;
                            }
                            .reply-box {
                                background: white;
                                padding: 20px;
                                border-left: 4px solid #4CAF50;
                                margin: 20px 0;
                            }
                            .original-message {
                                background: #f5f5f5;
                                padding: 15px;
                                border-left: 3px solid #999;
                                margin: 20px 0;
                                font-size: 14px;
                            }
                            .footer {
                                text-align: center;
                                margin-top: 30px;
                                padding-top: 20px;
                                border-top: 1px solid #ddd;
                                color: #666;
                                font-size: 14px;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>Response to Your Inquiry</h1>
                            </div>
                            <div class="content">
                                <p>Dear ${contactData.name},</p>
                                <p>Thank you for reaching out to us. Here's our response to your inquiry:</p>
                                
                                <div class="reply-box">
                                    <h3>Our Response:</h3>
                                    <p style="white-space: pre-wrap;">${replyMessage}</p>
                                </div>
                                
                                <div class="original-message">
                                    <h4>Your Original Message:</h4>
                                    ${contactData.subject ? `<p><strong>Subject:</strong> ${contactData.subject}</p>` : ''}
                                    <p>${contactData.message}</p>
                                </div>
                                
                                <p>If you have any further questions, please feel free to contact us again.</p>
                                
                                <div class="footer">
                                    <p>Best regards,<br><strong>NGTech Support Team</strong></p>
                                    <p>Email: support@ngtech.com | Phone: +1 (234) 567-890</p>
                                </div>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('Reply email sent:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Error sending reply email:', error);
            return { success: false, error: error.message };
        }
    }

    // Send notification to admin about new contact
    async sendAdminNotification(contactData) {
        try {
            const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

            const mailOptions = {
                from: `"${process.env.COMPANY_NAME || 'NGTech'}" <${process.env.EMAIL_USER}>`,
                to: adminEmail,
                subject: `New Contact Message from ${contactData.name}`,
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                line-height: 1.6;
                                color: #333;
                            }
                            .container {
                                max-width: 600px;
                                margin: 0 auto;
                                padding: 20px;
                            }
                            .header {
                                background: #FF9800;
                                color: white;
                                padding: 20px;
                                text-align: center;
                                border-radius: 10px 10px 0 0;
                            }
                            .content {
                                background: #f9f9f9;
                                padding: 30px;
                                border-radius: 0 0 10px 10px;
                            }
                            .info-row {
                                padding: 10px;
                                border-bottom: 1px solid #ddd;
                            }
                            .info-row:last-child {
                                border-bottom: none;
                            }
                            .label {
                                font-weight: bold;
                                color: #666;
                            }
                            .message-box {
                                background: white;
                                padding: 20px;
                                border-left: 4px solid #FF9800;
                                margin: 20px 0;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h2>🔔 New Contact Message</h2>
                            </div>
                            <div class="content">
                                <div class="info-row">
                                    <span class="label">Name:</span> ${contactData.name}
                                </div>
                                <div class="info-row">
                                    <span class="label">Email:</span> ${contactData.email}
                                </div>
                                ${contactData.phone ? `
                                <div class="info-row">
                                    <span class="label">Phone:</span> ${contactData.phone}
                                </div>
                                ` : ''}
                                ${contactData.subject ? `
                                <div class="info-row">
                                    <span class="label">Subject:</span> ${contactData.subject}
                                </div>
                                ` : ''}
                                <div class="info-row">
                                    <span class="label">Date:</span> ${new Date().toLocaleString()}
                                </div>
                                
                                <div class="message-box">
                                    <h3>Message:</h3>
                                    <p style="white-space: pre-wrap;">${contactData.message}</p>
                                </div>
                                
                                <p style="text-align: center; margin-top: 30px;">
                                    <a href="${process.env.ADMIN_PANEL_URL || 'http://localhost:5173/admin'}/contacts" 
                                       style="display: inline-block; padding: 12px 30px; background: #FF9800; color: white; text-decoration: none; border-radius: 5px;">
                                        View in Admin Panel
                                    </a>
                                </p>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('Admin notification sent:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Error sending admin notification:', error);
            return { success: false, error: error.message };
        }
    }

    // Verify email configuration
    async verifyConnection() {
        try {
            await this.transporter.verify();
            console.log('Email service is ready to send emails');
            return true;
        } catch (error) {
            console.error('Email service verification failed:', error);
            return false;
        }
    }
}

module.exports = new EmailService();
