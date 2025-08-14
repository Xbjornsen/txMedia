import { useEffect } from "react";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoSrc: string;
  title: string;
  description: string;
}

export default function VideoModal({ isOpen, onClose, videoSrc, title, description }: VideoModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="relative max-w-6xl max-h-full w-full flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-white hover:text-[var(--accent)] transition-colors p-2 bg-black/50 rounded-full"
          aria-label="Close modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Video container */}
        <div className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden">
          <video
            src={videoSrc}
            controls
            autoPlay
            className="w-full h-full object-cover"
            poster="/placeholder.jpg"
          >
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Video info */}
        <div className="mt-6 text-center text-white max-w-2xl">
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-sm text-gray-300">{description}</p>
        </div>

        {/* Navigation hint */}
        <div className="absolute bottom-4 right-4 text-white/70 text-sm">
          Press ESC to close
        </div>
      </div>
    </div>
  );
}