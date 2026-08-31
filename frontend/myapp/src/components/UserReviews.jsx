import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  StarIcon as StarIconSolid,
  CheckBadgeIcon,
} from "@heroicons/react/20/solid";
import {
  StarIcon as StarIconOutline,
  PencilSquareIcon,
  TrashIcon,
  ArrowTopRightOnSquareIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  SparklesIcon,
  ClockIcon,
  ShoppingBagIcon,
  ChatBubbleBottomCenterTextIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";

const RATING_LABELS = {
  1: "1 - Poor",
  2: "2 - Fair",
  3: "3 - Good",
  4: "4 - Very Good",
  5: "5 - Excellent",
};

export default function UserReviews() {
  const userInfo = useSelector((state) => state.productReducer?.userInfo);
  const [activeSubTab, setActiveSubTab] = useState("pending"); // "pending" | "given"
  const [pendingReviews, setPendingReviews] = useState([]);
  const [givenReviews, setGivenReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");

  // Write Review Modal State
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [selectedPendingItem, setSelectedPendingItem] = useState(null);
  const [writeRating, setWriteRating] = useState(5);
  const [writeHoverRating, setWriteHoverRating] = useState(0);
  const [writeComment, setWriteComment] = useState("");
  const [isSubmittingWrite, setIsSubmittingWrite] = useState(false);

  // Edit Review Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedReviewToEdit, setSelectedReviewToEdit] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editHoverRating, setEditHoverRating] = useState(0);
  const [editComment, setEditComment] = useState("");
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Delete Confirmation Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedReviewToDelete, setSelectedReviewToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (userInfo?.token) {
      fetchUserReviews();
    }
  }, [userInfo?.token]);

  const fetchUserReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/reviews`,
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        },
      );
      const data = await response.json();
      if (data.success) {
        setPendingReviews(data.pendingReviews || []);
        setGivenReviews(data.givenReviews || []);

        // Default to pending if available, otherwise given
        if (
          data.pendingReviews?.length === 0 &&
          data.givenReviews?.length > 0
        ) {
          setActiveSubTab("given");
        }
      } else {
        toast.error(data.message || "Failed to load reviews");
      }
    } catch (error) {
      console.error("Error fetching user reviews:", error);
      toast.error("Error loading reviews");
    } finally {
      setLoading(false);
    }
  };

  // Filtered Pending Reviews
  const filteredPending = useMemo(() => {
    if (!searchQuery.trim()) return pendingReviews;
    const q = searchQuery.toLowerCase().trim();
    return pendingReviews.filter(
      (item) =>
        item.productName?.toLowerCase().includes(q) ||
        item.productCategory?.toLowerCase().includes(q),
    );
  }, [pendingReviews, searchQuery]);

  // Filtered Given Reviews
  const filteredGiven = useMemo(() => {
    let list = [...givenReviews];

    if (ratingFilter !== "all") {
      list = list.filter(
        (r) => Math.round(Number(r.rating)) === Number(ratingFilter),
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.productName?.toLowerCase().includes(q) ||
          r.comment?.toLowerCase().includes(q) ||
          r.productCategory?.toLowerCase().includes(q),
      );
    }

    return list;
  }, [givenReviews, ratingFilter, searchQuery]);

  // Handlers for Writing Review
  const handleOpenWriteModal = (item) => {
    setSelectedPendingItem(item);
    setWriteRating(5);
    setWriteHoverRating(0);
    setWriteComment("");
    setIsWriteModalOpen(true);
  };

  const handleCloseWriteModal = () => {
    if (isSubmittingWrite) return;
    setIsWriteModalOpen(false);
    setSelectedPendingItem(null);
  };

  const handleSubmitWriteReview = async (e) => {
    e.preventDefault();
    if (!selectedPendingItem?.productId) return;
    if (!writeRating || Number(writeRating) < 1 || Number(writeRating) > 5) {
      toast.error("Please select a star rating between 1 and 5");
      return;
    }

    setIsSubmittingWrite(true);
    try {
      const trimmedComment =
        typeof writeComment === "string" ? writeComment.trim() : "";

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products/${selectedPendingItem.productId}/rating`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userInfo.token}`,
          },
          body: JSON.stringify({
            rating: Number(writeRating),
            comment: trimmedComment,
            name: userInfo?.name || "Customer",
            userId: userInfo?._id || userInfo?.id,
          }),
        },
      );

      const data = await response.json();
      if (data.success) {
        toast.success(
          trimmedComment
            ? "Review submitted successfully!"
            : "Rating submitted successfully!",
        );
        handleCloseWriteModal();
        await fetchUserReviews();
        setActiveSubTab("given");
      } else {
        throw new Error(data.message || "Failed to submit review");
      }
    } catch (error) {
      console.error("Submit review error:", error);
      toast.error(error.message || "Failed to submit review");
    } finally {
      setIsSubmittingWrite(false);
    }
  };

  // Handlers for Editing Review
  const handleOpenEditModal = (review) => {
    setSelectedReviewToEdit(review);
    setEditRating(Number(review.rating) || 5);
    setEditHoverRating(0);
    setEditComment(review.comment || "");
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    if (isSubmittingEdit) return;
    setIsEditModalOpen(false);
    setSelectedReviewToEdit(null);
  };

  const handleSubmitEditReview = async (e) => {
    e.preventDefault();
    if (!selectedReviewToEdit?.productId || !selectedReviewToEdit?.reviewId) {
      toast.error("Review identifier missing");
      return;
    }
    if (!editRating || Number(editRating) < 1 || Number(editRating) > 5) {
      toast.error("Please select a star rating between 1 and 5");
      return;
    }

    setIsSubmittingEdit(true);
    try {
      const trimmedComment =
        typeof editComment === "string" ? editComment.trim() : "";

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products/${selectedReviewToEdit.productId}/reviews/${selectedReviewToEdit.reviewId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userInfo.token}`,
          },
          body: JSON.stringify({
            rating: Number(editRating),
            comment: trimmedComment,
            name: userInfo?.name || selectedReviewToEdit.name,
          }),
        },
      );

      const data = await response.json();
      if (data.success) {
        toast.success("Rating/review updated successfully!");
        handleCloseEditModal();
        await fetchUserReviews();
      } else {
        throw new Error(data.message || "Failed to update review");
      }
    } catch (error) {
      console.error("Update review error:", error);
      toast.error(error.message || "Failed to update review");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Handlers for Deleting Review
  const handleOpenDeleteModal = (review) => {
    setSelectedReviewToDelete(review);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    if (isDeleting) return;
    setIsDeleteModalOpen(false);
    setSelectedReviewToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedReviewToDelete?.productId || !selectedReviewToDelete?.reviewId)
      return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/reviews/${selectedReviewToDelete.productId}/${selectedReviewToDelete.reviewId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        },
      );

      const data = await response.json();
      if (data.success) {
        toast.success("Review deleted successfully");
        handleCloseDeleteModal();
        await fetchUserReviews();
      } else {
        throw new Error(data.message || "Failed to delete review");
      }
    } catch (error) {
      console.error("Delete review error:", error);
      toast.error(error.message || "Failed to delete review");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-surface rounded-2xl shadow-soft border border-border-light p-12 text-center">
        <div className="w-10 h-10 border-3 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium text-text-secondary">
          Loading your reviews...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-2xl shadow-soft border border-border-light overflow-hidden">
      {/* Header Banner */}
      <div className="bg-surface-muted border-b border-border-light px-6 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-accent/10 text-accent rounded-lg">
                <ChatBubbleBottomCenterTextIcon className="h-5 w-5" />
              </div>
              <h3 className="font-heading text-xl font-bold text-text-primary">
                My Reviews
              </h3>
            </div>
            <p className="text-text-secondary text-xs mt-1">
              Rate your recent purchases and manage your published feedback
            </p>
          </div>

          {/* Sub-Tabs Selector */}
          <div className="flex items-center bg-surface p-1 rounded-xl border border-border-light self-start sm:self-auto shadow-xs">
            <button
              type="button"
              onClick={() => setActiveSubTab("pending")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === "pending"
                  ? "bg-accent text-white shadow-soft"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-muted"
              }`}
            >
              <ClockIcon className="h-4 w-4" />
              <span>Pending Reviews</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  activeSubTab === "pending"
                    ? "bg-white/20 text-white"
                    : "bg-accent/10 text-accent"
                }`}
              >
                {pendingReviews.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab("given")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === "given"
                  ? "bg-accent text-white shadow-soft"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-muted"
              }`}
            >
              <StarIconSolid className="h-4 w-4" />
              <span>Already Given</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  activeSubTab === "given"
                    ? "bg-white/20 text-white"
                    : "bg-surface-muted text-text-secondary"
                }`}
              >
                {givenReviews.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-4 sm:p-6 border-b border-border-light/60 bg-background/50 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <input
            type="text"
            placeholder={
              activeSubTab === "pending"
                ? "Search pending products..."
                : "Search your reviews..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs bg-surface border border-border-light rounded-xl text-text-primary placeholder:text-text-secondary/60 focus:border-accent focus:ring-1 focus:ring-accent outline-none shadow-xs transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary p-0.5"
            >
              <XMarkIcon className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Rating Filter Pills (Only for Given tab) */}
        {activeSubTab === "given" && (
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            <span className="text-xs font-semibold text-text-secondary mr-1 shrink-0">
              Filter:
            </span>
            <button
              type="button"
              onClick={() => setRatingFilter("all")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                ratingFilter === "all"
                  ? "bg-accent text-white shadow-xs"
                  : "bg-surface text-text-secondary border border-border-light hover:bg-surface-muted"
              }`}
            >
              All ({givenReviews.length})
            </button>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = givenReviews.filter(
                (r) => Math.round(Number(r.rating)) === star,
              ).length;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() =>
                    setRatingFilter((prev) =>
                      prev === String(star) ? "all" : String(star),
                    )
                  }
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
                    ratingFilter === String(star)
                      ? "bg-accent text-white shadow-xs"
                      : "bg-surface text-text-secondary border border-border-light hover:bg-surface-muted"
                  }`}
                >
                  <span>{star}★</span>
                  <span className="text-[10px] opacity-75">({count})</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Tab Content */}
      <div className="p-4 sm:p-6">
        {/* ================= PENDING REVIEWS TAB ================= */}
        {activeSubTab === "pending" && (
          <div>
            {filteredPending.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPending.map((item) => (
                  <div
                    key={item.productId}
                    className="bg-surface rounded-2xl border border-border-light p-4 shadow-card hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div className="flex gap-4">
                      {/* Product Thumbnail */}
                      <Link
                        to={`/product/${item.productId}`}
                        className="shrink-0 block relative w-20 h-20 sm:w-24 sm:h-24 bg-surface-muted rounded-xl border border-border-light overflow-hidden group-hover:border-accent/40 transition-colors"
                      >
                        <img
                          src={item.productImage || "/placeholder.png"}
                          alt={item.productName}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>

                      {/* Product Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-[10px] font-bold text-accent uppercase tracking-wider bg-accent/10 px-2 py-0.5 rounded-md">
                            {item.productCategory || "Product"}
                          </span>
                          {item.orderStatus && (
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                              {item.orderStatus}
                            </span>
                          )}
                        </div>

                        <Link
                          to={`/product/${item.productId}`}
                          className="font-heading text-sm font-bold text-text-primary hover:text-accent transition-colors line-clamp-2"
                        >
                          {item.productName}
                        </Link>

                        <div className="mt-1 flex items-center gap-2 text-xs text-text-secondary">
                          <span className="font-bold text-text-primary">
                            ₹{Number(item.productPrice || 0).toLocaleString()}
                          </span>
                          {(item.color || item.size) && (
                            <span className="text-[11px]">
                              •{" "}
                              {[item.color, item.size]
                                .filter(Boolean)
                                .join(" / ")}
                            </span>
                          )}
                        </div>

                        {item.orderDate && (
                          <p className="text-[11px] text-text-secondary/80 mt-1">
                            Purchased on{" "}
                            {new Date(item.orderDate).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="mt-4 pt-3 border-t border-border-light/60 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1 text-amber-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarIconOutline
                            key={star}
                            className="h-4 w-4 text-gray-300"
                          />
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenWriteModal(item)}
                        className="inline-flex items-center gap-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-soft active:scale-[0.98] cursor-pointer"
                      >
                        <SparklesIcon className="h-3.5 w-3.5" />
                        <span>Write Review</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : pendingReviews.length > 0 ? (
              <div className="text-center py-12 px-4 bg-surface-muted/50 rounded-2xl border border-border-light">
                <MagnifyingGlassIcon className="h-8 w-8 text-text-secondary/40 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-text-primary">
                  No pending items match your search
                </h4>
                <p className="text-xs text-text-secondary mt-1">
                  Try searching with different keywords
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mt-3 text-xs font-bold text-accent hover:underline cursor-pointer"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="text-center py-16 px-4 bg-surface rounded-2xl border border-dashed border-border-light">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckBadgeIcon className="h-7 w-7" />
                </div>
                <h4 className="font-heading text-lg font-bold text-text-primary">
                  No Pending Reviews!
                </h4>
                <p className="text-xs text-text-secondary max-w-sm mx-auto mt-1 mb-4 leading-relaxed">
                  You've already reviewed all your purchased items, or haven't
                  ordered products yet.
                </p>
                <Link
                  to="/product"
                  className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-soft"
                >
                  <ShoppingBagIcon className="h-4 w-4" />
                  <span>Explore Products</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* ================= ALREADY GIVEN REVIEWS TAB ================= */}
        {activeSubTab === "given" && (
          <div>
            {filteredGiven.length > 0 ? (
              <div className="space-y-4">
                {filteredGiven.map((review) => (
                  <div
                    key={review._id || review.reviewId}
                    className="bg-surface rounded-2xl border border-border-light p-5 shadow-card hover:shadow-md transition-all space-y-4"
                  >
                    {/* Header: Product Preview & Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-light/60">
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/product/${review.productId}`}
                          className="shrink-0 w-14 h-14 rounded-xl bg-surface-muted border border-border-light overflow-hidden"
                        >
                          <img
                            src={review.productImage || "/placeholder.png"}
                            alt={review.productName}
                            className="w-full h-full object-cover"
                          />
                        </Link>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-accent uppercase tracking-wider bg-accent/10 px-2 py-0.5 rounded-md">
                              {review.productCategory || "Product"}
                            </span>
                            <span className="text-[10px] font-semibold text-text-secondary">
                              Reviewed on{" "}
                              {new Date(review.date).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                            </span>
                          </div>
                          <Link
                            to={`/product/${review.productId}`}
                            className="font-heading text-sm font-bold text-text-primary hover:text-accent transition-colors block mt-0.5"
                          >
                            {review.productName}
                          </Link>
                        </div>
                      </div>

                      {/* Rating Badge and Action Buttons */}
                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200/70 px-2.5 py-1 rounded-xl">
                          <span className="text-xs font-bold text-amber-700">
                            {Number(review.rating).toFixed(1)}
                          </span>
                          <div className="flex text-amber-400">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <StarIconSolid
                                key={star}
                                className={`h-3.5 w-3.5 ${
                                  review.rating >= star
                                    ? "text-amber-400"
                                    : "text-gray-200"
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(review)}
                          className="p-2 text-text-secondary hover:text-accent hover:bg-accent/10 rounded-xl transition-colors cursor-pointer"
                          title="Edit review"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenDeleteModal(review)}
                          className="p-2 text-text-secondary hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                          title="Delete review"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>

                        {/* View Product Link */}
                        <Link
                          to={`/product/${review.productId}`}
                          className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-muted rounded-xl transition-colors"
                          title="View product page"
                        >
                          <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>

                    {/* Review Body */}
                    <div className="bg-background rounded-xl p-3.5 border border-border-light">
                      {review.comment && review.comment.trim() ? (
                        <p className="text-xs sm:text-sm text-text-primary leading-relaxed whitespace-pre-line">
                          "{review.comment}"
                        </p>
                      ) : (
                        <p className="text-xs sm:text-sm text-text-secondary italic">
                          ⭐ Star rating only (no written comment).
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : givenReviews.length > 0 ? (
              <div className="text-center py-12 px-4 bg-surface-muted/50 rounded-2xl border border-border-light">
                <MagnifyingGlassIcon className="h-8 w-8 text-text-secondary/40 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-text-primary">
                  No reviews match your selected filter
                </h4>
                <p className="text-xs text-text-secondary mt-1">
                  Try clearing search or changing the star rating filter
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setRatingFilter("all");
                  }}
                  className="mt-3 text-xs font-bold text-accent hover:underline cursor-pointer"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="text-center py-16 px-4 bg-surface rounded-2xl border border-dashed border-border-light">
                <div className="w-14 h-14 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-3">
                  <StarIconOutline className="h-7 w-7" />
                </div>
                <h4 className="font-heading text-lg font-bold text-text-primary">
                  No Reviews Given Yet
                </h4>
                <p className="text-xs text-text-secondary max-w-sm mx-auto mt-1 mb-4 leading-relaxed">
                  Share your experience with items you've bought to help other
                  shoppers make the best choice.
                </p>
                {pendingReviews.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveSubTab("pending")}
                    className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-soft cursor-pointer"
                  >
                    <ClockIcon className="h-4 w-4" />
                    <span>View Pending Reviews ({pendingReviews.length})</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================= WRITE REVIEW MODAL ================= */}
      <Dialog
        open={isWriteModalOpen}
        onClose={handleCloseWriteModal}
        className="relative z-50"
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ease-out data-closed:opacity-0"
        />

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <DialogPanel
            transition
            className="w-full max-w-lg transform rounded-2xl bg-surface p-6 sm:p-7 shadow-card border border-border-light transition-all duration-300 ease-out data-closed:scale-95 data-closed:opacity-0 my-auto text-text-primary"
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-border-light">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-accent/10 text-accent rounded-xl">
                  <SparklesIcon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-text-primary">
                    Write a Product Review
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Share your feedback and experience
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseWriteModal}
                className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface-muted rounded-lg transition-colors cursor-pointer"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Product Mini Preview */}
            {selectedPendingItem && (
              <div className="mt-4 p-3 bg-surface-muted rounded-xl border border-border-light/60 flex items-center gap-3">
                <img
                  src={selectedPendingItem.productImage || "/placeholder.png"}
                  alt={selectedPendingItem.productName}
                  className="w-12 h-12 rounded-lg object-cover bg-white shrink-0 border border-border-light"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-semibold text-text-primary truncate">
                    {selectedPendingItem.productName}
                  </h4>
                  <p className="text-xs text-text-secondary">
                    ₹
                    {Number(
                      selectedPendingItem.productPrice || 0,
                    ).toLocaleString()}{" "}
                    • {selectedPendingItem.productCategory || "Product"}
                  </p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmitWriteReview} className="mt-5 space-y-4">
              {/* Reviewer Name */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                  Reviewer Name
                </label>
                <input
                  type="text"
                  disabled
                  value={userInfo?.name || "Verified Customer"}
                  className="w-full rounded-xl border border-border-light bg-surface-muted px-3.5 py-2.5 text-xs text-text-secondary cursor-not-allowed shadow-xs"
                />
              </div>

              {/* Star Rating Selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Overall Rating
                  </label>
                  <span className="text-xs font-semibold text-accent px-2 py-0.5 bg-accent/10 rounded-md">
                    {RATING_LABELS[writeHoverRating || writeRating] ||
                      `${writeHoverRating || writeRating} Stars`}
                  </span>
                </div>

                <div
                  className="flex items-center gap-1.5 p-2.5 bg-surface-muted/50 rounded-xl border border-border-light"
                  onMouseLeave={() => setWriteHoverRating(0)}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setWriteRating(star)}
                      onMouseEnter={() => setWriteHoverRating(star)}
                      className="p-1 hover:scale-115 active:scale-95 transition-transform duration-150 cursor-pointer"
                      title={`${star} star${star > 1 ? "s" : ""}`}
                    >
                      <StarIconSolid
                        className={`h-7 w-7 transition-colors duration-150 ${
                          (writeHoverRating || writeRating) >= star
                            ? "text-yellow-400 fill-yellow-400 drop-shadow-xs"
                            : "text-border-light"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs text-text-secondary ml-auto pr-1">
                    Click to rate
                  </span>
                </div>
              </div>

              {/* Review Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Your Review{" "}
                    <span className="text-text-secondary/60 font-normal lowercase">
                      (optional)
                    </span>
                  </label>
                  <span
                    className={`text-xs ${
                      writeComment.length > 1000
                        ? "text-red-500 font-medium"
                        : "text-text-secondary"
                    }`}
                  >
                    {writeComment.length} / 1000 characters
                  </span>
                </div>
                <textarea
                  rows={4}
                  maxLength={1000}
                  placeholder="Share details about the quality, sizing, comfort (optional)..."
                  value={writeComment}
                  onChange={(e) => setWriteComment(e.target.value)}
                  className="w-full rounded-xl border border-border-light bg-background p-3 text-xs sm:text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:ring-1 focus:ring-accent outline-none resize-none transition-all shadow-xs"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-light mt-6">
                <button
                  type="button"
                  onClick={handleCloseWriteModal}
                  disabled={isSubmittingWrite}
                  className="px-4 py-2.5 rounded-xl border border-border-light text-text-secondary hover:text-text-primary hover:bg-surface-muted text-xs sm:text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    isSubmittingWrite ||
                    !writeRating ||
                    writeRating < 1 ||
                    writeRating > 5
                  }
                  className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs sm:text-sm font-semibold transition-all shadow-soft hover:shadow-card active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmittingWrite ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <CheckIcon className="h-4 w-4 stroke-2" />
                      <span>
                        {writeComment.trim()
                          ? "Submit Review"
                          : "Submit Rating"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </Dialog>

      {/* ================= EDIT REVIEW MODAL ================= */}
      <Dialog
        open={isEditModalOpen}
        onClose={handleCloseEditModal}
        className="relative z-50"
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ease-out data-closed:opacity-0"
        />

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <DialogPanel
            transition
            className="w-full max-w-lg transform rounded-2xl bg-surface p-6 sm:p-7 shadow-card border border-border-light transition-all duration-300 ease-out data-closed:scale-95 data-closed:opacity-0 my-auto text-text-primary"
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-border-light">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-accent/10 text-accent rounded-xl">
                  <PencilSquareIcon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-text-primary">
                    Edit Your Review
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Update your rating and thoughts on this item
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseEditModal}
                className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface-muted rounded-lg transition-colors cursor-pointer"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Product Mini Preview */}
            {selectedReviewToEdit && (
              <div className="mt-4 p-3 bg-surface-muted rounded-xl border border-border-light/60 flex items-center gap-3">
                <img
                  src={selectedReviewToEdit.productImage || "/placeholder.png"}
                  alt={selectedReviewToEdit.productName}
                  className="w-12 h-12 rounded-lg object-cover bg-white shrink-0 border border-border-light"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-semibold text-text-primary truncate">
                    {selectedReviewToEdit.productName}
                  </h4>
                  <p className="text-xs text-text-secondary">
                    {selectedReviewToEdit.productCategory || "Product"}
                  </p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmitEditReview} className="mt-5 space-y-4">
              {/* Star Rating Selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Overall Rating
                  </label>
                  <span className="text-xs font-semibold text-accent px-2 py-0.5 bg-accent/10 rounded-md">
                    {RATING_LABELS[editHoverRating || editRating] ||
                      `${editHoverRating || editRating} Stars`}
                  </span>
                </div>

                <div
                  className="flex items-center gap-1.5 p-2.5 bg-surface-muted/50 rounded-xl border border-border-light"
                  onMouseLeave={() => setEditHoverRating(0)}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditRating(star)}
                      onMouseEnter={() => setEditHoverRating(star)}
                      className="p-1 hover:scale-115 active:scale-95 transition-transform duration-150 cursor-pointer"
                      title={`${star} star${star > 1 ? "s" : ""}`}
                    >
                      <StarIconSolid
                        className={`h-7 w-7 transition-colors duration-150 ${
                          (editHoverRating || editRating) >= star
                            ? "text-yellow-400 fill-yellow-400 drop-shadow-xs"
                            : "text-border-light"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs text-text-secondary ml-auto pr-1">
                    Click to change
                  </span>
                </div>
              </div>

              {/* Review Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Your Review{" "}
                    <span className="text-text-secondary/60 font-normal lowercase">
                      (optional - clear to remove review text)
                    </span>
                  </label>
                  <span
                    className={`text-xs ${
                      editComment.length > 1000
                        ? "text-red-500 font-medium"
                        : "text-text-secondary"
                    }`}
                  >
                    {editComment.length} / 1000 characters
                  </span>
                </div>
                <textarea
                  rows={4}
                  maxLength={1000}
                  placeholder="Update your review details (leave empty for rating only)..."
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  className="w-full rounded-xl border border-border-light bg-background p-3 text-xs sm:text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:ring-1 focus:ring-accent outline-none resize-none transition-all shadow-xs"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-light mt-6">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  disabled={isSubmittingEdit}
                  className="px-4 py-2.5 rounded-xl border border-border-light text-text-secondary hover:text-text-primary hover:bg-surface-muted text-xs sm:text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    isSubmittingEdit ||
                    !editRating ||
                    editRating < 1 ||
                    editRating > 5
                  }
                  className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs sm:text-sm font-semibold transition-all shadow-soft hover:shadow-card active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmittingEdit ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckIcon className="h-4 w-4 stroke-2" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </Dialog>

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      <Dialog
        open={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        className="relative z-50"
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ease-out data-closed:opacity-0"
        />

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <DialogPanel
            transition
            className="w-full max-w-md transform rounded-2xl bg-surface p-6 shadow-card border border-border-light transition-all duration-300 ease-out data-closed:scale-95 data-closed:opacity-0 my-auto text-text-primary space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrashIcon className="h-6 w-6" />
            </div>

            <div>
              <h3 className="font-heading text-lg font-bold text-text-primary">
                Delete Review?
              </h3>
              <p className="text-xs text-text-secondary mt-1">
                Are you sure you want to remove your review for{" "}
                <span className="font-semibold text-text-primary">
                  "{selectedReviewToDelete?.productName}"
                </span>
                ? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCloseDeleteModal}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl border border-border-light text-text-secondary hover:text-text-primary hover:bg-surface-muted text-xs sm:text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-soft active:scale-[0.98] cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Review</span>
                )}
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
}
