import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Gavel as GavelIcon,
  ShoppingBag as ShoppingBagIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  LocalShipping as ShippingIcon,
  Autorenew as AutorenewIcon,
  Payment as PaymentIcon,
  WarningAmber as WarningIcon,
  Copyright as CopyrightIcon,
  Rule as RuleIcon,
  AccountCircle as AccountCircleIcon,
  Print as PrintIcon,
  Search as SearchIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  Update as UpdateIcon,
  HeadsetMic as SupportIcon
} from '@mui/icons-material'

const TermsOfService = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSection, setActiveSection] = useState('acceptance')

  const lastUpdated = 'March 15, 2026'

  const highlights = [
    {
      icon: <ShoppingBagIcon className="text-accent" fontSize="medium" />,
      title: 'Authentic Merchandise',
      desc: 'All products sold on NGStore are 100% genuine, directly sourced from verified artisans, brands, and authorized distributors.'
    },
    {
      icon: <PaymentIcon className="text-accent" fontSize="medium" />,
      title: 'Secure Payment Flow',
      desc: 'Transactions are secured via certified, encrypted gateways. We never store raw credit/debit card numbers or sensitive CVVs.'
    },
    {
      icon: <AutorenewIcon className="text-accent" fontSize="medium" />,
      title: 'Easy Returns & Exchanges',
      desc: 'Eligible items can be returned or exchanged via your account dashboard in accordance with our return guidelines.'
    },
    {
      icon: <RuleIcon className="text-accent" fontSize="medium" />,
      title: 'Fair & Transparent Terms',
      desc: 'Clear rights, transparent pricing, fair dispute resolution, and strict adherence to consumer protection standards.'
    }
  ]

  const sections = [
    {
      id: 'acceptance',
      title: '1. Acceptance of Terms & Eligibility',
      icon: <GavelIcon className="text-accent" fontSize="small" />,
      content: (
        <>
          <p className="text-text-secondary leading-relaxed mb-4">
            These Terms of Service (&ldquo;Terms&rdquo;) form a legally binding agreement between you (&ldquo;Customer,&rdquo; &ldquo;User,&rdquo; or &ldquo;you&rdquo;) and <strong className="text-text-primary">NGStore</strong> (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), governing your access to and use of our e-commerce website, mobile web platforms, and associated services.
          </p>
          <p className="text-text-secondary leading-relaxed mb-4">
            By browsing our website, registering an account, or placing an order, you confirm that you are at least 18 years of age (or have reached the age of majority in your jurisdiction) and possess full legal capacity to enter into binding agreements.
          </p>
          <div className="p-4 bg-accent-light rounded-xl border border-accent/20 text-xs text-text-primary font-medium">
            If you do not agree with any part of these Terms, you must discontinue your access and avoid placing orders on NGStore.
          </div>
        </>
      )
    },
    {
      id: 'account-security',
      title: '2. User Accounts & Security',
      icon: <AccountCircleIcon className="text-accent" fontSize="small" />,
      content: (
        <>
          <p className="text-text-secondary leading-relaxed mb-3">
            To unlock specific features such as order tracking, wishlists, and express checkout, you may create an account. When doing so, you agree to:
          </p>
          <ul className="space-y-2.5 text-text-secondary text-sm mb-4">
            <li className="flex items-start gap-2.5">
              <CheckCircleIcon className="text-accent shrink-0 mt-0.5" fontSize="small" />
              <span>Provide accurate, current, and complete registration information including verified email and phone.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircleIcon className="text-accent shrink-0 mt-0.5" fontSize="small" />
              <span>Maintain the confidentiality of your password and accept full responsibility for all activities under your account.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircleIcon className="text-accent shrink-0 mt-0.5" fontSize="small" />
              <span>Notify NGStore customer support immediately if you suspect any unauthorized access or breach of security.</span>
            </li>
          </ul>
          <p className="text-text-secondary text-sm">
            NGStore reserves the right to suspend or terminate accounts that provide misleading information or engage in abusive platform behavior.
          </p>
        </>
      )
    },
    {
      id: 'products-pricing',
      title: '3. Product Information, Pricing & Availability',
      icon: <ShoppingBagIcon className="text-accent" fontSize="small" />,
      content: (
        <>
          <p className="text-text-secondary leading-relaxed mb-4">
            We make every reasonable effort to display product colors, specifications, descriptions, and imagery as accurately as possible. However:
          </p>
          <div className="space-y-3 mb-4">
            <div className="p-4 bg-surface rounded-xl border border-border-light text-sm">
              <strong className="text-text-primary block mb-1">Color & Display Variations:</strong>
              <span className="text-text-secondary">Colors displayed on your monitor or mobile screen may vary slightly depending on display hardware, calibration, and lighting conditions.</span>
            </div>
            <div className="p-4 bg-surface rounded-xl border border-border-light text-sm">
              <strong className="text-text-primary block mb-1">Pricing & Typographical Inadvertencies:</strong>
              <span className="text-text-secondary">All prices are shown in local currency (INR) and are inclusive of applicable goods and services taxes unless explicitly noted. In the rare event of a typographical pricing error, NGStore reserves the right to cancel unfulfilled orders placed at incorrect price points and issue a full refund.</span>
            </div>
            <div className="p-4 bg-surface rounded-xl border border-border-light text-sm">
              <strong className="text-text-primary block mb-1">Inventory & Stock Status:</strong>
              <span className="text-text-secondary">Product availability is subject to change without prior notice. If an ordered item becomes out of stock after order placement, our team will notify you promptly and process an immediate refund.</span>
            </div>
          </div>
        </>
      )
    },
    {
      id: 'orders-payments',
      title: '4. Orders, Checkout & Payment Terms',
      icon: <PaymentIcon className="text-accent" fontSize="small" />,
      content: (
        <>
          <p className="text-text-secondary leading-relaxed mb-4">
            Placing an order constitutes an offer to purchase. An order is deemed accepted only when you receive an official dispatch confirmation email containing an assigned tracking number.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="p-4 bg-background rounded-xl border border-border-light">
              <h5 className="font-semibold text-text-primary text-sm mb-1">Accepted Payment Gateways</h5>
              <p className="text-xs text-text-secondary leading-relaxed">
                Credit/Debit cards (Visa, Mastercard, RuPay), UPI, Net Banking, and authorized digital wallets handled by secure payment partners.
              </p>
            </div>
            <div className="p-4 bg-background rounded-xl border border-border-light">
              <h5 className="font-semibold text-text-primary text-sm mb-1">Payment Verification & Authorization</h5>
              <p className="text-xs text-text-secondary leading-relaxed">
                By submitting payment details, you represent that you are legally authorized to utilize the payment method. Suspicious transactions may trigger automated 3D-Secure verifications.
              </p>
            </div>
          </div>
          <p className="text-text-secondary text-sm">
            We reserve the right to cancel any order if fraudulent payment activity, unauthorized bulk reselling, or invalid delivery destination data is detected.
          </p>
        </>
      )
    },
    {
      id: 'shipping-delivery',
      title: '5. Shipping, Dispatch & Risk of Loss',
      icon: <ShippingIcon className="text-accent" fontSize="small" />,
      content: (
        <>
          <p className="text-text-secondary leading-relaxed mb-3">
            We deliver across serviced postal pin codes via established courier partners.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-text-secondary text-sm mb-4">
            <li><strong className="text-text-primary">Dispatch Timeline:</strong> Most in-stock orders are processed and handed over to courier hubs within 1-2 business days.</li>
            <li><strong className="text-text-primary">Delivery Timeframes:</strong> Standard delivery usually takes 3 to 7 business days depending on customer location and transit logistics.</li>
            <li><strong className="text-text-primary">Tracking Updates:</strong> Real-time shipment status and milestone updates are available via our <Link to="/my-orders" className="text-accent underline font-medium">Order Tracking</Link> portal.</li>
            <li><strong className="text-text-primary">Title & Risk of Loss:</strong> Title and risk of loss pass to the customer upon delivery of package by courier partner to the address provided during checkout.</li>
          </ul>
        </>
      )
    },
    {
      id: 'returns-refunds',
      title: '6. Returns, Exchanges & Refunds Policy',
      icon: <AutorenewIcon className="text-accent" fontSize="small" />,
      content: (
        <>
          <p className="text-text-secondary leading-relaxed mb-4">
            Customer satisfaction is central to our philosophy. We offer a transparent return and exchange procedure:
          </p>
          <div className="space-y-3 mb-4 text-sm">
            <div className="p-4 bg-surface rounded-xl border border-border-light">
              <h4 className="font-semibold text-text-primary mb-1">Return Eligibility Window</h4>
              <p className="text-text-secondary">
                Eligible products can be returned within 7 days of delivery. Items must remain unused, unworn, undamaged, with original tags, brand packaging, barcodes, and included accessories intact.
              </p>
            </div>
            <div className="p-4 bg-surface rounded-xl border border-border-light">
              <h4 className="font-semibold text-text-primary mb-1">Non-Returnable Categories</h4>
              <p className="text-text-secondary">
                For hygiene and safety reasons, innerwear, personal care consumables, customized bespoke goods, and final clearance items cannot be returned unless received in a damaged condition.
              </p>
            </div>
            <div className="p-4 bg-surface rounded-xl border border-border-light">
              <h4 className="font-semibold text-text-primary mb-1">Refund Processing</h4>
              <p className="text-text-secondary">
                Once a returned item is received at our fulfillment center and undergoes quality inspection (2-3 business days), approved refunds are credited back to the original payment source within 5-7 banking business days.
              </p>
            </div>
          </div>
          <p className="text-text-secondary text-sm">
            You can initiate a return or exchange request directly from your <Link to="/my-orders" className="text-accent underline font-medium">My Orders</Link> page.
          </p>
        </>
      )
    },
    {
      id: 'intellectual-property',
      title: '7. Intellectual Property Rights',
      icon: <CopyrightIcon className="text-accent" fontSize="small" />,
      content: (
        <p className="text-text-secondary leading-relaxed">
          All website designs, trademarks, logos, brand names, product imagery, editorial text, graphics, software code, and layouts displayed on NGStore are the exclusive intellectual property of NGStore or its licensed suppliers and are protected under Indian and international copyright and trademark laws. You may not reproduce, duplicate, modify, distribute, or publicly display any material from this site without our prior written authorization.
        </p>
      )
    },
    {
      id: 'prohibited-conduct',
      title: '8. Prohibited Activities & Platform Conduct',
      icon: <WarningIcon className="text-accent" fontSize="small" />,
      content: (
        <>
          <p className="text-text-secondary leading-relaxed mb-3">
            When interacting with NGStore, you agree that you will NOT:
          </p>
          <ul className="space-y-2 text-text-secondary text-sm">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0"></span>
              <span>Engage in automated scraping, data extraction, crawling, or harvesting of catalog data without express written permission.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0"></span>
              <span>Attempt to bypass authentication, test vulnerabilities, or disrupt the network infrastructure and API endpoints.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0"></span>
              <span>Submit deceptive, abusive, profane, defamatory, or fraudulent product reviews and service requests.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0"></span>
              <span>Use fake addresses, stolen payment cards, or exploit promotional coupon codes through multi-accounting.</span>
            </li>
          </ul>
        </>
      )
    },
    {
      id: 'disclaimers-liability',
      title: '9. Limitation of Liability & Warranty Disclaimers',
      icon: <RuleIcon className="text-accent" fontSize="small" />,
      content: (
        <>
          <p className="text-text-secondary leading-relaxed mb-3">
            To the maximum extent permitted by applicable law, NGStore and its digital platform are provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis without warranties of any kind, whether express or implied.
          </p>
          <p className="text-text-secondary leading-relaxed text-sm mb-3">
            In no event shall NGStore, its founders, officers, employees, or partners be liable for any indirect, incidental, punitive, or consequential damages arising out of the use or inability to use our services or products.
          </p>
          <p className="text-text-secondary leading-relaxed text-sm">
            Our aggregate liability for any claims arising under these terms shall not exceed the actual amount paid by you for the specific product order giving rise to the claim.
          </p>
        </>
      )
    },
    {
      id: 'governing-law',
      title: '10. Governing Law & Dispute Resolution',
      icon: <GavelIcon className="text-accent" fontSize="small" />,
      content: (
        <>
          <p className="text-text-secondary leading-relaxed mb-3">
            These Terms of Service and any contractual disputes shall be governed by, construed, and interpreted in accordance with the laws of <strong className="text-text-primary">India</strong>, without regard to conflict of law principles.
          </p>
          <p className="text-text-secondary leading-relaxed text-sm mb-3">
            Any legal dispute, suit, or proceeding arising out of or related to these Terms or orders placed on NGStore shall be subject to the exclusive jurisdiction of the competent courts located in <strong className="text-text-primary">Nagpur, Maharashtra, India</strong>.
          </p>
          <p className="text-text-secondary leading-relaxed text-sm">
            Before initiating litigation, parties agree to attempt amicable resolution via good-faith discussions through our Customer Grievance Desk for a period of at least 30 days.
          </p>
        </>
      )
    },
    {
      id: 'modifications',
      title: '11. Modifications to Terms',
      icon: <AssignmentTurnedInIcon className="text-accent" fontSize="small" />,
      content: (
        <p className="text-text-secondary leading-relaxed">
          We reserve the right to amend, update, or replace these Terms at our discretion. The most current version will always be posted on this page with an updated &ldquo;Last Updated&rdquo; date. Continued use of NGStore following any modifications constitutes your acknowledgment and acceptance of the revised Terms.
        </p>
      )
    },
    {
      id: 'contact-support',
      title: '12. Contact Information & Customer Support',
      icon: <SupportIcon className="text-accent" fontSize="small" />,
      content: (
        <>
          <p className="text-text-secondary leading-relaxed mb-4">
            If you have questions regarding these Terms of Service or require assistance with an existing order, please contact our support desk:
          </p>
          <div className="bg-surface-muted p-5 rounded-xl border border-border-light space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <span className="font-semibold text-text-primary min-w-[120px]">Legal Entity:</span>
              <span className="text-text-secondary">NGStore E-Commerce</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="font-semibold text-text-primary min-w-[120px]">Email:</span>
              <a href="mailto:ngtech2026@gmail.com" className="text-accent hover:underline font-medium">ngtech2026@gmail.com</a>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="font-semibold text-text-primary min-w-[120px]">Phone Support:</span>
              <a href="tel:+917775831890" className="text-accent hover:underline font-medium">+91-7775831890 (Mon-Sat, 9AM-7PM IST)</a>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <span className="font-semibold text-text-primary min-w-[120px]">Registered Office:</span>
              <span className="text-text-secondary">VIPL IT Park, Nagpur, Maharashtra 440022, India</span>
            </div>
          </div>
        </>
      )
    }
  ]

  const filteredSections = sections.filter(sec =>
    sec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (typeof sec.content === 'string' && sec.content.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const scrollToSection = (id) => {
    setActiveSection(id)
    const element = document.getElementById(id)
    if (element) {
      const yOffset = -90
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-background text-text-primary py-10 md:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-border-light text-xs text-text-secondary">
          <div className="flex items-center space-x-2">
            <Link to="/" className="hover:text-accent transition-colors">Home</Link>
            <span>/</span>
            <span className="text-text-primary font-medium">Terms of Service</span>
          </div>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-light bg-surface hover:bg-surface-muted text-text-secondary hover:text-text-primary transition-colors text-xs shadow-xs"
            title="Print or Save as PDF"
          >
            <PrintIcon fontSize="inherit" />
            <span>Print Terms</span>
          </button>
        </div>

        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-light border border-accent/30 text-accent text-xs font-semibold uppercase tracking-wider mb-4">
            <GavelIcon fontSize="inherit" />
            User Agreement & Policies
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary mb-4 tracking-tight">
            Terms of Service
          </h1>
          <p className="text-text-secondary text-base sm:text-lg leading-relaxed mb-3">
            Please read these terms carefully before purchasing or interacting with NGStore. They establish your legal rights, responsibilities, and our mutual obligations.
          </p>
          <div className="inline-flex items-center gap-2 text-xs text-text-secondary bg-surface px-4 py-1.5 rounded-full border border-border-light shadow-xs">
            <UpdateIcon fontSize="inherit" className="text-accent" />
            <span>Last Updated: <strong className="text-text-primary font-medium">{lastUpdated}</strong></span>
          </div>
        </div>

        {/* Highlight Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          {highlights.map((item, index) => (
            <div
              key={index}
              className="bg-surface rounded-2xl p-5 border border-border-light shadow-soft hover:shadow-card transition-all duration-300 flex flex-col"
            >
              <div className="w-10 h-10 rounded-xl bg-accent-light flex items-center justify-center mb-3">
                {item.icon}
              </div>
              <h3 className="font-semibold text-text-primary text-sm mb-1.5">
                {item.title}
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed mt-auto">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Main Content Layout with Sidebar TOC */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Table of Contents - Desktop Sticky Sidebar */}
          <aside className="lg:col-span-4 order-2 lg:order-1">
            <div className="sticky top-24 bg-surface rounded-2xl p-6 border border-border-light shadow-soft">
              <h3 className="font-heading text-lg font-semibold text-text-primary mb-4 pb-3 border-b border-border-light">
                Table of Contents
              </h3>
              
              {/* Search Filter Box */}
              <div className="relative mb-5">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" fontSize="small" />
                <input
                  type="text"
                  placeholder="Filter sections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-surface-muted border border-border-light text-text-primary focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                      activeSection === section.id
                        ? 'bg-accent-light text-accent font-semibold'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-muted'
                    }`}
                  >
                    <span className="truncate">{section.title}</span>
                    <ArrowForwardIcon fontSize="inherit" className="opacity-60 ml-1 shrink-0" />
                  </button>
                ))}
              </nav>

              {/* Cross-Link to Privacy Policy */}
              <div className="mt-6 pt-5 border-t border-border-light">
                <p className="text-xs text-text-secondary mb-2">Curious how we safeguard your data?</p>
                <Link
                  to="/privacy-policy"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent-hover transition-colors"
                >
                  <span>Review Privacy Policy</span>
                  <ArrowForwardIcon fontSize="inherit" />
                </Link>
              </div>
            </div>
          </aside>

          {/* Policy Body */}
          <main className="lg:col-span-8 order-1 lg:order-2 space-y-8">
            {filteredSections.length === 0 ? (
              <div className="bg-surface rounded-2xl p-8 text-center border border-border-light">
                <p className="text-text-secondary text-sm">No sections match your search &ldquo;{searchQuery}&rdquo;.</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-3 text-xs text-accent font-semibold underline"
                >
                  Clear search
                </button>
              </div>
            ) : (
              filteredSections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="bg-surface rounded-2xl p-6 sm:p-8 border border-border-light shadow-soft scroll-mt-24 transition-all"
                >
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border-light">
                    <div className="w-8 h-8 rounded-lg bg-accent-light flex items-center justify-center shrink-0">
                      {section.icon}
                    </div>
                    <h2 className="font-heading text-xl sm:text-2xl font-bold text-text-primary">
                      {section.title}
                    </h2>
                  </div>
                  <div className="text-sm leading-relaxed">
                    {section.content}
                  </div>
                </section>
              ))
            )}

            {/* Quick Contact & Assistance Footer Box */}
            <div className="bg-gradient-to-r from-surface-muted to-accent-light rounded-2xl p-6 sm:p-8 border border-border-light shadow-soft flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="font-heading text-lg font-bold text-text-primary">
                  Need help understanding these terms?
                </h3>
                <p className="text-xs text-text-secondary max-w-md">
                  Our customer care team is available to assist with order questions, return policies, or shipping terms.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 shrink-0">
                <Link
                  to="/contact"
                  className="px-5 py-2.5 rounded-xl bg-accent text-white font-medium text-xs hover:bg-accent-hover transition-colors shadow-xs"
                >
                  Contact Support
                </Link>
                <Link
                  to="/store"
                  className="px-5 py-2.5 rounded-xl bg-surface border border-border-light text-text-primary font-medium text-xs hover:bg-surface-muted transition-colors shadow-xs"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>

          </main>
        </div>

      </div>
    </div>
  )
}

export default TermsOfService
