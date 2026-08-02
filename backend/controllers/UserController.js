const User = require('../model/User');
const jwt = require('jsonwebtoken');
const emailService = require('../services/emailService');
const crypto = require('crypto');

// Generate JWT
function generateToken(id) {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
}

class UserController {

    // Register a new user
    static registerUser = async (req, res) => {
        const { name, email, password, phone } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email address.' });
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

            const frontendUrl = process.env.FRONTEND_URL;
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

    // Login User
    static loginUser = async (req, res) => {
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

    // Get Individual User data
    static getMe = async (req, res) => {
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

    // Update User Profile
    static updateUserProfile = async (req, res) => {

        const { name, email, phone } = req.body;

        if (phone && !/^\d{10}$/.test(phone)) {
            return res.status(400).json({ message: 'Phone number must be exactly 10 digits' });
        }

        const user = await User.findById(req.user.id);

        if (user) {
            user.name = name || user.name;
            user.email = email || user.email;
            user.phone = phone || user.phone;

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

    // Change Password of user
    static changePassword = async (req, res) => {

        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user.id).select('+password');

        if (currentPassword === newPassword) {
            return res.status(400).json({ message: 'New password and Current password should not be same' });
        }

        if (user && (await user.matchPassword(currentPassword))) {
            user.password = newPassword;
            await user.save();
            res.json({ message: 'Password updated successfully' });
        } else {
            res.status(400).json({ message: 'Invalid current password' });
        }
    };

    // Add Address of user
    static addAddress = async (req, res) => {
        const user = await User.findById(req.user.id);

        if (user) {
            user.addresses.push(req.body);
            const updatedUser = await user.save();
            res.json(updatedUser.addresses);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    };

    // Update Address of user
    static updateAddress = async (req, res) => {

        const { street, city, state, zipCode, country, mobile } = req.body;

        const user = await User.findById(req.user.id);

        if (user) {
            const address = user.addresses.id(req.params.id);
            if (address) {
                address.street = street || address.street;
                address.city = city || address.city;
                address.state = state || address.state;
                address.zipCode = zipCode || address.zipCode;
                address.country = country || address.country;
                address.mobile = mobile || address.mobile;

                const updatedUser = await user.save();

                res.json(updatedUser.addresses);
            } else {
                res.status(404).json({ message: 'Address not found' });
            }
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    };

    // Delete Address of user
    static deleteAddress = async (req, res) => {
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

    // Forgot Password of user
    static forgotPassword = async (req, res) => {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json({ message: 'There is no user registered with this email address.' });
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

    // Reset Password of user
    static resetPassword = async (req, res) => {
        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        }).select('+password');

        if (!user) {
            return res.status(400).json({ message: 'Invalid token or token has expired' });
        }

        // Check if new password is the same as the old password
        const isMatch = await user.matchPassword(req.body.password);
        if (isMatch) {
            return res.status(400).json({ message: 'New password must be different from your old password.' });
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({
            message: 'Password reset successful. You can now login with your new password.',
            success: true,
            token: generateToken(user._id)
        });
    };

    // Verify Email of user
    static verifyEmail = async (req, res) => {
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
        await user.save();

        res.status(200).json({
            message: 'Email verified successfully. You can now log in.'
        });
    };

    // Get User Wishlist
    static getWishlist = async (req, res) => {
        try {
            const user = await User.findById(req.user.id).populate('wishlist');
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json({ success: true, wishlist: user.wishlist || [] });
        } catch (error) {
            console.error('Error in getWishlist:', error);
            res.status(500).json({ message: 'Failed to fetch wishlist' });
        }
    };

    // Add Item to Wishlist
    static addToWishlist = async (req, res) => {
        try {
            const { productId } = req.params;
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            if (!user.wishlist.includes(productId)) {
                user.wishlist.push(productId);
                await user.save();
            }

            const updatedUser = await User.findById(req.user.id).populate('wishlist');
            res.status(200).json({ success: true, message: 'Added to wishlist', wishlist: updatedUser.wishlist });
        } catch (error) {
            console.error('Error in addToWishlist:', error);
            res.status(500).json({ message: 'Failed to add item to wishlist' });
        }
    };

    // Remove Item from Wishlist
    static removeFromWishlist = async (req, res) => {
        try {
            const { productId } = req.params;
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
            await user.save();

            const updatedUser = await User.findById(req.user.id).populate('wishlist');
            res.status(200).json({ success: true, message: 'Removed from wishlist', wishlist: updatedUser.wishlist });
        } catch (error) {
            console.error('Error in removeFromWishlist:', error);
            res.status(500).json({ message: 'Failed to remove item from wishlist' });
        }
    };

}

module.exports = UserController;