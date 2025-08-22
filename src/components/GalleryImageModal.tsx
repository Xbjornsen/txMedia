import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { GalleryImage } from "@/types/gallery";

interface GalleryImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: GalleryImage[];
  currentIndex: number;
  onNavigate: (index: number) => void;
  onToggleFavorite?: (imageId: string) => void;
  onDownload?: (imageId: string, fileName: string) => void;
  showActions?: boolean;
  downloadLimit?: number;
  downloadsUsed?: number;
}

export default function GalleryImageModal({ 
  isOpen, 
  onClose, 
  images, 
  currentIndex, 
  onNavigate,
  onToggleFavorite,
  onDownload,
  showActions = false,
  downloadLimit,
  downloadsUsed
}: GalleryImageModalProps) {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  
  const currentImage = images[currentIndex];
  const canDownload = !downloadLimit || !downloadsUsed || downloadsUsed < downloadLimit;

  const navigatePrevious = useCallback(() => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  }, [currentIndex, onNavigate]);

  const navigateNext = useCallback(() => {
    if (currentIndex < images.length - 1) {
      onNavigate(currentIndex + 1);
    }
  }, [currentIndex, images.length, onNavigate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          navigatePrevious();
          break;
        case 'ArrowRight':
          navigateNext();
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      setIsImageLoading(true);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, navigatePrevious, navigateNext]);

  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    
    const currentTouch = e.targetTouches[0].clientX;
    const diff = touchStart - currentTouch;
    
    if (Math.abs(diff) > 50) { // Minimum swipe distance
      if (diff > 0) {
        navigateNext();
      } else {
        navigatePrevious();
      }
      setTouchStart(null);
    }
  };

  const handleTouchEnd = () => {
    setTouchStart(null);
  };

  if (!isOpen || !currentImage) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/95 flex items-center justify-center z-50"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        className="relative w-full h-full flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Loading spinner */}
        {isImageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              <p className="text-white text-sm">Loading image...</p>
            </div>
          </div>
        )}

        {/* Main Image */}
        <div className="relative max-w-full max-h-full">
          <Image
            src={currentImage.filePath}
            alt={currentImage.originalName || currentImage.fileName}
            width={currentImage.width}
            height={currentImage.height}
            className={`object-contain max-w-full max-h-full transition-opacity duration-300 ${
              isImageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            sizes="100vw"
            priority
            onLoad={handleImageLoad}
          />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 text-white hover:text-[var(--accent)] transition-colors p-3 bg-black/50 rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Close modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            {/* Previous */}
            <button
              onClick={navigatePrevious}
              disabled={currentIndex === 0}
              className={`absolute left-4 top-1/2 transform -translate-y-1/2 z-20 p-3 bg-black/50 rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors ${
                currentIndex === 0 
                  ? 'text-white/30 cursor-not-allowed' 
                  : 'text-white hover:text-[var(--accent)] hover:bg-black/70'
              }`}
              aria-label="Previous image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Next */}
            <button
              onClick={navigateNext}
              disabled={currentIndex === images.length - 1}
              className={`absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-3 bg-black/50 rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors ${
                currentIndex === images.length - 1 
                  ? 'text-white/30 cursor-not-allowed' 
                  : 'text-white hover:text-[var(--accent)] hover:bg-black/70'
              }`}
              aria-label="Next image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Image counter */}
        <div className="absolute top-4 left-4 z-20 px-3 py-2 bg-black/50 text-white rounded-lg text-sm">
          {currentIndex + 1} / {images.length}
        </div>

        {/* Image info and actions */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-6 text-white">
          <div className="max-w-4xl mx-auto">
            {/* Image title */}
            <h3 className="text-lg font-semibold mb-2">
              {currentImage.originalName || currentImage.fileName}
            </h3>

            {/* Action buttons */}
            {showActions && (
              <div className="flex flex-wrap gap-3 items-center">
                {/* Favorite button */}
                {onToggleFavorite && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(currentImage.id);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      currentImage.isFavorite
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    <span className="hidden sm:inline">
                      {currentImage.isFavorite ? 'Remove Favorite' : 'Add to Favorites'}
                    </span>
                  </button>
                )}

                {/* Download button */}
                {onDownload && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownload(currentImage.id, currentImage.originalName || currentImage.fileName);
                    }}
                    disabled={!canDownload}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      canDownload
                        ? 'bg-[var(--accent)] text-[var(--background)] hover:bg-opacity-80'
                        : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="hidden sm:inline">Download</span>
                  </button>
                )}

                {/* Download limit info */}
                {downloadLimit && downloadsUsed !== undefined && (
                  <div className="text-sm text-white/70 ml-auto">
                    Downloads: {downloadsUsed}/{downloadLimit}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="absolute bottom-4 right-4 text-white/70 text-sm hidden lg:block">
          <div className="flex flex-col items-end gap-1">
            <div>← → Navigate</div>
            <div>ESC Close</div>
          </div>
        </div>

        {/* Mobile swipe hint */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/70 text-sm lg:hidden">
          Swipe to navigate
        </div>
      </div>
    </div>
  );
}