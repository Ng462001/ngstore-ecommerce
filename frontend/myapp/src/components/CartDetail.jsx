import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useDispatch, useSelector } from 'react-redux'
import { NavLink } from 'react-router-dom'
import { removeProduct, updateProductQuantity } from '../Redux/action/action'


export default function CartDetail({ open, setOpen }) {
    // Access cartItems from the correct Redux state structure
    const cartItems = useSelector(state => state.productReducer.cartItems || [])
    const dispatch = useDispatch()

    // Calculate subtotal
    const subtotal = cartItems.reduce(
        (sum, item) => sum + (parseFloat(item.discountedPrice || item.price) * item.quantity),
        0
    ).toFixed(2)

    const handleIncrement = (itemId) => {
        const item = cartItems.find(item => item.id === itemId || item.cartId === itemId)
        if (item) {
            dispatch(updateProductQuantity(itemId, item.quantity + 1))
        }
    }

    const handleDecrement = (itemId) => {
        const item = cartItems.find(item => item.id === itemId || item.cartId === itemId)
        if (item && item.quantity > 1) {
            dispatch(updateProductQuantity(itemId, item.quantity - 1))
        }
    }

    const handleRemove = (itemId) => {
        dispatch(removeProduct(itemId))
    }

    // Helper functions
    const getItemId = (item) => {
        return item.cartId || item.id
    }

    const getItemImage = (item) => {
        return item.image || item.images?.[0]?.src || 'https://via.placeholder.com/150'
    }

    const getItemName = (item) => {
        return item.name || 'Product'
    }

    const getItemPrice = (item) => {
        return parseFloat(item.discountedPrice || item.price)
    }

    return (
        <Dialog open={open} onClose={setOpen} className="relative z-50">
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-gray-500/75 transition-opacity duration-500 ease-in-out data-[closed]:opacity-0"
            />

            <div className="fixed inset-0 overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                        <DialogPanel
                            transition
                            className="pointer-events-auto w-screen max-w-md transform transition duration-500 ease-in-out data-[closed]:translate-x-full sm:duration-700"
                        >
                            <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                                <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                                    <div className="flex items-start justify-between">
                                        <DialogTitle className="text-lg font-medium text-gray-900">
                                            Shopping cart ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
                                        </DialogTitle>
                                        <div className="ml-3 flex h-7 items-center">
                                            <button
                                                type="button"
                                                onClick={() => setOpen(false)}
                                                className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                                            >
                                                <span className="absolute -inset-0.5" />
                                                <span className="sr-only">Close panel</span>
                                                <XMarkIcon aria-hidden="true" className="size-6" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-8">
                                        {cartItems.length > 0 ? (
                                            <div className="flow-root">
                                                <ul role="list" className="-my-6 divide-y divide-gray-200">
                                                    {cartItems.map((item) => {
                                                        const itemId = getItemId(item)
                                                        const itemImage = getItemImage(item)
                                                        const itemName = getItemName(item)
                                                        const itemPrice = getItemPrice(item)
                                                        const totalPrice = (itemPrice * item.quantity).toFixed(2)

                                                        return (
                                                            <li key={itemId} className="flex py-6">
                                                                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                                                    <img
                                                                        alt={itemName}
                                                                        src={itemImage && itemImage.startsWith('http') ? itemImage : `${import.meta.env.VITE_API_URL}${itemImage}`}
                                                                        className="h-full w-full object-cover object-center"
                                                                    />
                                                                </div>

                                                                <div className="ml-4 flex flex-1 flex-col">
                                                                    <div>
                                                                        <div className="flex justify-between text-base font-medium text-gray-900">
                                                                            <h3 className="text-sm">{itemName}</h3>
                                                                            <p className="ml-4">₹{totalPrice}</p>
                                                                        </div>
                                                                        <div className="mt-1 mb-2 text-sm text-gray-500">
                                                                            {item.selectedColor && (
                                                                                <p>Color: {item.selectedColor}</p>
                                                                            )}
                                                                            {item.selectedSize && (
                                                                                <p>Size: {item.selectedSize}</p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex flex-1 items-end justify-between text-sm">
                                                                        <div className="flex items-center space-x-2">
                                                                            <button
                                                                                onClick={() => handleDecrement(itemId)}
                                                                                className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300 disabled:opacity-50 transition-colors"
                                                                                disabled={item.quantity <= 1}
                                                                            >
                                                                                -
                                                                            </button>
                                                                            <span className="w-8 text-center text-sm text-gray-900 font-medium">
                                                                                {item.quantity}
                                                                            </span>
                                                                            <button
                                                                                onClick={() => handleIncrement(itemId)}
                                                                                className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
                                                                            >
                                                                                +
                                                                            </button>
                                                                        </div>

                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleRemove(itemId)}
                                                                            className="font-medium text-red-600 hover:text-red-500 transition-colors"
                                                                        >
                                                                            Remove
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </li>
                                                        )
                                                    })}
                                                </ul>
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                                                    <svg
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                        className="w-full h-full"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={1}
                                                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                                        />
                                                    </svg>
                                                </div>
                                                <p className="text-gray-500 text-lg mb-2">Your cart is empty</p>
                                                <p className="text-gray-400 text-sm mb-4">Add some products to get started</p>
                                                <button
                                                    onClick={() => setOpen(false)}
                                                    className="text-indigo-600 hover:text-indigo-500 font-medium"
                                                >
                                                    Continue shopping
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {cartItems.length > 0 && (
                                    <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                                        <div className="flex justify-between text-base font-medium text-gray-900">
                                            <p>Subtotal</p>
                                            <p>₹{subtotal}</p>
                                        </div>
                                        <p className="mt-0.5 text-sm text-gray-500">
                                            Shipping and taxes calculated at checkout.
                                        </p>
                                        <div className="mt-6">
                                            <NavLink
                                                to='/checkout'
                                                onClick={() => setOpen(false)}
                                                className="flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-xs hover:bg-indigo-700 transition-colors"
                                            >
                                                Checkout
                                            </NavLink>
                                        </div>
                                        <div className="mt-4 flex justify-center">
                                            <button
                                                onClick={() => setOpen(false)}
                                                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                                            >
                                                Continue shopping
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </div>
        </Dialog>
    )
}