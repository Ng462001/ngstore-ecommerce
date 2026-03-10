// Script to create an admin user
const mongoose = require('mongoose');
const User = require('./model/User');
require('dotenv').config();

const createAdminUser = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Admin user details
        const adminData = {
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'admin123',  // Change this to a secure password
            role: 'admin'
        };

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminData.email });

        if (existingAdmin) {
            console.log('⚠️  Admin user already exists with email:', adminData.email);

            // Update to admin role if not already
            if (existingAdmin.role !== 'admin') {
                existingAdmin.role = 'admin';
                await existingAdmin.save();
                console.log('✅ Updated existing user to admin role');
            }
        } else {
            // Create new admin user
            const admin = await User.create(adminData);
            console.log('✅ Admin user created successfully!');
            console.log('📧 Email:', adminData.email);
            console.log('🔑 Password:', adminData.password);
        }

        console.log('\n🎉 You can now login with these credentials:');
        console.log('   Email: admin@example.com');
        console.log('   Password: admin123');
        console.log('\n⚠️  IMPORTANT: Change the password after first login!\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

createAdminUser();
