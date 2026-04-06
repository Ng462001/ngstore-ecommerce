require('dotenv').config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const connectDB = require("./config/db");

// Connect to database
connectDB();

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
