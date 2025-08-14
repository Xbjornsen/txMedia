import Image from "next/image";
import Head from "next/head";
import { useState, useMemo } from "react";
import ImageSkeleton from "../components/ImageSkeleton";
import ImageModal from "../components/ImageModal";
import VideoModal from "../components/VideoModal";
import PortfolioFilter from "../components/PortfolioFilter";

// Portfolio items organized by your specific categories
interface PortfolioItem {
  src: string;
  alt: string;
  desc: string;
  type: 'image' | 'video';
  thumbnail?: string;
}

interface PortfolioItems {
  [key: string]: PortfolioItem[];
}

const portfolioItems: PortfolioItems = {
  "Aerial Visions": [
    {
      src: "/dutches.jpg",
      alt: "Business Aerial",
      desc: "Drone footage for business promotions",
      type: "image",
    },
    {
      src: "/construction.jpg",
      alt: "Construction - Aerial View",
      desc: "Aerial shots for social media and websites",
      type: "image",
    },
    {
      src: "/business.jpg",
      alt: "Business Aerial",
      desc: "Hi resolution aerial images",
      type: "image",
    },
    {
      src: "/videos/aerial-demo.mp4",
      alt: "Aerial Drone Reel",
      desc: "Sample drone footage showcasing smooth cinematic movements",
      type: "video",
      thumbnail: "/business.jpg",
    },
  ],
  Weddings: [
    {
      src: "/wedding_hill.jpg",
      alt: "Wedding Ceremony",
      desc: "Capturing your special day in timeless images",
      type: "image",
    },
    {
      src: "/brides.jpg",
      alt: "Bride & Groom Portrait",
      desc: "Beautiful moments preserved forever",
      type: "image",
    },
    {
      src: "/wedding_ring.jpg",
      alt: "Bride & Groom Portrait",
      desc: "Capturing the moments",
      type: "image",
    },
    {
      src: "/wedding_couple_portrait.jpg",
      alt: "Wedding Couple Portrait",
      desc: "Intimate couple portrait capturing love and connection",
      type: "image",
    },
    {
      src: "/wedding_ceremony_outdoor.jpg", 
      alt: "Outdoor Wedding Ceremony",
      desc: "Beautiful outdoor ceremony in natural setting",
      type: "image",
    },
    {
      src: "/wedding_bride_dress.jpg",
      alt: "Bride in Wedding Dress",
      desc: "Elegant bridal portrait showcasing dress details",
      type: "image",
    },
    {
      src: "/videos/wedding-highlight.mp4",
      alt: "Wedding Highlight Reel",
      desc: "Emotional wedding moments captured in cinematic style",
      type: "video",
      thumbnail: "/wedding_hill.jpg",
    },
  ],
  Portraits: [
    { src: "/infant.jpg", alt: "Baby", desc: "New Born moments", type: "image" },
    {
      src: "/baby_portrait.jpg",
      alt: "Studio Session",
      desc: "Cherished early memories in soft, sweet photos",
      type: "image",
    },
    {
      src: "/baby_farm.jpg",
      alt: "Contemporay",
      desc: "Documenting your little one's growth",
      type: "image",
    },
  ],
  "Wall Prints": [
    {
      src: "/black_necked_stalk.jpg",
      alt: "Black Necked Stalk",
      desc: "Wildlife shots ready for printing",
      type: "image",
    },
    {
      src: "/crimson_finch.jpg",
      alt: "Crimson Finch",
      desc: "Wildlife shots ready for printing",
      type: "image",
    },
    {
      src: "/suculant.jpg",
      alt: "Contemporay",
      desc: "Macro shots ready for printing",
      type: "image",
    },
    {
      src: "/rainbow_bee_eater.jpg",
      alt: "Rainbow Bee-eater",
      desc: "Colorful bird captured in natural habitat",
      type: "image",
    },
    {
      src: "/lightning_storm.jpg",
      alt: "Lightning Storm",
      desc: "Dramatic weather photography perfect for large prints",
      type: "image",
    },
    {
      src: "/red_headed_finch.jpg",
      alt: "Red-headed Finch",
      desc: "Beautiful bird portrait with shallow depth of field",
      type: "image",
    },
  ],
};

