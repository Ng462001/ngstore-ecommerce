'use client'

import { Fragment, useState, useEffect, useMemo, useCallback } from 'react'
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
} from '@headlessui/react'
import { Bars3Icon, MagnifyingGlassIcon, ShoppingBagIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { NavLink, useNavigate } from 'react-router-dom'
import CartDetail from './CartDetail'
import { Avatar, Box, Icon, IconButton, Menu, MenuItem, Tooltip, Typography } from '@mui/material'
import { useSelector, useDispatch } from 'react-redux'
import { logoutUser } from '../Redux/action/action'
import Person2Icon from '@mui/icons-material/Person2';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LogoutIcon from '@mui/icons-material/Logout';

const navigation = {
  pages: [
    { name: 'Home', href: '/' },
    { name: 'Stores', href: '/store' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ],
}

const userSettings = [
  { name: 'Profile', href: '/profile', icon: Person2Icon },
  { name: 'My Orders', href: '/my-orders', icon: ShoppingCartIcon },
  { name: 'Logout', href: '/', icon: LogoutIcon }
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)
  const [anchorElUser, setAnchorElUser] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  // Custom hook to safely get Redux state
  const useAppSelector = (selector) => useSelector(selector)

  // Get user login state from Redux
  const isUserLoggedIn = useAppSelector(state => {
    if (!state) return false
    if (state.productReducer) {
      return state.productReducer.isUserLoggedIn || false
    }
    return state.isUserLoggedIn || false
  })

  // Get user profile from Redux
  const userProfile = useAppSelector(state => {
    if (!state) return null
    if (state.productReducer?.user) {
      return state.productReducer.user
    }
    return state.user || null
  })

  // Get cart items from Redux store
  const cartItems = useAppSelector(state => {
    if (!state) return []
    if (state.productReducer) {
      return Array.isArray(state.productReducer)
        ? state.productReducer
        : (state.productReducer.cartItems || [])
    }
    return state.cartItems || []
  })

  // Calculate total items in cart safely
  const totalCartItems = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const quantity = Number(item?.quantity) || 0
      return total + quantity
    }, 0)
  }, [cartItems])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        setCartOpen(false)
        setSearchOpen(false)
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Fetch search suggestions with debouncing
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([])
      return
    }

    const delayDebounceFn = setTimeout(async () => {
      setSuggestionsLoading(true)
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products?search=${encodeURIComponent(searchQuery)}&limit=5`)
        const result = await response.json()
        if (result.success && result.data) {
          setSuggestions(result.data)
        } else {
          setSuggestions([])
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error)
        setSuggestions([])
      } finally {
        setSuggestionsLoading(false)
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  const handleLogout = useCallback(async () => {
    setIsLoading(true)
    try {
      await dispatch(logoutUser())
      setAnchorElUser(null)
      navigate('/')
      // Only reload if needed, consider updating state instead
      setTimeout(() => {
        window.location.reload()
      }, 100)
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setIsLoading(false)
    }
  }, [dispatch, navigate])

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget)
  }

  const handleCloseUserMenu = () => {
    setAnchorElUser(null)
  }

  const handleUserMenuItemClick = useCallback((setting) => {
    handleCloseUserMenu()
    if (setting.name === 'Logout') {
      handleLogout()
    } else {
      navigate(setting.href)
    }
  }, [handleLogout, navigate])

  const handleSearch = useCallback((e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/store?search=${encodeURIComponent(searchQuery)}`)
      setSearchOpen(false)
      setSearchQuery('')
      setSuggestions([])
    }
  }, [searchQuery, navigate])

  const renderUserMenu = () => (
    <Box sx={{ flexGrow: 0 }}>
      <Tooltip title="Profile">
        <IconButton
          onClick={handleOpenUserMenu}
          sx={{ p: 0 }}
          disabled={isLoading}
          aria-label="User profile menu"
        >
          <Avatar
            alt={userProfile?.name || "User"}
            src={userProfile?.avatar}
            sx={{ width: 32, height: 32 }}
          />
        </IconButton>
      </Tooltip>
      <Menu
        sx={{ mt: '45px' }}
        id="menu-appbar"
        anchorEl={anchorElUser}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorElUser)}
        onClose={handleCloseUserMenu}
      >
        {userSettings.map((setting) => (
          <MenuItem
            key={setting.name}
            onClick={() => handleUserMenuItemClick(setting)}
            disabled={isLoading && setting.name === 'Logout'}
          >
            <Typography sx={{ textAlign: 'center', width: '100%' }}>
              <NavLink
                to={setting.href}
                className="block w-full hover:text-indigo-600"
                onClick={() => setOpen(false)}
              >
                <div className="flex items-center gap-2">
                  <setting.icon sx={{ width: 24, height: 24 }} />
                  {setting.name}
                </div>
              </NavLink>
            </Typography>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  )

  const renderMobileMenu = () => (
    <Dialog open={open} onClose={setOpen} className="relative z-40 lg:hidden">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/25 transition-opacity duration-300 ease-linear data-closed:opacity-0"
      />

      <div className="fixed inset-0 z-40 flex">
        <DialogPanel
          transition
          className="relative flex w-full max-w-xs transform flex-col overflow-y-auto bg-white pb-12 shadow-xl transition duration-300 ease-in-out data-closed:-translate-x-full"
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
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-md border border-gray-300 px-4 py-2 pl-10 focus:border-indigo-500 focus:ring-indigo-500"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 size-5 text-gray-400" />
            </form>
          </div>

          <div className="space-y-6 border-t border-gray-200 px-4 py-6">
            {navigation.pages.map((page) => (
              <div key={page.name} className="flow-root">
                <NavLink
                  to={page.href}
                  className="-m-2 block p-2 font-medium text-gray-900 hover:text-indigo-600"
                  onClick={() => setOpen(false)}
                  end
                >
                  {page.name}
                </NavLink>
              </div>
            ))}
          </div>

          {isUserLoggedIn ? (
            <div className="space-y-6 border-t border-gray-200 px-4 py-6">
              {userSettings.map((setting, index) => (
                <div key={index} className="flow-root">
                  {setting.name === 'Logout' ? (
                    <button
                      onClick={() => {
                        setOpen(false)
                        handleLogout()
                      }}
                      className="-m-2 block w-full p-2 text-left font-medium text-gray-900 hover:text-indigo-600"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Logging out...' : setting.name}
                    </button>
                  ) : (
                    <NavLink
                      to={setting.href}
                      className="-m-2 block p-2 font-medium text-gray-900 hover:text-indigo-600"
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
            <div className="space-y-6 border-t border-gray-200 px-4 py-6">
              <div className="flow-root">
                <NavLink
                  to="/login"
                  className="-m-2 block p-2 font-medium text-gray-900 hover:text-indigo-600"
                  onClick={() => setOpen(false)}
                >
                  Sign in
                </NavLink>
              </div>
              <div className="flow-root">
                <NavLink
                  to="/signup"
                  className="-m-2 block p-2 font-medium text-gray-900 hover:text-indigo-600"
                  onClick={() => setOpen(false)}
                >
                  Create account
                </NavLink>
              </div>
            </div>
          )}

          {/* Cart items count in mobile menu */}
          <div className="border-t border-gray-200 px-4 py-6">
            <div className="flow-root">
              <button
                onClick={() => {
                  setOpen(false)
                  setCartOpen(true)
                }}
                className="-m-2 flex w-full items-center p-2 hover:text-indigo-600"
                aria-label={`Open cart with ${totalCartItems} items`}
              >
                <ShoppingBagIcon
                  aria-hidden="true"
                  className="size-6 shrink-0 text-gray-400"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {totalCartItems} {totalCartItems === 1 ? 'item' : 'items'} in cart
                </span>
              </button>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )

  const renderDesktopMenu = () => (
    <PopoverGroup className="hidden lg:ml-8 lg:block lg:self-stretch">
      <div className="flex h-full space-x-8">
        {navigation.pages.map((page) => (
          <NavLink
            key={page.name}
            to={page.href}
            className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-800 hover:text-indigo-600"
            onClick={() => setOpen(false)}
          >
            {page.name}
          </NavLink>
        ))}
      </div>
    </PopoverGroup>
  )

  const handleSearchClose = () => {
    setSearchOpen(false)
    setSearchQuery('')
    setSuggestions([])
  }

  const renderSearchModal = () => (
    <Dialog open={searchOpen} onClose={handleSearchClose} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/50 transition-opacity duration-300 ease-linear data-closed:opacity-0"
      />
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20">
        <DialogPanel
          transition
          className="w-full max-w-2xl transform rounded-lg bg-white p-6 shadow-2xl transition duration-300 ease-in-out data-closed:opacity-0 data-closed:scale-95"
        >
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products, categories, tags..."
              className="w-full rounded-lg border border-gray-300 px-4 py-3 pl-12 text-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
            <MagnifyingGlassIcon className="absolute left-4 top-3.5 size-6 text-gray-400" />
            <button
              type="button"
              onClick={handleSearchClose}
              className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
              aria-label="Close search"
            >
              <XMarkIcon className="size-6" />
            </button>
          </form>

          {/* Suggestions Dropdown */}
          {(suggestions.length > 0 || suggestionsLoading || searchQuery.trim().length >= 2) && (
            <div className="mt-4 border-t border-gray-100 pt-4 max-h-[350px] overflow-y-auto">
              {suggestionsLoading ? (
                <div className="flex items-center justify-center py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                  <span className="ml-3 text-gray-500 text-sm">Searching...</span>
                </div>
              ) : suggestions.length > 0 ? (
                <div className="space-y-1">
                  <div className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Product Suggestions
                  </div>
                  {suggestions.map((product) => {
                    const productImg = product.image || product.images?.[0]?.src || 'https://via.placeholder.com/40x40?text=No+Image';
                    const fullImgUrl = productImg.startsWith('http') ? productImg : `${import.meta.env.VITE_API_URL}${productImg}`;
                    return (
                      <button
                        key={product._id}
                        onClick={() => {
                          navigate(`/product/${product._id}`)
                          handleSearchClose()
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                      >
                        <img
                          src={fullImgUrl}
                          alt={product.name}
                          className="w-10 h-10 object-contain rounded-md bg-gray-50 border border-gray-100"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/40x40?text=No+Image'
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">{product.name}</h4>
                          <p className="text-xs text-gray-500 truncate">{product.category}</p>
                        </div>
                        <div className="text-sm font-semibold text-gray-900">
                          ₹{(product.discountedPrice || product.price)?.toLocaleString()}
                        </div>
                      </button>
                    )
                  })}
                  <div className="border-t border-gray-50 pt-2 mt-2">
                    <button
                      onClick={handleSearch}
                      className="w-full text-center py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                    >
                      See all results for "{searchQuery}"
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 text-sm">
                  No products found for "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  )

  return (
    <>
      <div className="border-b border-gray-300 sticky-header sticky top-0 z-40 bg-white-500 bg-opacity-95 backdrop-blur supports-[backdrop-filter]:bg-white/95">
        {renderMobileMenu()}
        {renderSearchModal()}

        <header className="relative bg-white">
          <nav aria-label="Top" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ">
            <div >
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
                      src={import.meta.env.VITE_FRONTEND_URL + "/assets/img/logo/logo.png"}
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
                          className="text-sm font-medium text-gray-700 hover:text-indigo-600"
                        >
                          Sign in
                        </NavLink>
                        <span aria-hidden="true" className="h-6 w-px bg-gray-200" />
                        <NavLink
                          to="/signup"
                          className="text-sm font-medium text-gray-700 hover:text-indigo-600"
                        >
                          Create account
                        </NavLink>
                      </>
                    )}
                  </div>

                  {/* Search */}
                  <div className="flex lg:ml-6">
                    <button
                      onClick={() => setSearchOpen(true)}
                      className="p-2 text-gray-400 hover:text-gray-500"
                      aria-label="Search products"
                    >
                      <span className="sr-only">Search</span>
                      <MagnifyingGlassIcon aria-hidden="true" className="size-6" />
                    </button>
                  </div>

                  {/* Cart */}
                  <div className="ml-4 flow-root lg:ml-6">
                    <button
                      type='button'
                      onClick={() => setCartOpen(true)}
                      className="group -m-2 flex items-center p-2 relative"
                      aria-label={`Open shopping cart with ${totalCartItems} items`}
                    >
                      <ShoppingBagIcon
                        aria-hidden="true"
                        className="size-6 shrink-0 text-gray-400 group-hover:text-gray-500"
                      />
                      {totalCartItems > 0 && (
                        <span
                          className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs font-medium text-white transition-transform group-hover:scale-110"
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
  )
}