const User = require('../model/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendEmail = require('../services/sendEmail');


// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please add all fields' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        phone
    });

    if (user) {
        // Send email verification link
        const verificationToken = user.getVerificationToken();
        await user.save({ validateBeforeSave: false });

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const verifyUrl = `${frontendUrl}/verify-email/${verificationToken}`;

        // Modern HTML email template
        const htmlMessage = `
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
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }
                
                .email-container {
                    max-width: 600px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 24px;
                    overflow: hidden;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                    animation: slideIn 0.5s ease-out;
                }
                
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 40px 30px;
                    text-align: center;
                }
                
                .header h1 {
                    color: white;
                    font-size: 32px;
                    font-weight: 700;
                    margin-bottom: 10px;
                    letter-spacing: -0.5px;
                }
                
                .header p {
                    color: rgba(255,255,255,0.9);
                    font-size: 16px;
                    font-weight: 400;
                }
                
                .content {
                    padding: 40px 30px;
                    background: #ffffff;
                }
                
                .greeting {
                    font-size: 20px;
                    font-weight: 600;
                    color: #1a1a1a;
                    margin-bottom: 15px;
                }
                
                .message {
                    color: #4a5568;
                    font-size: 16px;
                    line-height: 1.6;
                    margin-bottom: 30px;
                }
                
                .user-info {
                    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                    border-radius: 16px;
                    padding: 25px;
                    margin-bottom: 30px;
                    border: 1px solid rgba(102, 126, 234, 0.1);
                }
                
                .user-info-item {
                    display: flex;
                    align-items: center;
                    margin-bottom: 12px;
                }
                
                .user-info-item:last-child {
                    margin-bottom: 0;
                }
                
                .user-info-label {
                    font-weight: 600;
                    color: #2d3748;
                    width: 80px;
                }
                
                .user-info-value {
                    color: #4a5568;
                    flex: 1;
                }
                
                .verify-button {
                    display: inline-block;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    text-decoration: none;
                    padding: 16px 32px;
                    border-radius: 50px;
                    font-weight: 600;
                    font-size: 16px;
                    margin: 20px 0;
                    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                    transition: transform 0.2s, box-shadow 0.2s;
                    border: none;
                    cursor: pointer;
                }
                
                .verify-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
                }
                
                .link-section {
                    background: #f8fafc;
                    border-radius: 12px;
                    padding: 20px;
                    margin: 20px 0;
                    border: 1px solid #e2e8f0;
                }
                
                .link-label {
                    font-size: 14px;
                    font-weight: 600;
                    color: #2d3748;
                    margin-bottom: 8px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .verification-link {
                    word-break: break-all;
                    color: #667eea;
                    font-size: 14px;
                    text-decoration: none;
                    background: white;
                    padding: 10px;
                    border-radius: 8px;
                    border: 1px solid #e2e8f0;
                    display: block;
                }
                
                .note {
                    background: #fff8e7;
                    border-left: 4px solid #fbbf24;
                    padding: 15px;
                    margin: 25px 0;
                    border-radius: 8px;
                    color: #92400e;
                    font-size: 14px;
                }
                
                .note strong {
                    color: #b45309;
                }
                
                .footer {
                    background: #1a202c;
                    padding: 30px;
                    text-align: center;
                    border-top: 1px solid #2d3748;
                }
                
                .footer p {
                    color: #a0aec0;
                    font-size: 14px;
                    line-height: 1.6;
                    margin-bottom: 15px;
                }
                
                .social-links {
                    margin: 20px 0;
                }
                
                .social-link {
                    display: inline-block;
                    margin: 0 10px;
                    color: #a0aec0;
                    text-decoration: none;
                    font-size: 14px;
                    transition: color 0.2s;
                }
                
                .social-link:hover {
                    color: #667eea;
                }
                
                .expiry-notice {
                    font-size: 13px;
                    color: #718096;
                    margin-top: 20px;
                    padding-top: 20px;
                    border-top: 1px solid #e2e8f0;
                }
                
                @media only screen and (max-width: 600px) {
                    .content {
                        padding: 30px 20px;
                    }
                    
                    .header h1 {
                        font-size: 28px;
                    }
                    
                    .verify-button {
                        display: block;
                        text-align: center;
                    }
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="header">
                    <h1>✨ Welcome Aboard!</h1>
                    <p>Let's get your account verified</p>
                </div>
                
                <div class="content">
                    <div class="greeting">
                        Hello ${user.name}! 👋
                    </div>
                    
                    <div class="message">
                        Thanks for registering with us! We're excited to have you on board. 
                        Please verify your email address to activate your account and get started.
                    </div>
                    
                    <div class="user-info">
                        <div class="user-info-item">
                            <span class="user-info-label">Name:</span>
                            <span class="user-info-value">${user.name}</span>
                        </div>
                        <div class="user-info-item">
                            <span class="user-info-label">Email:</span>
                            <span class="user-info-value">${user.email}</span>
                        </div>
                        <div class="user-info-item">
                            <span class="user-info-label">Account:</span>
                            <span class="user-info-value">${user.role || 'User'}</span>
                        </div>
                    </div>
                    
                    <div style="text-align: center;">
                        <a href="${verifyUrl}" class="verify-button">
                            🔐 Verify Email Address
                        </a>
                    </div>
                    
                    <div class="note">
                        <strong>⏰ Time-sensitive:</strong> This verification link will expire in 24 hours for security reasons.
                    </div>
                    
                    <div class="link-section">
                        <div class="link-label">🔗 Or copy this link:</div>
                        <div class="verification-link">${verifyUrl}</div>
                    </div>
                    
                    <div class="expiry-notice">
                        If you didn't create an account with us, please ignore this email or contact our support team if you have concerns.
                    </div>
                </div>
                
                <div class="footer">
                    <p style="color: #a0aec0; font-size: 16px; font-weight: 600; margin-bottom: 10px;">
                        Need help?
                    </p>
                    <p>
                        Contact us at <a href="mailto:support@yourapp.com" style="color: #667eea; text-decoration: none;">support@yourapp.com</a>
                    </p>
                    
                    <div class="social-links">
                        <a href="#" class="social-link">Twitter</a>
                        <a href="#" class="social-link">LinkedIn</a>
                        <a href="#" class="social-link">GitHub</a>
                    </div>
                    
                    <p style="margin-top: 20px;">
                        © ${new Date().getFullYear()} Your Company Name. All rights reserved.
                    </p>
                    <p style="font-size: 12px; color: #4a5568;">
                        123 Business Street, Suite 100<br>
                        San Francisco, CA 94105
                    </p>
                </div>
            </div>
        </body>
        </html>
        `;

        // Plain text fallback
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

Need help? Contact us at support@yourapp.com

© ${new Date().getFullYear()} Your Company Name
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: '🎉 Welcome! Please verify your email address',
                message: plainMessage,
                html: htmlMessage // Make sure your sendEmail function supports HTML
            });

            res.status(201).json({
                message: 'Registration successful! A verification email has been sent to your email address.',
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            });
        } catch (err) {
            user.emailVerificationToken = undefined;
            user.emailVerificationExpire = undefined;
            await user.save({ validateBeforeSave: false });

            console.error('Email sending error:', err);
            return res.status(500).json({
                message: 'Registration successful but verification email could not be sent. Please contact support.',
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            });
        }
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};
// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.status === 'Inactive') {
        return res.status(401).json({ message: 'Please verify your email to activate your account.' });
    }

    if (await user.matchPassword(password)) {
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id)
        });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
};

