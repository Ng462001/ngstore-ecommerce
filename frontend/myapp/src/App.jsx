import React from 'react'
import { createBrowserRouter, Navigate, RouterProvider, useLocation } from 'react-router-dom'
import { Toaster } from "react-hot-toast";
import MainLayout from './pages/MainLayout'
import About from './pages/About'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Home from './pages/Home'
import Product from './pages/Product'
import ProductDetail from './pages/ProductDetail'
import Checkout from './pages/Checkout'
import MyOrder from './pages/MyOrder'
import Payment from './pages/Payment'
import Profile from './pages/Profile'
import { ToastContainer } from 'react-toastify'
import OrderDetailsPage from './pages/OrderDetailsPage'
import AdminLayout from './admin/components/AdminLayout'
import CategoryPage from './pages/CategoryPage'
import Dashboard from './admin/pages/Dashboard'
import Products from './admin/pages/Products'
import Orders from './admin/pages/Orders'
import Customers from './admin/pages/Customers'
import Reviews from './admin/pages/Reviews'
import AdminOrderDetails from './admin/pages/AdminOrderDetails'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import AdminSupport from './admin/pages/AdminSupport'
import AdminReturns from './admin/pages/AdminReturns'
import AdminContactManagement from './admin/pages/AdminContactManagement'
import VerifyEmail from './pages/VerifyEmail'
import Wishlist from './pages/Wishlist'

// Private Route Wrapper
const PrivateAdminRoute = ({ children }) => {
  const userInfo = localStorage.getItem('userInfo');
  const user = JSON.parse(userInfo);
  if (!user) {
    return <Navigate to="/login" />;
  }
  if (user.role === 'admin') {
    return children;
  }
  return <Navigate to="/" />;
};

// Private Route Wrapper
const PrivateUserRoute = ({ children }) => {
  const location = useLocation();
  const userInfo = localStorage.getItem('userInfo');
  const user = userInfo ? JSON.parse(userInfo) : null;
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (user.role === 'user') {
    return children;
  }
  return <Navigate to="/" replace />;
};

// Prevent Admin from accessing non-admin pages
const NonAdminRoute = ({ children }) => {
  const userInfo = localStorage.getItem('userInfo');
  const user = userInfo ? JSON.parse(userInfo) : null;
  if (user && user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  return children;
};

const App = () => {
  const rootElement = createBrowserRouter([
    {
      path: '/',
      element: (
        <NonAdminRoute>
          <MainLayout />
        </NonAdminRoute>
      ),
      children: [
        {
          path: '/',
          element: <Home />
        },
        {
          path: '/about',
          element: <About />
        },
        {
          path: '/shop',
          element: <Product />
        },
        {
          path: '/contact',
          element: <Contact />
        },
        {
          path: '/forgot-password',
          element: <ForgotPassword />
        },
        {
          path: '/reset-password/:token',
          element: <ResetPassword />
        },
        {
          path: '/verify-email/:token',
          element: <VerifyEmail />
        },
        {
          path: '/login',
          element: <Login />
        },
        {
          path: '/signup',
          element: <Signup />
        },
        {
          path: '/store',
          element: <Product />
        },
        {
          path: '/category/:id',
          element: <CategoryPage />
        },
        {
          path: '/product/:id',
          element: <ProductDetail />
        },
        {
          path: '/checkout',
          element: <PrivateUserRoute> <Checkout /></PrivateUserRoute>
        },
        {
          path: '/my-orders',
          element: <PrivateUserRoute><MyOrder /></PrivateUserRoute>
        },
        {
          path: '/order-details/:id',
          element: <OrderDetailsPage />
        },
        {
          path: '/payment',
          element: <PrivateUserRoute><Payment /></PrivateUserRoute>
        },
        {
          path: '/profile',
          element: <PrivateUserRoute><Profile /></PrivateUserRoute>
        },
        {
          path: '/wishlist',
          element: <Wishlist />
        }
      ]
    },
    {
      path: '/admin',
      element: (
        <PrivateAdminRoute>
          <AdminLayout />
        </PrivateAdminRoute>
      ),
      children: [
        {
          index: true,
          element: <Navigate to="dashboard" replace />
        },
        {
          path: 'dashboard',
          element: <Dashboard />
        },
        {
          path: 'products',
          element: <Products />
        },
        {
          path: 'orders',
          element: <Orders />
        },
        {
          path: 'order/:id',
          element: <AdminOrderDetails />
        },
        {
          path: 'customers',
          element: <Customers />
        },
        {
          path: 'reviews',
          element: <Reviews />
        },
        {
          path: 'support',
          element: <AdminSupport />
        },
        {
          path: 'returns',
          element: <AdminReturns />
        },
        {
          path: 'contacts',
          element: <AdminContactManagement />
        },
      ]
    },
    {
      path: '*',
      element: <Navigate to="/" replace />
    }
  ])

  return (
    <>
      <Toaster />
      <ToastContainer position="top-right" autoClose={3000} limit={1} />
      <RouterProvider router={rootElement} future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }} />
    </>
  )
}

export default App