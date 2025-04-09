import Head from "next/head";
import Link from "next/link";
import Footer from "./footer";
import Header from "./header";

export default function Home() {

  const slideshowImages = [
    "/drone1.jpg", 
    "/wedding1.jpg", 
    "/baby1.jpg", 
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)]">
      <Head>
        <title>Tx Media - Photography, Videography & Drone Services</title>
        <meta name="description" content="Tx Media by Xavier Thorbjornsen - Drone Photography, Wedding Photography, and Baby Photography in the NT." />
      </Head>
      <Header />
      {/* Main Content with Dynamic Background */}
      <main className="relative flex flex-col flex-grow items-center justify-center px-4 overflow-hidden">
        {/* Slideshow Background */}
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full slideshow">
            {slideshowImages.map((src, index) => (
              <div
                key={index}
                className="absolute inset-0 bg-cover bg-center opacity-0 animate-slide"
                style={{
                  backgroundImage: `url(${src})`,
                  animationDelay: `${index * 5}s`, // 5s per image
                }}
              />
            ))}
          </div>
          {/* Overlay to ensure text readability */}
          <div className="absolute inset-0 bg-black/40" />
        </div>
        {/* Foreground Content */}
        <div className="relative z-10 text-center section-container">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white aerial-text drop-shadow-lg">
            Tx Media
          </h1>
          <p className="mt-4 text-base sm:text-lg md:text-xl text-white drop-shadow-md">
            Drone Media, Photography, Website Media & Videography 
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-block px-6 py-3 bg-[var(--accent)] text-[var(--background)] rounded-lg hover:bg-opacity-80 transition-all duration-300"
          >
            Get in Touch
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Add this CSS in your global stylesheet (e.g., globals.css)
const slideshowCSS = `
  .slideshow {
    position: relative;
    width: 100%;
    height: 100%;
  }
  .animate-slide {
    animation: slideshow 15s infinite;
  }
  @keyframes slideshow {
    0%, 33.33% { opacity: 1; }
    33.34%, 100% { opacity: 0; }
  }
`;