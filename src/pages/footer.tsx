export default function Footer() {
  return (
    <footer className="bg-[var(--background)] border-t border-[var(--secondary)]/20 py-1 md:py-2">
      <div className="max-w-7xl mx-auto px-4 py-2 md:py-4 text-center text-[var(--secondary)] text-xs sm:text-sm md:text-base">
        <p>
          © {new Date().getFullYear()} TX Media by Xavier Thorbjornsen. All
          rights reserved.
        </p>
        <div className="mt-2 flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
          {/* Email Link */}
          <p className="flex items-center gap-2">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--secondary)] group-hover:text-[var(--accent)]"
              fill="none"
              stroke="var(--secondary-alt)"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 8l9 6 9-6M3 8v8l9 6 9-6V8"
              />
            </svg>
            <a
              href="mailto:txfotography@gmail.com"
              className="hover:text-[var(--accent)] transition-colors"
            >
              txfotography@gmail.com
            </a>
          </p>
          {/* Instagram Link */}
          <p className="flex items-center gap-2">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--secondary)] group-hover:text-[var(--accent)]"
              fill="none"
              stroke="var(--secondary-alt)"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 3h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7a4 4 0 014-4z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 15a3 3 0 100-6 3 3 0 000 6z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 7h.01"
              />
            </svg>
            <a
              href="https://www.instagram.com/txmedia_nt"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--accent)] transition-colors"
            >
              @txmedia_nt
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
