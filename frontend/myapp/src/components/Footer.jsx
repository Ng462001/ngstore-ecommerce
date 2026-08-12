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
    <footer className="bg-surface-muted border-t border-border-light text-text-primary mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          {/* Company Info */}
          <div className="col-span-2 sm:col-span-1 space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <img
                src="/assets/img/logo/logo.png"
                alt="Company Logo"
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-sm text-text-secondary leading-relaxed">
              Your trusted destination for quality products and exceptional service. Shop with confidence.
            </p>
            {/* Social Media */}
            <div className="flex space-x-3 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-surface border border-border-light flex items-center justify-center text-text-secondary hover:text-accent hover:border-accent transition-colors shadow-xs"
                aria-label="Facebook"
              >
                <FacebookIcon fontSize="small" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-surface border border-border-light flex items-center justify-center text-text-secondary hover:text-accent hover:border-accent transition-colors shadow-xs"
                aria-label="Twitter"
              >
                <TwitterIcon fontSize="small" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-surface border border-border-light flex items-center justify-center text-text-secondary hover:text-accent hover:border-accent transition-colors shadow-xs"
                aria-label="Instagram"
              >
                <InstagramIcon fontSize="small" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-surface border border-border-light flex items-center justify-center text-text-secondary hover:text-accent hover:border-accent transition-colors shadow-xs"
                aria-label="LinkedIn"
              >
                <LinkedInIcon fontSize="small" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading text-base font-semibold text-text-primary mb-5">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-sm text-text-secondary hover:text-accent transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/store" className="text-sm text-text-secondary hover:text-accent transition-colors">
                  Stores
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-text-secondary hover:text-accent transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-text-secondary hover:text-accent transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-heading text-base font-semibold text-text-primary mb-5">
              Customer Service
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/profile" className="text-sm text-text-secondary hover:text-accent transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                <Link to="/my-orders" className="text-sm text-text-secondary hover:text-accent transition-colors">
                  Order Tracking
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-sm text-text-secondary hover:text-accent transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-text-secondary hover:text-accent transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-heading text-base font-semibold text-text-primary mb-5">
              Contact Us
            </h3>
            <ul className="space-y-3.5">
              <li className="flex items-start space-x-2.5 text-sm text-text-secondary">
                <LocationIcon className="text-accent mt-0.5 shrink-0" fontSize="small" />
                <span>VIPL IT Park, Nagpur, Maharashtra 440022</span>
              </li>
              <li className="flex items-center space-x-2.5 text-sm text-text-secondary">
                <PhoneIcon className="text-accent shrink-0" fontSize="small" />
                <a href="tel:+1234567890" className="hover:text-accent transition-colors">
                  +91-7775831890
                </a>
              </li>
              <li className="flex items-center space-x-2.5 text-sm text-text-secondary">
                <EmailIcon className="text-accent shrink-0" fontSize="small" />
                <a href="mailto:ngtech2026@gmail.com" className="hover:text-accent transition-colors">
                  ngtech2026@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-8 border-t border-border-light">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-xs text-text-secondary text-center md:text-left">
              © 2025-26 NGStore. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link to="/privacy-policy" className="text-xs text-text-secondary hover:text-accent transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-xs text-text-secondary hover:text-accent transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer