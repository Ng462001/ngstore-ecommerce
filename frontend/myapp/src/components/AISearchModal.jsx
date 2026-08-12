import { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'
import { MagnifyingGlassIcon, XMarkIcon, SparklesIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom'

const samplePrompts = [
    "👕 Red cotton t-shirt under ₹1,500",
    "👟 White sports running shoes",
    "📱 Smartphone under ₹20,000",
    "⭐ Top rated men clothing",
    "🎒 Black accessories for travel",
    "🎧 Wireless headphones for gym"
]

export default function AISearchModal({ open, onClose }) {
    const [searchQuery, setSearchQuery] = useState('')
    const [isAiMode, setIsAiMode] = useState(true)
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState([])
    const [aiMetadata, setAiMetadata] = useState(null)
    const navigate = useNavigate()

    // Fetch smart search results with debouncing
    useEffect(() => {
        if (!searchQuery.trim() || searchQuery.trim().length < 2) {
            setResults([])
            setAiMetadata(null)
            setLoading(false)
            return
        }

        const timer = setTimeout(async () => {
            setLoading(true)
            try {
                const endpoint = isAiMode
                    ? `${import.meta.env.VITE_API_URL}/api/products/smart-search?q=${encodeURIComponent(searchQuery)}`
                    : `${import.meta.env.VITE_API_URL}/api/products?search=${encodeURIComponent(searchQuery)}&limit=6`

                const res = await fetch(endpoint)
                const data = await res.json()

                if (data.success) {
                    setResults(data.data || [])
                    if (isAiMode && data.aiMetadata) {
                        setAiMetadata(data.aiMetadata)
                    } else {
                        setAiMetadata(null)
                    }
                } else {
                    setResults([])
                    setAiMetadata(null)
                }
            } catch (err) {
                console.error("Search error:", err)
                setResults([])
                setAiMetadata(null)
            } finally {
                setLoading(false)
            }
        }, 350)

        return () => clearTimeout(timer)
    }, [searchQuery, isAiMode])

    const handlePromptClick = (promptText) => {
        // Strip emoji if present for clean search
        const cleanPrompt = promptText.replace(/^[^\w\s\u0900-\u097F]+/, '').trim()
        setSearchQuery(cleanPrompt)
    }

    const handleFormSubmit = (e) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            if (isAiMode) {
                navigate(`/store?smartSearch=${encodeURIComponent(searchQuery)}`)
            } else {
                navigate(`/store?search=${encodeURIComponent(searchQuery)}`)
            }
            onClose()
            setSearchQuery('')
        }
    }

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
                                <p className="text-[11px] sm:text-xs text-text-secondary truncate hidden sm:block">Natural language search, auto filter detection & smart matching</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                            {/* Mode Toggle Button */}
                            <button
                                type="button"
                                onClick={() => setIsAiMode(!isAiMode)}
                                className={`text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1 ${
                                    isAiMode
                                        ? 'bg-accent-light border-accent/40 text-accent shadow-xs'
                                        : 'bg-surface-muted border-border-light text-text-secondary hover:text-text-primary'
                                }`}
                            >
                                <SparklesIcon className="h-3.5 w-3.5" />
                                <span>{isAiMode ? 'AI Mode' : 'Standard'}</span>
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
                    <form onSubmit={handleFormSubmit} className="mt-3 sm:mt-4 relative shrink-0">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={isAiMode ? "Ask AI e.g. 'Red sports shoes under ₹2,000'..." : "Search products..."}
                                className="w-full rounded-xl border border-border-light bg-background pl-9 sm:pl-12 pr-20 sm:pr-28 py-2.5 sm:py-3.5 text-xs sm:text-base text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-xs"
                                autoFocus
                            />
                            <div className="absolute left-3 text-accent">
                                {isAiMode ? (
                                    <SparklesIcon className="h-4 sm:h-6 w-4 sm:w-6 animate-pulse" />
                                ) : (
                                    <MagnifyingGlassIcon className="h-4 sm:h-6 w-4 sm:w-6 text-text-secondary" />
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={!searchQuery.trim()}
                                className="absolute right-1.5 sm:right-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-accent hover:bg-accent-hover disabled:opacity-40 text-white font-semibold text-xs sm:text-sm rounded-lg transition-all flex items-center gap-1 shadow-soft"
                            >
                                Search
                                <ArrowRightIcon className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                            </button>
                        </div>
                    </form>

                    {/* Scrollable Container for Prompts, Intent & Results */}
                    <div className="overflow-y-auto flex-1 mt-3 sm:mt-4 pr-0.5 space-y-3 sm:space-y-4">
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
                                            className="text-[11px] sm:text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-surface-muted border border-border-light hover:border-accent hover:bg-accent-light hover:text-accent text-text-primary transition-all font-medium flex items-center gap-1 shadow-xs"
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
                                <p className="text-text-secondary font-medium italic text-[11px] sm:text-xs">{aiMetadata.explanation}</p>

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
                                            Price: {aiMetadata.minPrice ? `₹${aiMetadata.minPrice}` : '₹0'} - {aiMetadata.maxPrice ? `₹${aiMetadata.maxPrice}` : 'Any'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Results Container */}
                        {(loading || results.length > 0 || (searchQuery.trim().length >= 2 && !loading)) && (
                            <div className="border-t border-border-light pt-3 space-y-2">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-6">
                                        <div className="animate-spin rounded-full h-7 w-7 border-2 border-accent border-t-transparent"></div>
                                        <span className="mt-2 text-xs text-text-secondary font-medium">AI is analyzing catalog...</span>
                                    </div>
                                ) : results.length > 0 ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between px-1 mb-1">
                                            <span className="text-[11px] sm:text-xs font-semibold text-text-secondary uppercase tracking-wider">
                                                Found {results.length} matching products
                                            </span>
                                        </div>
                                        {results.map((product) => {
                                            const productImg = product.image || product.images?.[0]?.src || 'https://via.placeholder.com/60x60?text=No+Image';
                                            const fullImgUrl = productImg.startsWith('http') ? productImg : `${import.meta.env.VITE_API_URL}${productImg}`;
                                            return (
                                                <div
                                                    key={product._id}
                                                    onClick={() => {
                                                        navigate(`/product/${product._id}`)
                                                        onClose()
                                                    }}
                                                    className="group flex items-center justify-between p-2.5 sm:p-3 rounded-xl border border-border-light hover:border-accent hover:bg-accent-light/30 transition-all cursor-pointer"
                                                >
                                                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                                                        <img
                                                            src={fullImgUrl}
                                                            alt={product.name}
                                                            className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-lg bg-background border border-border-light group-hover:scale-105 transition-transform shrink-0"
                                                            onError={(e) => {
                                                                e.target.src = 'https://via.placeholder.com/60x60?text=No+Image'
                                                            }}
                                                        />
                                                        <div className="min-w-0">
                                                            <h4 className="font-heading text-xs sm:text-sm font-semibold text-text-primary truncate group-hover:text-accent transition-colors">
                                                                {product.name}
                                                            </h4>
                                                            <div className="flex items-center gap-1.5 text-[11px] text-text-secondary mt-0.5">
                                                                <span className="bg-surface-muted px-1.5 py-0.5 rounded capitalize text-[10px]">{product.category}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="text-right shrink-0 ml-2">
                                                        <div className="text-xs sm:text-sm font-bold text-accent">
                                                            ₹{(product.discountedPrice || product.price)?.toLocaleString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
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
    )
}
