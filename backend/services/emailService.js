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
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: process.env.EMAIL_PORT || 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    /**
     * General utility method for sending emails.
     * Backwards-compatible replacement for the old sendEmail.js helper.
     */
    async sendEmail(options) {
        try {
            const mailOptions = {
                from: `"${process.env.COMPANY_NAME || 'NGSTORE'}" <${process.env.EMAIL_USER}>`,
                to: options.email,
                subject: options.subject,
                text: options.message,
                html: options.html
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('Message sent: %s', info.messageId);
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
}

module.exports = new EmailService();