export default function Portfolio() {
  const [loadingImages, setLoadingImages] = useState<{[key: string]: boolean}>({});
  const [selectedImage, setSelectedImage] = useState<{
    src: string;
    alt: string;
    title: string;
    description: string;
  } | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<{
    src: string;
    title: string;
    description: string;
  } | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const categories = ["All", ...Object.keys(portfolioItems)];

  const filteredItems = useMemo(() => {
    let filtered: PortfolioItems = portfolioItems;
    
    // Filter by category
    if (activeCategory !== "All") {
      filtered = { [activeCategory]: portfolioItems[activeCategory] || [] };
    }
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const searchFiltered: PortfolioItems = {};
      
      Object.entries(filtered).forEach(([category, items]) => {
        const matchingItems = items.filter(item => 
          item.alt.toLowerCase().includes(searchLower) ||
          item.desc.toLowerCase().includes(searchLower) ||
          category.toLowerCase().includes(searchLower)
        );
        
        if (matchingItems.length > 0) {
          searchFiltered[category] = matchingItems;
        }
      });
      
      return searchFiltered;
    }
    
    return filtered;
  }, [activeCategory, searchTerm]);

  const handleImageLoad = (imageKey: string) => {
    setLoadingImages(prev => ({ ...prev, [imageKey]: false }));
  };

  const handleImageLoadStart = (imageKey: string) => {
    setLoadingImages(prev => ({ ...prev, [imageKey]: true }));
  };

  const openImageModal = (item: PortfolioItem, category: string) => {
    if (item.type === 'video') {
      setSelectedVideo({
        src: item.src,
        title: item.alt,
        description: `${item.desc} - ${category} Collection`
      });
    } else {
      setSelectedImage({
        src: item.src,
        alt: item.alt,
        title: item.alt,
        description: `${item.desc} - ${category} Collection`
      });
    }
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  const closeVideoModal = () => {
    setSelectedVideo(null);
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

      {/* Filter and Search */}
      <PortfolioFilter
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Results count */}
      {searchTerm && (
        <div className="text-center mb-6">
          <p className="text-[var(--secondary)]">
            {Object.values(filteredItems).flat().length} result(s) for &quot;{searchTerm}&quot;
          </p>
        </div>
      )}

      {/* Category Sections */}
      {Object.entries(filteredItems).map(([category, items], idx) => (
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
                  className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                  onClick={() => openImageModal(item, category)}
                >
                  {isLoading && (
                    <div className="absolute inset-0 z-10">
                      <ImageSkeleton />
                    </div>
                  )}
                  {item.type === 'video' ? (
                    <div className="relative w-full h-64 md:h-80">
                      <Image
                        src={item.thumbnail || '/placeholder.jpg'}
                        alt={item.alt}
                        width={600}
                        height={400}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                        onLoadStart={() => handleImageLoadStart(imageKey)}
                        onLoad={() => handleImageLoad(imageKey)}
                      />
                      {/* Play button overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-black/60 rounded-full flex items-center justify-center group-hover:bg-[var(--accent)]/80 transition-colors">
                          <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  ) : (
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
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <h3 className="text-[var(--accent)] text-lg font-semibold">
                      {item.alt}
                    </h3>
                    <p className="text-[var(--secondary)] text-sm">{item.desc}</p>
                    <div className="mt-2 flex items-center gap-2">
                      {item.type === 'video' ? (
                        <>
                          <svg className="w-4 h-4 text-[var(--accent)]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                          <span className="text-xs text-[var(--secondary)]">Click to play video</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <span className="text-xs text-[var(--secondary)]">Click to view full size</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {/* No results message */}
      {Object.keys(filteredItems).length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">No results found</h3>
          <p className="text-[var(--secondary)]">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>

    {/* Image Modal */}
    {selectedImage && (
      <ImageModal
        isOpen={!!selectedImage}
        onClose={closeImageModal}
        src={selectedImage.src}
        alt={selectedImage.alt}
        title={selectedImage.title}
        description={selectedImage.description}
      />
    )}

    {/* Video Modal */}
    {selectedVideo && (
      <VideoModal
        isOpen={!!selectedVideo}
        onClose={closeVideoModal}
        videoSrc={selectedVideo.src}
        title={selectedVideo.title}
        description={selectedVideo.description}
      />
    )}
    </>
  );
}
