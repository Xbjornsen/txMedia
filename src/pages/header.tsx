// header.tsx
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-[var(--background)] border-b border-[var(--secondary)]/20 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 flex justify-between items-center py-2">
        <Link
          href="/"
          className="flex items-center space-x-2 text-xl sm:text-2xl font-bold aerial-text"
        >
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
            className="w-10 h-10 md:w-20 md:h-20"
          >
            <text
              x="100"
              y="110"
              font-family="Times New Roman, serif"
              font-size="80"
              font-weight="bold"
              fill="var(--secondary-alt)" // Use CSS variable
              text-anchor="middle"
              dominant-baseline="middle"
            >
              TX
            </text>
            <path
              d="M 145,100 A 60,60 0 1,1 45,100"
              fill="none"
              stroke="var(--secondary-alt)" // Use CSS variable
              stroke-width="4"
              stroke-linecap="round"
              transform="rotate(275, 100, 100)"
            />
          </svg>
          <span className="text-[var(--secondary-alt)]text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
            Media
          </span>
        </Link>
        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-6">
          <li>
            <Link
              href="/"
              className="text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/portfolio"
              className="text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
            >
              Portfolio
            </Link>
          </li>
          <li>
            <Link
              href="/packages"
              className="text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
            >
              Packages
            </Link>
          </li>
          <li>
            <Link
              href="/about"
              className="text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
            >
              About
            </Link>
          </li>
          <li>
            <Link
              href="/contact"
              className="text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
            >
              Contact
            </Link>
          </li>
        </ul>
        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-[var(--secondary-alt)] focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={
                isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"
              }
            />
          </svg>
        </button>
      </nav>
      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <ul className="md:hidden bg-[var(--background)] border-t border-[var(--secondary)]/20 text-center">
          <li>
            <Link
              href="/"
              className="block py-2 px-4 text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/portfolio"
              className="block py-2 px-4 text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
            >
              Portfolio
            </Link>
          </li>
          <li>
            <Link
              href="/packages"
              className="text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
            >
              Packages
            </Link>
          </li>
          <li>
            <Link
              href="/about"
              className="block py-2 px-4 text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
            >
              About
            </Link>
          </li>
          <li>
            <Link
              href="/contact"
              className="block py-2 px-4 text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
            >
              Contact
            </Link>
          </li>
        </ul>
      )}
    </header>
  );
}
