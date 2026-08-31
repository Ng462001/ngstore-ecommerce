import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  SparklesIcon,
  ArrowRightIcon,
  ClockIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

const samplePrompts = [
  "👕 Red cotton t-shirt under ₹1,500",
  "👟 White sports running shoes",
  "📱 Smartphone under ₹20,000",
  "⭐ Top rated men clothing",
  "🎒 Black accessories for travel",
  "🎧 Wireless headphones for gym",
];

export default function AISearchModal({ open, onClose }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAiMode, setIsAiMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [aiMetadata, setAiMetadata] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const navigate = useNavigate();

  const reduxUserInfo = useSelector(
    (state) => state?.productReducer?.userInfo || state?.userInfo,
  );

  // Robust token retrieval helper
  const getAuthToken = useCallback(() => {
    if (reduxUserInfo?.token) return reduxUserInfo.token;
    const directToken = localStorage.getItem("token");
    if (directToken) return directToken;
    try {
      const savedUser = localStorage.getItem("userInfo");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        return parsed?.token || parsed?.data?.token || null;
      }
    } catch (e) {
      return null;
    }
    return null;
  }, [reduxUserInfo]);

  // Fetch user recent searches from backend whenever search modal opens
  const fetchRecentSearches = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      return;
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/recent-searches`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await res.json();
      if (data.success && Array.isArray(data.recentSearches)) {
        setRecentSearches(data.recentSearches);
      }
    } catch (err) {
      console.error("Failed to fetch recent searches from backend:", err);
    }
  }, [getAuthToken]);

  useEffect(() => {
    if (open) {
      fetchRecentSearches();
    }
  }, [open, fetchRecentSearches]);

  // Save a search query to backend user model
  const saveRecentSearch = useCallback(
    async (query) => {
      const clean = query?.trim();
      if (!clean || clean.length < 2) return;

      // Optimistic UI update
      setRecentSearches((prev) => {
        const filtered = prev.filter(
          (item) => item.toLowerCase() !== clean.toLowerCase(),
        );
        return [clean, ...filtered].slice(0, 10);
      });

      const token = getAuthToken();
      if (!token) return;

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/users/recent-searches`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ query: clean }),
          },
        );
        const data = await res.json();
        if (data.success && Array.isArray(data.recentSearches)) {
          setRecentSearches(data.recentSearches);
        }
      } catch (err) {
        console.error("Failed to save recent search to backend:", err);
      }
    },
    [getAuthToken],
  );

  // Remove a single recent search from backend
  const removeRecentSearch = async (e, itemToRemove) => {
    e.stopPropagation();
    setRecentSearches((prev) => prev.filter((item) => item !== itemToRemove));

    const token = getAuthToken();
    if (!token) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/recent-searches`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ query: itemToRemove }),
        },
      );
      const data = await res.json();
      if (data.success && Array.isArray(data.recentSearches)) {
        setRecentSearches(data.recentSearches);
      }
    } catch (err) {
      console.error("Failed to delete recent search from backend:", err);
    }
  };

  // Clear all recent searches in backend
  const clearAllRecentSearches = async () => {
    setRecentSearches([]);

    const token = getAuthToken();
    if (!token) return;

    try {
      await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/recent-searches/clear`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
    } catch (err) {
      console.error("Failed to clear recent searches from backend:", err);
    }
  };

  // Fetch smart search results with debouncing
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setResults([]);
      setAiMetadata(null);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const endpoint = isAiMode
          ? `${import.meta.env.VITE_API_URL}/api/products/smart-search?q=${encodeURIComponent(searchQuery)}`
          : `${import.meta.env.VITE_API_URL}/api/products?search=${encodeURIComponent(searchQuery)}&limit=6`;

        const res = await fetch(endpoint);
        const data = await res.json();

        if (data.success) {
          setResults(data.data || []);
          if (isAiMode && data.aiMetadata) {
            setAiMetadata(data.aiMetadata);
          } else {
            setAiMetadata(null);
          }
        } else {
          setResults([]);
          setAiMetadata(null);
        }
      } catch (err) {
        console.error("Search error:", err);
        setResults([]);
        setAiMetadata(null);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, isAiMode]);

  const handlePromptClick = (promptText) => {
    // Strip emoji if present for clean search
    const cleanPrompt = promptText.replace(/^[^\w\s\u0900-\u097F]+/, "").trim();
    setSearchQuery(cleanPrompt);
    saveRecentSearch(cleanPrompt);
  };

  const handleRecentSearchClick = (text) => {
    setSearchQuery(text);
    saveRecentSearch(text);
  };

  const handleFormSubmit = (e) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      const query = searchQuery.trim();
      saveRecentSearch(query);
      if (isAiMode) {
        navigate(`/store?smartSearch=${encodeURIComponent(query)}`);
      } else {
        navigate(`/store?search=${encodeURIComponent(query)}`);
      }
      onClose();
      setSearchQuery("");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-text-primary/40 backdrop-blur-md transition-opacity duration-300 ease-out data-closed:opacity-0"
      />

      <div className="fixed inset-0 z-50 flex items-start justify-center p-2.5 sm:p-4 pt-4 sm:pt-20 overflow-y-auto">
        <DialogPanel
          transition
          className="w-full max-w-3xl transform rounded-2xl bg-surface p-4 sm:p-6 shadow-card border border-border-light transition duration-300 ease-out data-closed:scale-95 data-closed:opacity-0 my-auto sm:my-0 max-h-[92vh] flex flex-col"
        >
          {/* Header & Mode Switcher */}
          <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-border-light gap-2">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <div className="p-2 sm:p-2.5 bg-accent rounded-xl text-white shadow-soft shrink-0">
                <SparklesIcon className="h-4 sm:h-5 w-4 sm:w-5 animate-pulse" />
              </div>
              <div className="min-w-0">
                <h3 className="font-heading text-base sm:text-lg font-semibold text-text-primary flex items-center gap-1.5 sm:gap-2">
                  <span className="truncate">Smart Search</span>
                  <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-accent-light text-accent font-semibold border border-accent/30 shrink-0">
                    ✨ AI
                  </span>
                </h3>
                <p className="text-[11px] sm:text-xs text-text-secondary truncate hidden sm:block">
                  Natural language search, auto filter detection & smart
                  matching
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Mode Toggle Button */}
              <button
                type="button"
                onClick={() => setIsAiMode(!isAiMode)}
                className={`text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1 ${
                  isAiMode
                    ? "bg-accent-light border-accent/40 text-accent shadow-xs"
                    : "bg-surface-muted border-border-light text-text-secondary hover:text-text-primary"
                }`}
              >
                <SparklesIcon className="h-3.5 w-3.5" />
                <span>{isAiMode ? "AI Mode" : "Standard"}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="rounded-xl p-1.5 text-text-secondary hover:bg-surface-muted hover:text-text-primary transition-colors"
              >
                <XMarkIcon className="h-5 sm:h-6 w-5 sm:w-6" />
              </button>
            </div>
          </div>

          {/* Search Input */}
          <form
            onSubmit={handleFormSubmit}
            className="mt-3 sm:mt-4 flex items-center gap-2 sm:gap-2.5 shrink-0"
          >
            <div className="relative flex-1 flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isAiMode
                    ? "Ask AI e.g. 'Red sports shoes under ₹2,000'..."
                    : "Search products..."
                }
                className="w-full rounded-xl border border-border-light bg-background pl-9 sm:pl-11 pr-8 py-2.5 sm:py-3 text-xs sm:text-base text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-xs"
                autoFocus
              />
              <div className="absolute left-3 text-accent">
                {isAiMode ? (
                  <SparklesIcon className="h-4 sm:h-5 w-4 sm:w-5 animate-pulse" />
                ) : (
                  <MagnifyingGlassIcon className="h-4 sm:h-5 w-4 sm:w-5 text-text-secondary" />
                )}
              </div>

              {/* Clear input button if search text exists */}
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 p-1 text-text-secondary hover:text-text-primary transition-colors"
                  title="Clear input"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* External Search Button */}
            <button
              type="submit"
              disabled={!searchQuery.trim()}
              className="px-3.5 sm:px-5 py-2.5 sm:py-3 bg-accent hover:bg-accent-hover disabled:opacity-40 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-1.5 shadow-soft shrink-0 cursor-pointer"
            >
              <MagnifyingGlassIcon className="h-4 w-4" />
              <span>Search</span>
            </button>
          </form>

          {/* Scrollable Container for Prompts, Intent & Results */}
          <div className="overflow-y-auto flex-1 mt-3 sm:mt-4 pr-0.5 space-y-4">
            {/* Recent Searches Section (when search input is empty) */}
            {!searchQuery && recentSearches.length > 0 && (
              <div className="space-y-2 p-3 bg-surface-muted/60 rounded-2xl border border-border-light/60">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] sm:text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <ClockIcon className="h-4 w-4 text-accent" />
                    Recent Searches
                  </p>
                  <button
                    type="button"
                    onClick={clearAllRecentSearches}
                    className="text-[10px] sm:text-xs text-text-secondary hover:text-rose-500 transition-colors flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <TrashIcon className="h-3 w-3" />
                    <span>Clear All</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1">
                  {recentSearches.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleRecentSearchClick(item)}
                      className="group inline-flex items-center gap-1.5 text-[11px] sm:text-xs pl-3 pr-1.5 py-1 sm:py-1.5 rounded-full bg-surface border border-border-light hover:border-accent hover:bg-accent-light/50 text-text-primary hover:text-accent transition-all font-medium cursor-pointer shadow-xs"
                    >
                      <ClockIcon className="h-3 w-3 text-text-secondary group-hover:text-accent transition-colors shrink-0" />
                      <span className="truncate max-w-[140px] sm:max-w-[200px]">
                        {item}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => removeRecentSearch(e, item)}
                        title="Remove"
                        className="p-0.5 rounded-full hover:bg-surface-muted text-text-secondary/50 hover:text-rose-500 transition-colors cursor-pointer"
                      >
                        <XMarkIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick AI Sample Prompts */}
            {!searchQuery && (
              <div>
                <p className="text-[11px] sm:text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-1">
                  <SparklesIcon className="h-3.5 w-3.5 text-accent" />
                  Try asking AI
                </p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {samplePrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePromptClick(prompt)}
                      className="text-[11px] sm:text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-surface-muted border border-border-light hover:border-accent hover:bg-accent-light hover:text-accent text-text-primary transition-all font-medium flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* AI Intent Breakdown Card */}
            {aiMetadata && (
              <div className="p-3 sm:p-4 bg-accent-light/50 border border-accent/20 rounded-xl text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-text-primary flex items-center gap-1 text-xs">
                    <SparklesIcon className="h-3.5 w-3.5 text-accent" />
                    AI Search Explanation:
                  </span>
                  {aiMetadata.isAiPowered && (
                    <span className="text-[10px] bg-accent/10 text-accent font-bold px-2 py-0.5 rounded-full border border-accent/20">
                      Gemini 1.5
                    </span>
                  )}
                </div>
                <p className="text-text-secondary font-medium italic text-[11px] sm:text-xs">
                  {aiMetadata.explanation}
                </p>

                <div className="flex flex-wrap gap-1 pt-1">
                  {aiMetadata.category && (
                    <span className="px-2 py-0.5 rounded-md bg-surface border border-border-light text-accent font-semibold text-[10px] sm:text-xs">
                      Category: {aiMetadata.category}
                    </span>
                  )}
                  {aiMetadata.color && (
                    <span className="px-2 py-0.5 rounded-md bg-surface border border-border-light text-accent font-semibold capitalize text-[10px] sm:text-xs">
                      Color: {aiMetadata.color}
                    </span>
                  )}
                  {(aiMetadata.maxPrice || aiMetadata.minPrice) && (
                    <span className="px-2 py-0.5 rounded-md bg-surface border border-border-light text-success font-semibold text-[10px] sm:text-xs">
                      Price:{" "}
                      {aiMetadata.minPrice ? `₹${aiMetadata.minPrice}` : "₹0"} -{" "}
                      {aiMetadata.maxPrice ? `₹${aiMetadata.maxPrice}` : "Any"}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Results Container */}
            {(loading ||
              results.length > 0 ||
              (searchQuery.trim().length >= 2 && !loading)) && (
              <div className="border-t border-border-light pt-3 space-y-2">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-6">
                    <div className="animate-spin rounded-full h-7 w-7 border-2 border-accent border-t-transparent"></div>
                    <span className="mt-2 text-xs text-text-secondary font-medium">
                      AI is analyzing catalog...
                    </span>
                  </div>
                ) : results.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1 mb-1">
                      <span className="text-[11px] sm:text-xs font-semibold text-text-secondary uppercase tracking-wider">
                        Found {results.length} matching products
                      </span>
                    </div>
                    {results.map((product) => {
                      const productImg =
                        product.image ||
                        product.images?.[0]?.src ||
                        "https://via.placeholder.com/60x60?text=No+Image";
                      const fullImgUrl = productImg.startsWith("http")
                        ? productImg
                        : `${import.meta.env.VITE_API_URL}${productImg}`;
                      return (
                        <div
                          key={product._id}
                          onClick={() => {
                            if (searchQuery.trim()) {
                              saveRecentSearch(searchQuery.trim());
                            }
                            navigate(`/product/${product._id}`);
                            onClose();
                          }}
                          className="group flex items-center justify-between p-2.5 sm:p-3 rounded-xl border border-border-light hover:border-accent hover:bg-accent-light/30 transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                            <img
                              src={fullImgUrl}
                              alt={product.name}
                              className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-lg bg-background border border-border-light group-hover:scale-105 transition-transform shrink-0"
                              onError={(e) => {
                                e.target.src =
                                  "https://via.placeholder.com/60x60?text=No+Image";
                              }}
                            />
                            <div className="min-w-0">
                              <h4 className="font-heading text-xs sm:text-sm font-semibold text-text-primary truncate group-hover:text-accent transition-colors">
                                {product.name}
                              </h4>
                              <div className="flex items-center gap-1.5 text-[11px] text-text-secondary mt-0.5">
                                <span className="bg-surface-muted px-1.5 py-0.5 rounded capitalize text-[10px]">
                                  {product.category}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0 ml-2">
                            <div className="text-xs sm:text-sm font-bold text-accent">
                              ₹
                              {(
                                product.discountedPrice || product.price
                              )?.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <div className="pt-2 border-t border-border-light">
                      <button
                        onClick={handleFormSubmit}
                        className="w-full text-center py-2 text-xs font-semibold text-accent hover:bg-accent-light rounded-xl transition-colors flex items-center justify-center gap-1"
                      >
                        View all AI results in store page
                        <ArrowRightIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-text-secondary text-xs">
                    No products matching your search query.
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
