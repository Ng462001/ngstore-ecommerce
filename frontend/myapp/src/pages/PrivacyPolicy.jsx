import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Security as SecurityIcon,
  Shield as ShieldIcon,
  Lock as LockIcon,
  VisibilityOff as VisibilityOffIcon,
  Cookie as CookieIcon,
  Person as PersonIcon,
  Payment as PaymentIcon,
  LocalShipping as ShippingIcon,
  ContactSupport as ContactSupportIcon,
  Print as PrintIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Update as UpdateIcon,
} from "@mui/icons-material";

const PrivacyPolicy = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("intro");

  const lastUpdated = "March 15, 2026";

  const highlights = [
    {
      icon: <LockIcon className="text-accent" fontSize="medium" />,
      title: "Data Protection & Encryption",
      desc: "All sensitive transmissions including checkout details and authentication credentials use industry-standard SSL/TLS 256-bit encryption.",
    },
    {
      icon: <VisibilityOffIcon className="text-accent" fontSize="medium" />,
      title: "Never Sold to Third Parties",
      desc: "We never sell, rent, or trade your personal personal information to data brokers or advertising exchanges.",
    },
    {
      icon: <CookieIcon className="text-accent" fontSize="medium" />,
      title: "Transparent Cookie Usage",
      desc: "Cookies are used solely to preserve your shopping bag, secure sessions, and offer tailor-made product recommendations.",
    },
    {
      icon: <PersonIcon className="text-accent" fontSize="medium" />,
      title: "Full User Control & Access",
      desc: "You hold full rights to view, update, export, or request deletion of your account and stored personal data anytime.",
    },
  ];

  const sections = [
    {
      id: "intro",
      title: "1. Introduction & Overview",
      icon: <ShieldIcon className="text-accent" fontSize="small" />,
      content: (
        <>
          <p className="text-text-secondary leading-relaxed mb-4">
            Welcome to <strong className="text-text-primary">NGStore</strong>{" "}
            (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;). We
            respect your privacy and are committed to protecting the personal
            data you share with us. This Privacy Policy details how NGStore
            collects, uses, stores, discloses, and protects your information
            when you visit our website, register an account, browse our product
            collections, or place an order.
          </p>
          <p className="text-text-secondary leading-relaxed">
            By accessing or using NGStore, you acknowledge that you have read,
            understood, and agreed to the practices outlined in this Privacy
            Policy. If you do not agree with any terms within this policy,
            please refrain from using our platform.
          </p>
        </>
      ),
    },
    {
      id: "information-collected",
      title: "2. Information We Collect",
      icon: <PersonIcon className="text-accent" fontSize="small" />,
      content: (
        <>
          <p className="text-text-secondary leading-relaxed mb-4">
            We collect information that you directly provide to us, information
            collected automatically as you navigate our platform, and data from
            trusted payment and courier partners:
          </p>
          <div className="space-y-4 mb-4">
            <div className="bg-surface rounded-xl p-4 border border-border-light shadow-xs">
              <h4 className="font-semibold text-text-primary mb-1">
                A. Account & Profile Information
              </h4>
              <p className="text-sm text-text-secondary">
                When you create an account on NGStore, we collect your full
                name, email address, phone number, encrypted password hash, and
                default delivery preferences.
              </p>
            </div>
            <div className="bg-surface rounded-xl p-4 border border-border-light shadow-xs">
              <h4 className="font-semibold text-text-primary mb-1">
                B. Purchase & Order Details
              </h4>
              <p className="text-sm text-text-secondary">
                Items placed in cart, order history, billing address, shipping
                address, contact phone number for courier delivery, recipient
                name, and return/exchange requests.
              </p>
            </div>
            <div className="bg-surface rounded-xl p-4 border border-border-light shadow-xs">
              <h4 className="font-semibold text-text-primary mb-1">
                C. Payment Information
              </h4>
              <p className="text-sm text-text-secondary">
                Payments are processed via PCI-DSS compliant payment gateways
                (such as Stripe or Razorpay). NGStore does not store complete
                credit/debit card numbers or CVV codes on our servers; we only
                store transaction identifiers and payment status to verify
                successful checkout.
              </p>
            </div>
            <div className="bg-surface rounded-xl p-4 border border-border-light shadow-xs">
              <h4 className="font-semibold text-text-primary mb-1">
                D. Automated Log & Device Data
              </h4>
              <p className="text-sm text-text-secondary">
                IP address, browser type, operating system, referring URL, time
                zone, pages viewed, interaction events, and approximate
                geolocation derived from IP.
              </p>
            </div>
          </div>
        </>
      ),
    },
    {
      id: "how-we-use-info",
      title: "3. How We Use Your Information",
      icon: <ShippingIcon className="text-accent" fontSize="small" />,
      content: (
        <>
          <p className="text-text-secondary leading-relaxed mb-4">
            We use your personal data for legitimate business purposes,
            including:
          </p>
          <ul className="space-y-2.5 text-text-secondary">
            <li className="flex items-start gap-2.5">
              <CheckCircleIcon
                className="text-accent shrink-0 mt-0.5"
                fontSize="small"
              />
              <span>
                <strong>Fulfilling Orders:</strong> Processing payments,
                preparing shipments, dispatching packages, and delivering
                tracking status updates.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircleIcon
                className="text-accent shrink-0 mt-0.5"
                fontSize="small"
              />
              <span>
                <strong>Account Management:</strong> Authenticating logins,
                managing your wishlist, and remembering your saved addresses.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircleIcon
                className="text-accent shrink-0 mt-0.5"
                fontSize="small"
              />
              <span>
                <strong>Customer Support:</strong> Resolving service tickets,
                processing return and exchange claims, and responding to
                inquiries.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircleIcon
                className="text-accent shrink-0 mt-0.5"
                fontSize="small"
              />
              <span>
                <strong>Platform Improvements:</strong> Analyzing aggregated
                visitor behavior to enhance website responsiveness, UX, and
                inventory planning.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircleIcon
                className="text-accent shrink-0 mt-0.5"
                fontSize="small"
              />
              <span>
                <strong>Security & Fraud Prevention:</strong> Protecting against
                malicious account takeovers, unauthorized card usage, and
                automated bot abuse.
              </span>
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "third-parties",
      title: "4. Information Sharing & Third-Party Disclosure",
      icon: <PaymentIcon className="text-accent" fontSize="small" />,
      content: (
        <>
          <p className="text-text-secondary leading-relaxed mb-4">
            We only share your information with trusted third parties necessary
            to perform core e-commerce services:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="p-4 bg-background rounded-xl border border-border-light">
              <h5 className="font-semibold text-text-primary text-sm mb-1">
                Logistics & Shipping Couriers
              </h5>
              <p className="text-xs text-text-secondary leading-relaxed">
                Shared only to the extent needed: your delivery name, address,
                contact phone, and shipment order number for courier drop-off.
              </p>
            </div>
            <div className="p-4 bg-background rounded-xl border border-border-light">
              <h5 className="font-semibold text-text-primary text-sm mb-1">
                Payment Gateways
              </h5>
              <p className="text-xs text-text-secondary leading-relaxed">
                PCI-DSS certified payment processors handle card tokenization
                and authentication with high-level bank encryption standards.
              </p>
            </div>
            <div className="p-4 bg-background rounded-xl border border-border-light">
              <h5 className="font-semibold text-text-primary text-sm mb-1">
                Transactional Communication
              </h5>
              <p className="text-xs text-text-secondary leading-relaxed">
                Automated email and SMS services that deliver invoice copies,
                account verification links, and dispatch status alerts.
              </p>
            </div>
            <div className="p-4 bg-background rounded-xl border border-border-light">
              <h5 className="font-semibold text-text-primary text-sm mb-1">
                Legal Compliance
              </h5>
              <p className="text-xs text-text-secondary leading-relaxed">
                Disclosed only when mandated by court summons, law enforcement
                investigations, or to protect the safety and property of NGStore
                users.
              </p>
            </div>
          </div>
          <div className="p-4 bg-accent-light rounded-xl border border-accent/20 text-xs text-text-primary font-medium">
            Note: We do not sell, rent, or monetize your contact or browsing
            records to third-party marketing brokers.
          </div>
        </>
      ),
    },
    {
      id: "cookies",
      title: "5. Cookies & Tracking Technologies",
      icon: <CookieIcon className="text-accent" fontSize="small" />,
      content: (
        <>
          <p className="text-text-secondary leading-relaxed mb-3">
            NGStore uses cookies, web beacons, and local storage tokens to
            provide a seamless browsing and checkout experience:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-text-secondary text-sm mb-4">
            <li>
              <strong className="text-text-primary">Essential Cookies:</strong>{" "}
              Required to keep your session alive, identify authentication JWT
              tokens, and safeguard cart items across page refreshes.
            </li>
            <li>
              <strong className="text-text-primary">Preference Cookies:</strong>{" "}
              Remember your theme choices, currency preferences, and recently
              viewed products.
            </li>
            <li>
              <strong className="text-text-primary">Analytics Cookies:</strong>{" "}
              Help our engineering team understand navigation flow, checkout
              drop-off rates, and page performance.
            </li>
          </ul>
          <p className="text-text-secondary text-sm">
            You can configure your browser to block or alert you about cookies;
            however, disabling essential cookies may cause cart checkout and
            login sessions to malfunction.
          </p>
        </>
      ),
    },
    {
      id: "security-retention",
      title: "6. Data Security & Storage Retention",
      icon: <SecurityIcon className="text-accent" fontSize="small" />,
      content: (
        <>
          <p className="text-text-secondary leading-relaxed mb-4">
            We implement administrative, technical, and physical safeguards
            designed to protect personal data against loss, unauthorized access,
            destruction, and disclosure:
          </p>
          <ul className="space-y-2 text-text-secondary text-sm mb-4">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
              <span>
                All network communications are secured using TLS/SSL
                cryptographic protocols.
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
              <span>
                Passwords are salted and securely hashed using bcrypt prior to
                database storage.
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
              <span>
                Access to production customer records is strictly restricted to
                authorized operations personnel.
              </span>
            </li>
          </ul>
          <p className="text-text-secondary text-sm leading-relaxed">
            We retain your personal details for as long as your account remains
            active or as required by applicable commercial and tax accounting
            regulations (such as maintaining order transaction records for
            auditing).
          </p>
        </>
      ),
    },
    {
      id: "user-rights",
      title: "7. Your Privacy Rights & Choices",
      icon: <ShieldIcon className="text-accent" fontSize="small" />,
      content: (
        <>
          <p className="text-text-secondary leading-relaxed mb-4">
            You maintain full sovereignty over your personal data. Depending on
            your location, your rights include:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-4">
            <div className="p-3 bg-surface rounded-lg border border-border-light">
              <span className="font-semibold text-text-primary block mb-0.5">
                Right to Access
              </span>
              <span className="text-text-secondary text-xs">
                Request a summary of the personal information we hold about you.
              </span>
            </div>
            <div className="p-3 bg-surface rounded-lg border border-border-light">
              <span className="font-semibold text-text-primary block mb-0.5">
                Right to Rectification
              </span>
              <span className="text-text-secondary text-xs">
                Edit your name, phone, or delivery address directly in your
                profile dashboard.
              </span>
            </div>
            <div className="p-3 bg-surface rounded-lg border border-border-light">
              <span className="font-semibold text-text-primary block mb-0.5">
                Right to Erasure
              </span>
              <span className="text-text-secondary text-xs">
                Request permanent deletion of your account and profile records.
              </span>
            </div>
            <div className="p-3 bg-surface rounded-lg border border-border-light">
              <span className="font-semibold text-text-primary block mb-0.5">
                Marketing Opt-Out
              </span>
              <span className="text-text-secondary text-xs">
                Unsubscribe from promotional emails anytime via one-click footer
                links.
              </span>
            </div>
          </div>
          <p className="text-text-secondary text-sm">
            To submit a privacy or data request, please email us directly at{" "}
            <a
              href="mailto:ngtech2026@gmail.com"
              className="text-accent underline font-medium"
            >
              ngtech2026@gmail.com
            </a>
            .
          </p>
        </>
      ),
    },
    {
      id: "children",
      title: "8. Children's Privacy",
      icon: <PersonIcon className="text-accent" fontSize="small" />,
      content: (
        <p className="text-text-secondary leading-relaxed">
          NGStore does not knowingly market to or solicit personal data from
          children under the age of 18 (or under the age of majority in your
          jurisdiction). If you are a parent or guardian and believe that your
          child has registered an account or provided us with personal
          information without consent, please contact us immediately so we can
          promptly delete the account.
        </p>
      ),
    },
    {
      id: "updates",
      title: "9. Updates to This Privacy Policy",
      icon: <UpdateIcon className="text-accent" fontSize="small" />,
      content: (
        <p className="text-text-secondary leading-relaxed">
          We may revise this Privacy Policy periodically to reflect changes in
          our legal obligations, service features, or operational practices.
          When significant updates occur, we will update the &ldquo;Last
          Updated&rdquo; date at the top of this document and notify active
          users via an on-site banner or email notification. Your continued use
          of the platform following the publication of changes constitutes
          acceptance.
        </p>
      ),
    },
    {
      id: "grievance",
      title: "10. Contact Us & Grievance Officer",
      icon: <ContactSupportIcon className="text-accent" fontSize="small" />,
      content: (
        <>
          <p className="text-text-secondary leading-relaxed mb-4">
            If you have questions, feedback, or grievances regarding our privacy
            practices, please contact our designated Grievance & Compliance
            team:
          </p>
          <div className="bg-surface-muted p-5 rounded-xl border border-border-light space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <span className="font-semibold text-text-primary min-w-[120px]">
                Store Name:
              </span>
              <span className="text-text-secondary">NGStore E-Commerce</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="font-semibold text-text-primary min-w-[120px]">
                Officer In-Charge:
              </span>
              <span className="text-text-secondary">
                Nikhil Gahane (Data & Privacy Desk)
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="font-semibold text-text-primary min-w-[120px]">
                Email:
              </span>
              <a
                href="mailto:ngtech2026@gmail.com"
                className="text-accent hover:underline font-medium"
              >
                ngtech2026@gmail.com
              </a>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="font-semibold text-text-primary min-w-[120px]">
                Phone:
              </span>
              <a
                href="tel:+917775831890"
                className="text-accent hover:underline font-medium"
              >
                +91-7775831890
              </a>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <span className="font-semibold text-text-primary min-w-[120px]">
                Address:
              </span>
              <span className="text-text-secondary">
                VIPL IT Park, Nagpur, Maharashtra 440022, India
              </span>
            </div>
          </div>
        </>
      ),
    },
  ];

  const filteredSections = sections.filter(
    (sec) =>
      sec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (typeof sec.content === "string" &&
        sec.content.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90;
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary py-10 md:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-border-light text-xs text-text-secondary">
          <div className="flex items-center space-x-2">
            <Link to="/" className="hover:text-accent transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-text-primary font-medium">
              Privacy Policy
            </span>
          </div>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-light bg-surface hover:bg-surface-muted text-text-secondary hover:text-text-primary transition-colors text-xs shadow-xs"
            title="Print or Save as PDF"
          >
            <PrintIcon fontSize="inherit" />
            <span>Print Policy</span>
          </button>
        </div>

        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-light border border-accent/30 text-accent text-xs font-semibold uppercase tracking-wider mb-4">
            <SecurityIcon fontSize="inherit" />
            Privacy & Data Governance
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary mb-4 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-text-secondary text-base sm:text-lg leading-relaxed mb-3">
            Your trust is our most valuable asset. Learn how we safeguard your
            personal data, ensure transaction integrity, and uphold your privacy
            rights at NGStore.
          </p>
          <div className="inline-flex items-center gap-2 text-xs text-text-secondary bg-surface px-4 py-1.5 rounded-full border border-border-light shadow-xs">
            <UpdateIcon fontSize="inherit" className="text-accent" />
            <span>
              Last Updated:{" "}
              <strong className="text-text-primary font-medium">
                {lastUpdated}
              </strong>
            </span>
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
                <SearchIcon
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
                  fontSize="small"
                />
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
                        ? "bg-accent-light text-accent font-semibold"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface-muted"
                    }`}
                  >
                    <span className="truncate">{section.title}</span>
                    <ArrowForwardIcon
                      fontSize="inherit"
                      className="opacity-60 ml-1 shrink-0"
                    />
                  </button>
                ))}
              </nav>

              {/* Cross-Link to Terms of Service */}
              <div className="mt-6 pt-5 border-t border-border-light">
                <p className="text-xs text-text-secondary mb-2">
                  Looking for our rules of purchase?
                </p>
                <Link
                  to="/terms-and-conditions"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent-hover transition-colors"
                >
                  <span>Review Terms of Service</span>
                  <ArrowForwardIcon fontSize="inherit" />
                </Link>
              </div>
            </div>
          </aside>

          {/* Policy Body */}
          <main className="lg:col-span-8 order-1 lg:order-2 space-y-8">
            {filteredSections.length === 0 ? (
              <div className="bg-surface rounded-2xl p-8 text-center border border-border-light">
                <p className="text-text-secondary text-sm">
                  No sections match your search &ldquo;{searchQuery}&rdquo;.
                </p>
                <button
                  onClick={() => setSearchQuery("")}
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
                  Have questions about your data?
                </h3>
                <p className="text-xs text-text-secondary max-w-md">
                  Our privacy team is available to help clarify questions,
                  handle data deletion requests, or assist with compliance.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 shrink-0">
                <Link
                  to="/contact"
                  className="px-5 py-2.5 rounded-xl bg-accent text-white font-medium text-xs hover:bg-accent-hover transition-colors shadow-xs"
                >
                  Contact Support
                </Link>
                <a
                  href="mailto:ngtech2026@gmail.com"
                  className="px-5 py-2.5 rounded-xl bg-surface border border-border-light text-text-primary font-medium text-xs hover:bg-surface-muted transition-colors shadow-xs"
                >
                  Email Privacy Desk
                </a>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
