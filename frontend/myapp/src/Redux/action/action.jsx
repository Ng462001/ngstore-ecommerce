// Use different action names to avoid conflicts
export const addProduct = (product) => ({
    type: 'ADD_TO_CART',
    payload: product
})

export const removeProduct = (productId) => ({
    type: 'REMOVE_FROM_CART',
    payload: productId
})

export const updateProductQuantity = (productId, quantity) => ({
    type: 'UPDATE_CART_QUANTITY',
    payload: { productId, quantity }
})

export const clearCart = () => ({
    type: 'CLEAR_CART'
})

export const loginUser = (userInfo) => ({
    type: 'LOGIN_USER',
    payload: userInfo
})

export const logoutUser = () => ({
    type: 'LOGOUT_USER'
})

export const addToWishlist = (product) => ({
    type: 'ADD_TO_WISHLIST',
    payload: product
})

export const removeFromWishlist = (productId) => ({
    type: 'REMOVE_FROM_WISHLIST',
    payload: productId
})

export const toggleWishlist = (product) => ({
    type: 'TOGGLE_WISHLIST',
    payload: product
})

export const setWishlist = (wishlistItems) => ({
    type: 'SET_WISHLIST',
    payload: wishlistItems
})

export const clearWishlist = () => ({
    type: 'CLEAR_WISHLIST'
})