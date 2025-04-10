import Image from "next/image";

// Portfolio items organized by your specific categories
const portfolioItems = {
  "Aerial Visions": [
    {
      src: "/drone1.JPG",
      alt: "Business Aerial",
      desc: "Drone footage for business promotions",
    },
    {
      src: "/drone2.JPG",
      alt: "Construction - Aerial View",
      desc: "Aerial shots for social media and websites",
    },
    {
      src: "/drone3.JPG",
      alt: "Business Aerial",
      desc: "Hi resolution aerial images",
    },
  ],
  Weddings: [
    {
      src: "/wedding1.JPG",
      alt: "Wedding Ceremony",
      desc: "Capturing your special day in timeless images",
    },
    {
      src: "/wedding2.JPG",
      alt: "Bride & Groom Portrait",
      desc: "Beautiful moments preserved forever",
    },
    {
      src: "/wedding3.JPG",
      alt: "Bride & Groom Portrait",
      desc: "Capturing the moments",
    },
  ],
  Portaits: [
    { src: "/baby3.JPG", alt: "Baby", desc: "New Born moments" },
    {
      src: "/baby1.jpg",
      alt: "Studio Session",
      desc: "Cherished early memories in soft, sweet photos",
    },
    {
      src: "/baby2.JPG",
      alt: "Contemporay",
      desc: "Documenting your little one’s growth",
    },
  ],
  "Wall Prints": [
    {
      src: "/nature1.jpg",
      alt: "Black Necked Stalk",
      desc: "Wildlife shots ready for printing",
    },
    {
      src: "/nature2.jpg",
      alt: "Crimson Finch",
      desc: "Wildlife shots ready for printing",
    },
    {
      src: "/nature3.JPG",
      alt: "Contemporay",
      desc: "Macro shots ready for printing",
    },
  ],
};

export default function Portfolio() {
  return (
    <div className="section-container w-full max-w-7xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-bold text-[var(--foreground)] text-center mb-12 tracking-tight"></h1>

      {/* Category Sections */}
      {Object.entries(portfolioItems).map(([category, items], idx) => (
        <section key={idx} className="mb-16">
          <h2 className="text-2xl md:text-3xl font-semibold text-[var(--accent)] mb-6 text-center">
            {category}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={600}
                  height={400}
                  className="object-cover w-full h-64 md:h-80 transition-transform duration-500 group-hover:scale-105"
                  placeholder="blur"
                  blurDataURL="/placeholder.jpg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <h3 className="text-[var(--accent)] text-lg font-semibold">
                    {item.alt}
                  </h3>
                  <p className="text-[var(--secondary)] text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
