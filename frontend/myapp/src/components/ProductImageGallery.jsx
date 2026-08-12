import { useState, useEffect, useRef } from "react";
import PropTypes from 'prop-types';

export default function ProductImageGallery({ mainImage, images = [], productName }) {
    // Combine main image with additional images
    const allImages = [
        { src: mainImage, alt: `${productName} - Main` },
        ...images.map(img => ({
            src: img.image,
            alt: img.short_description || `${productName} - Additional`
        }))
    ].filter(img => img.src); // Remove any invalid images

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [touchStart, setTouchStart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fullscreen, setFullscreen] = useState(false);
    const [imageErrors, setImageErrors] = useState({});
    const [mainImageHeight, setMainImageHeight] = useState(0);

    const thumbnailRef = useRef(null);
    const mainImageRef = useRef(null);
    const mainContainerRef = useRef(null);

    const getImageSrc = (img) => {
        if (!img?.src) return "";
        return img.src.startsWith("http")
            ? img.src
            : `${import.meta.env.VITE_API_URL}${img.src}`;
    };

    const nextImage = () => {
        setSelectedIndex((prev) =>
            prev === allImages.length - 1 ? 0 : prev + 1
        );
        setLoading(true);
    };

    const prevImage = () => {
        setSelectedIndex((prev) =>
            prev === 0 ? allImages.length - 1 : prev - 1
        );
        setLoading(true);
    };

    const handleImageError = (index) => {
        setImageErrors(prev => ({ ...prev, [index]: true }));
        setLoading(false);
    };

    /* ================= MEASURE MAIN IMAGE HEIGHT ================= */
    useEffect(() => {
        if (mainContainerRef.current && !fullscreen) {
            const resizeObserver = new ResizeObserver((entries) => {
                for (let entry of entries) {
                    setMainImageHeight(entry.contentRect.height);
                }
            });

            resizeObserver.observe(mainContainerRef.current);

            return () => resizeObserver.disconnect();
        }
    }, [fullscreen]);

    /* ================= KEYBOARD NAVIGATION ================= */
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === "ArrowRight") nextImage();
            if (e.key === "ArrowLeft") prevImage();
            if (e.key === "Escape" && fullscreen) setFullscreen(false);
        };

        window.addEventListener("keydown", handleKey);

        return () => window.removeEventListener("keydown", handleKey);
    }, [allImages.length, fullscreen]);

    /* ================= THUMBNAIL SCROLL SYNC ================= */
    useEffect(() => {
        // Scroll active thumbnail into view
        if (thumbnailRef.current && allImages.length > 0) {
            const activeThumb = thumbnailRef.current.children[selectedIndex];
            if (activeThumb) {
                activeThumb.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center'
                });
            }
        }
    }, [selectedIndex, allImages.length]);

    /* ================= SWIPE SUPPORT ================= */
    const handleTouchStart = (e) => {
        setTouchStart(e.touches[0].clientX);
    };

    const handleTouchMove = (e) => {
        // Prevent scrolling while swiping
        if (touchStart) {
            e.preventDefault();
        }
    };

    const handleTouchEnd = (e) => {
        if (!touchStart) return;

        const diff = touchStart - e.changedTouches[0].clientX;

        if (diff > 50) nextImage();
        if (diff < -50) prevImage();

        setTouchStart(null);
    };

    /* ================= IMAGE PRELOAD (ADJACENT IMAGES) ================= */
    useEffect(() => {
        const preloadImages = () => {
            if (allImages.length === 0) return;

            const indices = [
                selectedIndex,
                (selectedIndex + 1) % allImages.length,
                selectedIndex === 0 ? allImages.length - 1 : selectedIndex - 1
            ];

            indices.forEach(index => {
                const img = new Image();
                img.src = getImageSrc(allImages[index]);
            });
        };

        preloadImages();
    }, [selectedIndex, allImages]);

    /* ================= FULLSCREEN TOGGLE ================= */
    const toggleFullscreen = () => {
        setFullscreen(!fullscreen);
    };

    if (!allImages.length) {
        return (
            <div className="bg-gray-100 rounded-xl p-8 text-center text-gray-500">
                No images available
            </div>
        );
    }

    const mainImageClasses = fullscreen
        ? "fixed inset-0 z-50 bg-black p-8 flex items-center justify-center"
        : "w-full lg:col-span-4 mt-0";

    const mainImageContent = (
        <div
            ref={mainContainerRef}
            className={mainImageClasses}
        >
            <div
                ref={mainImageRef}
                className={`relative bg-surface border border-border-light rounded-2xl overflow-hidden shadow-soft group ${fullscreen ? 'w-full h-full' : ''
                    }`}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                aria-live="polite"
            >
                {/* Loading spinner */}
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-surface z-10">
                        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                {/* Zoom hover effect (only when not in fullscreen) */}
                <div className={`${!fullscreen ? 'overflow-hidden' : ''}`}>
                    {imageErrors[selectedIndex] ? (
                        <div className="w-full h-[600px] flex items-center justify-center bg-gray-200 text-gray-500">
                            <span className="text-lg">Image not found</span>
                        </div>
                    ) : (
                        <img
                            key={selectedIndex} // Force re-render on image change
                            src={getImageSrc(allImages[selectedIndex])}
                            alt={allImages[selectedIndex]?.alt || `${productName} - Image ${selectedIndex + 1}`}
                            onLoad={() => setLoading(false)}
                            onError={() => handleImageError(selectedIndex)}
                            className={`w-full max-h-[600px] object-contain p-6 transition-transform duration-300 ${!fullscreen ? 'group-hover:scale-110' : ''
                                } ${loading ? 'opacity-0' : 'opacity-100'}`}
                        />
                    )}
                </div>

                {/* NAV ARROWS */}
                {allImages.length > 1 && (
                    <>
                        <button
                            onClick={prevImage}
                            aria-label="Previous image"
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-surface/90 backdrop-blur-sm border border-border-light shadow-sm rounded-full p-2.5 opacity-80 hover:opacity-100 transition-all focus:outline-none focus:ring-2 focus:ring-accent"
                        >
                            <svg className="w-5 h-5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        <button
                            onClick={nextImage}
                            aria-label="Next image"
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-surface/90 backdrop-blur-sm border border-border-light shadow-sm rounded-full p-2.5 opacity-80 hover:opacity-100 transition-all focus:outline-none focus:ring-2 focus:ring-accent"
                        >
                            <svg className="w-5 h-5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </>
                )}

                {/* COUNTER */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-3 py-1 rounded-full">
                    {selectedIndex + 1} / {allImages.length}
                </div>

                {/* FULLSCREEN BUTTON */}
                <button
                    onClick={toggleFullscreen}
                    aria-label={fullscreen ? "Exit fullscreen" : "View fullscreen"}
                    className="absolute top-4 right-4 bg-white shadow rounded-full p-2 opacity-80 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    {fullscreen ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                    )}
                </button>

                {/* CLOSE FULLSCREEN BUTTON (visible only in fullscreen) */}
                {fullscreen && (
                    <button
                        onClick={toggleFullscreen}
                        aria-label="Close fullscreen"
                        className="absolute top-4 left-4 bg-white shadow rounded-full p-2 opacity-80 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );

    if (fullscreen) {
        return mainImageContent;
    }

    return (
        <div
            className="lg:grid lg:grid-cols-5 lg:gap-8"
            aria-label={`Product images for ${productName}`}
        >
            {/* THUMBNAILS - Hidden on mobile, visible on desktop */}
            <div className="hidden lg:block lg:col-span-1">
                <div
                    ref={thumbnailRef}
                    className="flex lg:flex-col gap-3 hover-scroll overflow-y-auto p-1"
                    style={{ height: mainImageHeight ? `${mainImageHeight}px` : '600px' }}
                    role="tablist"
                    aria-label="Product image thumbnails"
                >
                    {allImages.map((img, index) => (
                        <button
                            key={index}
                            role="tab"
                            aria-selected={selectedIndex === index}
                            aria-label={`View image ${index + 1} of ${allImages.length}${img.alt ? ` - ${img.alt}` : ''}`}
                            onClick={() => {
                                setSelectedIndex(index);
                                setLoading(true);
                            }}
                            className={`aspect-square min-w-[80px] rounded-xl overflow-hidden transition-all duration-200 flex-shrink-0
                                ${selectedIndex === index
                                    ? "ring-2 ring-accent border-transparent"
                                    : "border border-border-light hover:border-accent"
                                }
                                focus:outline-none focus:ring-2 focus:ring-accent
                            `}
                        >
                            {imageErrors[index] ? (
                                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-xs">
                                    Error
                                </div>
                            ) : (
                                <img
                                    src={getImageSrc(img)}
                                    alt={img.alt || `${productName} ${index + 1}`}
                                    onError={() => handleImageError(index)}
                                    loading="lazy"
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* MAIN IMAGE */}
            {mainImageContent}
        </div>
    );
}

/* ================= PROPTYPES ================= */

ProductImageGallery.propTypes = {
    mainImage: PropTypes.string.isRequired,
    images: PropTypes.arrayOf(
        PropTypes.shape({
            image: PropTypes.string.isRequired,
            short_description: PropTypes.string
        })
    ),
    productName: PropTypes.string.isRequired
};