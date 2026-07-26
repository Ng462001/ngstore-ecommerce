require('dotenv').config();
const dns = require('dns');

if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const PORT = process.env.PORT || 3000;

const app = express();

// Middleware
app.use(cors({
    origin: ["http://localhost:5173", "https://ngstore-ecommerce.vercel.app"],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/support", require("./routes/supportRoutes"));
app.use("/api/return-exchange", require("./routes/returnExchangeRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));

//Server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
