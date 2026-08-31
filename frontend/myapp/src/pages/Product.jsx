import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { XMarkIcon, SparklesIcon } from "@heroicons/react/24/outline";
import {
  ChevronDownIcon,
  FunnelIcon,
  MinusIcon,
  PlusIcon,
} from "@heroicons/react/20/solid";
import ProductCard from "../components/ProductCard";
import { useLocation, useNavigate } from "react-router-dom";
import { Pagination } from "@mui/material";
import AISearchModal from "../components/AISearchModal";

const sortOptions = [
  { name: "Most Popular", href: "#", current: true, value: "createdAt" },
  { name: "Best Rating", href: "#", current: false, value: "-rating.average" },
  { name: "Newest", href: "#", current: false, value: "-createdAt" },
  { name: "Price: Low to High", href: "#", current: false, value: "price" },
  { name: "Price: High to Low", href: "#", current: false, value: "-price" },
];

const filters = [
  {
    id: "category",
    name: "Category",
    options: [
      { value: "men", label: "Men" },
      { value: "women", label: "Women" },
      { value: "accessories", label: "Accessories" },
      { value: "electronic device", label: "Electronics" },
      { value: "mobile", label: "Mobile" },
      { value: "sports", label: "Sports" },
      { value: "home", label: "Home" },
      { value: "cloths", label: "Cloths" },
    ],
  },
  {
    id: "color",
    name: "Color",
    options: [
      { value: "white", label: "White" },
      { value: "black", label: "Black" },
      { value: "gray", label: "Gray" },
      { value: "blue", label: "Blue" },
      { value: "green", label: "Green" },
      { value: "red", label: "Red" },
    ],
  },
  {
    id: "size",
    name: "Size",
    options: [
      { value: "XS", label: "XS" },
      { value: "S", label: "S" },
      { value: "M", label: "M" },
      { value: "L", label: "L" },
      { value: "XL", label: "XL" },
      { value: "2XL", label: "2XL" },
    ],
  },
  {
    id: "discount",
    name: "Discount",
    options: [
      { value: "20", label: "20% and Above" },
      { value: "30", label: "30% and Above" },
      { value: "40", label: "40% and Above" },
      { value: "50", label: "50% and Above" },
    ],
  },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

// Demo fallback images for products without image
const demoImages = [
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&auto=format&fit=crop&q=60",
];

// Function to get a random demo image
const getRandomDemoImage = () => {
  return demoImages[Math.floor(Math.random() * demoImages.length)];
};

// Function to process product data and ensure images exist
const processProductData = (products) => {
  return products.map((product) => ({
    ...product,
    // Ensure image exists, otherwise use demo image
    image: product.image || product.images?.[0]?.src || getRandomDemoImage(),
    // Ensure price and discountedPrice are numbers
    price: parseFloat(product.price) || 0,
    discountedPrice: product.discountedPrice
      ? parseFloat(product.discountedPrice)
      : null,
    // Ensure name exists
    name: product.name || "Unnamed Product",
    // Ensure description exists
    description: product.description || "No description available",
    // Ensure category exists
    category: product.category || "uncategorized",
  }));
};

export default function Product() {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const [sortOption, setSortOption] = useState(sortOptions[0]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [aiMetadata, setAiMetadata] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch products from API
  const fetchProducts = useCallback(async (queryParams = "") => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products${queryParams}`,
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        const processedProducts = processProductData(result.data || []);
        setProducts(processedProducts);
        setPagination(result.pagination || {});
      } else {
        throw new Error(result.message || "Failed to fetch products");
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch smart search results
  const fetchSmartSearchResults = useCallback(
    async (smartSearchQuery, page = "1") => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/products/smart-search?q=${encodeURIComponent(smartSearchQuery)}&page=${page}&limit=12`,
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch smart search products: ${response.status}`,
          );
        }

        const result = await response.json();

        if (result.success) {
          const processedProducts = processProductData(result.data || []);
          setProducts(processedProducts);
          setPagination(result.pagination || {});
          setAiMetadata(result.aiMetadata || null);
        } else {
          throw new Error(result.message || "Smart search failed");
        }
      } catch (err) {
        console.error("Error fetching smart search products:", err);
        setError(err.message);
        setProducts([]);
        setAiMetadata(null);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Apply filters from URL on component mount and when URL changes
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const smartSearchQuery = searchParams.get("smartSearch");
    const querySearch = searchParams.get("search") || "";

    if (smartSearchQuery) {
      setSearchQuery(smartSearchQuery);
      const page = searchParams.get("page") || "1";
      fetchSmartSearchResults(smartSearchQuery, page);
      return;
    }

    setAiMetadata(null);
    const newFilters = {};

    filters.forEach((section) => {
      const values = searchParams.get(section.id)?.split(",") || [];
      if (values.length > 0) {
        newFilters[section.id] = values;
      }
    });

    // Get sort from URL or use default
    const sortFromUrl = searchParams.get("sort");
    const orderFromUrl = searchParams.get("order");
    const selectedSort =
      sortOptions.find(
        (option) =>
          option.value ===
          (orderFromUrl === "desc" ? `-${sortFromUrl}` : sortFromUrl),
      ) || sortOptions[0];

    setSearchQuery(querySearch);

    setSortOption(selectedSort);
    setActiveFilters(newFilters);

    // Build API query string
    const apiQueryParams = new URLSearchParams();

    // Add pagination
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "12";
    apiQueryParams.set("page", page);
    apiQueryParams.set("limit", limit);

    // Add filters
    Object.entries(newFilters).forEach(([key, values]) => {
      if (values.length > 0) {
        apiQueryParams.set(key, values.join(","));
      }
    });

    // Add sorting
    if (selectedSort.value.startsWith("-")) {
      apiQueryParams.set("sort", selectedSort.value.slice(1));
      apiQueryParams.set("order", "desc");
    } else {
      apiQueryParams.set("sort", selectedSort.value);
      apiQueryParams.set("order", "asc");
    }

    if (querySearch) {
      apiQueryParams.set("search", querySearch);
    }

    // Add inStock filter by default for better UX
    apiQueryParams.set("inStock", "true");

    const queryString = apiQueryParams.toString();
    fetchProducts(queryString ? `?${queryString}` : "");
  }, [location.search, fetchProducts, fetchSmartSearchResults]);

  const handleFilter = useCallback(
    (value, sectionId) => {
      const newFilters = { ...activeFilters };
      const currentPage =
        new URLSearchParams(location.search).get("page") || "1";

      if (newFilters[sectionId]?.includes(value)) {
        newFilters[sectionId] = newFilters[sectionId].filter(
          (item) => item !== value,
        );
        if (newFilters[sectionId].length === 0) {
          delete newFilters[sectionId];
        }
      } else {
        newFilters[sectionId] = [...(newFilters[sectionId] || []), value];
      }

      const searchParams = new URLSearchParams();

      // Preserve search query if it exists
      const currentSearch = new URLSearchParams(location.search).get("search");
      if (currentSearch) {
        searchParams.set("search", currentSearch);
      }

      // Add filters
      Object.entries(newFilters).forEach(([key, values]) => {
        if (values.length > 0) {
          searchParams.set(key, values.join(","));
        }
      });

      // Add sorting
      if (sortOption.value.startsWith("-")) {
        searchParams.set("sort", sortOption.value.slice(1));
        searchParams.set("order", "desc");
      } else {
        searchParams.set("sort", sortOption.value);
        searchParams.set("order", "asc");
      }

      // Reset to page 1 when filters change
      searchParams.set("page", "1");

      const query = searchParams.toString();
      navigate(`${location.pathname}${query ? `?${query}` : ""}`);
    },
    [activeFilters, sortOption, location.pathname, navigate],
  );

  const handleSort = useCallback(
    (option) => {
      const searchParams = new URLSearchParams(location.search);

      if (option.value.startsWith("-")) {
        searchParams.set("sort", option.value.slice(1));
        searchParams.set("order", "desc");
      } else {
        searchParams.set("sort", option.value);
        searchParams.set("order", "asc");
      }

      // Reset to page 1 when sort changes
      searchParams.set("page", "1");

      const query = searchParams.toString();
      navigate(`${location.pathname}${query ? `?${query}` : ""}`);
    },
    [location.search, location.pathname, navigate],
  );

  const handlePageChange = useCallback(
    (page) => {
      const searchParams = new URLSearchParams(location.search);
      searchParams.set("page", page.toString());

      const query = searchParams.toString();
      navigate(`${location.pathname}${query ? `?${query}` : ""}`);
    },
    [location.search, location.pathname, navigate],
  );

  const clearAllFilters = useCallback(() => {
    const searchParams = new URLSearchParams();
    searchParams.set("page", "1");

    // Keep only pagination and basic params
    const query = searchParams.toString();
    navigate(`${location.pathname}${query ? `?${query}` : ""}`);
  }, [location.pathname, navigate]);

  const getFilterLabel = (filterType, value) => {
    const filterSection = filters.find((f) => f.id === filterType);
    const option = filterSection?.options.find((opt) => opt.value === value);
    return option?.label || value;
  };

  const renderFilterOptions = (section, isMobile = false) => {
    const prefix = isMobile ? "mobile-" : "";

    if (section.id === "color") {
      const colorMap = {
        white: { bg: "#ffffff", border: "border-gray-200" },
        black: { bg: "#111827", border: "border-transparent" },
        gray: { bg: "#6B7280", border: "border-transparent" },
        blue: { bg: "#3B82F6", border: "border-transparent" },
        green: { bg: "#10B981", border: "border-transparent" },
        red: { bg: "#EF4444", border: "border-transparent" },
      };

      return (
        <div className="flex flex-wrap gap-3">
          {section.options.map((option) => {
            const isSelected =
              activeFilters[section.id]?.includes(option.value) || false;
            const colorInfo = colorMap[option.value.toLowerCase()] || {
              bg: option.value,
              border: "border-gray-300",
            };
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleFilter(option.value, section.id)}
                title={option.label}
                className={classNames(
                  "size-8 rounded-full cursor-pointer relative focus:outline-hidden transition-all duration-200 hover:scale-110",
                  colorInfo.border,
                  isSelected
                    ? "ring-2 ring-accent ring-offset-2 scale-105"
                    : "border border-border-light",
                )}
                style={{ backgroundColor: colorInfo.bg }}
                aria-label={`Filter by color ${option.label}`}
              >
                {isSelected && (
                  <span
                    className={classNames(
                      "absolute inset-0 flex items-center justify-center text-xs font-bold pointer-events-none",
                      option.value.toLowerCase() === "white"
                        ? "text-gray-900"
                        : "text-white",
                    )}
                  >
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      );
    }

    if (section.id === "size") {
      return (
        <div className="flex flex-wrap gap-2">
          {section.options.map((option) => {
            const isSelected =
              activeFilters[section.id]?.includes(option.value) || false;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleFilter(option.value, section.id)}
                className={classNames(
                  "min-w-10 h-10 px-2 rounded-xl text-xs font-semibold flex items-center justify-center border transition-all duration-200 hover:border-accent hover:text-accent",
                  isSelected
                    ? "bg-accent text-white border-accent shadow-xs"
                    : "bg-surface text-text-primary border-border-light",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      );
    }

    return (
      <div className={isMobile ? "space-y-6" : "space-y-4"}>
        {section.options.map((option, optionIdx) => (
          <div key={option.value} className="flex gap-3">
            <div className="flex h-5 shrink-0 items-center">
              <div className="group grid size-4 grid-cols-1">
                <input
                  checked={
                    activeFilters[section.id]?.includes(option.value) || false
                  }
                  onChange={() => handleFilter(option.value, section.id)}
                  id={`filter-${prefix}${section.id}-${optionIdx}`}
                  name={`${section.id}[]`}
                  type="checkbox"
                  className="col-start-1 row-start-1 appearance-none rounded-md border border-border-light bg-surface checked:border-accent checked:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent cursor-pointer"
                />
                <svg
                  fill="none"
                  viewBox="0 0 14 14"
                  className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                >
                  <path
                    d="M3 8L6 11L11 3.5"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-checked:opacity-100 transition-opacity duration-200"
                  />
                </svg>
              </div>
            </div>
            <label
              htmlFor={`filter-${prefix}${section.id}-${optionIdx}`}
              className={classNames(
                "cursor-pointer select-none transition-colors duration-200 hover:text-accent",
                isMobile
                  ? "min-w-0 flex-1 text-text-secondary"
                  : "text-sm text-text-secondary",
              )}
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
    );
  };

  // Loading state
  if (loading && products.length === 0) {
    return (
      <div className="bg-white min-h-screen pt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && products.length === 0) {
    return (
      <div className="bg-white min-h-screen pt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Error Loading Products
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div>
        {/* Mobile Filter Dialog */}
        <Dialog
          open={mobileFiltersOpen}
          onClose={setMobileFiltersOpen}
          className="relative z-40 lg:hidden"
        >
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-text-primary/40 backdrop-blur-md transition-opacity duration-300 ease-linear data-closed:opacity-0"
          />

          <div className="fixed inset-0 z-40 flex">
            <DialogPanel
              transition
              className="relative ml-auto flex size-full max-w-xs transform flex-col overflow-y-auto bg-background py-4 pb-12 shadow-card border-l border-border-light transition duration-300 ease-in-out data-closed:translate-x-full"
            >
              <div className="flex items-center justify-between px-4 pb-3 border-b border-border-light">
                <h2 className="font-heading text-lg font-semibold text-text-primary flex items-center gap-2">
                  <FunnelIcon className="size-4 text-accent" />
                  Filters
                </h2>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="-mr-2 flex size-9 items-center justify-center rounded-xl bg-surface border border-border-light p-2 text-text-secondary hover:text-accent transition-colors"
                  aria-label="Close menu"
                >
                  <XMarkIcon aria-hidden="true" className="size-5" />
                </button>
              </div>

              <form className="mt-2 divide-y divide-border-light">
                {filters.map((section) => (
                  <Disclosure key={section.id} as="div" className="px-4 py-4">
                    <h3 className="-mx-2 -my-2">
                      <DisclosureButton className="group flex w-full items-center justify-between bg-transparent px-2 py-2 text-text-secondary hover:text-accent transition-colors">
                        <span className="font-heading text-sm font-semibold text-text-primary group-hover:text-accent transition-colors">
                          {section.name}
                        </span>
                        <span className="ml-6 flex items-center">
                          <PlusIcon
                            aria-hidden="true"
                            className="size-4 text-accent group-data-open:hidden"
                          />
                          <MinusIcon
                            aria-hidden="true"
                            className="size-4 text-accent group-data-open:block hidden"
                          />
                        </span>
                      </DisclosureButton>
                    </h3>
                    <DisclosurePanel className="pt-4">
                      {renderFilterOptions(section, true)}
                    </DisclosurePanel>
                  </Disclosure>
                ))}
              </form>
            </DialogPanel>
          </div>
        </Dialog>

        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-border-light pt-6 sm:pt-10 pb-4 sm:pb-6 gap-3">
            <div>
              <h1 className="font-heading text-2xl sm:text-4xl font-semibold tracking-tight text-text-primary">
                {searchQuery
                  ? `Search Results for "${searchQuery}"`
                  : "All Collections"}
              </h1>
              {pagination.total !== undefined && (
                <p className="mt-1 text-xs sm:text-sm text-text-secondary">
                  Showing {products.length} of {pagination.total} products
                </p>
              )}
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-border-light bg-surface text-xs font-semibold text-text-primary hover:border-accent hover:text-accent transition-colors lg:hidden cursor-pointer shadow-xs"
                aria-label="Open filters"
              >
                <FunnelIcon aria-hidden="true" className="size-4 text-accent" />
                <span>Filters</span>
                {Object.keys(activeFilters).length > 0 && (
                  <span className="size-4 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center">
                    {Object.keys(activeFilters).length}
                  </span>
                )}
              </button>

              <Menu as="div" className="relative inline-block text-left">
                <div>
                  <MenuButton className="group flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-border-light bg-surface hover:border-accent text-xs font-semibold text-text-primary transition-colors cursor-pointer shadow-xs">
                    <span>Sort: {sortOption.name}</span>
                    <ChevronDownIcon
                      aria-hidden="true"
                      className="size-4 shrink-0 text-text-secondary group-hover:text-accent transition-colors"
                    />
                  </MenuButton>
                </div>

                <MenuItems
                  transition
                  className="absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-2xl bg-surface border border-border-light p-1.5 shadow-card transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                >
                  <div className="space-y-0.5">
                    {sortOptions.map((option) => (
                      <MenuItem key={option.name}>
                        <button
                          onClick={() => handleSort(option)}
                          className={classNames(
                            sortOption.name === option.name
                              ? "bg-accent-light text-accent font-semibold"
                              : "text-text-primary hover:bg-surface-muted hover:text-accent",
                            "block w-full px-3 py-2 text-xs text-left rounded-xl transition-all cursor-pointer",
                          )}
                        >
                          {option.name}
                        </button>
                      </MenuItem>
                    ))}
                  </div>
                </MenuItems>
              </Menu>
            </div>
          </div>

          {/* Quick Mobile Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto py-3 border-b border-border-light/60 no-scrollbar">
            {filters
              .find((f) => f.id === "category")
              ?.options.map((cat) => {
                const isSelected = activeFilters.category?.includes(cat.value);
                return (
                  <button
                    key={cat.value}
                    onClick={() => handleFilter(cat.value, "category")}
                    className={classNames(
                      "shrink-0 text-xs px-3.5 py-1.5 rounded-full border transition-all font-medium cursor-pointer",
                      isSelected
                        ? "bg-accent text-white border-accent shadow-xs"
                        : "bg-surface text-text-secondary border-border-light hover:border-accent hover:text-accent",
                    )}
                  >
                    {cat.label}
                  </button>
                );
              })}
          </div>

          {/* Active Filters */}
          {(Object.keys(activeFilters).length > 0 || searchQuery) && (
            <div className="flex flex-wrap gap-2 mt-3">
              {searchQuery && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent-light text-accent border border-accent/20">
                  Search: "{searchQuery}"
                  <button
                    onClick={() => {
                      const searchParams = new URLSearchParams(location.search);
                      searchParams.delete("search");
                      searchParams.set("page", "1");
                      navigate(
                        `${location.pathname}?${searchParams.toString()}`,
                      );
                    }}
                    className="ml-2 hover:bg-accent/20 rounded-full size-4 flex items-center justify-center"
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                </span>
              )}
              {Object.entries(activeFilters).map(([filterType, values]) =>
                values.map((value) => (
                  <span
                    key={`${filterType}-${value}`}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent-light text-accent border border-accent/20"
                  >
                    {getFilterLabel(filterType, value)}
                    <button
                      onClick={() => handleFilter(value, filterType)}
                      className="ml-2 hover:bg-accent/20 rounded-full size-4 flex items-center justify-center"
                      aria-label={`Remove ${getFilterLabel(filterType, value)} filter`}
                    >
                      ×
                    </button>
                  </span>
                )),
              )}
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-surface-muted text-text-secondary hover:text-text-primary border border-border-light cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}

          {/* AI Smart Search Insights Banner */}
          {aiMetadata && (
            <div className="mt-4 p-3.5 sm:p-4 rounded-2xl bg-accent-light/50 border border-accent/20 text-text-primary shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SparklesIcon className="h-4 sm:h-5 w-4 sm:w-5 text-accent" />
                  <h3 className="font-heading font-bold text-xs sm:text-sm text-text-primary flex items-center gap-1.5">
                    ✨ AI Smart Search Active
                  </h3>
                </div>
                <span className="text-[10px] sm:text-xs bg-accent/10 text-accent font-bold px-2.5 py-0.5 rounded-full border border-accent/20 shrink-0">
                  {aiMetadata.isAiPowered ? "Gemini AI" : "Smart NLP"}
                </span>
              </div>
              <p className="text-text-secondary font-medium italic text-[11px] sm:text-xs">
                "{aiMetadata.explanation}"
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1 text-[11px] sm:text-xs">
                {aiMetadata.category && (
                  <span className="px-2.5 py-0.5 rounded-md bg-surface border border-border-light text-accent font-semibold text-[10px] sm:text-xs">
                    Category:{" "}
                    <span className="uppercase text-accent font-bold">
                      {aiMetadata.category}
                    </span>
                  </span>
                )}
                {aiMetadata.color && (
                  <span className="px-2.5 py-0.5 rounded-md bg-surface border border-border-light text-accent font-semibold text-[10px] sm:text-xs">
                    Color:{" "}
                    <span className="capitalize text-accent font-bold">
                      {aiMetadata.color}
                    </span>
                  </span>
                )}
                {(aiMetadata.maxPrice || aiMetadata.minPrice) && (
                  <span className="px-2.5 py-0.5 rounded-md bg-surface border border-border-light text-success font-semibold text-[10px] sm:text-xs">
                    Price:{" "}
                    <span className="font-bold">
                      {aiMetadata.minPrice ? `₹${aiMetadata.minPrice}` : "₹0"} -{" "}
                      {aiMetadata.maxPrice
                        ? `₹${aiMetadata.maxPrice}`
                        : "Any"}
                    </span>
                  </span>
                )}
              </div>
            </div>
          )}

          <section
            aria-labelledby="products-heading"
            className="pt-4 sm:pt-6 pb-20 sm:pb-24"
          >
            <h2 id="products-heading" className="sr-only">
              Products
            </h2>

            <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
              {/* Desktop Filters */}
              <div className="hidden lg:block lg:col-span-1 p-5 rounded-2xl bg-surface border border-border-light shadow-xs sticky top-24 h-fit">
                <h2 className="font-heading text-base font-semibold text-text-primary pb-3 border-b border-border-light flex items-center justify-between">
                  <span>Filters</span>
                  <FunnelIcon className="size-4 text-accent" />
                </h2>
                <form className="divide-y divide-border-light">
                  {filters.map((section) => (
                    <Disclosure key={section.id} as="div" className="py-4">
                      <h3 className="-my-1 flow-root">
                        <DisclosureButton className="group flex w-full items-center justify-between bg-transparent py-2 text-sm text-text-secondary hover:text-accent transition-colors">
                          <span className="font-heading text-sm font-semibold text-text-primary group-hover:text-accent transition-colors">
                            {section.name}
                          </span>
                          <span className="ml-6 flex items-center">
                            <PlusIcon
                              aria-hidden="true"
                              className="size-4 text-accent group-data-open:hidden"
                            />
                            <MinusIcon
                              aria-hidden="true"
                              className="size-4 text-accent group-data-open:block hidden"
                            />
                          </span>
                        </DisclosureButton>
                      </h3>
                      <DisclosurePanel className="pt-4">
                        {renderFilterOptions(section, false)}
                      </DisclosurePanel>
                    </Disclosure>
                  ))}
                </form>
              </div>

              {/* Product Grid */}
              <div className="lg:col-span-3 w-full">
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-10 w-10 border-2 border-accent border-t-transparent"></div>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <p className="text-red-600 mb-4 text-sm font-medium">
                      Error: {error}
                    </p>
                    <button
                      onClick={() => fetchProducts(location.search.slice(1))}
                      className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl text-xs font-semibold transition-all shadow-soft"
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-4 sm:py-5">
                      {products.length > 0 ? (
                        products.map((item) => (
                          <ProductCard key={item._id || item.id} item={item} />
                        ))
                      ) : (
                        <div className="text-center py-12 w-full col-span-1 sm:col-span-2 lg:col-span-3">
                          <p className="text-text-secondary text-sm sm:text-base">
                            No products found matching your filters.
                          </p>
                          <button
                            onClick={clearAllFilters}
                            className="mt-4 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white font-semibold text-xs rounded-xl transition-all shadow-soft"
                          >
                            Clear all filters
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.pages > 1 && (
                      <div className="flex justify-center mt-8">
                        <Pagination
                          count={pagination.pages}
                          page={pagination.current}
                          onChange={(e, value) => handlePageChange(value)}
                          color="primary"
                          size="medium"
                          showFirstButton
                          showLastButton
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
