// components/Sidebar.js
import React from "react";
import {
  Dashboard as DashboardIcon,
  ShoppingCart,
  Inventory,
  Star,
  People,
  Store,
  Logout,
  Settings,
  Email,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { logoutUser } from "../../Redux/action/action";
import { useDispatch } from "react-redux";

const Sidebar = ({ onMobileClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  // Extract the current section from the path
  const currentSection = location.pathname.split("/").pop() || "dashboard";

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <DashboardIcon />,
      path: "/admin/dashboard",
    },
    {
      id: "products",
      label: "Products",
      icon: <Inventory />,
      path: "/admin/products",
    },
    {
      id: "orders",
      label: "Orders",
      icon: <ShoppingCart />,
      path: "/admin/orders",
    },
    {
      id: "reviews",
      label: "Reviews & Ratings",
      icon: <Star />,
      path: "/admin/reviews",
    },
    {
      id: "customers",
      label: "Customers",
      icon: <People />,
      path: "/admin/customers",
    },
    {
      id: "support",
      label: "Support",
      icon: <People />,
      path: "/admin/support",
    },
    {
      id: "returns",
      label: "Returns",
      icon: <Inventory />,
      path: "/admin/returns",
    },
    {
      id: "contacts",
      label: "Contact Messages",
      icon: <Email />,
      path: "/admin/contacts",
    },
  ];

  const handleItemClick = (path) => {
    navigate(path);
    if (onMobileClose) onMobileClose();
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  return (
    <div className="flex flex-col h-full bg-surface border-r border-border-light text-text-primary">
      {/* Logo */}
      <div className="flex items-center justify-center p-4 border-b border-border-light gap-2.5">
        <Store className="text-accent" />
        <span className="font-heading text-lg font-semibold tracking-wide text-text-primary">
          NGStore Admin
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        {menuItems.map((item) => {
          const isActive = currentSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.path)}
              className={`flex items-center w-full px-4 py-3 text-left rounded-xl transition-all duration-200 text-sm ${
                isActive
                  ? "bg-accent-light text-accent font-semibold shadow-xs border-r-2 border-accent"
                  : "text-text-secondary hover:bg-surface-muted hover:text-text-primary"
              }`}
            >
              <span
                className={`mr-3 ${isActive ? "text-accent" : "text-text-secondary"}`}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="mt-auto p-4 border-t border-border-light space-y-2">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-left rounded-xl text-error hover:bg-error/10 transition-all text-sm font-medium"
        >
          <Logout className="mr-3" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
