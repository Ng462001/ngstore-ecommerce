> [!IMPORTANT]
> **⚡ Note on Backend Initial Load Time (Render Free Tier):**  
> The backend server for this project is hosted on **Render** (Free Tier). If the backend service has been idle, the initial request or cold start may take **1 to 2 minutes** to wake up the server. Please allow 1–2 minutes for data and API responses to load on your initial visit!

# 🛍️ NG Store - Modern MERN Stack E-Commerce Platform

A feature-rich, full-stack E-Commerce web application built using the **MERN** stack (MongoDB, Express, React, Node.js). **NG Store** provides an end-to-end shopping experience for customers and a complete management dashboard for administrators, integrated with **Stripe** payment processing, **Cloudinary** media storage, and **Redux Toolkit** state management.

---

## 🌐 Live Demo & Deployment

- **Frontend App**: [NG Store Web App](https://ngstore-ecommerce.vercel.app) _(Hosted on Vercel)_
- **Backend API**: Hosted on Render _(Note: May take 1–2 mins to cold start)_

---

## ✨ Features

### 🛒 Customer Features

- **User Authentication**: Secure Signup, Login, Email Verification via Nodemailer, Password Reset, and JWT-based session security.
- **Product Storefront**: Interactive product browsing with category filtering, search, ratings, and detailed product views.
- **Wishlist & Cart Management**: Dynamic shopping cart and persistent wishlist powered by Redux Toolkit.
- **Checkout & Payments**: Seamless checkout flow integrated with **Stripe** payments and Cash on Delivery support.
- **Order Management**: View order history, real-time status tracking, and itemized invoice details.
- **Customer Support & Returns**: File support tickets, contact inquiries, and return/exchange requests directly from the portal.

### 🛡️ Admin Dashboard (`/admin`)

- **Interactive Analytics**: Overview of platform sales, order metrics, product inventory, and customer activity logs.
- **Product Management**: Create, update, delete, and manage product inventory with image uploads via **Cloudinary**.
- **Order Processing**: Track customer orders, update delivery/shipping statuses, and manage fulfillment.
- **Customer Management**: Manage registered users and administrative permissions.
- **Support & Returns Control**: Process customer support inquiries and approve/reject return & exchange requests.

---

## 🛠️ Tech Stack

### **Frontend**

- **Framework**: React 18 (Vite)
- **State Management**: Redux Toolkit & React-Redux
- **Styling**: Tailwind CSS, Material-UI (MUI), Headless UI, Framer Motion
- **Payments**: `@stripe/react-stripe-js` & `@stripe/stripe-js`
- **Routing & Notifications**: React Router v6, React Hot Toast, React Toastify
- **HTTP Client**: Axios

### **Backend**

- **Runtime & Framework**: Node.js & Express.js (v5)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT) & Bcrypt.js
- **Media Storage**: Cloudinary & Multer
- **Email Service**: Nodemailer
- **AI Integrations**: Google Generative AI (Gemini SDK)
- **Payment Gateway**: Stripe Node SDK

---

## 📁 Repository Structure

```
E-commerce Website/
├── backend/
│   ├── config/          # DB connection & Cloudinary setup
│   ├── controllers/     # Controller logic for products, orders, users, etc.
│   ├── middleware/      # Auth verification & Admin role guards
│   ├── model/           # Mongoose schemas (User, Product, Order, Support, etc.)
│   ├── routes/          # Express route definitions
│   ├── services/        # Third-party service handlers
│   └── server.js        # Express application entry point
│
└── frontend/myapp/
    ├── src/
    │   ├── admin/       # Admin Dashboard components & pages
    │   ├── api/         # Axios instance & API configuration
    │   ├── components/  # Shared UI components (Navbar, Footer, Modals)
    │   ├── pages/       # Customer pages (Home, Shop, Cart, Checkout, Profile)
    │   ├── Redux/       # Redux store configuration & slices
    │   ├── App.jsx      # Router configuration & protected routes
    │   └── main.jsx     # Frontend entry point
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
EMAIL_USER=your_email_address
EMAIL_PASS=your_email_password
```

### Frontend (`frontend/myapp/.env`)

```env
VITE_API_URL=http://localhost:3000
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
VITE_FRONTEND_URL=http://localhost:5173
```

---

## 🚀 Getting Started Locally

### Prerequisites

- **Node.js** (v18+ recommended)
- **MongoDB** instance (Local or MongoDB Atlas)
- **npm** or **bun**

### 1. Setup Backend

```bash
cd backend
npm install
npm run dev
```

Backend will start on `http://localhost:3000`.

### 2. Setup Frontend

```bash
cd frontend/myapp
npm install
npm run dev
```

Frontend will start on `http://localhost:5173`.

---

## 🔌 API Endpoints Overview

| Module       | Base Path              | Description                                              |
| :----------- | :--------------------- | :------------------------------------------------------- |
| **Products** | `/api/products`        | Fetch, search, filter products, & add reviews            |
| **Users**    | `/api/users`           | Authentication, profile management, & password resets    |
| **Orders**   | `/api/orders`          | Create orders, view user order history & order details   |
| **Payment**  | `/api/payment`         | Stripe payment intent creation & verification            |
| **Admin**    | `/api/admin`           | Admin dashboard metrics, inventory & customer management |
| **Support**  | `/api/support`         | Customer ticket creation & admin support management      |
| **Returns**  | `/api/return-exchange` | Customer return requests & status handling               |
| **Contact**  | `/api/contact`         | Public contact queries & management                      |

---

## 📄 License

This project is licensed under the ISC License.
