import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-[var(--background)] border-b border-[var(--secondary)]/20 sticky top-0 z-50 shadow-md">
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
            className="w-10 h-10 md:w-20 md:h-20 flex-shrink-0"
          >
            <text
              x="100"
              y="110"
              fontFamily="Times New Roman, serif"
              fontSize="80"
              fontWeight="bold"
              fill="var(--secondary-alt)"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              TX
            </text>
            <path
              d="M 145,100 A 60,60 0 1,1 45,100"
              fill="none"
              stroke="var(--secondary-alt)"
              strokeWidth="4"
              strokeLinecap="round"
              transform="rotate(275, 100, 100)"
            />
          </svg>
          <span className="text-[var(--secondary-alt)] text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
            Media
          </span>
        </Link>
        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-6 items-center">
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
          className="md:hidden text-[var(--secondary-alt)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] rounded"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
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
        <ul className="md:hidden bg-[var(--background)] border-t border-[var(--secondary)]/20 absolute left-0 right-0 top-full z-50 shadow-md">
          <li>
            <button
              onClick={() => scrollToSection("home")}
              className="block w-full py-2 px-4 text-[var(--foreground)] hover:text-[var(--accent)] hover:bg-[var(--gradient-start)] transition-colors text-left"
            >
              Home
            </button>
          </li>
          <li>
            <button
              onClick={() => scrollToSection("portfolio")}
              className="block w-full py-2 px-4 text-[var(--foreground)] hover:text-[var(--accent)] hover:bg-[var(--gradient-start)] transition-colors text-left"
            >
              Portfolio
            </button>
          </li>
          <li>
            <button
              onClick={() => scrollToSection("packages")}
              className="block w-full py-2 px-4 text-[var(--foreground)] hover:text-[var(--accent)] hover:bg-[var(--gradient-start)] transition-colors text-left"
            >
              Packages
            </button>
          </li>
          <li>
            <button
              onClick={() => scrollToSection("about")}
              className="block w-full py-2 px-4 text-[var(--foreground)] hover:text-[var(--accent)] hover:bg-[var(--gradient-start)] transition-colors text-left"
            >
              About
            </button>
          </li>
          <li>
            <button
              onClick={() => scrollToSection("contact")}
              className="block w-full py-2 px-4 text-[var(--foreground)] hover:text-[var(--accent)] hover:bg-[var(--gradient-start)] transition-colors text-left"
            >
              Contact
            </button>
          </li>
        </ul>
      )}
    </header>
  );
}
