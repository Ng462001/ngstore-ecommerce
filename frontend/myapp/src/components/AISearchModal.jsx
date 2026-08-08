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
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300 ease-out data-closed:opacity-0"
            />

            <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-20">
                <DialogPanel
                    transition
                    className="w-full max-w-3xl transform rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5 transition duration-300 ease-out data-closed:scale-95 data-closed:opacity-0"
                >
                    {/* Header & Mode Switcher */}
                    <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                        <div className="flex items-center space-x-2">
                            <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white shadow-md shadow-indigo-200">
                                <SparklesIcon className="h-5 w-5 animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-1.5">
                                    Smart Search
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-semibold border border-indigo-200">
                                        ✨ AI Powered
                                    </span>
                                </h3>
                                <p className="text-xs text-gray-500">Natural language search, auto filter detection & smart matching</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Mode Toggle Button */}
                            <button
                                type="button"
                                onClick={() => setIsAiMode(!isAiMode)}
                                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1 ${
                                    isAiMode
                                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-xs'
                                        : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                <SparklesIcon className="h-3.5 w-3.5" />
                                {isAiMode ? 'AI Mode ON' : 'Standard Search'}
                            </button>

                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                    </div>

                    {/* Search Input */}
                    <form onSubmit={handleFormSubmit} className="mt-4 relative">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={isAiMode ? "Ask AI e.g. 'Red sports shoes under ₹2,000' or 'cotton dress for summer'..." : "Search products..."}
                                className="w-full rounded-xl border-2 border-indigo-100 pl-12 pr-28 py-3.5 text-base text-gray-900 placeholder-gray-400 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all shadow-inner"
                                autoFocus
                            />
                            <div className="absolute left-3.5 text-indigo-500">
                                {isAiMode ? (
                                    <SparklesIcon className="h-6 w-6 animate-pulse" />
                                ) : (
                                    <MagnifyingGlassIcon className="h-6 w-6 text-gray-400" />
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={!searchQuery.trim()}
                                className="absolute right-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium text-sm rounded-lg transition-colors flex items-center gap-1 shadow-md shadow-indigo-200"
                            >
                                Search
                                <ArrowRightIcon className="h-4 w-4" />
                            </button>
                        </div>
                    </form>

                    {/* Quick AI Sample Prompts */}
                    {!searchQuery && (
                        <div className="mt-5">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1">
                                <SparklesIcon className="h-3.5 w-3.5 text-indigo-500" />
                                Try asking AI
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {samplePrompts.map((prompt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handlePromptClick(prompt)}
                                        className="text-xs px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 text-gray-700 transition-all font-medium flex items-center gap-1 shadow-xs"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* AI Intent Breakdown Card */}
                    {aiMetadata && (
                        <div className="mt-4 p-3.5 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 border border-indigo-100 rounded-xl text-xs space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-indigo-900 flex items-center gap-1">
                                    <SparklesIcon className="h-4 w-4 text-indigo-600" />
                                    AI Search Explanation:
                                </span>
                                {aiMetadata.isAiPowered && (
                                    <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full border border-purple-200">
                                        Gemini 1.5 Flash
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-700 font-medium italic">{aiMetadata.explanation}</p>

                            <div className="flex flex-wrap gap-1.5 pt-1">
                                {aiMetadata.category && (
                                    <span className="px-2 py-0.5 rounded-md bg-white border border-indigo-200 text-indigo-700 font-semibold">
                                        Category: {aiMetadata.category}
                                    </span>
                                )}
                                {aiMetadata.color && (
                                    <span className="px-2 py-0.5 rounded-md bg-white border border-indigo-200 text-indigo-700 font-semibold capitalize">
                                        Color: {aiMetadata.color}
                                    </span>
                                )}
                                {(aiMetadata.maxPrice || aiMetadata.minPrice) && (
                                    <span className="px-2 py-0.5 rounded-md bg-white border border-emerald-200 text-emerald-700 font-semibold">
                                        Price: {aiMetadata.minPrice ? `₹${aiMetadata.minPrice}` : '₹0'} - {aiMetadata.maxPrice ? `₹${aiMetadata.maxPrice}` : 'Any'}
                                    </span>
                                )}
                                {aiMetadata.sort && (
                                    <span className="px-2 py-0.5 rounded-md bg-white border border-amber-200 text-amber-700 font-semibold">
                                        Sort: {aiMetadata.sort} ({aiMetadata.order})
                                    </span>
                                )}
                            </div>

                            {/* Suggested Queries */}
                            {aiMetadata.suggestedQueries && aiMetadata.suggestedQueries.length > 0 && (
                                <div className="pt-2 border-t border-indigo-100/60 flex items-center gap-2">
                                    <span className="text-gray-500 font-medium shrink-0">Related:</span>
                                    <div className="flex flex-wrap gap-1">
                                        {aiMetadata.suggestedQueries.map((sq, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setSearchQuery(sq)}
                                                className="text-[11px] text-indigo-600 hover:text-indigo-800 underline decoration-indigo-300 font-medium"
                                            >
                                                "{sq}"
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Results Container */}
                    {(loading || results.length > 0 || (searchQuery.trim().length >= 2 && !loading)) && (
                        <div className="mt-4 border-t border-gray-100 pt-4 max-h-[340px] overflow-y-auto pr-1">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-8">
                                    <div className="relative">
                                        <div className="animate-spin rounded-full h-8 w-8 border-3 border-indigo-600 border-t-transparent"></div>
                                        <SparklesIcon className="h-4 w-4 text-purple-600 absolute inset-0 m-auto animate-pulse" />
                                    </div>
                                    <span className="mt-3 text-sm text-gray-500 font-medium">AI is analyzing catalog...</span>
                                </div>
                            ) : results.length > 0 ? (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between px-1 mb-1">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
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
                                                className="group flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-indigo-300 hover:bg-indigo-50/40 transition-all cursor-pointer"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <img
                                                        src={fullImgUrl}
                                                        alt={product.name}
                                                        className="w-12 h-12 object-contain rounded-lg bg-gray-50 border border-gray-200 group-hover:scale-105 transition-transform"
                                                        onError={(e) => {
                                                            e.target.src = 'https://via.placeholder.com/60x60?text=No+Image'
                                                        }}
                                                    />
                                                    <div className="min-w-0">
                                                        <h4 className="text-sm font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                                                            {product.name}
                                                        </h4>
                                                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                                            <span className="bg-gray-100 px-2 py-0.5 rounded capitalize">{product.category}</span>
                                                            {product.colors && product.colors.length > 0 && (
                                                                <span className="text-gray-400">• {product.colors[0].name}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="text-right shrink-0 ml-3">
                                                    <div className="text-sm font-bold text-gray-900">
                                                        ₹{(product.discountedPrice || product.price)?.toLocaleString()}
                                                    </div>
                                                    {product.discount > 0 && (
                                                        <div className="text-xs text-emerald-600 font-semibold">
                                                            {product.discount}% OFF
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}

                                    <div className="pt-2 border-t border-gray-100">
                                        <button
                                            onClick={handleFormSubmit}
                                            className="w-full text-center py-2.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                                        >
                                            View all AI results in store page
                                            <ArrowRightIcon className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500 text-sm">
                                    No products matching your AI search query. Try simplifying your search!
                                </div>
                            )}
                        </div>
                    )}
                </DialogPanel>
            </div>
        </Dialog>
    )
}
