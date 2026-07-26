import { useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { loginUser } from "../Redux/action/action"
import { toast } from 'react-hot-toast';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleSubmit = async (event) => {
    setLoading(true);
    event.preventDefault()
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        dispatch(loginUser(data))
        if (data.role === 'admin') {
          setLoading(false);
          toast.success("Login successful!");
          navigate('/admin')
        } else {
          setLoading(false);
          toast.success("Login successful!");
          navigate('/')
        }
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Sign In
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
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
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                Password
              </label>
              <div className="text-sm">
                <NavLink to="/forgot-password" className="font-semibold text-indigo-600 hover:text-indigo-500">
                  Forgot password?
                </NavLink>
              </div>
            </div>
            <div className="mt-2 relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md border-0 pl-3 pr-10 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="Enter your password"
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
              type="submit"
              disabled={loading}
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
              </div> : 'Sign in'}
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <NavLink to="/signup" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
            Sign Up
          </NavLink>
        </p>
      </div>
    </div>
  )
}