import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  LocalOffer as CouponIcon,
  Add as AddIcon,
  Autorenew as GenerateIcon,
  Search as SearchIcon,
  ContentCopy as CopyIcon,
  DeleteOutline as DeleteIcon,
  EditOutlined as EditIcon,
  CheckCircleOutline as CheckIcon,
  AccessTime as ExpiredIcon,
  TrendingUp as TrendingUpIcon,
  Close as CloseIcon,
  ShoppingBagOutlined as ProductIcon,
} from "@mui/icons-material";
import CouponFormModal from "../components/CouponFormModal";
import CouponGeneratorModal from "../components/CouponGeneratorModal";

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [stats, setStats] = useState({
    totalCoupons: 0,
    activeCoupons: 0,
    expiredCoupons: 0,
    totalRedemptions: 0,
    totalSavingsGiven: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [productsList, setProductsList] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

  useEffect(() => {
    fetchCoupons();
    fetchProducts();
  }, [statusFilter]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const url = new URL(
        `${import.meta.env.VITE_API_URL}/api/coupons/admin/all`,
      );
      if (statusFilter !== "all") url.searchParams.set("status", statusFilter);
      if (searchTerm) url.searchParams.set("search", searchTerm);

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        setCoupons(data.coupons || []);
        if (data.stats) setStats(data.stats);
      } else {
        toast.error(data.message || "Failed to load coupons");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error fetching coupons");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products?limit=100&status=all`,
      );
      const data = await res.json();
      if (res.ok) {
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.products)
              ? data.products
              : [];
        setProductsList(list);
      } else {
        setProductsList([]);
      }
    } catch (err) {
      console.error("Failed to load products list:", err);
      setProductsList([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCoupons();
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Coupon code ${code} copied!`);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/coupons/admin/${id}/toggle-status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        },
      );
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setCoupons((prev) =>
          prev.map((c) =>
            c._id === id ? { ...c, isActive: !currentStatus } : c,
          ),
        );
      } else {
        toast.error(data.message || "Failed to toggle status");
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Are you sure you want to delete coupon '${code}'?`)) {
      return;
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/coupons/admin/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        },
      );
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchCoupons();
      } else {
        toast.error(data.message || "Failed to delete coupon");
      }
    } catch (err) {
      toast.error("Error deleting coupon");
    }
  };

  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (coupon) => {
    setEditingCoupon(coupon);
    setIsCreateOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
            Coupons & Discounts
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Create promotional codes, set product restrictions, and manage
            customer savings
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsGenerateOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-light bg-surface hover:bg-surface-muted text-text-primary text-sm font-medium transition-all shadow-xs"
          >
            <GenerateIcon fontSize="small" className="text-accent" />
            <span>Quick Generate</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-all shadow-soft"
          >
            <AddIcon fontSize="small" />
            <span>Create Coupon</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface p-5 rounded-2xl border border-border-light shadow-soft flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
              Total Coupons
            </p>
            <h3 className="font-heading text-2xl font-bold text-text-primary mt-1">
              {stats.totalCoupons}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-accent-light flex items-center justify-center text-accent">
            <CouponIcon />
          </div>
        </div>

        <div className="bg-surface p-5 rounded-2xl border border-border-light shadow-soft flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
              Active Offers
            </p>
            <h3 className="font-heading text-2xl font-bold text-success mt-1">
              {stats.activeCoupons}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-success">
            <CheckIcon />
          </div>
        </div>

        <div className="bg-surface p-5 rounded-2xl border border-border-light shadow-soft flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
              Redemptions
            </p>
            <h3 className="font-heading text-2xl font-bold text-text-primary mt-1">
              {stats.totalRedemptions}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <TrendingUpIcon />
          </div>
        </div>

        <div className="bg-surface p-5 rounded-2xl border border-border-light shadow-soft flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
              Total Customer Savings
            </p>
            <h3 className="font-heading text-2xl font-bold text-accent mt-1">
              ₹{stats.totalSavingsGiven.toLocaleString("en-IN")}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-accent">
            <ExpiredIcon />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface p-4 rounded-2xl border border-border-light shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: "all", label: "All Coupons" },
            { id: "active", label: "Active" },
            { id: "expired", label: "Expired" },
            { id: "inactive", label: "Inactive" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? "bg-accent text-white shadow-xs"
                  : "bg-surface-muted text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex items-center min-w-[260px]"
        >
          <SearchIcon className="absolute left-3 text-text-secondary text-sm pointer-events-none" />
          <input
            type="text"
            placeholder="Search coupon code or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface-muted border border-border-light rounded-xl text-xs text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </form>
      </div>

      {/* Coupons Table / Grid */}
      {loading ? (
        <div className="bg-surface rounded-2xl border border-border-light p-12 text-center text-text-secondary">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-accent border-t-transparent mb-3" />
          <p className="text-sm">Loading coupons...</p>
        </div>
      ) : coupons.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-border-light p-12 text-center">
          <CouponIcon sx={{ fontSize: 48 }} className="text-accent/40 mb-3" />
          <h3 className="font-heading text-lg font-semibold text-text-primary mb-1">
            No Coupons Found
          </h3>
          <p className="text-text-secondary text-sm max-w-md mx-auto mb-5">
            {searchTerm || statusFilter !== "all"
              ? "No coupons match the selected filter or search keyword."
              : "You haven't created any coupons yet. Get started by clicking 'Create Coupon' or 'Quick Generate'."}
          </p>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-all"
          >
            <AddIcon fontSize="small" />
            <span>Create First Coupon</span>
          </button>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-border-light shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-muted border-b border-border-light text-text-secondary uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Coupon Code</th>
                  <th className="py-3.5 px-4">Discount</th>
                  <th className="py-3.5 px-4">Min. Spend</th>
                  <th className="py-3.5 px-4">Applicability</th>
                  <th className="py-3.5 px-4">Usage</th>
                  <th className="py-3.5 px-4">Valid Until</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {coupons.map((coupon) => {
                  const isExpired = new Date(coupon.expiryDate) < new Date();
                  const remainingDays = Math.ceil(
                    (new Date(coupon.expiryDate) - new Date()) /
                      (1000 * 60 * 60 * 24),
                  );

                  return (
                    <tr
                      key={coupon._id}
                      className="hover:bg-surface-muted/50 transition-colors"
                    >
                      {/* Code */}
                      <td className="py-4 px-4 font-mono font-bold text-text-primary">
                        <div className="flex items-center gap-2">
                          <span className="bg-accent-light text-accent px-2.5 py-1 rounded-md border border-accent/20 tracking-wider">
                            {coupon.code}
                          </span>
                          <button
                            onClick={() => handleCopyCode(coupon.code)}
                            title="Copy code"
                            className="p-1 text-text-secondary hover:text-accent transition-colors"
                          >
                            <CopyIcon fontSize="inherit" />
                          </button>
                        </div>
                        <p className="font-sans font-normal text-text-secondary text-[11px] mt-1 max-w-[200px] truncate">
                          {coupon.description}
                        </p>
                      </td>

                      {/* Discount */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                          {coupon.discountType === "percentage"
                            ? `${coupon.discountAmount}% OFF`
                            : `₹${coupon.discountAmount} FLAT`}
                        </span>
                        {coupon.discountType === "percentage" &&
                          coupon.maxDiscountAmount && (
                            <p className="text-[11px] text-text-secondary mt-0.5">
                              Up to ₹{coupon.maxDiscountAmount}
                            </p>
                          )}
                      </td>

                      {/* Min Spend */}
                      <td className="py-4 px-4 text-text-primary font-medium">
                        {coupon.minPurchaseAmount > 0
                          ? `₹${coupon.minPurchaseAmount.toLocaleString("en-IN")}`
                          : "No minimum"}
                      </td>

                      {/* Applicability */}
                      <td className="py-4 px-4">
                        {coupon.applicableType === "all" ? (
                          <span className="text-text-secondary">
                            All Products
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-accent font-medium">
                            <ProductIcon sx={{ fontSize: 14 }} />
                            {coupon.applicableProducts?.length || 0} product(s)
                          </span>
                        )}
                      </td>

                      {/* Usage */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1 max-w-[120px]">
                          <div className="flex justify-between text-[11px] text-text-secondary">
                            <span>{coupon.usedCount || 0} used</span>
                            <span>
                              {coupon.usageLimit
                                ? `/ ${coupon.usageLimit}`
                                : "(Unlimited)"}
                            </span>
                          </div>
                          {coupon.usageLimit && (
                            <div className="w-full bg-surface-muted h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-accent h-full rounded-full transition-all"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    ((coupon.usedCount || 0) /
                                      coupon.usageLimit) *
                                      100,
                                  )}%`,
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Valid Until */}
                      <td className="py-4 px-4">
                        <span className="text-text-primary">
                          {new Date(coupon.expiryDate).toLocaleDateString()}
                        </span>
                        <p
                          className={`text-[11px] mt-0.5 font-medium ${
                            isExpired
                              ? "text-error"
                              : remainingDays <= 3
                                ? "text-amber-600"
                                : "text-text-secondary"
                          }`}
                        >
                          {isExpired
                            ? "Expired"
                            : `${remainingDays} day${
                                remainingDays === 1 ? "" : "s"
                              } left`}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <button
                          onClick={() =>
                            handleToggleStatus(coupon._id, coupon.isActive)
                          }
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            coupon.isActive && !isExpired
                              ? "bg-success"
                              : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${
                              coupon.isActive && !isExpired
                                ? "translate-x-4"
                                : "translate-x-0"
                            }`}
                          />
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(coupon)}
                            className="p-1.5 text-text-secondary hover:text-accent rounded-lg hover:bg-surface-muted transition-colors"
                            title="Edit Coupon"
                          >
                            <EditIcon fontSize="small" />
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(coupon._id, coupon.code)
                            }
                            className="p-1.5 text-text-secondary hover:text-error rounded-lg hover:bg-error/10 transition-colors"
                            title="Delete Coupon"
                          >
                            <DeleteIcon fontSize="small" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      <CouponFormModal
        open={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingCoupon(null);
        }}
        coupon={editingCoupon}
        onSuccess={fetchCoupons}
        productsList={productsList}
        loadingProducts={loadingProducts}
      />

      {/* QUICK GENERATOR MODAL */}
      <CouponGeneratorModal
        open={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        onSuccess={fetchCoupons}
      />
    </div>
  );
};

export default AdminCoupons;
