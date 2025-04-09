import Header from "./header";
import Footer from "./footer";

export default function About() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)]">
      <Header />
      <main className="flex flex-col flex-grow items-center justify-center px-4">
        <div className="section-container text-center w-full max-w-7xl">
          <h1 className="text-4xl font-bold text-[var(--foreground)] mb-8 tracking-tight">
            About Tx Media
          </h1>
          <div className="max-w-2xl mx-auto text-[var(--secondary)] text-lg">
            <p className="mb-4">
              Tx Media is your go-to media solution in the Northern Territory (NT), specializing in photography, videography, and drone media. 
            </p>
            <p className="mb-4">
              We create stunning visual content for social media, websites, and everything in between. Whether you need captivating aerial shots, professional photos, or dynamic videos, we’ve got you covered.
            </p>
            <p>
              Based in the NT, Tx Media is passionate about bringing your vision to life through high-quality media tailored to your needs.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}