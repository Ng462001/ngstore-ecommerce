import { Fragment, useState, useEffect, useMemo, useCallback } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from "@headlessui/react";
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  XMarkIcon,
  HeartIcon,
  SparklesIcon,
  UserIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { NavLink, useNavigate } from "react-router-dom";
import CartDetail from "./CartDetail";
import AISearchModal from "./AISearchModal";
import {
  Avatar,
  Box,
  Icon,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../Redux/action/action";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LocalMallOutlinedIcon from "@mui/icons-material/LocalMallOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";

const navigation = {
  pages: [
    { name: "Home", href: "/" },
    { name: "Stores", href: "/store" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ],
};

const userSettings = [
  { name: "My Profile", href: "/profile", icon: PersonOutlineIcon },
  { name: "My Orders", href: "/my-orders", icon: LocalMallOutlinedIcon },
  { name: "Logout", href: "/", icon: LogoutOutlinedIcon },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Custom hook to safely get Redux state
  const useAppSelector = (selector) => useSelector(selector);

  // Get wishlist items from Redux store
  const wishlistItems = useAppSelector((state) => {
    if (!state) return [];
    if (state.productReducer) {
      return state.productReducer.wishlistItems || [];
    }
    return state.wishlistItems || [];
  });

  const totalWishlistItems = wishlistItems.length;

  // Get user login state from Redux
  const isUserLoggedIn = useAppSelector((state) => {
    if (!state) return false;
    if (state.productReducer) {
      return state.productReducer.isUserLoggedIn || false;
    }
    return state.isUserLoggedIn || false;
  });

  // Get user profile from Redux
  const userProfile = useAppSelector((state) => {
    if (!state) return null;
    if (state.productReducer?.user) {
      return state.productReducer.user;
    }
    return state.user || null;
  });

  // Get cart items from Redux store
  const cartItems = useAppSelector((state) => {
    if (!state) return [];
    if (state.productReducer) {
      return Array.isArray(state.productReducer)
        ? state.productReducer
        : state.productReducer.cartItems || [];
    }
    return state.cartItems || [];
  });

  // Calculate total items in cart safely
  const totalCartItems = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const quantity = Number(item?.quantity) || 0;
      return total + quantity;
    }, 0);
  }, [cartItems]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        setCartOpen(false);
        setSearchOpen(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = useCallback(async () => {
    setIsLoading(true);
    try {
      await dispatch(logoutUser());
      setAnchorElUser(null);
      navigate("/");
      // Only reload if needed, consider updating state instead
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, navigate]);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleUserMenuItemClick = useCallback(
    (setting) => {
      handleCloseUserMenu();
      if (setting.name === "Logout") {
        handleLogout();
      } else {
        navigate(setting.href);
      }
    },
    [handleLogout, navigate],
  );

  const renderUserMenu = () => {
    const storedUser = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const currentUser = userProfile || storedUser;
    const rawName = currentUser?.name || currentUser?.firstName || "Account";
    const firstName = rawName.split(" ")[0];
    const userAvatar = currentUser?.avatar;

    return (
      <Box sx={{ flexGrow: 0 }}>
        <Tooltip title="Account Menu">
          <button
            onClick={handleOpenUserMenu}
            disabled={isLoading}
            className="group flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#E7E4DD] bg-[#FAF9F6] hover:bg-[#FFFFFF] hover:border-[#B8925A] transition-all duration-300 shadow-xs hover:shadow-md cursor-pointer"
            aria-label="User account menu"
          >
            {/* Avatar / Initial */}
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={firstName}
                className="size-6 rounded-full object-cover border border-[#B8925A]"
              />
            ) : (
              <div className="size-6 rounded-full bg-[#B8925A] text-white flex items-center justify-center text-xs font-semibold">
                {firstName.charAt(0).toUpperCase()}
              </div>
            )}

            {/* User First Name */}
            <span className="text-xs font-semibold text-[#1C1B19] group-hover:text-[#B8925A] transition-colors">
              {firstName}
            </span>

            {/* Caret Arrow */}
            <ChevronDownIcon className="size-3.5 text-[#6B6862] group-hover:text-[#B8925A] transition-transform duration-200" />
          </button>
        </Tooltip>
        <Menu
          sx={{ mt: "45px" }}
          id="menu-appbar"
          anchorEl={anchorElUser}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          keepMounted
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          open={Boolean(anchorElUser)}
          onClose={handleCloseUserMenu}
          PaperProps={{
            elevation: 0,
            sx: {
              minWidth: 230,
              borderRadius: "18px",
              bgcolor: "#FFFFFF",
              border: "1px solid #E7E4DD",
              boxShadow: "0 16px 40px -4px rgba(28, 27, 25, 0.12)",
              py: 1,
              mt: 1,
              overflow: "hidden",
            },
          }}
        >
          {/* User Profile Header Badge Card */}
          <Box
            sx={{
              px: 2.5,
              py: 2,
              borderBottom: "1px solid #E7E4DD",
              mb: 1,
              bgcolor: "#FAF9F6",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <Avatar
              src={userAvatar}
              sx={{
                width: 40,
                height: 40,
                bgcolor: "#B8925A",
                color: "#FFFFFF",
                fontWeight: 700,
                fontSize: "1rem",
                fontFamily: '"Playfair Display", Georgia, serif',
                boxShadow: "0 2px 8px rgba(184, 146, 90, 0.3)",
              }}
            >
              {firstName.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  color: "#1C1B19",
                  fontFamily: '"Playfair Display", Georgia, serif',
                  fontSize: "0.95rem",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {currentUser?.name || firstName}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "#B8925A",
                  fontWeight: 600,
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  display: "block",
                }}
              >
                ✨ Member
              </Typography>
            </Box>
          </Box>

          {/* Menu Items */}
          {userSettings.map((setting) => {
            const IconComponent = setting.icon;
            const isLogout = setting.name === "Logout";

            return (
              <MenuItem
                key={setting.name}
                onClick={() => handleUserMenuItemClick(setting)}
                disabled={isLoading && isLogout}
                sx={{
                  py: 1.2,
                  px: 2.5,
                  my: 0.3,
                  borderRadius: "10px",
                  mx: 1,
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    bgcolor: isLogout ? "rgba(179, 65, 59, 0.08)" : "#FAF9F6",
                    "& .menu-text": {
                      color: isLogout ? "#B3413B" : "#B8925A",
                      fontWeight: 600,
                    },
                    "& .menu-icon": {
                      color: isLogout ? "#B3413B" : "#B8925A",
                      transform: "scale(1.1)",
                    },
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    width: "100%",
                  }}
                >
                  <IconComponent
                    className="menu-icon"
                    sx={{
                      fontSize: 19,
                      color: isLogout ? "#B3413B" : "#6B6862",
                      transition: "transform 0.2s ease, color 0.2s ease",
                    }}
                  />
                  <Typography
                    className="menu-text"
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      fontSize: "0.875rem",
                      color: isLogout ? "#B3413B" : "#1C1B19",
                      fontFamily: '"Inter", sans-serif',
                      transition: "color 0.2s ease",
                    }}
                  >
                    {setting.name}
                  </Typography>
                </Box>
              </MenuItem>
            );
          })}
        </Menu>
      </Box>
    );
  };

  const renderMobileMenu = () => (
    <Dialog open={open} onClose={setOpen} className="relative z-40 lg:hidden">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/25 transition-opacity duration-300 ease-linear data-closed:opacity-0"
      />

      <div className="fixed inset-0 z-40 flex">
        <DialogPanel
          transition
          className="relative flex w-full max-w-xs transform flex-col overflow-y-auto bg-background pb-12 shadow-card border-r border-border-light transition duration-300 ease-in-out data-closed:-translate-x-full"
        >
          <div className="flex px-4 pt-5 pb-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="relative -m-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:text-gray-500"
              aria-label="Close menu"
            >
              <XMarkIcon aria-hidden="true" className="size-6" />
            </button>
          </div>

          {/* Search in mobile menu */}
          <div className="px-4 pb-4">
            <button
              onClick={() => {
                setOpen(false);
                setSearchOpen(true);
              }}
              className="w-full flex items-center justify-between rounded-xl border border-border-light bg-surface px-4 py-2.5 text-text-secondary text-sm hover:border-accent hover:text-accent transition-colors"
            >
              <div className="flex items-center gap-2">
                <MagnifyingGlassIcon className="size-5 text-gray-400" />
                <span>Search products...</span>
              </div>
              <SparklesIcon className="size-4 text-accent" />
            </button>
          </div>

          <div className="space-y-6 border-t border-gray-200 px-4 py-6">
            {navigation.pages.map((page) => (
              <div key={page.name} className="flow-root">
                <NavLink
                  to={page.href}
                  end={page.href === "/"}
                  className={({ isActive }) =>
                    `-m-2 block p-2 font-medium transition-colors ${
                      isActive
                        ? "text-accent font-semibold bg-accent-light/40 rounded-lg"
                        : "text-text-primary hover:text-accent"
                    }`
                  }
                  onClick={() => setOpen(false)}
                >
                  {page.name}
                </NavLink>
              </div>
            ))}
          </div>

          {isUserLoggedIn ? (
            <div className="space-y-6 border-t border-border-light px-4 py-6">
              {userSettings.map((setting, index) => (
                <div key={index} className="flow-root">
                  {setting.name === "Logout" ? (
                    <button
                      onClick={() => {
                        setOpen(false);
                        handleLogout();
                      }}
                      className="-m-2 block w-full p-2 text-left font-medium text-text-primary hover:text-accent transition-colors"
                      disabled={isLoading}
                    >
                      {isLoading ? "Logging out..." : setting.name}
                    </button>
                  ) : (
                    <NavLink
                      to={setting.href}
                      className="-m-2 block p-2 font-medium text-text-primary hover:text-accent transition-colors flex items-center gap-2"
                      onClick={() => setOpen(false)}
                      end
                    >
                      <setting.icon sx={{ width: 24, height: 24 }} />
                      {setting.name}
                    </NavLink>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6 border-t border-border-light px-4 py-6">
              <div className="flow-root">
                <NavLink
                  to="/login"
                  className="-m-2 block p-2 font-medium text-text-primary hover:text-accent transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Sign in
                </NavLink>
              </div>
              <div className="flow-root">
                <NavLink
                  to="/signup"
                  className="-m-2 block p-2 font-medium text-text-primary hover:text-accent transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Create account
                </NavLink>
              </div>
            </div>
          )}

          {/* Wishlist & Cart items count in mobile menu */}
          <div className="border-t border-gray-200 px-4 py-6 space-y-4">
            <div className="flow-root">
              <NavLink
                to="/wishlist"
                onClick={() => setOpen(false)}
                className="-m-2 flex w-full items-center p-2 hover:text-pink-600"
                aria-label={`Open wishlist with ${totalWishlistItems} items`}
              >
                <HeartIcon
                  aria-hidden="true"
                  className="size-6 shrink-0 text-gray-400 group-hover:text-pink-500"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {totalWishlistItems}{" "}
                  {totalWishlistItems === 1 ? "item" : "items"} in wishlist
                </span>
              </NavLink>
            </div>
            <div className="flow-root">
              <button
                onClick={() => {
                  setOpen(false);
                  setCartOpen(true);
                }}
                className="-m-2 flex w-full items-center p-2 hover:text-indigo-600"
                aria-label={`Open cart with ${totalCartItems} items`}
              >
                <ShoppingBagIcon
                  aria-hidden="true"
                  className="size-6 shrink-0 text-gray-400"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {totalCartItems} {totalCartItems === 1 ? "item" : "items"} in
                  cart
                </span>
              </button>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );

  const renderDesktopMenu = () => (
    <PopoverGroup className="hidden lg:ml-10 lg:block lg:self-stretch">
      <div className="flex h-full space-x-8">
        {navigation.pages.map((page) => (
          <NavLink
            key={page.name}
            to={page.href}
            end={page.href === "/"}
            className={({ isActive }) =>
              `flex items-center text-xs font-semibold uppercase tracking-wider transition-colors relative py-2 ${
                isActive
                  ? "text-accent after:content-[''] after:absolute after:bottom-4 after:left-0 after:w-full after:h-0.5 after:bg-accent"
                  : "text-text-primary hover:text-accent after:content-[''] after:absolute after:bottom-4 after:left-0 after:w-0 after:h-0.5 after:bg-accent hover:after:w-full after:transition-all"
              }`
            }
            onClick={() => setOpen(false)}
          >
            {page.name}
          </NavLink>
        ))}
      </div>
    </PopoverGroup>
  );

  return (
    <>
      <div className="sticky-header border-b border-border-light sticky top-0 z-40 bg-background/90 backdrop-blur-md">
        {renderMobileMenu()}
        <AISearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

        <header className="relative bg-transparent">
          <nav
            aria-label="Top"
            className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 "
          >
            <div>
              <div className="flex h-16 items-center">
                {/* Mobile menu button */}
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="relative rounded-md bg-white p-2 text-gray-400 hover:text-gray-500 lg:hidden"
                  aria-label="Open menu"
                >
                  <span className="absolute -inset-0.5" />
                  <Bars3Icon aria-hidden="true" className="size-6" />
                </button>

                {/* Logo */}
                <div className="ml-4 flex lg:ml-0">
                  <NavLink to="/" className="flex items-center">
                    <img
                      alt="Company Logo"
                      src={
                        import.meta.env.VITE_FRONTEND_URL +
                        "/assets/img/logo/logo.png"
                      }
                      className="h-12 w-auto"
                    />
                  </NavLink>
                </div>

                {/* Desktop Navigation */}
                {renderDesktopMenu()}

                <div className="ml-auto flex items-center">
                  <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-end lg:space-x-6">
                    {isUserLoggedIn ? (
                      renderUserMenu()
                    ) : (
                      <>
                        <NavLink
                          to="/login"
                          className="text-sm font-medium text-text-primary hover:text-accent transition-colors"
                        >
                          Sign in
                        </NavLink>
                        <span
                          aria-hidden="true"
                          className="h-4 w-px bg-border-light"
                        />
                        <NavLink
                          to="/signup"
                          className="text-sm font-medium text-text-primary hover:text-accent transition-colors"
                        >
                          Create account
                        </NavLink>
                      </>
                    )}
                  </div>

                  {/* Search Button */}
                  <div className="ml-3 sm:ml-4 flow-root lg:ml-6">
                    <button
                      onClick={() => setSearchOpen(true)}
                      className="group flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-full border-0 sm:border sm:border-[#E7E4DD] bg-transparent sm:bg-[#FAF9F6] hover:bg-transparent sm:hover:bg-[#FFFFFF] sm:hover:border-[#B8925A] transition-all duration-200 cursor-pointer"
                      aria-label="Open search"
                    >
                      <MagnifyingGlassIcon className="size-6 sm:size-4 shrink-0 text-text-secondary group-hover:text-accent transition-colors" />
                      <span className="text-xs font-medium text-[#6B6862] group-hover:text-[#1C1B19] transition-colors hidden sm:inline">
                        Search...
                      </span>
                    </button>
                  </div>

                  {/* Wishlist */}
                  <div className="ml-4 flow-root lg:ml-6">
                    <NavLink
                      to="/wishlist"
                      className="group -m-2 flex items-center p-2 relative"
                      aria-label="View wishlist"
                    >
                      {totalWishlistItems > 0 ? (
                        <HeartIconSolid
                          aria-hidden="true"
                          className="size-6 shrink-0 text-accent group-hover:text-accent-hover transition-transform group-hover:scale-110"
                        />
                      ) : (
                        <HeartIcon
                          aria-hidden="true"
                          className="size-6 shrink-0 text-text-secondary group-hover:text-accent transition-colors"
                        />
                      )}
                      {totalWishlistItems > 0 && (
                        <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-accent ring-2 ring-background"></span>
                        </span>
                      )}
                      <span className="sr-only">items in wishlist</span>
                    </NavLink>
                  </div>

                  {/* Cart */}
                  <div className="ml-4 flow-root lg:ml-6">
                    <button
                      type="button"
                      onClick={() => setCartOpen(true)}
                      className="group -m-2 flex items-center p-2 relative"
                      aria-label={`Open shopping cart with ${totalCartItems} items`}
                    >
                      <ShoppingBagIcon
                        aria-hidden="true"
                        className="size-6 shrink-0 text-text-secondary group-hover:text-accent transition-colors"
                      />
                      {totalCartItems > 0 && (
                        <span
                          className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white transition-transform group-hover:scale-110 shadow-xs"
                          aria-label={`${totalCartItems} items in cart`}
                        >
                          {totalCartItems}
                        </span>
                      )}
                      <span className="sr-only">items in cart, view bag</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </header>
      </div>

      <CartDetail open={cartOpen} setOpen={setCartOpen} />
    </>
  );
}
