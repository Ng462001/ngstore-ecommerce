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
        <div className="flex min-h-screen flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-8 bg-background">
            <div className="sm:mx-auto sm:w-full sm:max-w-md bg-surface p-8 sm:p-10 rounded-2xl border border-border-light shadow-card">
                <div className="text-center mb-8">
                    <h2 className="font-heading text-3xl font-semibold tracking-tight text-text-primary">
                        Reset password
                    </h2>
                    <p className="mt-2 text-sm text-text-secondary">
                        {isSubmitted
                            ? "Check your email for reset instructions"
                            : "Enter your email address and we'll send you a link to reset your password"}
                    </p>
                </div>

                {!isSubmitted ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-text-primary mb-2">
                                Email address
                            </label>
                            <div>
                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full rounded-xl border border-border-light bg-background px-3.5 py-3 text-text-primary shadow-xs placeholder:text-text-secondary/50 focus:border-accent focus:ring-1 focus:ring-accent sm:text-sm"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`flex w-full justify-center rounded-xl bg-accent px-4 py-3 text-base font-semibold leading-6 text-white shadow-soft hover:bg-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent transition-all duration-200 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
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
                        <div className="rounded-xl bg-success/10 p-4 border border-success/30">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-success" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-semibold text-success">
                                        Reset link sent successfully!
                                    </p>
                                    <p className="mt-1 text-xs text-text-secondary">
                                        Check your email at <span className="font-semibold text-text-primary">{email}</span> for instructions to reset your password.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col space-y-4">
                            <button
                                onClick={handleResend}
                                className="flex w-full justify-center rounded-xl bg-accent px-4 py-3 text-base font-semibold leading-6 text-white shadow-soft hover:bg-accent-hover transition-all duration-200"
                            >
                                Resend reset link
                            </button>
                        </div>
                    </div>
                )}

                <div className="mt-8 pt-6 border-t border-border-light">
                    <div className="space-y-3">
                        <p className="text-center text-sm text-text-secondary">
                            Remember your password?{' '}
                            <NavLink to="/login" className="font-semibold text-accent hover:underline">
                                Sign in
                            </NavLink>
                        </p>

                        <p className="text-center text-sm text-text-secondary">
                            Don't have an account?{' '}
                            <NavLink to="/signup" className="font-semibold text-accent hover:underline">
                                Sign up
                            </NavLink>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}