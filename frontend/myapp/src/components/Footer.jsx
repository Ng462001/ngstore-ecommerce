import React from 'react'
import { Link } from 'react-router-dom'
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material'

const Footer = () => {

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="col-span-2 sm:col-span-1 space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <img
                src="/assets/img/logo/logo.png"
                alt="Company Logo"
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-sm text-gray-600 leading-relaxed">
              Your trusted destination for quality products and exceptional service. Shop with confidence.
            </p>
            {/* Social Media */}
            <div className="flex space-x-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-indigo-600 transition-colors"
                aria-label="Facebook"
              >
                <FacebookIcon />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-indigo-600 transition-colors"
                aria-label="Twitter"
              >
                <TwitterIcon />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-indigo-600 transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-indigo-600 transition-colors"
                aria-label="LinkedIn"
              >
                <LinkedInIcon />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/store" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                  Stores
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Customer Service
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/profile" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                <Link to="/my-orders" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                  Order Tracking
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2 text-sm text-gray-600">
                <LocationIcon className="text-indigo-600 mt-0.5" fontSize="small" />
                <span>VIPL IT Park, Nagpur, Maharashtra 440022</span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-gray-600">
                <PhoneIcon className="text-indigo-600" fontSize="small" />
                <a href="tel:+1234567890" className="hover:text-indigo-600 transition-colors">
                  +91-7775831890
                </a>
              </li>
              <li className="flex items-center space-x-2 text-sm text-gray-600">
                <EmailIcon className="text-indigo-600" fontSize="small" />
                <a href="mailto:ngtech2026@gmail.com" className="hover:text-indigo-600 transition-colors">
                  ngtech2026@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-500 text-center md:text-left">
              © 2025-26 NGStore. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link to="/privacy-policy" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">
                Privacy
              </Link>
              <Link to="/terms" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer