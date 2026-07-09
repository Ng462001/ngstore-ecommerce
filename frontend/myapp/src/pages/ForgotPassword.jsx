import { useState } from "react"
import toast from "react-hot-toast"
import { NavLink } from "react-router-dom"

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (event) => {
        event.preventDefault()
        setIsLoading(true)

        try {
            // API call to send reset password email
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            })

            const data = await response.json()

            if (response.ok) {
                setIsSubmitted(true)
                setIsLoading(false)
                toast.success(data.message)
            } else {
                toast.error(data.message)
                setIsLoading(false)
            }
        } catch (error) {
            console.error('Forgot password error:', error)
            toast.error('An error occurred. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleResend = () => {
        setEmail('')
        setIsSubmitted(false)
    }

    return (
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                    Reset your password
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    {isSubmitted
                        ? "Check your email for reset instructions"
                        : "Enter your email address and we'll send you a link to reset your password"}
                </p>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                {!isSubmitted ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
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
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Sending...
                                    </>
                                ) : (
                                    'Send reset link'
                                )}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-6">
                        <div className="rounded-md bg-green-50 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-green-800">
                                        Reset link sent successfully!
                                    </p>
                                    <p className="mt-2 text-sm text-green-700">
                                        Check your email at <span className="font-semibold">{email}</span> for instructions to reset your password.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col space-y-4">
                            <button
                                onClick={handleResend}
                                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                Resend reset link
                            </button>
                        </div>
                    </div>
                )}

                <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="space-y-3">
                        <p className="text-center text-sm text-gray-500">
                            Remember your password?{' '}
                            <NavLink to="/login" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
                                Sign in
                            </NavLink>
                        </p>

                        <p className="text-center text-sm text-gray-500">
                            Don't have an account?{' '}
                            <NavLink to="/signup" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
                                Sign up
                            </NavLink>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}