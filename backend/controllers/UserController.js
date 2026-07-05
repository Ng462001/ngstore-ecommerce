const User = require('../model/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const emailService = require('../services/emailService');


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

        try {
            await emailService.sendVerificationEmail(user, verifyUrl);

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

    try {
        await emailService.sendPasswordResetEmail(user, resetUrl);

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
