import React, { useState, useEffect, useRef } from "react";
import ProductCard from "./ProductCard";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function RelatedProducts({
  currentProductId,
  category,
  title = "Similar Products",
  subtitle = "Customers who viewed this item also viewed",
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scrollContainerRef = useRef(null);

  // Fetch related products
  useEffect(() => {
    let isMounted = true;
    const fetchRelated = async () => {
      if (!currentProductId) return;
      try {
        setLoading(true);
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/products/${currentProductId}/related?limit=12`,
        );
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.data)) {
          setProducts(data.data);
        } else if (isMounted) {
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching related products:", error);
        if (isMounted) setProducts([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchRelated();
    return () => {
      isMounted = false;
    };
  }, [currentProductId]);

  // Check scroll position to toggle navigation arrows
  const checkScrollPosition = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
      el.addEventListener("scroll", checkScrollPosition);
      checkScrollPosition();
      return () => el.removeEventListener("scroll", checkScrollPosition);
    }
  }, [products]);

  const handleScroll = (direction) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = direction === "left" ? -300 : 300;
    el.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  if (!loading && products.length === 0) {
    return null;
  }

  return (
    <div className="mt-16 pt-12 border-t border-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold uppercase tracking-wider mb-2">
            <SparklesIcon className="h-3.5 w-3.5" />
            <span>Recommended For You</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 tracking-tight">
            {title}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {subtitle}{" "}
            {category && (
              <span className="text-accent font-medium">in {category}</span>
            )}
          </p>
        </div>

        {/* Scroll Controls */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleScroll("left")}
            disabled={!canScrollLeft}
            className={classNames(
              canScrollLeft
                ? "bg-white text-gray-800 border-gray-200 hover:bg-gray-50 hover:border-accent shadow-sm cursor-pointer"
                : "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed",
              "p-2.5 rounded-xl border transition-all active:scale-95",
            )}
            title="Scroll left"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => handleScroll("right")}
            disabled={!canScrollRight}
            className={classNames(
              canScrollRight
                ? "bg-white text-gray-800 border-gray-200 hover:bg-gray-50 hover:border-accent shadow-sm cursor-pointer"
                : "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed",
              "p-2.5 rounded-xl border transition-all active:scale-95",
            )}
            title="Scroll right"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Product Slider / Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm animate-pulse space-y-3"
            >
              <div className="h-48 bg-gray-100 rounded-xl" />
              <div className="h-4 bg-gray-100 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
              <div className="h-5 bg-gray-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="relative group">
          <div
            ref={scrollContainerRef}
            className="flex gap-5 overflow-x-auto scroll-smooth pb-4 pt-1 px-1 -mx-1 scrollbar-none snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {products.map((item) => {
              const itemId = item._id || item.id;
              return (
                <div
                  key={itemId}
                  className="flex-none w-[240px] sm:w-[280px] snap-start"
                >
                  <ProductCard item={item} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
