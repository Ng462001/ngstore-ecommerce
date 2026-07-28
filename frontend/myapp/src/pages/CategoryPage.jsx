'use client'

import { useState, useEffect, useCallback } from 'react'
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
} from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { ChevronDownIcon, FunnelIcon, MinusIcon, PlusIcon } from '@heroicons/react/20/solid'
import ProductCard from '../components/ProductCard'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Pagination } from '@mui/material'

const sortOptions = [
    { name: 'Most Popular', href: '#', current: true, value: 'createdAt' },
    { name: 'Best Rating', href: '#', current: false, value: '-rating.average' },
    { name: 'Newest', href: '#', current: false, value: '-createdAt' },
    { name: 'Price: Low to High', href: '#', current: false, value: 'price' },
    { name: 'Price: High to Low', href: '#', current: false, value: '-price' },
]

const allFilters = [
    {
        id: 'color',
        name: 'Color',
        options: [
            { value: 'white', label: 'White' },
            { value: 'black', label: 'Black' },
            { value: 'gray', label: 'Gray' },
            { value: 'blue', label: 'Blue' },
            { value: 'green', label: 'Green' },
            { value: 'red', label: 'Red' },
        ],
    },
    {
        id: 'size',
        name: 'Size',
        options: [
            { value: 'XS', label: 'XS' },
            { value: 'S', label: 'S' },
            { value: 'M', label: 'M' },
            { value: 'L', label: 'L' },
            { value: 'XL', label: 'XL' },
            { value: '2XL', label: '2XL' },
        ],
    },
    {
        id: 'discount',
        name: 'Discount',
        options: [
            { value: '20', label: '20% and Above' },
            { value: '30', label: '30% and Above' },
            { value: '40', label: '40% and Above' },
            { value: '50', label: '50% and Above' },
        ],
    },
]

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

// Function to get a random demo image
const demoImages = [
    'https://tailwindui.com/plus/img/ecommerce-images/product-page-01-related-product-01.jpg',
    'https://tailwindui.com/plus/img/ecommerce-images/category-page-04-image-card-01.jpg',
    'https://tailwindui.com/plus/img/ecommerce-images/category-page-04-image-card-02.jpg',
    'https://tailwindui.com/plus/img/ecommerce-images/category-page-04-image-card-03.jpg',
    'https://tailwindui.com/plus/img/ecommerce-images/category-page-04-image-card-04.jpg',
];

const getRandomDemoImage = () => {
    return demoImages[Math.floor(Math.random() * demoImages.length)]
}

// Function to process product data and ensure images exist
const processProductData = (products) => {
    return products.map(product => ({
        ...product,
        // Ensure image exists, otherwise use demo image
        image: product.image || product.images?.[0]?.src || getRandomDemoImage(),
        // Ensure price and discountedPrice are numbers
        price: parseFloat(product.price) || 0,
        discountedPrice: product.discountedPrice ? parseFloat(product.discountedPrice) : null,
        // Ensure name exists
        name: product.name || 'Unnamed Product',
        // Ensure description exists
        description: product.description || 'No description available',
        // Ensure category exists
        category: product.category || 'uncategorized',
    }))
}

