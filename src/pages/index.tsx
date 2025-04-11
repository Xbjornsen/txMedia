import Head from "next/head";
import Link from "next/link";
import Packages from "./packages"; // Reusing your Packages page as a component
import About from "./about";
import Contact from "./contact";
import Portfolio from "./portfolio";

export default function Home() {
  const slideshowImages = ["/drone1.JPG", "/wedding1.JPG", "/baby1.jpg"];

  return (
    <div className="flex flex-col bg-[var(--background)]">
      <Head>
        <title>Tx Media - Photography, Videography & Drone Services</title>
        <meta
          name="description"
          content="Tx Media by Xavier Thorbjornsen - Drone Photography, Wedding Photography, and Baby Photography in the NT."
        />
      </Head>

      {/* Mobile: Stacked Sections, Desktop: Home Only */}
      <main className="flex flex-col flex-grow">
        {/* Home Section */}
        <section
          id="home"
          className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden"
        >
          <div className="absolute inset-0 z-0">
            <div className="w-full h-full slideshow">
              {slideshowImages.map((src, index) => (
                <div
                  key={index}
                  className="absolute inset-0 bg-cover bg-center opacity-0 animate-slide"
                  style={{
                    backgroundImage: `url(${src})`,
                    animationDelay: `${index * 5}s`,
                  }}
                />
              ))}
            </div>
            <div className="absolute inset-0 bg-black/40" />
          </div>
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
        </section>

        {/* Mobile-Only Sections */}
        <section
          id="portfolio"
          className="md:hidden px-4 py-4 bg-[var(--background)]"
        >
          <Portfolio />
        </section>

        <section
          id="packages"
          className="md:hidden px-4 py-4 bg-[var(--background)]"
        >
          <Packages />
        </section>

        <section
          id="about"
          className="md:hidden px-4 py-4 bg-[var(--background)]"
        >
          <About />
        </section>

        <section
          id="contact"
          className="md:hidden px-4 py-4 bg-[var(--background)]"
        >
          <Contact />
        </section>
      </main>
    </div>
  );
}
