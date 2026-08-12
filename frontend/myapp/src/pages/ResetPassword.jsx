import { useState } from "react"
import toast from "react-hot-toast"
import { useParams, useNavigate } from "react-router-dom"
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

export default function ResetPassword() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const { token } = useParams()
    const navigate = useNavigate()

    const handleSubmit = async (event) => {
        event.preventDefault()

        if (password !== confirmPassword) {
            toast.error('New password and confirm password should be the same')
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/reset-password/${token}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password }),
            })

            const data = await response.json()

            if (response.ok) {
                toast.success(data.message)
                navigate('/login')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.error('Reset password error:', error)
            toast.error('An error occurred. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-8 bg-background">
            <div className="sm:mx-auto sm:w-full sm:max-w-md bg-surface p-8 sm:p-10 rounded-2xl border border-border-light shadow-card">
                <div className="text-center mb-8">
                    <h2 className="font-heading text-3xl font-semibold tracking-tight text-text-primary">
                        Create new password
                    </h2>
                    <p className="mt-2 text-sm text-text-secondary">
                        Your new password must be different from previous used passwords.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-text-primary mb-2">
                            New Password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                required
                                minLength="6"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full rounded-xl border border-border-light bg-background pl-3.5 pr-10 py-3 text-text-primary shadow-xs placeholder:text-text-secondary/50 focus:border-accent focus:ring-1 focus:ring-accent sm:text-sm"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-secondary hover:text-text-primary"
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
                        <label htmlFor="confirmPassword" className="block text-xs font-semibold uppercase tracking-wider text-text-primary mb-2">
                            Confirm New Password
                        </label>
                        <div className="relative">
                            <input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                minLength="6"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="block w-full rounded-xl border border-border-light bg-background pl-3.5 pr-10 py-3 text-text-primary shadow-xs placeholder:text-text-secondary/50 focus:border-accent focus:ring-1 focus:ring-accent sm:text-sm"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-secondary hover:text-text-primary"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? (
                                    <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                                ) : (
                                    <EyeIcon className="h-5 w-5" aria-hidden="true" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`flex w-full justify-center rounded-xl bg-accent px-4 py-3 text-base font-semibold leading-6 text-white shadow-soft hover:bg-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent transition-all duration-200 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
