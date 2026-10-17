import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import {
  LocalOffer as CouponIcon,
  ContentCopy as CopyIcon,
  BookmarkAdded as SavedIcon,
  BookmarkBorder as BookmarkIcon,
  ShoppingBag as ShopIcon,
  CheckCircle as RedeemedIcon,
  AccessTime as ClockIcon,
  InfoOutlined as InfoIcon,
  DeleteOutline as RemoveIcon,
  ArrowForward as ArrowIcon,
} from "@mui/icons-material";

const UserCoupons = () => {
  const [activeTab, setActiveTab] = useState("saved");
  const [savedCoupons, setSavedCoupons] = useState([]);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [usedCoupons, setUsedCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claimCode, setClaimCode] = useState("");
  const [isClaiming, setIsClaiming] = useState(false);

  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

  useEffect(() => {
    fetchUserCoupons();
  }, []);

  const fetchUserCoupons = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/coupons/my-coupons`,
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        setSavedCoupons(data.savedCoupons || []);
        setAvailableCoupons(data.availableCoupons || []);
        setUsedCoupons(data.usedCoupons || []);
      } else {
        toast.error(data.message || "Failed to load coupons");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching coupons");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Coupon code '${code}' copied to clipboard!`);
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    if (!claimCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    try {
      setIsClaiming(true);
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/coupons/claim`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userInfo.token}`,
          },
          body: JSON.stringify({ code: claimCode.trim() }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setClaimCode("");
        fetchUserCoupons();
        setActiveTab("saved");
      } else {
        toast.error(data.message || "Failed to claim coupon");
      }
    } catch (err) {
      toast.error("Network error while claiming coupon");
    } finally {
      setIsClaiming(false);
    }
  };

  const handleSaveCoupon = async (id, code) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/coupons/save/${id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchUserCoupons();
      } else {
        toast.error(data.message || "Failed to save coupon");
      }
    } catch (err) {
      toast.error("Error saving coupon");
    }
  };

  const handleRemoveSaved = async (id, code) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/coupons/save/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchUserCoupons();
      } else {
        toast.error(data.message || "Failed to remove coupon");
      }
    } catch (err) {
      toast.error("Error removing coupon");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Claim Coupon Code */}
      <div className="bg-gradient-to-r from-accent-light via-surface to-accent-light/40 border border-border-light rounded-2xl p-5 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center shrink-0 shadow-xs">
              <CouponIcon fontSize="small" />
            </div>
            <div>
              <h4 className="font-heading text-base font-bold text-text-primary">
                Have a Coupon or Promo Code?
              </h4>
              <p className="text-text-secondary text-xs mt-0.5">
                Claim vouchers received via newsletter, social promotions, or partner offers.
              </p>
            </div>
          </div>

          <form onSubmit={handleClaimSubmit} className="flex items-center gap-2 max-w-md w-full">
            <input
              type="text"
              placeholder="ENTER COUPON CODE"
              value={claimCode}
              onChange={(e) => setClaimCode(e.target.value.toUpperCase())}
              className="flex-1 px-3.5 py-2.5 bg-surface border border-border-light rounded-xl text-xs font-mono font-bold tracking-wider uppercase text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-1 focus:ring-accent shadow-xs"
            />
            <button
              type="submit"
              disabled={isClaiming}
              className="px-4 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl text-xs font-semibold whitespace-nowrap transition-all shadow-soft disabled:opacity-50"
            >
              {isClaiming ? "Claiming..." : "Claim Offer"}
            </button>
          </form>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-border-light pb-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("saved")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === "saved"
                ? "bg-accent text-white shadow-soft"
                : "bg-surface-muted text-text-secondary hover:text-text-primary"
            }`}
          >
            <SavedIcon sx={{ fontSize: 16 }} />
            <span>Saved Coupons</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === "saved" ? "bg-white/20 text-white" : "bg-border-light text-text-secondary"
              }`}
            >
              {savedCoupons.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("available")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === "available"
                ? "bg-accent text-white shadow-soft"
                : "bg-surface-muted text-text-secondary hover:text-text-primary"
            }`}
          >
            <CouponIcon sx={{ fontSize: 16 }} />
            <span>Available Offers</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === "available" ? "bg-white/20 text-white" : "bg-border-light text-text-secondary"
              }`}
            >
              {availableCoupons.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("used")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === "used"
                ? "bg-accent text-white shadow-soft"
                : "bg-surface-muted text-text-secondary hover:text-text-primary"
            }`}
          >
            <RedeemedIcon sx={{ fontSize: 16 }} />
            <span>Redeemed History</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === "used" ? "bg-white/20 text-white" : "bg-border-light text-text-secondary"
              }`}
            >
              {usedCoupons.length}
            </span>
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="p-12 text-center text-text-secondary">
          <div className="inline-block animate-spin rounded-full h-7 w-7 border-2 border-accent border-t-transparent mb-2" />
          <p className="text-xs">Loading coupons...</p>
        </div>
      ) : activeTab === "saved" ? (
        /* SAVED COUPONS */
        savedCoupons.length === 0 ? (
          <div className="p-10 bg-surface rounded-2xl border border-border-light text-center">
            <BookmarkIcon sx={{ fontSize: 44 }} className="text-text-secondary/40 mb-2" />
            <h4 className="font-heading text-base font-semibold text-text-primary">
              No Saved Coupons Yet
            </h4>
            <p className="text-xs text-text-secondary max-w-sm mx-auto mt-1 mb-4">
              Explore available offers and save your favorite coupons so you can easily apply them during payment!
            </p>
            <button
              onClick={() => setActiveTab("available")}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent text-white rounded-xl text-xs font-medium hover:bg-accent-hover transition-all"
            >
              <span>Explore Available Offers</span>
              <ArrowIcon fontSize="inherit" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedCoupons.map((coupon) => (
              <CouponTicketCard
                key={coupon._id}
                coupon={coupon}
                type="saved"
                onCopy={handleCopy}
                onRemove={handleRemoveSaved}
              />
            ))}
          </div>
        )
      ) : activeTab === "available" ? (
        /* AVAILABLE OFFERS */
        availableCoupons.length === 0 ? (
          <div className="p-10 bg-surface rounded-2xl border border-border-light text-center">
            <CouponIcon sx={{ fontSize: 44 }} className="text-text-secondary/40 mb-2" />
            <h4 className="font-heading text-base font-semibold text-text-primary">
              No Public Offers Available
            </h4>
            <p className="text-xs text-text-secondary max-w-sm mx-auto mt-1">
              Check back soon for new seasonal discounts and exclusive promo codes!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableCoupons.map((coupon) => (
              <CouponTicketCard
                key={coupon._id}
                coupon={coupon}
                type="available"
                onCopy={handleCopy}
                onSave={handleSaveCoupon}
              />
            ))}
          </div>
        )
      ) : (
        /* USED COUPONS */
        usedCoupons.length === 0 ? (
          <div className="p-10 bg-surface rounded-2xl border border-border-light text-center">
            <RedeemedIcon sx={{ fontSize: 44 }} className="text-text-secondary/40 mb-2" />
            <h4 className="font-heading text-base font-semibold text-text-primary">
              No Redeemed Coupons
            </h4>
            <p className="text-xs text-text-secondary max-w-sm mx-auto mt-1">
              Coupons applied to your completed orders will show up here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {usedCoupons.map((used, idx) => (
              <div
                key={idx}
                className="bg-surface p-4 rounded-xl border border-border-light flex items-center justify-between shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <RedeemedIcon fontSize="small" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-text-primary">
                        {used.code}
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
                        Redeemed
                      </span>
                    </div>
                    <p className="text-[11px] text-text-secondary mt-0.5">
                      {used.description}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-success">
                    Saved ₹{used.discountGiven || used.discountAmount}
                  </span>
                  <p className="text-[10px] text-text-secondary mt-0.5">
                    {used.usedAt ? new Date(used.usedAt).toLocaleDateString() : "Redeemed"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* How to Use Note */}
      <div className="bg-surface-muted/60 border border-border-light rounded-xl p-4 flex items-start gap-3">
        <InfoIcon sx={{ fontSize: 18 }} className="text-accent mt-0.5 shrink-0" />
        <div className="text-xs text-text-secondary space-y-1">
          <p className="font-semibold text-text-primary">
            How to use your coupons:
          </p>
          <p>
            Copy the coupon code or click "Use at Checkout". During payment, enter or pick your saved coupon to apply instant savings to your order subtotal.
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Beautiful Perforated Ticket Card Component
 */
const CouponTicketCard = ({ coupon, type, onCopy, onSave, onRemove }) => {
  const daysLeft = Math.ceil(
    (new Date(coupon.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="relative bg-surface rounded-2xl border border-border-light shadow-soft hover:shadow-card transition-all overflow-hidden flex flex-col justify-between group">
      {/* Decorative Golden Accent Top Strip */}
      <div className="h-1.5 bg-gradient-to-r from-accent via-[#D4AF37] to-accent w-full" />

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Top Row: Discount Value & Expiry */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <span className="inline-block text-xl font-heading font-extrabold text-accent">
                {coupon.discountType === "percentage"
                  ? `${coupon.discountAmount}% OFF`
                  : `₹${coupon.discountAmount} FLAT OFF`}
              </span>
              {coupon.discountType === "percentage" && coupon.maxDiscountAmount && (
                <span className="text-[11px] text-text-secondary ml-1.5 font-medium">
                  (Up to ₹{coupon.maxDiscountAmount})
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 text-[11px] font-medium text-text-secondary bg-surface-muted px-2 py-0.5 rounded-md">
              <ClockIcon sx={{ fontSize: 13 }} className="text-accent" />
              <span>{daysLeft <= 0 ? "Expires today" : `${daysLeft}d left`}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-text-secondary mb-3 leading-relaxed">
            {coupon.description}
          </p>

          {/* Conditions */}
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-text-secondary mb-4">
            <span className="bg-surface-muted px-2 py-0.5 rounded border border-border-light">
              Min spend: ₹{coupon.minPurchaseAmount || 0}
            </span>
            <span className="bg-surface-muted px-2 py-0.5 rounded border border-border-light">
              {coupon.applicableType === "all" ? "Valid Sitewide" : "Selected Items"}
            </span>
            {coupon.remainingUses !== undefined && (
              <span className="bg-surface-muted px-2 py-0.5 rounded border border-border-light">
                {coupon.remainingUses} use left
              </span>
            )}
          </div>
        </div>

        {/* Perforation Cut Effect */}
        <div className="relative border-t border-dashed border-border-light my-2">
          <div className="absolute -left-7 -top-2.5 w-5 h-5 rounded-full bg-[#FAF9F6] border border-border-light" />
          <div className="absolute -right-7 -top-2.5 w-5 h-5 rounded-full bg-[#FAF9F6] border border-border-light" />
        </div>

        {/* Bottom Row: Code & Action Buttons */}
        <div className="flex items-center justify-between pt-2 gap-2">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs font-bold px-2.5 py-1 bg-accent-light text-accent rounded-lg border border-accent/30 tracking-wider">
              {coupon.code}
            </span>
            <button
              onClick={() => onCopy(coupon.code)}
              title="Copy Coupon Code"
              className="p-1.5 text-text-secondary hover:text-accent rounded-lg hover:bg-surface-muted transition-colors"
            >
              <CopyIcon fontSize="small" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {type === "saved" ? (
              <>
                <button
                  onClick={() => onRemove(coupon._id, coupon.code)}
                  title="Remove from saved"
                  className="p-1.5 text-text-secondary hover:text-error rounded-lg hover:bg-error/10 transition-colors"
                >
                  <RemoveIcon fontSize="small" />
                </button>
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-accent hover:bg-accent-hover text-white rounded-lg text-xs font-medium transition-all shadow-xs"
                >
                  <ShopIcon sx={{ fontSize: 13 }} />
                  <span>Shop Now</span>
                </Link>
              </>
            ) : (
              <button
                onClick={() => onSave(coupon._id, coupon.code)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-surface-muted hover:bg-accent-light text-text-primary hover:text-accent border border-border-light rounded-lg text-xs font-medium transition-all"
              >
                <BookmarkIcon sx={{ fontSize: 13 }} />
                <span>Save Offer</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCoupons;