export default function CategoryPage() {
    const { id } = useParams() // Get category from URL
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
    const [activeFilters, setActiveFilters] = useState({})
    const [sortOption, setSortOption] = useState(sortOptions[0])
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [pagination, setPagination] = useState({})
    const location = useLocation()
    const navigate = useNavigate()

    const categoryName = id ? id.replace(/-/g, ' ') : 'Category';

    // Categories that should show size filter
    const clothingCategories = ['men', 'women', 'cloths'];

    // Filter available filters based on category
    const filters = allFilters.filter(section => {
        if (section.id === 'size') {
            // Only show size for clothing categories
            return clothingCategories.some(cat => id?.toLowerCase().includes(cat));
        }
        return true;
    });

    // Fetch products from API
    const fetchProducts = useCallback(async (queryParams = '') => {
        try {
            setLoading(true)
            setError(null)

            // Ensure category is included in query
            let url = `${import.meta.env.VITE_API_URL}/api/products${queryParams}`
            if (!url.includes('category=')) {
                const separator = url.includes('?') ? '&' : '?'
                url = `${url}${separator}category=${id}`
            }

            const response = await fetch(url)

            if (!response.ok) {
                throw new Error(`Failed to fetch products: ${response.status}`)
            }

            const result = await response.json()

            if (result.success) {
                const processedProducts = processProductData(result.data || [])
                setProducts(processedProducts)
                setPagination(result.pagination || {})
            } else {
                throw new Error(result.message || 'Failed to fetch products')
            }
        } catch (err) {
            console.error('Error fetching products:', err)
            setError(err.message)
            setProducts([])
        } finally {
            setLoading(false)
        }
    }, [id])

    // Apply filters from URL on component mount and when URL changes
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search)
        const newFilters = {}

        filters.forEach(section => {
            const values = searchParams.get(section.id)?.split(',') || []
            if (values.length > 0) {
                newFilters[section.id] = values
            }
        })

        // Get sort from URL or use default
        const sortFromUrl = searchParams.get('sort')
        const orderFromUrl = searchParams.get('order')
        const selectedSort = sortOptions.find(option =>
            option.value === (orderFromUrl === 'desc' ? `-${sortFromUrl}` : sortFromUrl)
        ) || sortOptions[0]

        setSortOption(selectedSort)
        setActiveFilters(newFilters)

        // Build API query string
        const apiQueryParams = new URLSearchParams()

        // Add pagination
        const page = searchParams.get('page') || '1'
        const limit = searchParams.get('limit') || '12'
        apiQueryParams.set('page', page)
        apiQueryParams.set('limit', limit)

        // Force category filter
        if (id) {
            apiQueryParams.set('category', id)
        }

        // Add filters
        Object.entries(newFilters).forEach(([key, values]) => {
            if (values.length > 0) {
                apiQueryParams.set(key, values.join(','))
            }
        })

        // Add sorting
        if (selectedSort.value.startsWith('-')) {
            apiQueryParams.set('sort', selectedSort.value.slice(1))
            apiQueryParams.set('order', 'desc')
        } else {
            apiQueryParams.set('sort', selectedSort.value)
            apiQueryParams.set('order', 'asc')
        }

        // Add inStock filter by default for better UX
        apiQueryParams.set('inStock', 'true')

        const queryString = apiQueryParams.toString()
        fetchProducts(queryString ? `?${queryString}` : '')

    }, [location.search, fetchProducts, id])

    const handleFilter = useCallback((value, sectionId) => {
        const newFilters = { ...activeFilters }

        if (newFilters[sectionId]?.includes(value)) {
            newFilters[sectionId] = newFilters[sectionId].filter(item => item !== value)
            if (newFilters[sectionId].length === 0) {
                delete newFilters[sectionId]
            }
        } else {
            newFilters[sectionId] = [...(newFilters[sectionId] || []), value]
        }

        const searchParams = new URLSearchParams()

        // Add filters
        Object.entries(newFilters).forEach(([key, values]) => {
            if (values.length > 0) {
                searchParams.set(key, values.join(','))
            }
        })

        // Add sorting
        if (sortOption.value.startsWith('-')) {
            searchParams.set('sort', sortOption.value.slice(1))
            searchParams.set('order', 'desc')
        } else {
            searchParams.set('sort', sortOption.value)
            searchParams.set('order', 'asc')
        }

        // Reset to page 1 when filters change
        searchParams.set('page', '1')

        const query = searchParams.toString()
        navigate(`${location.pathname}${query ? `?${query}` : ''}`)
    }, [activeFilters, sortOption, location.pathname, navigate])

    const handleSort = useCallback((option) => {
        const searchParams = new URLSearchParams(location.search)

        if (option.value.startsWith('-')) {
            searchParams.set('sort', option.value.slice(1))
            searchParams.set('order', 'desc')
        } else {
            searchParams.set('sort', option.value)
            searchParams.set('order', 'asc')
        }

        // Reset to page 1 when sort changes
        searchParams.set('page', '1')

        const query = searchParams.toString()
        navigate(`${location.pathname}${query ? `?${query}` : ''}`)
    }, [location.search, location.pathname, navigate])

    const handlePageChange = useCallback((page) => {
        const searchParams = new URLSearchParams(location.search)
        searchParams.set('page', page.toString())

        const query = searchParams.toString()
        navigate(`${location.pathname}${query ? `?${query}` : ''}`)
    }, [location.search, location.pathname, navigate])

    const clearAllFilters = useCallback(() => {
        const searchParams = new URLSearchParams()
        searchParams.set('page', '1')

        // Keep only pagination and basic params
        const query = searchParams.toString()
        navigate(`${location.pathname}${query ? `?${query}` : ''}`)
    }, [location.pathname, navigate])

    const getFilterLabel = (filterType, value) => {
        const filterSection = filters.find(f => f.id === filterType)
        const option = filterSection?.options.find(opt => opt.value === value)
        return option?.label || value
    }

    const renderFilterOptions = (section, isMobile = false) => {
        const prefix = isMobile ? 'mobile-' : ''
        
        if (section.id === 'color') {
            const colorMap = {
                white: { bg: '#ffffff', border: 'border-gray-200' },
                black: { bg: '#111827', border: 'border-transparent' },
                gray: { bg: '#6B7280', border: 'border-transparent' },
                blue: { bg: '#3B82F6', border: 'border-transparent' },
                green: { bg: '#10B981', border: 'border-transparent' },
                red: { bg: '#EF4444', border: 'border-transparent' }
            }

            return (
                <div className="flex flex-wrap gap-3">
                    {section.options.map((option) => {
                        const isSelected = activeFilters[section.id]?.includes(option.value) || false
                        const colorInfo = colorMap[option.value.toLowerCase()] || { bg: option.value, border: 'border-gray-300' }
                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => handleFilter(option.value, section.id)}
                                title={option.label}
                                className={classNames(
                                    "size-8 rounded-full cursor-pointer relative focus:outline-hidden transition-all duration-200 hover:scale-110",
                                    colorInfo.border,
                                    isSelected ? "ring-2 ring-indigo-600 ring-offset-2 scale-105" : "border"
                                )}
                                style={{ backgroundColor: colorInfo.bg }}
                                aria-label={`Filter by color ${option.label}`}
                            >
                                {isSelected && (
                                    <span className={classNames(
                                        "absolute inset-0 flex items-center justify-center text-xs font-bold pointer-events-none",
                                        option.value.toLowerCase() === 'white' ? 'text-gray-900' : 'text-white'
                                    )}>
                                        ✓
                                    </span>
                                )}
                            </button>
                        )
                    })}
                </div>
            )
        }

        if (section.id === 'size') {
            return (
                <div className="flex flex-wrap gap-2">
                    {section.options.map((option) => {
                        const isSelected = activeFilters[section.id]?.includes(option.value) || false
                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => handleFilter(option.value, section.id)}
                                className={classNames(
                                    "min-w-10 h-10 px-2 rounded-md text-xs font-semibold flex items-center justify-center border transition-all duration-200 hover:border-indigo-600 hover:text-indigo-600",
                                    isSelected
                                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                                        : "bg-white text-gray-700 border-gray-200"
                                )}
                            >
                                {option.label}
                            </button>
                        )
                    })}
                </div>
            )
        }

        return (
            <div className={isMobile ? "space-y-6" : "space-y-4"}>
                {section.options.map((option, optionIdx) => (
                    <div key={option.value} className="flex gap-3">
                        <div className="flex h-5 shrink-0 items-center">
                            <div className="group grid size-4 grid-cols-1">
                                <input
                                    checked={activeFilters[section.id]?.includes(option.value) || false}
                                    onChange={() => handleFilter(option.value, section.id)}
                                    id={`filter-${prefix}${section.id}-${optionIdx}`}
                                    name={`${section.id}[]`}
                                    type="checkbox"
                                    className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto cursor-pointer"
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
                                "cursor-pointer select-none transition-colors duration-200 hover:text-indigo-600",
                                isMobile ? "min-w-0 flex-1 text-gray-500" : "text-sm text-gray-600"
                            )}
                        >
                            {option.label}
                        </label>
                    </div>
                ))}
            </div>
        )
    }

    // Loading state
    if (loading && products.length === 0) {
        return (
            <div className="bg-white min-h-screen pt-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white">
            <div>
                {/* Mobile Filter Dialog */}
                <Dialog open={mobileFiltersOpen} onClose={setMobileFiltersOpen} className="relative z-40 lg:hidden">
                    <DialogBackdrop
                        transition
                        className="fixed inset-0 bg-black/25 transition-opacity duration-300 ease-linear data-closed:opacity-0"
                    />

                    <div className="fixed inset-0 z-40 flex">
                        <DialogPanel
                            transition
                            className="relative ml-auto flex size-full max-w-xs transform flex-col overflow-y-auto bg-white py-4 pb-12 shadow-xl transition duration-300 ease-in-out data-closed:translate-x-full"
                        >
                            <div className="flex items-center justify-between px-4">
                                <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                                <button
                                    type="button"
                                    onClick={() => setMobileFiltersOpen(false)}
                                    className="-mr-2 flex size-10 items-center justify-center rounded-md bg-white p-2 text-gray-400"
                                    aria-label="Close menu"
                                >
                                    <XMarkIcon aria-hidden="true" className="size-6" />
                                </button>
                            </div>

                            <form className="mt-4 border-t border-gray-200">
                                {filters.map((section) => (
                                    <Disclosure key={section.id} as="div" className="border-t border-gray-200 px-4 py-6">
                                        <h3 className="-mx-2 -my-3 flow-root">
                                            <DisclosureButton className="group flex w-full items-center justify-between bg-white px-2 py-3 text-gray-400 hover:text-gray-500">
                                                <span className="font-medium text-gray-900">{section.name}</span>
                                                <span className="ml-6 flex items-center">
                                                    <PlusIcon aria-hidden="true" className="size-5 group-data-open:hidden" />
                                                    <MinusIcon aria-hidden="true" className="size-5 group-data-open:block hidden" />
                                                </span>
                                            </DisclosureButton>
                                        </h3>
                                        <DisclosurePanel className="pt-6">
                                            {renderFilterOptions(section, true)}
                                        </DisclosurePanel>
                                    </Disclosure>
                                ))}
                            </form>
                        </DialogPanel>
                    </div>
                </Dialog>

                <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-baseline justify-between border-b border-gray-200 pt-24 pb-6">
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight text-gray-900 capitalize">{categoryName}</h1>
                            {pagination.total !== undefined && (
                                <p className="mt-2 text-sm text-gray-500">
                                    Showing {products.length} of {pagination.total} products
                                </p>
                            )}
                        </div>

                        <div className="flex items-center">
                            <Menu as="div" className="relative inline-block text-left">
                                <div>
                                    <MenuButton className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
                                        Sort
                                        <ChevronDownIcon
                                            aria-hidden="true"
                                            className="-mr-1 ml-1 size-5 shrink-0 text-gray-400 group-hover:text-gray-500"
                                        />
                                    </MenuButton>
                                </div>

                                <MenuItems
                                    transition
                                    className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-white ring-1 shadow-2xl ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                                >
                                    <div className="py-1">
                                        {sortOptions.map((option) => (
                                            <MenuItem key={option.name}>
                                                <button
                                                    onClick={() => handleSort(option)}
                                                    className={classNames(
                                                        sortOption.name === option.name ? 'font-medium text-gray-900' : 'text-gray-500',
                                                        'block w-full px-4 py-2 text-sm text-left data-focus:bg-gray-100 data-focus:outline-hidden',
                                                    )}
                                                >
                                                    {option.name}
                                                </button>
                                            </MenuItem>
                                        ))}
                                    </div>
                                </MenuItems>
                            </Menu>
                            <button
                                type="button"
                                onClick={() => setMobileFiltersOpen(true)}
                                className="-m-2 ml-4 p-2 text-gray-400 hover:text-gray-500 sm:ml-6 lg:hidden"
                                aria-label="Open filters"
                            >
                                <FunnelIcon aria-hidden="true" className="size-5" />
                            </button>
                        </div>
                    </div>

                    {/* Active Filters */}
                    {Object.keys(activeFilters).length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                            {Object.entries(activeFilters).map(([filterType, values]) =>
                                values.map(value => (
                                    <span
                                        key={`${filterType}-${value}`}
                                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                                    >
                                        {getFilterLabel(filterType, value)}
                                        <button
                                            onClick={() => handleFilter(value, filterType)}
                                            className="ml-2 hover:bg-indigo-200 rounded-full size-4 flex items-center justify-center"
                                            aria-label={`Remove ${getFilterLabel(filterType, value)} filter`}
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))
                            )}
                            <button
                                onClick={clearAllFilters}
                                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                            >
                                Clear all
                            </button>
                        </div>
                    )}

                    <section aria-labelledby="products-heading" className="pt-6 pb-24">
                        <h2 id="products-heading" className="sr-only">
                            Products
                        </h2>

                        <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
                            {/* Desktop Filters */}
                            <form className="hidden lg:block">
                                {filters.map((section) => (
                                    <Disclosure key={section.id} as="div" className="border-b border-gray-200 py-6">
                                        <h3 className="-my-3 flow-root">
                                            <DisclosureButton className="group flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500">
                                                <span className="font-medium text-gray-900">{section.name}</span>
                                                <span className="ml-6 flex items-center">
                                                    <PlusIcon aria-hidden="true" className="size-5 group-data-open:hidden" />
                                                    <MinusIcon aria-hidden="true" className="size-5 group-data-open:block hidden" />
                                                </span>
                                            </DisclosureButton>
                                        </h3>
                                        <DisclosurePanel className="pt-6">
                                            {renderFilterOptions(section, false)}
                                        </DisclosurePanel>
                                    </Disclosure>
                                ))}
                            </form>

                            {/* Product Grid */}
                            <div className="lg:col-span-3 w-full">
                                {loading ? (
                                    <div className="flex justify-center items-center h-64">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                                    </div>
                                ) : error ? (
                                    <div className="text-center py-12">
                                        <p className="text-red-600 mb-4">Error: {error}</p>
                                        <button
                                            onClick={() => fetchProducts(location.search.slice(1))}
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                                        >
                                            Retry
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 bg-white py-5'>
                                            {products.length > 0 ? (
                                                products.map((item) => (
                                                    <ProductCard key={item._id || item.id} item={item} />
                                                ))
                                            ) : (
                                                <div className="text-center py-12 w-full col-span-3">
                                                    <p className="text-gray-500 text-lg">No products found matching.</p>
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
                                                    size="large"
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
    )
}
