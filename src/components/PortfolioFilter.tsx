
interface PortfolioFilterProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  searchTerm: string;
  onSearchChange: (search: string) => void;
}

export default function PortfolioFilter({ 
  categories, 
  activeCategory, 
  onCategoryChange, 
  searchTerm, 
  onSearchChange 
}: PortfolioFilterProps) {
  return (
    <div className="mb-8 space-y-4">
      {/* Search bar */}
      <div className="relative max-w-md mx-auto">
        <input
          type="text"
          placeholder="Search portfolio..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-4 py-2 pl-10 bg-[var(--gradient-start)] border border-[var(--secondary)]/20 rounded-lg text-[var(--foreground)] placeholder-[var(--secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
        />
        <svg 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--secondary)]"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Category filter buttons */}
      <div className="flex flex-wrap justify-center gap-2">
        <button
          onClick={() => onCategoryChange("All")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
            activeCategory === "All"
              ? "bg-[var(--accent)] text-[var(--background)]"
              : "bg-[var(--gradient-start)] text-[var(--foreground)] hover:bg-[var(--accent)]/20"
          }`}
        >
          All ({categories.length - 1})
        </button>
        {categories.filter(cat => cat !== "All").map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeCategory === category
                ? "bg-[var(--accent)] text-[var(--background)]"
                : "bg-[var(--gradient-start)] text-[var(--foreground)] hover:bg-[var(--accent)]/20"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}