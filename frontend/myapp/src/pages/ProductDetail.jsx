'use client'

import { useState, useEffect, useCallback } from 'react'
import { StarIcon } from '@heroicons/react/20/solid'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { addProduct } from '../Redux/action/action'
import { toast } from 'react-hot-toast'
import ProductImageGallery from '../components/ProductImageGallery'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function ProductDetail() {
  const [product, setProduct] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [selectedSize, setSelectedSize] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [addedToCart, setAddedToCart] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', name: '' })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewSuccess, setReviewSuccess] = useState(false)

  const dispatch = useDispatch()
  const { id } = useParams()
  const navigate = useNavigate()

  const { userInfo, isUserLoggedIn } = useSelector(state => state.productReducer || state)

  // Update review form name if logged in
  useEffect(() => {
    if (isUserLoggedIn && userInfo?.name) {
      setReviewForm(prev => ({ ...prev, name: userInfo.name }))
    }
  }, [isUserLoggedIn, userInfo]);

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${id}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch product: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        const productData = result.data

        // Transform data according to your database structure
        const transformedProduct = {
          // Basic product info
          _id: productData._id,
          name: productData.name,
          price: productData.price,
          originalPrice: productData.originalPrice,
          discountedPrice: productData.discountedPrice,
          discount: productData.discount,
          quantity: productData.quantity,
          sku: productData.sku,
          mainImage: productData.image, // This is the main image

          // Images array from backend
          additionalImages: productData.images && productData.images.length > 0
            ? productData.images.map(img => ({
              image: img.image || img.src, // Handle both formats
              short_description: img.short_description || img.alt || `${productData.name} view`
            }))
            : [],

          // Colors - transform to match expected structure
          colors: productData.colors && productData.colors.length > 0
            ? productData.colors.map(color => ({
              id: color.name?.toLowerCase(),
              name: color.name,
              class: color.class || `bg-gray-200`,
              selectedClass: color.selectedClass || `ring-2 ring-gray-400`
            }))
            : [],   // Empty = no color variants, no selector shown

          // Sizes - transform to match expected structure
          sizes: productData.sizes && productData.sizes.length > 0
            ? productData.sizes.map(size => ({
              id: size.name?.toLowerCase(),
              name: size.name,
              inStock: size.inStock !== undefined ? size.inStock : true
            }))
            : [],   // Empty = no size variants, no selector shown

          // Content
          description: productData.description,
          short_description: productData.short_description,
          highlights: productData.highlights,
          details: productData.details,

          // Navigation
          breadcrumbs: productData.breadcrumbs || [
            { id: 1, name: 'Home', href: '/' },
            { id: 2, name: productData.category || 'Category', href: `/category/${productData.category || ''}` }
          ],
          href: '#',

          // Additional fields from your database
          category: productData.category,
          tags: productData.tags,
          status: productData.status,
          featured: productData.featured,
          rating: productData.rating,
          reviews: productData.reviews || [],
          shipping: productData.shipping,
          meta: productData.meta
        }

        setProduct(transformedProduct)

        // Set default selections only if variants exist
        if (transformedProduct.colors && transformedProduct.colors.length > 0) {
          setSelectedColor(transformedProduct.colors[0])
        } else {
          setSelectedColor(null)
        }
        if (transformedProduct.sizes && transformedProduct.sizes.length > 0) {
          const firstAvailableSize = transformedProduct.sizes.find(size => size.inStock)
          setSelectedSize(firstAvailableSize || transformedProduct.sizes[0])
        } else {
          setSelectedSize(null)
        }
      } else {
        throw new Error(result.message || 'Failed to fetch product')
      }
    } catch (err) {
      console.error('Error fetching product:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) {
      fetchProduct()
    }
  }, [id, fetchProduct])

  const handleAddToCart = () => {
    if (!product) return

    const hasColors = product.colors && product.colors.length > 0
    const hasSizes = product.sizes && product.sizes.length > 0

    // Only require selection for products that actually have variants
    if (hasColors && !selectedColor) {
      toast.warn('Please select a color', { autoClose: 2000 })
      return
    }
    if (hasSizes && !selectedSize) {
      toast.warn('Please select a size', { autoClose: 2000 })
      return
    }

    const cartProduct = {
      _id: product._id,
      cartId: `${product._id}-${selectedColor?.name || 'no-color'}-${selectedSize?.name || 'no-size'}`,
      name: product.name,
      price: product.discountedPrice || product.price,
      discountedPrice: product.discountedPrice,
      image: product.mainImage, // Use mainImage instead of image
      selectedColor: selectedColor?.name || null,
      selectedSize: selectedSize?.name || null,
      quantity: 1,
    }

    dispatch(addProduct(cartProduct))
    setAddedToCart(true)
    toast.success('Added to cart! 🛒', { autoClose: 2000 })

    setTimeout(() => {
      setAddedToCart(false)
    }, 3000)
  }

  const handleColorChange = (color) => {
    setSelectedColor(color)
    setAddedToCart(false)
  }

  const handleSizeChange = (size) => {
    setSelectedSize(size)
    setAddedToCart(false)
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    setSubmittingReview(true)

    const reviewData = {
      ...reviewForm,
      name: isUserLoggedIn ? userInfo?.name : reviewForm.name
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${id}/rating`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData)
      })

      const result = await response.json()
      if (result.success) {
        await fetchProduct()  // refresh reviews after submit
        setReviewForm({ rating: 5, comment: '', name: '' })
        setReviewSuccess(true)
        toast.success('Review submitted! Thank you.', { autoClose: 3000 })
        setTimeout(() => setReviewSuccess(false), 4000)
      } else {
        throw new Error(result.message)
      }
    } catch (err) {
      console.error('Error submitting review:', err)
      toast.error(err.message || 'Failed to submit review. Please try again.', { autoClose: 4000 })
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white min-h-screen pt-24">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="bg-white min-h-screen pt-24">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
            <p className="text-gray-600 mb-4">{error || 'The product you are looking for does not exist.'}</p>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  const reviews = {
    href: '#',
    average: product.rating?.average || 0,
    totalCount: product.rating?.count || 0
  }

  const hasUserReviewed = isUserLoggedIn && userInfo?.name && product?.reviews?.some(
    (review) => review.name === userInfo.name
  );

  const displayPrice = product.discountedPrice || product.price
  const originalPrice = product.discountedPrice ? product.originalPrice : null

  return (
    <div className="bg-white">
      <div className="pt-6">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb">
          <ol role="list" className="mx-auto flex max-w-2xl items-center space-x-2 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
            {product.breadcrumbs.map((breadcrumb) => (
              <li key={breadcrumb.id}>
                <div className="flex items-center">
                  <button
                    onClick={() => navigate(breadcrumb.href)}
                    className="mr-2 text-sm font-medium text-gray-900 hover:text-indigo-600 transition-colors"
                  >
                    {breadcrumb.name}
                  </button>
                  <svg
                    fill="currentColor"
                    width={16}
                    height={20}
                    viewBox="0 0 16 20"
                    aria-hidden="true"
                    className="h-5 w-4 text-gray-300"
                  >
                    <path d="M5.697 4.34L8.98 16.532h1.327L7.025 4.341H5.697z" />
                  </svg>
                </div>
              </li>
            ))}
            <li className="text-sm">
              <span aria-current="page" className="font-medium text-gray-500">
                {product.name}
              </span>
            </li>
          </ol>
        </nav>

        {/* Image gallery with vertical thumbnails - UPDATED PROPS */}
        <div className="mx-auto mt-6 max-w-2xl sm:px-6 lg:max-w-7xl lg:grid">
          <ProductImageGallery
            mainImage={product.mainImage}
            images={product.additionalImages}
            productName={product.name}
          />
        </div>

        {/* Product info */}
        <div className="mx-auto max-w-2xl px-4 pt-10 pb-16 sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-3 lg:grid-rows-[auto_auto_1fr] lg:gap-x-8 lg:px-8 lg:pt-16 lg:pb-12">
          <div className="lg:col-span-2 lg:border-r lg:border-gray-200 lg:pr-8">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{product.name}</h1>

            {/* Price display with discount */}
            <div className="mt-4 flex items-center gap-2">
              <p className="text-3xl tracking-tight text-gray-900">₹{displayPrice}</p>
              {originalPrice && (
                <div className="flex items-center gap-2">
                  <p className="text-lg text-gray-500 line-through">₹{originalPrice}</p>
                  <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded-full">
                    Save {Math.round(((originalPrice - displayPrice) / originalPrice) * 100)}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Options */}
          <div className="mt-4 lg:row-span-3 lg:mt-0">
            <h2 className="sr-only">Product information</h2>

            {/* Reviews */}
            {reviews.totalCount > 0 && (
              <div className="mt-6">
                <h3 className="sr-only">Reviews</h3>
                <div className="flex items-center">
                  <div className="flex items-center">
                    {[0, 1, 2, 3, 4].map((rating) => (
                      <StarIcon
                        key={rating}
                        aria-hidden="true"
                        className={classNames(
                          reviews.average > rating ? 'text-yellow-400' : 'text-gray-200',
                          'size-5 shrink-0',
                        )}
                      />
                    ))}
                  </div>
                  <p className="sr-only">{reviews.average} out of 5 stars</p>
                  <a href={reviews.href} className="ml-3 text-sm font-medium text-indigo-600 hover:text-indigo-500">
                    {reviews.totalCount} reviews
                  </a>
                </div>
              </div>
            )}

            <form className="mt-10">
              {/* Colors */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900">Color</h3>
                    {selectedColor && (
                      <span className="text-sm text-gray-500">
                        Selected: <span className="font-medium">{selectedColor.name}</span>
                      </span>
                    )}
                  </div>

                  <fieldset aria-label="Choose a color" className="mt-4">
                    <div className="flex items-center gap-x-3">
                      {product.colors.map((color) => (
                        <div key={color.id} className="relative">
                          <input
                            id={`color-${color.id}`}
                            name="color"
                            type="radio"
                            checked={selectedColor?.id === color.id}
                            onChange={() => handleColorChange(color)}
                            className="sr-only"
                          />
                          <label
                            htmlFor={`color-${color.id}`}
                            className={classNames(
                              selectedColor?.id === color.id ? color.selectedClass : '',
                              'relative -m-0.5 flex cursor-pointer items-center justify-center rounded-full p-0.5 focus:outline-none'
                            )}
                          >
                            <span
                              aria-hidden="true"
                              className={classNames(
                                color.class,
                                'size-8 rounded-full border border-black/10'
                              )}
                            />
                          </label>
                        </div>
                      ))}
                    </div>
                  </fieldset>
                </div>
              )}

              {/* Sizes */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mt-10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900">Size</h3>
                    {selectedSize && (
                      <span className="text-sm text-gray-500">
                        Selected: <span className="font-medium">{selectedSize.name}</span>
                      </span>
                    )}
                  </div>

                  <fieldset aria-label="Choose a size" className="mt-4">
                    <div className="grid grid-cols-4 gap-3">
                      {product.sizes.map((size) => (
                        <div key={size.id} className="relative">
                          <input
                            id={`size-${size.id}`}
                            name="size"
                            type="radio"
                            checked={selectedSize?.id === size.id}
                            onChange={() => handleSizeChange(size)}
                            disabled={!size.inStock}
                            className="sr-only"
                          />
                          <label
                            htmlFor={`size-${size.id}`}
                            className={classNames(
                              selectedSize?.id === size.id
                                ? 'border-indigo-600 bg-indigo-600 text-white'
                                : 'border-gray-300 bg-white text-gray-900',
                              !size.inStock ? 'cursor-not-allowed bg-gray-50 text-gray-200' : 'cursor-pointer hover:bg-indigo-900',
                              'flex items-center justify-center rounded-md border py-3 px-3 text-sm font-medium uppercase sm:flex-1'
                            )}
                          >
                            {size.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </fieldset>
                </div>
              )}

              {/* Selection Summary */}
              {(selectedColor || selectedSize) && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Your Selection:</h4>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    {selectedColor && (
                      <div className="flex items-center gap-2">
                        <span>Color:</span>
                        <span className="font-medium text-gray-900">{selectedColor.name}</span>
                        {/* Show Tailwind class as an actual colored swatch */}
                        <span className={classNames(selectedColor.class, 'size-4 rounded-full border border-gray-300 inline-block')} />
                      </div>
                    )}
                    {selectedSize && (
                      <div className="flex items-center gap-2">
                        <span>Size:</span>
                        <span className="font-medium text-gray-900">{selectedSize.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Stock status */}
              <div className="mt-6">
                {product.quantity > 0 ? (
                  <p className="text-green-600 text-sm font-medium">
                    In Stock ({product.quantity} available)
                  </p>
                ) : (
                  <p className="text-red-600 text-sm font-medium">Out of Stock</p>
                )}
              </div>

              {/* Add to Cart Button */}
              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={
                    product.quantity === 0 ||
                    addedToCart ||
                    (product.colors?.length > 0 && !selectedColor) ||
                    (product.sizes?.length > 0 && !selectedSize)
                  }
                  className={classNames(
                    product.quantity === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : addedToCart
                        ? 'bg-green-600 hover:bg-green-700'
                        : (product.colors?.length > 0 && !selectedColor) || (product.sizes?.length > 0 && !selectedSize)
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-700',
                    'flex w-full items-center justify-center rounded-md border border-transparent px-8 py-3 text-base font-medium text-white focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden transition-colors duration-200'
                  )}
                >
                  {product.quantity === 0
                    ? 'Out of Stock'
                    : addedToCart
                      ? '✓ Added to Cart!'
                      : (product.colors?.length > 0 && !selectedColor) || (product.sizes?.length > 0 && !selectedSize)
                        ? 'Select Options'
                        : 'Add to Cart'
                  }
                </button>

                {addedToCart && (
                  <p className="text-green-600 text-sm text-center mt-2 font-medium">
                    ✓ Product added to your cart!
                  </p>
                )}
              </div>
            </form>
          </div>

          <div className="py-10 lg:col-span-2 lg:col-start-1 lg:border-r lg:border-gray-200 lg:pt-6 lg:pr-8 lg:pb-16">
            {/* Description */}
            <div>
              <h3 className="sr-only">Description</h3>
              <div className="space-y-6">
                <p className="text-base text-gray-900">{product.description}</p>
              </div>
            </div>

            {/* Highlights */}
            {product.highlights && product.highlights.length > 0 && (
              <div className="mt-10">
                <h3 className="text-sm font-medium text-gray-900">Highlights</h3>
                <div className="mt-4">
                  <ul role="list" className="list-disc space-y-2 pl-4 text-sm">
                    {product.highlights.map((highlight, index) => (
                      <li key={index} className="text-gray-400">
                        <span className="text-gray-600">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Details - only show if available */}
            {product.details && (
              <div className="mt-10">
                <h2 className="text-sm font-medium text-gray-900">Details</h2>
                <div className="mt-4 space-y-6">
                  <p className="text-sm text-gray-600">{product.details}</p>
                </div>
              </div>
            )}

            {/* Short Description */}
            {product.short_description && (
              <div className="mt-10">
                <h2 className="text-sm font-medium text-gray-900">Overview</h2>
                <div className="mt-4 space-y-6">
                  <p className="text-sm text-gray-600">{product.short_description}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================= PREMIUM REVIEWS SECTION ================= */}
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 border-t border-gray-200">

          {/* Header */}
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Customer Reviews
            </h2>
            <p className="mt-2 text-gray-500 text-sm">
              {reviews.totalCount} {reviews.totalCount === 1 ? "review" : "reviews"}
            </p>
          </div>

          {/* Rating Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">

            {/* Average Score */}
            <div className="flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100 p-10">
              <div className="text-5xl font-bold text-gray-900">
                {reviews.average.toFixed(1)}
              </div>
              <div className="flex mt-3">
                {[1, 2, 3, 4, 5].map(star => (
                  <StarIcon
                    key={star}
                    className={classNames(
                      reviews.average >= star ? "text-yellow-400" : "text-gray-200",
                      "h-6 w-6"
                    )}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">Average Rating</p>
            </div>

            {/* Distribution */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h3 className="text-lg font-medium text-gray-900 mb-6">
                Rating Breakdown
              </h3>

              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map(star => {
                  const count = product.reviews?.filter(r => Math.floor(r.rating) === star).length || 0;
                  const percentage = reviews.totalCount > 0 ? (count / reviews.totalCount) * 100 : 0;

                  return (
                    <div key={star} className="flex items-center gap-4">
                      <span className="w-10 text-sm text-gray-600">{star}★</span>

                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 transition-all duration-700"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>

                      <span className="w-8 text-xs text-gray-500 text-right">
                        {count}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

          </div>

          {/* Reviews + Form */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* Reviews List */}
            <div className="lg:col-span-2 space-y-6">

              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Recent Reviews
              </h3>

              {product.reviews?.length > 0 ? (
                product.reviews.map((review, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {review.name}
                        </h4>
                        <p className="text-xs text-gray-400">
                          {new Date(review.date).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex">
                        {[1, 2, 3, 4, 5].map(star => (
                          <StarIcon
                            key={star}
                            className={classNames(
                              review.rating >= star ? "text-yellow-400" : "text-gray-200",
                              "h-4 w-4"
                            )}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100">
                  <StarIcon className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">
                    No reviews yet. Be the first to review.
                  </p>
                </div>
              )}

            </div>

            {/* Review Form */}
            <div id="write-review" className="lg:col-span-1">

              <div className="sticky top-24 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Write a Review
                </h3>

                {reviewSuccess && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700">
                    Thank you for your review!
                  </div>
                )}

                {!isUserLoggedIn ? (
                  <div className="text-center py-6 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-gray-600 font-medium mb-4">You need to login first to write a review.</p>
                    <Link
                      to="/login"
                      className="inline-block bg-indigo-600 text-white rounded-md py-2 px-4 text-sm font-medium hover:bg-indigo-700 transition-colors"
                    >
                      Login Now
                    </Link>
                  </div>
                ) : hasUserReviewed ? (
                  <div className="text-center py-6 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-gray-600 font-medium">You have already submitted a review for this product.</p>
                  </div>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="space-y-5">

                    <input
                      type="text"
                      required
                      disabled={isUserLoggedIn}
                      placeholder="Your Name"
                      value={isUserLoggedIn ? userInfo?.name : reviewForm.name}
                      onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                      className={classNames(
                        isUserLoggedIn ? 'bg-gray-100 cursor-not-allowed text-gray-500' : '',
                        "w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      )}
                    />

                    {/* Rating */}
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map(rating => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setReviewForm({ ...reviewForm, rating })}
                        >
                          <StarIcon
                            className={classNames(
                              reviewForm.rating >= rating ? "text-yellow-400" : "text-gray-200",
                              "h-6 w-6 hover:text-yellow-400 transition-colors"
                            )}
                          />
                        </button>
                      ))}
                      <span className="text-sm text-gray-500 ml-2">
                        {reviewForm.rating}/5
                      </span>
                    </div>

                    <textarea
                      rows={4}
                      required
                      placeholder="Share your experience..."
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      className="w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                    />

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="w-full bg-indigo-600 text-white rounded-md py-2 text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60"
                    >
                      {submittingReview ? "Submitting..." : "Submit Review"}
                    </button>

                  </form>
                )}

              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}