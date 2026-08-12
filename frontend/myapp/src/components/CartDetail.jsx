import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useDispatch, useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { removeProduct, updateProductQuantity } from "../Redux/action/action";

export default function CartDetail({ open, setOpen }) {
  const dispatch = useDispatch();

  const cartItems = useSelector((state) => {
    if (state.productReducer) {
      return Array.isArray(state.productReducer)
        ? state.productReducer
        : state.productReducer.cartItems || [];
    }
    return state.cartItems || [];
  });

  const getItemPrice = (item) => {
    const p = parseFloat(item.price) || 0;
    const dp = parseFloat(item.discountedPrice) || 0;
    if (dp > 0 && dp < p) return dp;
    return p || dp;
  };

  // Calculate subtotal
  const subtotal = cartItems.reduce(
    (sum, item) => sum + getItemPrice(item) * item.quantity,
    0,
  );

  const handleIncrement = (itemId) => {
    const item = cartItems.find(
      (item) => item.id === itemId || item.cartId === itemId,
    );
    if (item) {
      dispatch(updateProductQuantity(itemId, item.quantity + 1));
    }
  };

  const handleDecrement = (itemId) => {
    const item = cartItems.find(
      (item) => item.id === itemId || item.cartId === itemId,
    );
    if (item && item.quantity > 1) {
      dispatch(updateProductQuantity(itemId, item.quantity - 1));
    }
  };

  const handleRemove = (itemId) => {
    dispatch(removeProduct(itemId));
  };

  // Helper functions
  const getItemId = (item) => {
    return item.cartId || item.id;
  };

  const getItemImage = (item) => {
    return (
      item.image || item.images?.[0]?.src || "https://via.placeholder.com/150"
    );
  };

  const getItemName = (item) => {
    return item.name || "Product";
  };

  return (
    <Dialog open={open} onClose={setOpen} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-text-primary/40 backdrop-blur-md transition-opacity duration-500 ease-in-out data-[closed]:opacity-0"
      />

      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-0 sm:pl-10">
            <DialogPanel
              transition
              className="pointer-events-auto w-screen max-w-full sm:max-w-md transform transition duration-500 ease-in-out data-[closed]:translate-x-full sm:duration-700"
            >
              <div className="flex h-full flex-col overflow-y-scroll bg-surface border-l border-border-light shadow-card">
                <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                  <div className="flex items-start justify-between">
                    <DialogTitle className="font-heading text-lg font-semibold text-text-primary">
                      Shopping Bag ({cartItems.length}{" "}
                      {cartItems.length === 1 ? "item" : "items"})
                    </DialogTitle>
                    <div className="ml-3 flex h-7 items-center">
                      <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="relative -m-2 p-2 text-text-secondary hover:text-text-primary"
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
                        <ul
                          role="list"
                          className="-my-6 divide-y divide-border-light"
                        >
                          {cartItems.map((item) => {
                            const itemId = getItemId(item);
                            const itemImage = getItemImage(item);
                            const itemName = getItemName(item);
                            const itemPrice = getItemPrice(item);
                            const totalPrice = itemPrice * item.quantity;

                            return (
                              <li key={itemId} className="flex py-6">
                                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-border-light bg-background">
                                  <img
                                    alt={itemName}
                                    src={
                                      itemImage && itemImage.startsWith("http")
                                        ? itemImage
                                        : `${import.meta.env.VITE_API_URL}${itemImage}`
                                    }
                                    className="h-full w-full object-cover object-center"
                                  />
                                </div>

                                <div className="ml-4 flex flex-1 flex-col">
                                  <div>
                                    <div className="flex justify-between text-base font-medium text-text-primary">
                                      <h3 className="font-heading text-sm font-semibold">
                                        {itemName}
                                      </h3>
                                      <p className="ml-4 font-bold text-text-primary">
                                        ₹{totalPrice.toLocaleString("en-IN", {
                                          maximumFractionDigits: 2,
                                        })}
                                      </p>
                                    </div>
                                    <div className="mt-1 mb-2 text-xs text-text-secondary">
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
                                        className="w-7 h-7 flex items-center justify-center bg-surface-muted border border-border-light rounded-lg hover:border-accent hover:text-accent disabled:opacity-40 transition-colors text-text-primary font-bold cursor-pointer"
                                        disabled={item.quantity <= 1}
                                      >
                                        -
                                      </button>
                                      <span className="w-6 text-center text-xs text-text-primary font-semibold">
                                        {item.quantity}
                                      </span>
                                      <button
                                        onClick={() => handleIncrement(itemId)}
                                        className="w-7 h-7 flex items-center justify-center bg-surface-muted border border-border-light rounded-lg hover:border-accent hover:text-accent transition-colors text-text-primary font-bold cursor-pointer"
                                      >
                                        +
                                      </button>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => handleRemove(itemId)}
                                      className="text-xs font-semibold text-error hover:underline transition-colors cursor-pointer"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="mx-auto h-20 w-20 text-text-secondary/40 mb-4">
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
                        <p className="font-heading text-lg text-text-primary font-semibold mb-1">
                          Your bag is empty
                        </p>
                        <p className="text-text-secondary text-sm mb-6">
                          Discover our curated collections
                        </p>
                        <button
                          onClick={() => setOpen(false)}
                          className="text-accent hover:underline font-semibold text-sm cursor-pointer"
                        >
                          Continue shopping
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {cartItems.length > 0 && (
                  <div className="border-t border-border-light px-4 py-6 sm:px-6 bg-surface-muted/50">
                    <div className="flex justify-between text-base font-semibold text-text-primary">
                      <p>Subtotal</p>
                      <p className="text-text-primary font-bold text-lg">
                        ₹{subtotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <p className="mt-0.5 text-xs text-text-secondary">
                      Shipping and taxes calculated at checkout.
                    </p>
                    <div className="mt-6">
                      <NavLink
                        to="/checkout"
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-center rounded-xl border border-transparent bg-accent px-6 py-3.5 text-base font-semibold text-white shadow-soft hover:bg-accent-hover transition-all duration-200"
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
  );
}
