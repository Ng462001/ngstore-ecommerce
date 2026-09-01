import { useState, useEffect, useCallback, useMemo } from "react";
import { StarIcon } from "@heroicons/react/20/solid";
import {
  HeartIcon,
  ShoppingCartIcon,
  PencilSquareIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  ArrowsUpDownIcon,
  CheckBadgeIcon,
  ChatBubbleBottomCenterTextIcon,
  SparklesIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  TrashIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
} from "@heroicons/react/24/outline";
import {
  HeartIcon as HeartIconSolid,
  BoltIcon as BoltIconSolid,
  HandThumbUpIcon as HandThumbUpIconSolid,
  HandThumbDownIcon as HandThumbDownIconSolid,
} from "@heroicons/react/24/solid";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Pagination } from "@mui/material";
import { addProduct, toggleWishlist } from "../Redux/action/action";
import { toast } from "react-hot-toast";
import ProductImageGallery from "../components/ProductImageGallery";
import EditReviewModal from "../components/EditReviewModal";
import RelatedProducts from "../components/RelatedProducts";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function ProductDetail() {
  const [product, setProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
    name: "",
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [reactingReviewId, setReactingReviewId] = useState(null);

  // Review Filter & Sort States
  const [selectedRatingFilter, setSelectedRatingFilter] = useState("all");
  const [reviewSearchQuery, setReviewSearchQuery] = useState("");
  const [reviewSortBy, setReviewSortBy] = useState("newest");
  const [onlyMyReviews, setOnlyMyReviews] = useState(false);
  const [reviewPage, setReviewPage] = useState(1);
  const [isReviewsAccordionOpen, setIsReviewsAccordionOpen] = useState(true);
  const REVIEWS_PER_PAGE = 3;

  const dispatch = useDispatch();
  const { id } = useParams();
  const navigate = useNavigate();

  const { userInfo, isUserLoggedIn } = useSelector(
    (state) => state.productReducer || state,
  );

  const wishlistItems = useSelector((state) => {
    if (!state) return [];
    if (state.productReducer) {
      return state.productReducer.wishlistItems || [];
    }
    return state.wishlistItems || [];
  });

  const isWishlisted = wishlistItems.some(
    (item) => (item._id || item.id) === (product?._id || id),
  );

  const handleWishlistToggle = async () => {
    if (!product) return;

    const token = localStorage.getItem("token");
    if (!isUserLoggedIn || !token) {
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }

    const productId = product._id || id;

    const colorToSave =
      selectedColor?.name ||
      (product.colors && product.colors.length > 0
        ? product.colors[0]?.name
        : null);
    const sizeToSave =
      selectedSize?.name ||
      (product.sizes && product.sizes.length > 0
        ? product.sizes.find((s) => s.inStock)?.name || product.sizes[0]?.name
        : null);

    const wishlistItem = {
      ...product,
      _id: productId,
      id: productId,
      selectedColor: colorToSave,
      selectedSize: sizeToSave,
      image: product.mainImage || product.image,
    };

    dispatch(toggleWishlist(wishlistItem));

    try {
      if (isWishlisted) {
        await fetch(
          `${import.meta.env.VITE_API_URL}/api/users/wishlist/${productId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          },
        );
      } else {
        await fetch(
          `${import.meta.env.VITE_API_URL}/api/users/wishlist/${productId}`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          },
        );
      }
    } catch (err) {
      console.error("Error syncing wishlist:", err);
    }
  };

  // Update review form name if logged in
  useEffect(() => {
    if (isUserLoggedIn && userInfo?.name) {
      setReviewForm((prev) => ({ ...prev, name: userInfo.name }));
    }
  }, [isUserLoggedIn, userInfo]);

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products/${id}`,
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch product: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        const productData = result.data;

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
          additionalImages:
            productData.images && productData.images.length > 0
              ? productData.images.map((img) => ({
                  image: img.image || img.src, // Handle both formats
                  short_description:
                    img.short_description ||
                    img.alt ||
                    `${productData.name} view`,
                }))
              : [],

          // Colors - transform to match expected structure
          colors:
            productData.colors && productData.colors.length > 0
              ? productData.colors.map((color) => ({
                  id: color.name?.toLowerCase(),
                  name: color.name,
                  class: color.class || `bg-gray-200`,
                  selectedClass: color.selectedClass || `ring-2 ring-gray-400`,
                }))
              : [], // Empty = no color variants, no selector shown

          // Sizes - transform to match expected structure
          sizes:
            productData.sizes && productData.sizes.length > 0
              ? productData.sizes.map((size) => ({
                  id: size.name?.toLowerCase(),
                  name: size.name,
                  inStock: size.inStock !== undefined ? size.inStock : true,
                }))
              : [], // Empty = no size variants, no selector shown

          // Content
          description: productData.description,
          short_description: productData.short_description,
          highlights: productData.highlights,
          details: productData.details,

          // Navigation
          breadcrumbs: productData.breadcrumbs || [
            { id: 1, name: "Home", href: "/" },
            {
              id: 2,
              name: productData.category || "Category",
              href: `/category/${productData.category || ""}`,
            },
          ],
          href: "#",

          // Additional fields from your database
          category: productData.category,
          tags: productData.tags,
          status: productData.status,
          featured: productData.featured,
          rating: productData.rating,
          reviews: productData.reviews || [],
          shipping: productData.shipping,
          meta: productData.meta,
        };

        setProduct(transformedProduct);

        // Set default selections only if variants exist
        if (transformedProduct.colors && transformedProduct.colors.length > 0) {
          setSelectedColor(transformedProduct.colors[0]);
        } else {
          setSelectedColor(null);
        }
        if (transformedProduct.sizes && transformedProduct.sizes.length > 0) {
          const firstAvailableSize = transformedProduct.sizes.find(
            (size) => size.inStock,
          );
          setSelectedSize(firstAvailableSize || transformedProduct.sizes[0]);
        } else {
          setSelectedSize(null);
        }
      } else {
        throw new Error(result.message || "Failed to fetch product");
      }
    } catch (err) {
      console.error("Error fetching product:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id, fetchProduct]);

  const handleAddToCart = () => {
    if (!product) return;

    const hasColors = product.colors && product.colors.length > 0;
    const hasSizes = product.sizes && product.sizes.length > 0;

    // Only require selection for products that actually have variants
    if (hasColors && !selectedColor) {
      toast.error("Please select a color");
      return;
    }
    if (hasSizes && !selectedSize) {
      toast.error("Please select a size");
      return;
    }

    const token = localStorage.getItem("token");
    if (!isUserLoggedIn || !token) {
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }

    const cartProduct = {
      _id: product._id,
      cartId: `${product._id}-${selectedColor?.name || "no-color"}-${selectedSize?.name || "no-size"}`,
      name: product.name,
      price: product.discountedPrice || product.price,
      discountedPrice: product.discountedPrice,
      image: product.mainImage, // Use mainImage instead of image
      selectedColor: selectedColor?.name || null,
      selectedSize: selectedSize?.name || null,
      quantity: 1,
    };

    dispatch(addProduct(cartProduct));
    setAddedToCart(true);
    toast.success("Added to cart!", { autoClose: 1000 });

    setTimeout(() => {
      setAddedToCart(false);
    }, 2000);
  };

  const handleBuyNow = () => {
    if (!product) return;

    if (product.quantity === 0) {
      toast.error("This product is out of stock");
      return;
    }

    const hasColors = product.colors && product.colors.length > 0;
    const hasSizes = product.sizes && product.sizes.length > 0;

    // Only require selection for products that actually have variants
    if (hasColors && !selectedColor) {
      toast.error("Please select a color before buying");
      return;
    }
    if (hasSizes && !selectedSize) {
      toast.error("Please select a size before buying");
      return;
    }

    const token = localStorage.getItem("token");
    if (!isUserLoggedIn || !token) {
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }

    const cartProduct = {
      _id: product._id,
      cartId: `${product._id}-${selectedColor?.name || "no-color"}-${selectedSize?.name || "no-size"}`,
      name: product.name,
      price: product.discountedPrice || product.price,
      discountedPrice: product.discountedPrice,
      image: product.mainImage,
      selectedColor: selectedColor?.name || null,
      selectedSize: selectedSize?.name || null,
      quantity: 1,
    };

    dispatch(addProduct(cartProduct));
    navigate("/checkout");
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.rating || reviewForm.rating < 1 || reviewForm.rating > 5) {
      toast.error("Please select a rating between 1 and 5 stars");
      return;
    }

    setSubmittingReview(true);

    const reviewData = {
      rating: Number(reviewForm.rating),
      comment: reviewForm.comment ? reviewForm.comment.trim() : "",
      name: isUserLoggedIn ? userInfo?.name : reviewForm.name || "Customer",
      userId: isUserLoggedIn ? userInfo?._id || userInfo?.id : undefined,
    };

    try {
      const headers = {
        "Content-Type": "application/json",
      };
      if (userInfo?.token) {
        headers["Authorization"] = `Bearer ${userInfo.token}`;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products/${id}/rating`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify(reviewData),
        },
      );

      const result = await response.json();
      if (result.success) {
        await fetchProduct(); // refresh reviews after submit
        setReviewForm({ rating: 5, comment: "", name: "" });
        setReviewSuccess(true);
        toast.success(
          reviewData.comment
            ? "Rating & review submitted! Thank you."
            : "Star rating submitted! Thank you.",
          { autoClose: 3000 },
        );
        setTimeout(() => setReviewSuccess(false), 4000);
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      toast.error(
        err.message || "Failed to submit rating/review. Please try again.",
        {
          autoClose: 4000,
        },
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  const reviews = useMemo(() => {
    const revs = product?.reviews || [];
    const validRatings = revs
      .map((r) => Number(r?.rating))
      .filter((r) => !isNaN(r) && r >= 1 && r <= 5);

    const ratingCount =
      product?.rating?.count !== undefined && product?.rating?.count !== null
        ? Number(product.rating.count)
        : validRatings.length;

    const reviewCount =
      product?.rating?.reviewCount !== undefined &&
      product?.rating?.reviewCount !== null
        ? Number(product.rating.reviewCount)
        : revs.filter(
            (r) =>
              r?.comment &&
              typeof r.comment === "string" &&
              r.comment.trim().length > 0,
          ).length;

    const average =
      product?.rating?.average !== undefined &&
      product?.rating?.average !== null
        ? Number(product.rating.average)
        : validRatings.length > 0
          ? validRatings.reduce((sum, val) => sum + val, 0) /
            validRatings.length
          : 0;

    return {
      href: "#reviews-section",
      average: parseFloat(Number(average).toFixed(1)),
      ratingCount,
      reviewCount,
      totalCount: ratingCount,
    };
  }, [product?.reviews, product?.rating]);

  const currentUserId = userInfo?._id || userInfo?.id;

  const userReview =
    isUserLoggedIn && currentUserId
      ? product?.reviews?.find((review) => {
          if (!review?.user) return false;
          const reviewUserId =
            typeof review.user === "object"
              ? review.user._id || review.user.id
              : review.user;
          return String(reviewUserId) === String(currentUserId);
        })
      : null;

  const hasUserReviewed = Boolean(userReview);

  const handleOpenEditModal = (rev) => {
    setEditingReview(rev || userReview);
    setIsEditModalOpen(true);
  };

  const handleDeleteReviewAdmin = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/reviews/${product._id || id}/${reviewId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${userInfo?.token || localStorage.getItem("token")}`,
          },
        },
      );
      const data = await response.json();
      if (data.success) {
        toast.success("Review deleted successfully");
        await fetchProduct();
      } else {
        throw new Error(data.message || "Failed to delete review");
      }
    } catch (err) {
      console.error("Error deleting review:", err);
      toast.error(err.message || "Failed to delete review");
    }
  };

  const handleReviewReaction = async (reviewId, action) => {
    if (!isUserLoggedIn) {
      toast.error("Please log in to like or dislike reviews");
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }

    const token = userInfo?.token || localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to react to reviews");
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }

    try {
      setReactingReviewId(reviewId);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products/${product._id || id}/reviews/${reviewId}/react`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            action,
            userId: currentUserId,
          }),
        },
      );

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update reaction");
      }

      if (result.data) {
        setProduct((prev) => ({
          ...prev,
          reviews: result.data.reviews || prev.reviews,
        }));
      } else {
        await fetchProduct();
      }
    } catch (err) {
      console.error("Error reacting to review:", err);
      toast.error(err.message || "Failed to react to review");
    } finally {
      setReactingReviewId(null);
    }
  };

  // Compute star counts from product rating breakdown or reviews
  const ratingCounts = useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    if (product?.rating?.breakdown) {
      for (let i = 1; i <= 5; i++) {
        counts[i] = Number(product.rating.breakdown[i]) || 0;
      }
      return counts;
    }

    if (
      product?.reviews &&
      Array.isArray(product.reviews) &&
      product.reviews.length > 0
    ) {
      product.reviews.forEach((r) => {
        const star = Math.min(
          5,
          Math.max(1, Math.round(Number(r?.rating) || 0)),
        );
        if (counts[star] !== undefined) {
          counts[star]++;
        }
      });
    }

    return counts;
  }, [product?.reviews, product?.rating?.breakdown]);

  // Filter only reviews that have non-empty written comments for the customer review cards list
  const writtenReviews = useMemo(() => {
    if (!product?.reviews || !Array.isArray(product.reviews)) return [];
    return product.reviews.filter(
      (r) =>
        r?.comment &&
        typeof r.comment === "string" &&
        r.comment.trim().length > 0,
    );
  }, [product?.reviews]);

  // Counts of positive (>= 4 stars) and negative (<= 3 stars) reviews
  const positiveReviewCount = useMemo(() => {
    return writtenReviews.filter((r) => {
      const star = Math.min(5, Math.max(1, Math.round(Number(r?.rating) || 0)));
      return star >= 4;
    }).length;
  }, [writtenReviews]);

  const negativeReviewCount = useMemo(() => {
    return writtenReviews.filter((r) => {
      const star = Math.min(5, Math.max(1, Math.round(Number(r?.rating) || 0)));
      return star <= 3;
    }).length;
  }, [writtenReviews]);

  // Filtered and sorted written reviews
  const filteredReviews = useMemo(() => {
    let list = [...writtenReviews];

    // Filter by rating sentiment (all, positive, negative) or star rating
    if (selectedRatingFilter === "positive") {
      list = list.filter((r) => {
        const star = Math.min(
          5,
          Math.max(1, Math.round(Number(r?.rating) || 0)),
        );
        return star >= 4;
      });
    } else if (selectedRatingFilter === "negative") {
      list = list.filter((r) => {
        const star = Math.min(
          5,
          Math.max(1, Math.round(Number(r?.rating) || 0)),
        );
        return star <= 3;
      });
    } else if (selectedRatingFilter !== "all") {
      const targetStar = Number(selectedRatingFilter);
      if (!isNaN(targetStar)) {
        list = list.filter((r) => {
          const star = Math.min(
            5,
            Math.max(1, Math.round(Number(r?.rating) || 0)),
          );
          return star === targetStar;
        });
      }
    }

    // Filter by "only my reviews"
    if (onlyMyReviews && isUserLoggedIn && currentUserId) {
      list = list.filter((r) => {
        if (
          userReview &&
          (r._id === userReview._id || r.id === userReview._id)
        ) {
          return true;
        }
        if (!r?.user) return false;
        const reviewUserId =
          typeof r.user === "object" ? r.user._id || r.user.id : r.user;
        return String(reviewUserId) === String(currentUserId);
      });
    }

    // Filter by search query
    if (reviewSearchQuery.trim()) {
      const q = reviewSearchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.comment?.toLowerCase().includes(q) ||
          r.name?.toLowerCase().includes(q),
      );
    }

    // Sort
    list.sort((a, b) => {
      const ratingA = Number(a?.rating) || 0;
      const ratingB = Number(b?.rating) || 0;
      const dateA = new Date(a?.date || 0).getTime();
      const dateB = new Date(b?.date || 0).getTime();

      if (reviewSortBy === "highest") {
        return ratingB - ratingA || dateB - dateA;
      }
      if (reviewSortBy === "lowest") {
        return ratingA - ratingB || dateB - dateA;
      }
      if (reviewSortBy === "oldest") {
        return dateA - dateB;
      }
      // default "newest"
      return dateB - dateA;
    });

    return list;
  }, [
    writtenReviews,
    selectedRatingFilter,
    onlyMyReviews,
    reviewSearchQuery,
    reviewSortBy,
    isUserLoggedIn,
    currentUserId,
    userReview,
  ]);

  // Reset pagination to page 1 when any filter/search/sort changes
  useEffect(() => {
    setReviewPage(1);
  }, [selectedRatingFilter, reviewSearchQuery, onlyMyReviews, reviewSortBy]);

  const totalReviewPages =
    Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE) || 1;

  const paginatedReviews = useMemo(() => {
    const startIndex = (reviewPage - 1) * REVIEWS_PER_PAGE;
    return filteredReviews.slice(startIndex, startIndex + REVIEWS_PER_PAGE);
  }, [filteredReviews, reviewPage]);

  const handleClearReviewFilters = () => {
    setSelectedRatingFilter("all");
    setReviewSearchQuery("");
    setReviewSortBy("newest");
    setOnlyMyReviews(false);
    setReviewPage(1);
  };

  const isAnyFilterActive =
    selectedRatingFilter !== "all" ||
    reviewSearchQuery.trim() !== "" ||
    onlyMyReviews ||
    reviewSortBy !== "newest";

  if (loading) {
    return (
      <div className="bg-white min-h-screen pt-24">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-white min-h-screen pt-24">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Product Not Found
            </h2>
            <p className="text-gray-600 mb-4">
              {error || "The product you are looking for does not exist."}
            </p>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Safe price parser
  const numPrice = parseFloat(product?.price) || 0;
  const numDiscounted = parseFloat(product?.discountedPrice) || 0;
  const numOriginal = parseFloat(product?.originalPrice) || 0;

  const displayPrice =
    numDiscounted > 0 && numDiscounted < numPrice ? numDiscounted : numPrice;
  const originalPrice =
    numDiscounted > 0 && numDiscounted < numPrice
      ? numOriginal > 0
        ? numOriginal
        : numPrice
      : numOriginal > numPrice
        ? numOriginal
        : null;

  const fmtPrice = (val) =>
    val.toLocaleString("en-IN", { maximumFractionDigits: 2 });

  return (
    <div className="bg-background min-h-screen pb-12">
      <div className="pt-8">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb">
          <ol
            role="list"
            className="mx-auto flex max-w-2xl items-center space-x-2 px-4 sm:px-6 lg:max-w-7xl lg:px-8"
          >
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
          <div className="lg:col-span-2 lg:border-r lg:border-border-light lg:pr-8">
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
              {product.name}
            </h1>

            {/* Price display with discount */}
            <div className="mt-4 flex items-center gap-3">
              <p className="text-3xl font-bold tracking-tight text-text-primary">
                ₹{fmtPrice(displayPrice)}
              </p>
              {originalPrice && (
                <div className="flex items-center gap-2">
                  <p className="text-lg text-text-secondary line-through">
                    ₹{fmtPrice(originalPrice)}
                  </p>
                  <span className="bg-error/10 text-error text-xs font-semibold px-2.5 py-1 rounded-full border border-error/20">
                    Save{" "}
                    {Math.round(
                      ((originalPrice - displayPrice) / originalPrice) * 100,
                    )}
                    %
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Options */}
          <div className="mt-4 lg:row-span-3 lg:mt-0">
            <h2 className="sr-only">Product information</h2>

            {/* Rating & Review Pill Badge */}
            {reviews.ratingCount > 0 && (
              <div className="mt-4">
                <h3 className="sr-only">Reviews</h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsReviewsAccordionOpen(true);
                    const el = document.getElementById("reviews-section");
                    if (el)
                      el.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                  }}
                  className="inline-flex items-center gap-2.5 px-3 py-1.5 bg-[#F6F6F6] hover:bg-[#EFEFEF] dark:bg-surface dark:hover:bg-surface-muted rounded-xl border border-border-light shadow-2xs hover:shadow-xs transition-all cursor-pointer group active:scale-[0.98]"
                >
                  <div className="flex items-center gap-1 font-bold text-sm text-text-primary">
                    <span>
                      {reviews.average > 0 ? reviews.average.toFixed(1) : "0.0"}
                    </span>
                    <StarIcon
                      aria-hidden="true"
                      className="size-4 text-amber-400 fill-amber-400 shrink-0"
                    />
                  </div>

                  <span className="h-4 w-[1px] bg-border-light group-hover:bg-border transition-colors" />

                  <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">
                    {reviews.ratingCount.toLocaleString()}{" "}
                    {reviews.ratingCount === 1 ? "Rating" : "Ratings"}
                  </span>
                </button>
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
                        Selected:{" "}
                        <span className="font-medium">
                          {selectedColor.name}
                        </span>
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
                              selectedColor?.id === color.id
                                ? color.selectedClass
                                : "",
                              "relative -m-0.5 flex cursor-pointer items-center justify-center rounded-full p-0.5 focus:outline-none",
                            )}
                          >
                            <span
                              aria-hidden="true"
                              className={classNames(
                                color.class,
                                "size-8 rounded-full border border-black/10",
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
                        Selected:{" "}
                        <span className="font-medium">{selectedSize.name}</span>
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
                                ? "border-accent bg-accent text-white shadow-xs"
                                : "border-border-light bg-surface text-text-primary hover:border-accent hover:text-accent",
                              !size.inStock
                                ? "cursor-not-allowed bg-surface-muted text-text-secondary/50"
                                : "cursor-pointer",
                              "flex items-center justify-center rounded-xl border py-3 px-3 text-sm font-medium uppercase transition-colors",
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
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Your Selection:
                  </h4>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    {selectedColor && (
                      <div className="flex items-center gap-2">
                        <span>Color:</span>
                        <span className="font-medium text-gray-900">
                          {selectedColor.name}
                        </span>
                        {/* Show Tailwind class as an actual colored swatch */}
                        <span
                          className={classNames(
                            selectedColor.class,
                            "size-4 rounded-full border border-gray-300 inline-block",
                          )}
                        />
                      </div>
                    )}
                    {selectedSize && (
                      <div className="flex items-center gap-2">
                        <span>Size:</span>
                        <span className="font-medium text-gray-900">
                          {selectedSize.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Stock status */}
              <div className="mt-6">
                {product.quantity <= 0 ? (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-semibold shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    <span>Out of Stock</span>
                  </div>
                ) : product.quantity <= 5 ? (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm font-semibold shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    <span>
                      Hurry, only {product.quantity}{" "}
                      {product.quantity === 1 ? "item" : "items"} left in stock
                      — order soon!
                    </span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>In Stock</span>
                  </div>
                )}
              </div>

              {/* Action Buttons: Buy Now, Add to Cart & Wishlist */}
              <div className="mt-8 space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Buy Now Button (Primary Instant Action) */}
                  <button
                    type="button"
                    onClick={handleBuyNow}
                    disabled={product.quantity === 0}
                    className={classNames(
                      product.quantity === 0
                        ? "bg-border-light text-text-secondary cursor-not-allowed"
                        : "bg-accent hover:bg-accent-hover text-white shadow-soft hover:shadow-card active:scale-[0.98]",
                      "flex-1 flex items-center justify-center gap-2 rounded-xl border border-transparent px-6 py-3.5 text-base font-semibold focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:outline-hidden transition-all duration-200 cursor-pointer",
                    )}
                  >
                    <BoltIconSolid className="w-5 h-5 text-white" />
                    <span>
                      {product.quantity === 0 ? "Out of Stock" : "Buy Now"}
                    </span>
                  </button>

                  {/* Add to Cart Button (Secondary Action) */}
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
                        ? "bg-border-light text-text-secondary cursor-not-allowed border-transparent"
                        : addedToCart
                          ? "bg-success text-white border-transparent"
                          : (product.colors?.length > 0 && !selectedColor) ||
                              (product.sizes?.length > 0 && !selectedSize)
                            ? "bg-surface-muted text-text-secondary border-border-light cursor-not-allowed"
                            : "bg-surface hover:bg-accent-light text-accent border-2 border-accent hover:border-accent-hover shadow-xs active:scale-[0.98]",
                      "flex-1 flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-semibold focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:outline-hidden transition-all duration-200 cursor-pointer",
                    )}
                  >
                    {addedToCart ? (
                      <span>✓ Added</span>
                    ) : (
                      <>
                        <ShoppingCartIcon className="w-5 h-5" />
                        <span>
                          {(product.colors?.length > 0 && !selectedColor) ||
                          (product.sizes?.length > 0 && !selectedSize)
                            ? "Select Options"
                            : "Cart"}
                        </span>
                      </>
                    )}
                  </button>

                  {/* Wishlist Button */}
                  <button
                    type="button"
                    onClick={handleWishlistToggle}
                    className={classNames(
                      isWishlisted
                        ? "bg-accent-light text-accent border-accent/40 shadow-xs"
                        : "bg-surface text-text-secondary border-border-light hover:border-accent hover:text-accent",
                      "flex items-center justify-center rounded-xl border p-3.5 text-base font-medium transition-colors duration-200 cursor-pointer sm:w-auto",
                    )}
                    title={
                      isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"
                    }
                  >
                    {isWishlisted ? (
                      <HeartIconSolid className="size-6 text-accent" />
                    ) : (
                      <HeartIcon className="size-6 text-text-secondary hover:text-accent" />
                    )}
                  </button>
                </div>
              </div>

              {addedToCart && (
                <p className="text-green-600 text-sm text-center mt-2 font-medium">
                  ✓ Product added to your cart!
                </p>
              )}
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
                <h3 className="text-sm font-medium text-gray-900">
                  Highlights
                </h3>
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
                  <p className="text-sm text-gray-600">
                    {product.short_description}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================= PREMIUM REVIEWS ACCORDION SECTION ================= */}
        <div
          id="reviews-section"
          className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 border-t border-border-light/30 scroll-mt-20"
        >
          {/* Accordion Trigger Header */}
          <div
            onClick={() => setIsReviewsAccordionOpen((prev) => !prev)}
            className="w-full bg-surface hover:bg-surface/80 border border-border-light rounded-3xl p-6 sm:p-7 shadow-card cursor-pointer transition-all duration-300 select-none group"
            role="button"
            aria-expanded={isReviewsAccordionOpen}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setIsReviewsAccordionOpen((prev) => !prev);
              }
            }}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
              {/* Left: Title & Badge */}
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold uppercase tracking-wider">
                  <ChatBubbleBottomCenterTextIcon className="h-3.5 w-3.5" />
                  <span>Customer Opinions</span>
                </div>
                <div className="flex items-center gap-3">
                  <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-text-primary group-hover:text-accent transition-colors">
                    Customer Ratings & Reviews
                  </h2>
                </div>
                <p className="text-text-secondary text-xs sm:text-sm">
                  {reviews.ratingCount > 0
                    ? `Based on ${reviews.ratingCount} authentic verified customer ${reviews.ratingCount === 1 ? "rating" : "ratings"}${reviews.reviewCount > 0 ? ` (${reviews.reviewCount} written ${reviews.reviewCount === 1 ? "review" : "reviews"})` : ""}`
                    : "No ratings or reviews yet. Be the first to share your experience!"}
                </p>
              </div>

              {/* Right: Stats & Accordion Toggle Button */}
              <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
                {/* Quick stats pill */}
                <div className="flex items-center gap-2.5 bg-background rounded-2xl border border-border-light px-4 py-2.5 shadow-xs">
                  <span className="text-2xl font-black text-text-primary">
                    {reviews.average > 0 ? reviews.average.toFixed(1) : "0.0"}
                  </span>
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon
                        key={star}
                        className={classNames(
                          (reviews.average || 0) >= star
                            ? "text-amber-400"
                            : "text-gray-200",
                          "h-4 w-4",
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-text-secondary font-semibold pl-2 border-l border-border-light">
                    {reviews.ratingCount}{" "}
                    {reviews.ratingCount === 1 ? "rating" : "ratings"}
                  </span>
                </div>

                {/* Accordion Expand/Collapse Button */}
                <div className="flex items-center justify-center gap-2 bg-accent text-white group-hover:bg-accent-hover px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-soft shrink-0 min-w-[135px] sm:min-w-[140px]">
                  <span>
                    {isReviewsAccordionOpen ? "Hide Reviews" : "Show Reviews"}
                  </span>
                  <ChevronDownIcon
                    className={classNames(
                      "h-4 w-4 transition-transform duration-300 shrink-0",
                      isReviewsAccordionOpen ? "rotate-180" : "rotate-0",
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Accordion Collapsible Content */}
          {isReviewsAccordionOpen && (
            <div className="mt-8 transition-all duration-300">
              {/* Main 2-Column Responsive Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* LEFT COLUMN: Rating Breakdown & Write Review Form (4 cols on lg) */}
                <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
                  {/* Rating Overview Card */}
                  <div className="bg-surface rounded-3xl p-6 border border-border-light shadow-card space-y-5">
                    <div className="flex items-center justify-between pb-4 border-b border-border-light/60">
                      <div>
                        <h3 className="text-base font-bold text-text-primary">
                          Rating Overview
                        </h3>
                        <p className="text-xs text-text-secondary mt-0.5">
                          Based on customer scores
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-black text-text-primary tracking-tight">
                          {reviews.average > 0
                            ? reviews.average.toFixed(1)
                            : "0.0"}
                        </span>
                        <span className="text-xs font-semibold text-text-secondary">
                          /5
                        </span>
                      </div>
                    </div>

                    {/* Rating Breakdown Bars */}
                    <div className="space-y-2.5">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = ratingCounts[star] || 0;
                        const percentage =
                          reviews.ratingCount > 0
                            ? (count / reviews.ratingCount) * 100
                            : 0;

                        return (
                          <div
                            key={star}
                            className="w-full flex items-center gap-3 py-1.5 px-1 text-left"
                          >
                            <div className="flex items-center gap-1 w-10 text-xs font-semibold text-text-primary">
                              <span>{star}</span>
                              <StarIcon className="h-3.5 w-3.5 text-amber-400" />
                            </div>

                            <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-amber-400 rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>

                            <div className="w-12 text-right">
                              <span className="text-xs text-text-secondary font-medium">
                                {count}
                              </span>
                              <span className="text-[10px] text-text-secondary/60 ml-0.5">
                                ({Math.round(percentage)}%)
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Write Review or Your Review Card */}
                  <div
                    id="write-review"
                    className="bg-surface rounded-3xl p-6 border border-border-light shadow-card"
                  >
                    <div className="flex items-center justify-between mb-5 pb-4 border-b border-border-light/60">
                      <h3 className="font-heading text-lg font-bold text-text-primary">
                        {hasUserReviewed
                          ? "Your Rating & Review"
                          : "Rate & Review"}
                      </h3>
                      <span className="text-[11px] font-semibold text-accent bg-accent/10 px-2.5 py-0.5 rounded-full border border-accent/20">
                        {hasUserReviewed ? "Submitted" : "Share Experience"}
                      </span>
                    </div>

                    {reviewSuccess && (
                      <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
                        <CheckBadgeIcon className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                        <span>
                          Thank you! Your rating/review has been submitted.
                        </span>
                      </div>
                    )}

                    {!isUserLoggedIn ? (
                      <div className="text-center py-6 px-4 bg-surface-muted rounded-2xl border border-border-light space-y-3">
                        <p className="text-text-secondary text-xs leading-relaxed">
                          Have you used this product? Log in to give a star
                          rating or share your thoughts to help other shoppers.
                        </p>
                        <Link
                          to="/login"
                          className="inline-flex items-center justify-center bg-accent hover:bg-accent-hover text-white rounded-xl py-2.5 px-5 text-xs font-bold transition-all shadow-soft cursor-pointer"
                        >
                          Login to Rate & Review
                        </Link>
                      </div>
                    ) : hasUserReviewed ? (
                      <div className="p-4 bg-surface-muted rounded-2xl border border-border-light space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-amber-400">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <StarIcon
                                key={star}
                                className={classNames(
                                  (userReview?.rating || 0) >= star
                                    ? "text-amber-400"
                                    : "text-gray-200",
                                  "h-4 w-4",
                                )}
                              />
                            ))}
                            <span className="text-xs font-bold text-text-primary ml-1.5">
                              {userReview?.rating} / 5
                            </span>
                          </div>
                          <span className="text-[11px] text-text-secondary font-medium">
                            {userReview?.date
                              ? new Date(userReview.date).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  },
                                )
                              : "Recently"}
                          </span>
                        </div>

                        {userReview?.comment && userReview.comment.trim() ? (
                          <p className="text-xs text-text-primary italic leading-relaxed whitespace-pre-line bg-background p-3 rounded-xl border border-border-light">
                            "{userReview.comment}"
                          </p>
                        ) : (
                          <p className="text-xs text-text-secondary italic bg-background p-2.5 rounded-xl border border-border-light">
                            ⭐ You submitted a star rating without a written
                            review.
                          </p>
                        )}

                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(userReview)}
                          className="w-full inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white rounded-xl py-2.5 px-4 text-xs font-bold transition-all shadow-soft active:scale-[0.98] cursor-pointer"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                          <span>
                            {userReview?.comment && userReview.comment.trim()
                              ? "Edit Your Rating & Review"
                              : "Edit Rating / Add Written Review"}
                          </span>
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleReviewSubmit} className="space-y-4">
                        <div>
                          <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">
                            Reviewer Name
                          </label>
                          <input
                            type="text"
                            disabled={isUserLoggedIn}
                            placeholder="Your Name"
                            value={
                              isUserLoggedIn ? userInfo?.name : reviewForm.name
                            }
                            onChange={(e) =>
                              setReviewForm({
                                ...reviewForm,
                                name: e.target.value,
                              })
                            }
                            className="w-full rounded-xl border border-border-light bg-background p-2.5 text-xs text-text-primary focus:border-accent focus:ring-1 focus:ring-accent outline-none shadow-xs disabled:bg-surface-muted disabled:text-text-secondary"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">
                            Overall Rating{" "}
                            <span className="text-rose-500">*</span>
                          </label>
                          <div className="flex items-center gap-1.5 py-1">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <button
                                key={rating}
                                type="button"
                                onClick={() =>
                                  setReviewForm({ ...reviewForm, rating })
                                }
                                className="p-0.5 hover:scale-110 transition-transform cursor-pointer"
                              >
                                <StarIcon
                                  className={classNames(
                                    reviewForm.rating >= rating
                                      ? "text-amber-400 fill-amber-400"
                                      : "text-gray-200",
                                    "h-6 w-6 transition-colors",
                                  )}
                                />
                              </button>
                            ))}
                            <span className="text-xs font-bold text-accent ml-2">
                              {reviewForm.rating} / 5 Stars
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">
                            Detailed Review{" "}
                            <span className="text-text-secondary/60 font-normal lowercase">
                              (optional)
                            </span>
                          </label>
                          <textarea
                            rows={3}
                            placeholder="Write your thoughts about quality, comfort, fit, and design (optional)..."
                            value={reviewForm.comment}
                            onChange={(e) =>
                              setReviewForm({
                                ...reviewForm,
                                comment: e.target.value,
                              })
                            }
                            className="w-full rounded-xl border border-border-light bg-background p-2.5 text-xs text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:ring-1 focus:ring-accent outline-none resize-none shadow-xs"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={
                            submittingReview ||
                            !reviewForm.rating ||
                            reviewForm.rating < 1 ||
                            reviewForm.rating > 5
                          }
                          className="w-full bg-accent hover:bg-accent-hover text-white rounded-xl py-2.5 px-4 text-xs font-bold transition-all shadow-soft disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
                        >
                          {submittingReview ? (
                            <>
                              <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                              <span>Submitting...</span>
                            </>
                          ) : (
                            <span>
                              {reviewForm.comment && reviewForm.comment.trim()
                                ? "Submit Rating & Review"
                                : "Submit Star Rating"}
                            </span>
                          )}
                        </button>
                      </form>
                    )}
                  </div>
                </div>

                {/* RIGHT COLUMN: Filter Toolbar & Review Cards List (8 cols on lg) */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Filter & Sort Bar */}
                  <div className="bg-surface rounded-3xl border border-border-light p-5 sm:p-6 shadow-card space-y-4">
                    {/* Search & Sort Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-light/60">
                      {/* Search Input */}
                      <div className="relative flex-1">
                        <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                        <input
                          type="text"
                          placeholder="Search reviews by keywords or reviewer name..."
                          value={reviewSearchQuery}
                          onChange={(e) => setReviewSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-9 py-2 text-xs bg-background border border-border-light rounded-xl text-text-primary placeholder:text-text-secondary/60 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all shadow-xs"
                        />
                        {reviewSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setReviewSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-text-secondary hover:text-text-primary rounded-full cursor-pointer"
                            title="Clear search"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      {/* Sort Dropdown */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <ArrowsUpDownIcon className="h-4 w-4 text-text-secondary" />
                        <select
                          id="review-sort"
                          value={reviewSortBy}
                          onChange={(e) => setReviewSortBy(e.target.value)}
                          className="text-xs font-semibold bg-background border border-border-light rounded-xl px-3 py-2 text-text-primary focus:border-accent focus:ring-1 focus:ring-accent outline-none cursor-pointer shadow-xs"
                          aria-label="Sort reviews by"
                        >
                          <option value="newest">Most Recent</option>
                          <option value="highest">Highest Rating</option>
                          <option value="lowest">Lowest Rating</option>
                          <option value="oldest">Oldest First</option>
                        </select>
                      </div>
                    </div>

                    {/* Filter Pills Row */}
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="text-text-secondary font-semibold mr-1 flex items-center gap-1">
                        <FunnelIcon className="h-3.5 w-3.5 text-accent" />{" "}
                        Filter:
                      </span>

                      {/* All Button */}
                      <button
                        type="button"
                        onClick={() => setSelectedRatingFilter("all")}
                        className={classNames(
                          selectedRatingFilter === "all"
                            ? "bg-accent text-white shadow-xs font-bold"
                            : "bg-surface-muted text-text-secondary hover:bg-gray-200 font-medium",
                          "px-3 py-1.5 rounded-xl transition-all cursor-pointer",
                        )}
                      >
                        All ({writtenReviews.length})
                      </button>

                      {/* Positive Reviews Pill */}
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedRatingFilter((prev) =>
                            prev === "positive" ? "all" : "positive",
                          )
                        }
                        className={classNames(
                          selectedRatingFilter === "positive"
                            ? "bg-emerald-600 text-white shadow-xs font-bold"
                            : "bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100 font-medium",
                          "px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5",
                        )}
                      >
                        <HandThumbUpIcon className="h-3.5 w-3.5" />
                        <span>Positive</span>
                        <span
                          className={classNames(
                            selectedRatingFilter === "positive"
                              ? "text-emerald-100"
                              : "text-emerald-700 font-bold",
                          )}
                        ></span>
                      </button>

                      {/* Negative Reviews Pill */}
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedRatingFilter((prev) =>
                            prev === "negative" ? "all" : "negative",
                          )
                        }
                        className={classNames(
                          selectedRatingFilter === "negative"
                            ? "bg-rose-600 text-white shadow-xs font-bold"
                            : "bg-rose-50 text-rose-800 border border-rose-200/80 hover:bg-rose-100 font-medium",
                          "px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5",
                        )}
                      >
                        <HandThumbDownIcon className="h-3.5 w-3.5" />
                        <span>Negative</span>
                        <span
                          className={classNames(
                            selectedRatingFilter === "negative"
                              ? "text-rose-100"
                              : "text-rose-700 font-bold",
                          )}
                        ></span>
                      </button>

                      {/* Only My Reviews */}
                      {isUserLoggedIn && userReview && (
                        <button
                          type="button"
                          onClick={() => setOnlyMyReviews((prev) => !prev)}
                          className={classNames(
                            onlyMyReviews
                              ? "bg-accent text-white shadow-xs font-bold"
                              : "bg-surface-muted text-text-secondary hover:bg-gray-200 font-medium",
                            "px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1",
                          )}
                        >
                          <span>My Review</span>
                        </button>
                      )}

                      {/* Reset All */}
                      {isAnyFilterActive && (
                        <button
                          type="button"
                          onClick={handleClearReviewFilters}
                          className="ml-auto inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-bold px-2.5 py-1 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        >
                          <XMarkIcon className="h-3.5 w-3.5" />
                          <span>Reset Filters</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Review Cards List */}
                  <div className="space-y-4">
                    {filteredReviews.length > 0 ? (
                      <>
                        {paginatedReviews.map((review, index) => {
                          const reviewUserId =
                            typeof review?.user === "object"
                              ? review.user._id || review.user.id
                              : review?.user;
                          const isMyReview =
                            isUserLoggedIn &&
                            Boolean(currentUserId) &&
                            ((userReview &&
                              (review._id === userReview._id ||
                                review.id === userReview._id)) ||
                              (reviewUserId &&
                                String(reviewUserId) ===
                                  String(currentUserId)));

                          const reviewerInitial = (review.name || "U")
                            .trim()
                            .charAt(0)
                            .toUpperCase();

                          return (
                            <div
                              key={review._id || index}
                              className={classNames(
                                isMyReview
                                  ? "bg-accent/[0.02] border-accent/30 ring-1 ring-accent/20"
                                  : "bg-surface border-border-light",
                                "rounded-3xl border p-6 shadow-card hover:shadow-md transition-all space-y-3.5",
                              )}
                            >
                              {/* Header: User Avatar + Name + Date + Rating */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  {/* Avatar Badge */}
                                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/40 text-accent font-bold flex items-center justify-center text-sm border border-accent/20 shadow-xs flex-shrink-0">
                                    {reviewerInitial}
                                  </div>

                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h4 className="font-bold text-text-primary text-sm">
                                        {review.name || "Verified Customer"}
                                      </h4>
                                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                                        <CheckBadgeIcon className="h-3.5 w-3.5 text-emerald-600" />
                                        <span>Verified Buyer</span>
                                      </span>
                                      {isMyReview && (
                                        <span className="inline-flex items-center gap-1 bg-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                                          Your Review
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-text-secondary mt-0.5">
                                      Reviewed on{" "}
                                      {review.date
                                        ? new Date(
                                            review.date,
                                          ).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                          })
                                        : "Recent Date"}
                                    </p>
                                  </div>
                                </div>

                                {/* Star Rating and Edit button */}
                                <div className="flex items-center gap-3 self-start sm:self-auto">
                                  <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/70 px-2.5 py-1 rounded-xl">
                                    <span className="text-xs font-bold text-amber-700">
                                      {Number(review.rating).toFixed(1)}
                                    </span>
                                    <div className="flex text-amber-400">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <StarIcon
                                          key={star}
                                          className={classNames(
                                            review.rating >= star
                                              ? "text-amber-400"
                                              : "text-gray-200",
                                            "h-3.5 w-3.5",
                                          )}
                                        />
                                      ))}
                                    </div>
                                  </div>

                                  {(isMyReview ||
                                    userInfo?.role === "admin") && (
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleOpenEditModal(review)
                                        }
                                        className="inline-flex items-center gap-1 text-xs font-bold text-accent hover:text-accent-hover bg-accent/10 hover:bg-accent/20 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer"
                                        title={
                                          userInfo?.role === "admin" &&
                                          !isMyReview
                                            ? "Edit review (Admin)"
                                            : "Edit this review"
                                        }
                                      >
                                        <PencilSquareIcon className="h-3.5 w-3.5" />
                                        <span>Edit</span>
                                      </button>

                                      {userInfo?.role === "admin" && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleDeleteReviewAdmin(review._id)
                                          }
                                          className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer"
                                          title="Delete review (Admin)"
                                        >
                                          <TrashIcon className="h-3.5 w-3.5" />
                                          <span>Delete</span>
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Review Comment Body */}
                              <p className="text-text-primary text-sm leading-relaxed whitespace-pre-line pl-0 sm:pl-13">
                                {review.comment}
                              </p>

                              {/* Review Reaction (Like / Dislike) Row - Hidden for user's own review */}
                              {!isMyReview && (() => {
                                const likesArr = Array.isArray(review.likes)
                                  ? review.likes
                                  : [];
                                const dislikesArr = Array.isArray(
                                  review.dislikes,
                                )
                                  ? review.dislikes
                                  : [];
                                const likesCount = likesArr.length;
                                const dislikesCount = dislikesArr.length;

                                const hasLiked =
                                  isUserLoggedIn &&
                                  Boolean(currentUserId) &&
                                  likesArr.some((uid) => {
                                    const uidStr =
                                      typeof uid === "object" && uid
                                        ? uid._id || uid.id
                                        : uid;
                                    return (
                                      String(uidStr) === String(currentUserId)
                                    );
                                  });

                                const hasDisliked =
                                  isUserLoggedIn &&
                                  Boolean(currentUserId) &&
                                  dislikesArr.some((uid) => {
                                    const uidStr =
                                      typeof uid === "object" && uid
                                        ? uid._id || uid.id
                                        : uid;
                                    return (
                                      String(uidStr) === String(currentUserId)
                                    );
                                  });

                                const isReacting =
                                  reactingReviewId === review._id;

                                return (
                                  <div className="flex items-center justify-between pt-3 border-t border-border-light/60 pl-0 sm:pl-13 text-xs">
                                    <span className="text-[11px] font-medium text-text-secondary/70">
                                      Was this review helpful?
                                    </span>

                                    <div className="flex items-center gap-2">
                                      {/* Like Button */}
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleReviewReaction(
                                            review._id,
                                            "like",
                                          )
                                        }
                                        disabled={isReacting}
                                        className={classNames(
                                          hasLiked
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-300 font-bold shadow-xs"
                                            : "bg-surface-muted/70 text-text-secondary hover:text-text-primary hover:bg-gray-200 border-border-light/40 font-medium",
                                          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs transition-all cursor-pointer disabled:opacity-50 active:scale-95",
                                        )}
                                        title={
                                          hasLiked ? "Liked" : "Helpful (Like)"
                                        }
                                      >
                                        {hasLiked ? (
                                          <HandThumbUpIconSolid className="h-3.5 w-3.5 text-emerald-600" />
                                        ) : (
                                          <HandThumbUpIcon className="h-3.5 w-3.5" />
                                        )}
                                        {likesCount > 0 && (
                                          <span
                                            className={classNames(
                                              hasLiked
                                                ? "text-emerald-800 font-bold"
                                                : "text-text-secondary font-semibold",
                                              "text-[11px]",
                                            )}
                                          >
                                            {likesCount}
                                          </span>
                                        )}
                                      </button>

                                      {/* Dislike Button */}
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleReviewReaction(
                                            review._id,
                                            "dislike",
                                          )
                                        }
                                        disabled={isReacting}
                                        className={classNames(
                                          hasDisliked
                                            ? "bg-rose-50 text-rose-700 border-rose-300 font-bold shadow-xs"
                                            : "bg-surface-muted/70 text-text-secondary hover:text-text-primary hover:bg-gray-200 border-border-light/40 font-medium",
                                          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs transition-all cursor-pointer disabled:opacity-50 active:scale-95",
                                        )}
                                        title={
                                          hasDisliked
                                            ? "Disliked"
                                            : "Not helpful (Dislike)"
                                        }
                                      >
                                        {hasDisliked ? (
                                          <HandThumbDownIconSolid className="h-3.5 w-3.5 text-rose-600" />
                                        ) : (
                                          <HandThumbDownIcon className="h-3.5 w-3.5" />
                                        )}
                                        {dislikesCount > 0 && (
                                          <span
                                            className={classNames(
                                              hasDisliked
                                                ? "text-rose-800 font-bold"
                                                : "text-text-secondary font-semibold",
                                              "text-[11px]",
                                            )}
                                          >
                                            {dislikesCount}
                                          </span>
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          );
                        })}

                        {/* Pagination Controls */}
                        {totalReviewPages > 1 && (
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-2">
                            <p className="text-xs text-text-secondary font-medium">
                              Showing{" "}
                              <span className="font-bold text-text-primary">
                                {(reviewPage - 1) * REVIEWS_PER_PAGE + 1}
                              </span>{" "}
                              to{" "}
                              <span className="font-bold text-text-primary">
                                {Math.min(
                                  reviewPage * REVIEWS_PER_PAGE,
                                  filteredReviews.length,
                                )}
                              </span>{" "}
                              of{" "}
                              <span className="font-bold text-text-primary">
                                {filteredReviews.length}
                              </span>{" "}
                              reviews
                            </p>

                            <Pagination
                              count={totalReviewPages}
                              page={reviewPage}
                              onChange={(e, val) => {
                                setReviewPage(val);
                                const el =
                                  document.getElementById("reviews-section");
                                if (el) {
                                  el.scrollIntoView({
                                    behavior: "smooth",
                                    block: "start",
                                  });
                                }
                              }}
                              color="primary"
                              size="medium"
                              shape="rounded"
                              siblingCount={1}
                              boundaryCount={0}
                              showFirstButton
                              showLastButton
                              sx={{
                                "& .MuiPaginationItem-root": {
                                  fontFamily: "inherit",
                                  fontWeight: 600,
                                  fontSize: "0.825rem",
                                  borderRadius: "12px",
                                },
                                "& .MuiPaginationItem-root.Mui-selected": {
                                  backgroundColor: "#1C1B19",
                                  color: "#FFFFFF",
                                  "&:hover": {
                                    backgroundColor: "#000000",
                                  },
                                },
                              }}
                            />
                          </div>
                        )}
                      </>
                    ) : isAnyFilterActive || writtenReviews.length > 0 ? (
                      <div className="text-center py-12 px-6 bg-surface rounded-3xl border border-border-light shadow-card space-y-3.5">
                        <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto">
                          <FunnelIcon className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-text-primary">
                            No reviews match your selected filters
                          </h4>
                          <p className="text-xs text-text-secondary mt-1 max-w-sm mx-auto">
                            Try changing the star rating filter or clearing the
                            search query to see more reviews.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleClearReviewFilters}
                          className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-soft cursor-pointer active:scale-[0.98]"
                        >
                          <XMarkIcon className="h-4 w-4" />
                          <span>Clear All Filters</span>
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-16 px-6 bg-surface rounded-3xl border border-border-light shadow-card space-y-3">
                        <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto">
                          <ChatBubbleBottomCenterTextIcon className="h-6 w-6" />
                        </div>
                        <h4 className="text-base font-bold text-text-primary">
                          {reviews.ratingCount > 0
                            ? "No Written Reviews Yet"
                            : "No Ratings or Reviews Yet"}
                        </h4>
                        <p className="text-xs text-text-secondary max-w-xs mx-auto">
                          {reviews.ratingCount > 0
                            ? `This item has received ${reviews.ratingCount} star ${reviews.ratingCount === 1 ? "rating" : "ratings"}, but no customer has written a review yet. Be the first to share your thoughts!`
                            : "Be the first person to share a star rating or written review for this product."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Related / Similar Products Section (Flipkart & Amazon style) */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <RelatedProducts
            currentProductId={product._id || product.id || id}
            category={product.category}
            title="Similar Products"
            subtitle="Customers who viewed this item also viewed"
          />

          {/* Customers Also Bought / Trending Picks */}
          <RelatedProducts
            currentProductId={product._id || product.id || id}
            category={product.category}
            title="Customers Also Bought"
            subtitle="Explore popular styles and trending recommendations"
          />
        </div>
      </div>

      {/* Edit Review Modal */}
      <EditReviewModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        review={editingReview}
        product={product}
        onReviewUpdated={fetchProduct}
      />
    </div>
  );
}
