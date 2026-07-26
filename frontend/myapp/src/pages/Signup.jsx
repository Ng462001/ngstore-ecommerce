import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { NavLink, useNavigate } from 'react-router-dom'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

const Signup = () => {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const navigate = useNavigate()

    const handleSubmit = async (event) => {
        event.preventDefault()
        if (password.length < 6) {
            toast.error('Password must be at least 6 characters')
            return
        }
        if (phone.length < 10) {
            toast.error('Phone number must be at least 10 digits')
            return
        }
        setLoading(true)
        try {
            // Remove formatting from phone number before sending
            const phoneDigits = phone.replace(/\D/g, '')

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, phone: phoneDigits, password }),
            })

            const data = await response.json()

            if (response.ok) {
                toast.success(data.message || 'Registration successful. Please check your email to verify your account.')
                setLoading(false)
                navigate('/login')
            } else {
                toast.error(data.message || 'Signup failed')
                setLoading(false)
            }
        } catch (error) {
            console.error('Signup error:', error)
            toast.error('An error occurred during signup')
        } finally {
            setLoading(false)
        }
    }

    // Format phone number as user types
    const handlePhoneChange = (e) => {
        let value = e.target.value.replace(/\D/g, '')
        if (value.length > 10) value = value.substring(0, 10)
        setPhone(value)
    }

    return (
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                    Sign Up
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                            Name
                        </label>
                        <div className="mt-2">
                            <input
                                id="name"
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="block w-full rounded-md border-0 px-3 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                placeholder="Enter your full name"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                            Email address
                        </label>
                        <div className="mt-2">
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full rounded-md border-0 px-3 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium leading-6 text-gray-900">
                            Phone Number
                        </label>
                        <div className="mt-2">
                            <input
                                id="phone"
                                type="tel"
                                autoComplete="tel"
                                required
                                value={phone}
                                onChange={handlePhoneChange}
                                className="block w-full rounded-md border-0 px-3 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                placeholder="Enter your phone number"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                                Password
                            </label>
                        </div>
                        <div className="mt-2 relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="new-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full rounded-md border-0 pl-3 pr-10 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                placeholder="At least 6 characters"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                                ) : (
                                    <EyeIcon className="h-5 w-5" aria-hidden="true" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div>
                        <button
                            disabled={loading}
                            type="submit"
                            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            {loading ? <div role="status">
                                <svg xmlns="http://www.w3.org/2000/svg" className="size-9 shrink-0 animate-spin dark:fill-slate-50"
                                    viewBox="0 0 256 256" aria-hidden="true">
                                    <path
                                        d="M128 63.04c-5.104 0-9.28-4.176-9.28-9.28V16.64c0-5.104 4.176-9.28 9.28-9.28s9.28 4.176 9.28 9.28v37.12c0 5.104-4.176 9.28-9.28 9.28zm52.548 21.692c-2.32 0-4.756-.928-6.612-2.668-3.596-3.596-3.596-9.512 0-13.108l26.216-26.216c3.596-3.596 9.512-3.596 13.108 0s3.596 9.512 0 13.108l-26.216 26.216c-1.856 1.856-4.176 2.668-6.496 2.668zm58.812 52.548h-37.12c-5.104 0-9.28-4.176-9.28-9.28s4.176-9.28 9.28-9.28h37.12c5.104 0 9.28 4.176 9.28 9.28s-4.176 9.28-9.28 9.28zm-32.596 78.764c-2.32 0-4.756-.928-6.612-2.668l-26.216-26.216c-3.596-3.596-3.596-9.512 0-13.108s9.512-3.596 13.108 0l26.216 26.216c3.596 3.596 3.596 9.512 0 13.108-1.74 1.74-4.176 2.668-6.496 2.668zM128 248.64c-5.104 0-9.28-4.176-9.28-9.28v-37.12c0-5.104 4.176-9.28 9.28-9.28s9.28 4.176 9.28 9.28v37.12c0 5.104-4.176 9.28-9.28 9.28zm-78.764-32.596c-2.32 0-4.756-.928-6.612-2.668-3.596-3.596-3.596-9.512 0-13.108l26.216-26.216c3.596-3.596 9.512-3.596 13.108 0s3.596 9.512 0 13.108l-26.216 26.216c-1.74 1.74-4.06 2.668-6.496 2.668zm4.524-78.764H16.64c-5.104 0-9.28-4.176-9.28-9.28s4.176-9.28 9.28-9.28h37.12c5.104 0 9.28 4.176 9.28 9.28s-4.176 9.28-9.28 9.28zm21.692-52.548c-2.32 0-4.756-.928-6.612-2.668l-26.1-26.216c-3.596-3.596-3.596-9.512 0-13.108s9.512-3.596 13.108 0l26.216 26.216c3.596 3.596 3.596 9.512 0 13.108-1.856 1.856-4.176 2.668-6.612 2.668z"
                                        data-original="#000000" />
                                </svg>
                                <span className="sr-only">Loading…</span>
                            </div> : 'Sign Up'}
                        </button>
                    </div>
                </form>

                <p className="mt-10 text-center text-sm text-gray-500">
                    Already a member?{' '}
                    <NavLink to="/login" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
                        Sign in
                    </NavLink>
                </p>
            </div>
        </div>
    )
}

export default Signup