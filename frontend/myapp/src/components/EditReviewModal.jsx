import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { StarIcon } from "@heroicons/react/20/solid";
import {
  XMarkIcon,
  PencilSquareIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

const RATING_LABELS = {
  1: "1 - Poor",
  2: "2 - Fair",
  3: "3 - Good",
  4: "4 - Very Good",
  5: "5 - Excellent",
};

export default function EditReviewModal({
  isOpen,
  onClose,
  review,
  product,
  onReviewUpdated,
}) {
  const userInfo = useSelector((state) => state.productReducer?.userInfo);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Synchronize initial review data when modal opens
  useEffect(() => {
    if (review) {
      setRating(Number(review.rating) || 5);
      setComment(review.comment || "");
      setName(review.name || "");
      setErrorMsg("");
    }
  }, [review, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      setErrorMsg("Please select a valid star rating (1–5).");
      return;
    }

    if (!product?._id || !review?._id) {
      setErrorMsg("Product or review identifier is missing.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const headers = {
        "Content-Type": "application/json",
      };
      if (userInfo?.token) {
        headers["Authorization"] = `Bearer ${userInfo.token}`;
      }

      const trimmedComment = typeof comment === "string" ? comment.trim() : "";

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products/${product._id}/reviews/${review._id}`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify({
            rating: Number(rating),
            comment: trimmedComment,
            name: name.trim() || review.name,
            userId: userInfo?._id || userInfo?.id,
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Rating/review updated successfully! ✨", {
          duration: 3500,
        });
        if (onReviewUpdated) {
          await onReviewUpdated();
        }
        onClose();
      } else {
        throw new Error(data.message || "Failed to update review.");
      }
    } catch (err) {
      console.error("Error updating review:", err);
      setErrorMsg(
        err.message ||
          "An unexpected error occurred while updating your review.",
      );
      toast.error(err.message || "Failed to update review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentDisplayRating = hoverRating || rating;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Dimmed backdrop */}
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
                  Edit Your Rating & Review
                </h3>
                <p className="text-xs text-text-secondary">
                  Update your star rating or written thoughts
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface-muted rounded-lg transition-colors cursor-pointer"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Product Mini Preview */}
          {product && (
            <div className="mt-4 p-3 bg-surface-muted rounded-xl border border-border-light/60 flex items-center gap-3">
              <img
                src={product.mainImage || product.image}
                alt={product.name}
                className="w-12 h-12 rounded-lg object-cover bg-white shrink-0 border border-border-light"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-semibold text-text-primary truncate">
                  {product.name}
                </h4>
                <p className="text-xs text-text-secondary">
                  {product.category || "Product"}
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                {errorMsg}
              </div>
            )}

            {/* Reviewer Name */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                Reviewer Name
              </label>
              <input
                type="text"
                disabled
                value={name}
                className="w-full rounded-xl border border-border-light bg-surface-muted px-3.5 py-2.5 text-sm text-text-secondary cursor-not-allowed shadow-xs"
              />
            </div>

            {/* Star Rating Selection */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Overall Rating <span className="text-rose-500">*</span>
                </label>
                <span className="text-xs font-semibold text-accent px-2 py-0.5 bg-accent/10 rounded-md">
                  {RATING_LABELS[currentDisplayRating] ||
                    `${currentDisplayRating} Stars`}
                </span>
              </div>

              <div
                className="flex items-center gap-1.5 p-2.5 bg-surface-muted/50 rounded-xl border border-border-light"
                onMouseLeave={() => setHoverRating(0)}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    className="p-1 hover:scale-115 active:scale-95 transition-transform duration-150 cursor-pointer"
                    title={`${star} star${star > 1 ? "s" : ""}`}
                  >
                    <StarIcon
                      className={`h-7 w-7 transition-colors duration-150 ${
                        currentDisplayRating >= star
                          ? "text-yellow-400 fill-yellow-400 drop-shadow-xs"
                          : "text-border-light"
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs text-text-secondary ml-auto pr-1">
                  Click star to change
                </span>
              </div>
            </div>

            {/* Review Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Your Review <span className="text-text-secondary/60 font-normal lowercase">(optional - clear to remove review text)</span>
                </label>
                <span
                  className={`text-xs ${
                    comment.length > 1000
                      ? "text-red-500 font-medium"
                      : "text-text-secondary"
                  }`}
                >
                  {comment.length} / 1000 characters
                </span>
              </div>
              <textarea
                rows={4}
                maxLength={1000}
                placeholder="What did you like or dislike? (Leave empty for rating only)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full rounded-xl border border-border-light bg-background p-3 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:ring-1 focus:ring-accent outline-none resize-none transition-all shadow-xs"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-light mt-6">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl border border-border-light text-text-secondary hover:text-text-primary hover:bg-surface-muted text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !rating || rating < 1 || rating > 5}
                className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-semibold transition-all shadow-soft hover:shadow-card active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
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
  );
}