// @desc    Get user data
// @route   GET /api/users/me
// @access  Private
const getMe = async (req, res) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        addresses: user.addresses,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    });
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    const user = await User.findById(req.user.id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.phone = req.body.phone || user.phone;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            role: updatedUser.role,
            addresses: updatedUser.addresses,
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.updatedAt,
            token: generateToken(updatedUser._id),
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    if (user && (await user.matchPassword(currentPassword))) {
        user.password = newPassword;
        await user.save();
        res.json({ message: 'Password updated successfully' });
    } else {
        res.status(400).json({ message: 'Invalid current password' });
    }
};

// @desc    Add address
// @route   POST /api/users/address
// @access  Private
const addAddress = async (req, res) => {
    const user = await User.findById(req.user.id);

    if (user) {
        user.addresses.push(req.body);
        const updatedUser = await user.save();
        res.json(updatedUser.addresses);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Update address
// @route   PUT /api/users/address/:id
// @access  Private
const updateAddress = async (req, res) => {
    const user = await User.findById(req.user.id);

    if (user) {
        const address = user.addresses.id(req.params.id);
        if (address) {
            address.street = req.body.street || address.street;
            address.city = req.body.city || address.city;
            address.state = req.body.state || address.state;
            address.zipCode = req.body.zipCode || address.zipCode;
            address.country = req.body.country || address.country;
            address.mobile = req.body.mobile || address.mobile;

            const updatedUser = await user.save();
            res.json(updatedUser.addresses);
        } else {
            res.status(404).json({ message: 'Address not found' });
        }
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Delete address
// @route   DELETE /api/users/address/:id
// @access  Private
const deleteAddress = async (req, res) => {
    const user = await User.findById(req.user.id);

    if (user) {
        user.addresses = user.addresses.filter(
            (addr) => addr._id.toString() !== req.params.id
        );
        const updatedUser = await user.save();
        res.json(updatedUser.addresses);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Forgot password
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return res.status(404).json({ message: 'There is no user with that email' });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Beautiful HTML email template
    const htmlMessage = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            </style>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Inter', Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <!-- Main Card -->
                <div style="background: white; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); overflow: hidden;">
                    
                    <!-- Header with gradient -->
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Password Reset Request</h1>
                        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Secure your account</p>
                    </div>
                    
                    <!-- Content -->
                    <div style="padding: 40px 30px;">
                        <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">Hello <strong style="color: #667eea;">${user.name || 'User'}</strong>,</p>
                        
                        <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">We received a request to reset the password for your account. If you didn't make this request, you can safely ignore this email.</p>
                        
                        <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">To reset your password, click the button below. This link will expire in <strong style="color: #f59e0b;">10 minutes</strong>.</p>
                        
                        <!-- Reset Button -->
                        <div style="text-align: center; margin: 35px 0;">
                            <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-size: 16px; font-weight: 600; letter-spacing: 0.5px; box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3); transition: all 0.3s ease;">Reset Password</a>
                        </div>
                        
                        <!-- Security Tips -->
                        <div style="background: #f8f9ff; border-radius: 12px; padding: 20px; margin: 20px 0;">
                            <h3 style="color: #333; font-size: 16px; font-weight: 600; margin: 0 0 15px;">🔐 Security Tips</h3>
                            <ul style="color: #666; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
                                <li style="margin-bottom: 8px;">Use a strong password that you don't use elsewhere</li>
                                <li style="margin-bottom: 8px;">Include numbers, symbols, and mixed case letters</li>
                                <li style="margin-bottom: 8px;">Never share this link with anyone</li>
                            </ul>
                        </div>
                        
                        <!-- Footer Note -->
                        <p style="color: #999; font-size: 14px; line-height: 1.6; margin: 25px 0 0; text-align: center;">
                            Didn't request this? Please <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/contact" style="color: #667eea; text-decoration: none;">contact support</a> immediately.
                        </p>
                    </div>
                    
                    <!-- Footer -->
                    <div style="background: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #e9ecef;">
                        <p style="color: #999; font-size: 14px; margin: 0 0 10px;">&copy; ${new Date().getFullYear()} ${process.env.COMPANY_NAME}. All rights reserved.</p>
                        <p style="color: #999; font-size: 12px; margin: 0;">This email was sent to ${user.email}</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;

    // Plain text version as fallback
    const textMessage = `Hello ${user.name || 'User'},\n\nWe received a request to reset the password for your account. If you didn't make this request, please ignore this email.\n\nClick the link below to reset your password (valid for 10 minutes):\n${resetUrl}\n\nFor security:\n- Use a strong password\n- Never share this link\n- Contact support if you didn't request this\n\n© ${new Date().getFullYear()} ${process.env.COMPANY_NAME}. All rights reserved.`;

    try {
        await sendEmail({
            email: user.email,
            subject: '🔐 Reset Your Password - Secure Link Inside',
            message: textMessage, // Plain text fallback
            html: htmlMessage // HTML version
        });

        res.status(200).json({
            success: true,
            message: 'Password reset email sent successfully. Please check your inbox.'
        });
    } catch (err) {
        console.error('Email could not be sent. Error:', err);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        res.status(500).json({
            message: 'Failed to send reset email. Please try again later.'
        });
    }
};

// @desc    Reset password
// @route   PUT /api/users/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
    // Get hashed token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).json({ message: 'Invalid token or token has expired' });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
        success: true,
        token: generateToken(user._id)
    });
};

// @desc    Verify email address
// @route   PUT /api/users/verifyemail/:token
// @access  Public
const verifyEmail = async (req, res) => {
    // Get hashed token
    const verificationToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        emailVerificationToken: verificationToken,
        emailVerificationExpire: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    // Set status to Active
    user.status = 'Active';
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    res.status(200).json({
        message: 'Email verified successfully. You can now log in.'
    });
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    addAddress,
    updateAddress,
    deleteAddress,
    updateUserProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    verifyEmail
};
