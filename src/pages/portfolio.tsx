import Image from "next/image";
import Head from "next/head";
import { useState } from "react";
import ImageSkeleton from "../components/ImageSkeleton";

// Portfolio items organized by your specific categories
const portfolioItems = {
  "Aerial Visions": [
    {
      src: "/dutches.jpg",
      alt: "Business Aerial",
      desc: "Drone footage for business promotions",
    },
    {
      src: "/construction.jpg",
      alt: "Construction - Aerial View",
      desc: "Aerial shots for social media and websites",
    },
    {
      src: "/business.jpg",
      alt: "Business Aerial",
      desc: "Hi resolution aerial images",
    },
  ],
  Weddings: [
    {
      src: "/wedding_hill.jpg",
      alt: "Wedding Ceremony",
      desc: "Capturing your special day in timeless images",
    },
    {
      src: "/brides.jpg",
      alt: "Bride & Groom Portrait",
      desc: "Beautiful moments preserved forever",
    },
    {
      src: "/wedding_ring.jpg",
      alt: "Bride & Groom Portrait",
      desc: "Capturing the moments",
    },
  ],
  Portraits: [
    { src: "/infant.jpg", alt: "Baby", desc: "New Born moments" },
    {
      src: "/baby_portrait.jpg",
      alt: "Studio Session",
      desc: "Cherished early memories in soft, sweet photos",
    },
    {
      src: "/baby_farm.jpg",
      alt: "Contemporay",
      desc: "Documenting your little one’s growth",
    },
  ],
  "Wall Prints": [
    {
      src: "/black_necked_stalk.jpg",
      alt: "Black Necked Stalk",
      desc: "Wildlife shots ready for printing",
    },
    {
      src: "/crimson_finch.jpg",
      alt: "Crimson Finch",
      desc: "Wildlife shots ready for printing",
    },
    {
      src: "/suculant.jpg",
      alt: "Contemporay",
      desc: "Macro shots ready for printing",
    },
    {
      src: "/rainbow_bee_eater.jpg",
      alt: "Rainbow Bee-eater",
      desc: "Colorful bird captured in natural habitat",
    },
    {
      src: "/lightning_storm.jpg",
      alt: "Lightning Storm",
      desc: "Dramatic weather photography perfect for large prints",
    },
    {
      src: "/red_headed_finch.jpg",
      alt: "Red-headed Finch",
      desc: "Beautiful bird portrait with shallow depth of field",
    },
  ],
};

export default function Portfolio() {
  const [loadingImages, setLoadingImages] = useState<{[key: string]: boolean}>({});

  const handleImageLoad = (imageKey: string) => {
    setLoadingImages(prev => ({ ...prev, [imageKey]: false }));
  };

  const handleImageLoadStart = (imageKey: string) => {
    setLoadingImages(prev => ({ ...prev, [imageKey]: true }));
  };

  return (
    <>
      <Head>
        <title>Portfolio - Tx Media</title>
        <meta
          name="description"
          content="Explore Tx Media's portfolio featuring aerial drone photography, wedding photography, portrait sessions, and wall prints in the Northern Territory."
        />
      </Head>
      <div className="section-container w-full max-w-7xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-bold text-[var(--foreground)] text-center mb-12 tracking-tight">Our Portfolio</h1>

      {/* Category Sections */}
      {Object.entries(portfolioItems).map(([category, items], idx) => (
        <section key={idx} className="mb-16">
          <h2 className="text-2xl md:text-3xl font-semibold text-[var(--accent)] mb-6 text-center">
            {category}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item, index) => {
              const imageKey = `${category}-${index}`;
              const isLoading = loadingImages[imageKey];
              
              return (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isLoading && (
                    <div className="absolute inset-0 z-10">
                      <ImageSkeleton />
                    </div>
                  )}
                  <Image
                    src={item.src}
                    alt={item.alt}
                    width={600}
                    height={400}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover w-full h-64 md:h-80 transition-transform duration-500 group-hover:scale-105"
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                    priority={idx === 0 && index < 3}
                    loading={idx === 0 && index < 3 ? "eager" : "lazy"}
                    onLoadStart={() => handleImageLoadStart(imageKey)}
                    onLoad={() => handleImageLoad(imageKey)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <h3 className="text-[var(--accent)] text-lg font-semibold">
                      {item.alt}
                    </h3>
                    <p className="text-[var(--secondary)] text-sm">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
    </>
  );
}
