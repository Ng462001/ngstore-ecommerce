import { combineReducers } from "@reduxjs/toolkit";

const initialState = {
    cartItems: [],
    wishlistItems: [],
    userInfo: null,
    isUserLoggedIn: false
}

// Load from localStorage
try {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        const parsed = JSON.parse(savedCart);
        initialState.cartItems = parsed.cartItems || [];
    }

    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
        initialState.wishlistItems = JSON.parse(savedWishlist) || [];
    }

    const savedUserInfo = localStorage.getItem('userInfo');
    if (savedUserInfo) {
        const parsedUserInfo = JSON.parse(savedUserInfo);
        initialState.userInfo = parsedUserInfo;
        initialState.isUserLoggedIn = true;
    }
} catch (error) {
    console.error('Error loading from localStorage:', error);
}

const productReducer = (state = initialState, action) => {
    let newState;

    switch (action.type) {
        case 'ADD_TO_CART':
            const existingItemIndex = state.cartItems.findIndex(
                item => item.cartId === action.payload.cartId
            );

            if (existingItemIndex >= 0) {
                newState = {
                    ...state,
                    cartItems: state.cartItems.map((item, index) =>
                        index === existingItemIndex
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    )
                };
            } else {
                newState = {
                    ...state,
                    cartItems: [...state.cartItems, { ...action.payload, quantity: 1 }]
                };
            }
            break;

        case 'REMOVE_FROM_CART':
            newState = {
                ...state,
                cartItems: state.cartItems.filter(item =>
                    item.cartId !== action.payload && item.id !== action.payload && item._id !== action.payload
                )
            };
            break;

        case 'UPDATE_CART_QUANTITY':
            newState = {
                ...state,
                cartItems: state.cartItems.map(item =>
                    (item.cartId === action.payload.productId || item.id === action.payload.productId || item._id === action.payload.productId)
                        ? { ...item, quantity: action.payload.quantity }
                        : item
                )
            };
            break;

        case 'CLEAR_CART':
            newState = {
                ...state,
                cartItems: []
            };
            break;

        case 'ADD_TO_WISHLIST': {
            const targetId = action.payload._id || action.payload.id;
            const exists = state.wishlistItems.some(item => (item._id || item.id) === targetId);
            if (!exists) {
                newState = {
                    ...state,
                    wishlistItems: [...state.wishlistItems, action.payload]
                };
            } else {
                newState = state;
            }
            break;
        }

        case 'REMOVE_FROM_WISHLIST': {
            const removeId = action.payload;
            newState = {
                ...state,
                wishlistItems: state.wishlistItems.filter(item => (item._id || item.id) !== removeId)
            };
            break;
        }

        case 'TOGGLE_WISHLIST': {
            const itemToToggle = action.payload;
            const toggleId = itemToToggle._id || itemToToggle.id;
            const isPresent = state.wishlistItems.some(item => (item._id || item.id) === toggleId);
            if (isPresent) {
                newState = {
                    ...state,
                    wishlistItems: state.wishlistItems.filter(item => (item._id || item.id) !== toggleId)
                };
            } else {
                newState = {
                    ...state,
                    wishlistItems: [...state.wishlistItems, itemToToggle]
                };
            }
            break;
        }

        case 'SET_WISHLIST':
            newState = {
                ...state,
                wishlistItems: action.payload || []
            };
            break;

        case 'CLEAR_WISHLIST':
            newState = {
                ...state,
                wishlistItems: []
            };
            break;

        case 'LOGIN_USER':
            newState = {
                ...state,
                userInfo: action.payload,
                isUserLoggedIn: true
            };
            break;

        case 'LOGOUT_USER':
            newState = {
                ...state,
                userInfo: null,
                isUserLoggedIn: false
            };
            break;

        default:
            return state;
    }

    // Save to localStorage after every state change
    try {
        localStorage.setItem('cart', JSON.stringify({ cartItems: newState.cartItems }));
        localStorage.setItem('wishlist', JSON.stringify(newState.wishlistItems || []));
        if (newState.userInfo) {
            localStorage.setItem('userInfo', JSON.stringify(newState.userInfo));
            // Also save token separately for admin components
            if (newState.userInfo.token) {
                localStorage.setItem('token', newState.userInfo.token);
            }
        } else {
            localStorage.removeItem('userInfo');
            localStorage.removeItem('token');
        }
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }

    return newState;
};

export const rootReducer = combineReducers({
    productReducer
});