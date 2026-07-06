import React from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import MainLayout from './pages/MainLayout'
import About from './components/About'
import Contact from './components/Contact'
import Login from './components/Login'
import Signup from './components/Signup'
import Shop from './components/Shop'
import Home from './components/Home'
import Product from './components/Product'
import ProductDetail from './components/ProductDetail'
import Checkout from './components/Checkout'
import MyOrder from './components/MyOrder'
import Payment from './components/Payment'
import Profile from './components/Profile'
import { ToastContainer } from 'react-toastify'
import OrderDetailsPage from './components/OrderDetailsPage'
import AdminLayout from './admin/layout/AdminLayout'
import CategoryPage from './components/CategoryPage'
import Dashboard from './admin/Dashboard'
import Products from './admin/Products'
import Orders from './admin/Orders'
import Customers from './admin/Customers'
import Reviews from './admin/Reviews'
import AdminOrderDetails from './admin/AdminOrderDetails'
import ForgotPassword from './components/ForgotPassword'
import ResetPassword from './components/ResetPassword'
import AdminSupport from './admin/AdminSupport'
import AdminReturns from './admin/AdminReturns'
import AdminContactManagement from './admin/AdminContactManagement'
import VerifyEmail from './components/VerifyEmail'

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
  const userInfo = localStorage.getItem('userInfo');
  const user = JSON.parse(userInfo);
  if (!user) {
    return <Navigate to="/login" />;
  }
  if (user.role === 'user') {
    return children;
  }
  return <Navigate to="/" />;
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
          element: <Shop />
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
      <ToastContainer position="top-right" autoClose={3000} limit={1} />
      <RouterProvider router={rootElement} future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }} />
    </>
  )
}

export default App