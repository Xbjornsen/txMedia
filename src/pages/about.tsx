import Head from "next/head";

export default function About() {
  return (
    <>
      <Head>
        <title>About Tx Media - Professional Photography NT</title>
        <meta
          name="description"
          content="Learn about Tx Media, Northern Territory's professional photography and videography service specializing in drone media, weddings, and portraits."
        />
      </Head>
      <div className="section-container text-center w-full max-w-7xl px-4 py-4 md:py-8">
      <h1 className="text-4xl md:text-5xl font-bold text-[var(--neutral-light)] mb-6 md:mb-8 tracking-tight drop-shadow-md">
        About Tx Media
      </h1>
      <div className="max-w-4xl mx-auto text-lg bg-[var(--background)]/80 rounded-xl p-6 md:p-8">
        <div className="grid md:grid-cols-2 gap-8 items-center mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-[var(--accent)] mb-4">
              Xavier Thorbjornsen
            </h2>
            <p className="mb-4 text-[var(--neutral-light)] drop-shadow-sm">
              Based in the Northern Territory, Xavier brings passion and expertise to every shoot. 
              Specializing in drone photography, wedding documentation, and portrait sessions, 
              Tx Media combines technical skill with creative vision.
            </p>
            <p className="mb-4 text-[var(--neutral-light)] drop-shadow-sm">
              From capturing breathtaking aerial perspectives to intimate portrait moments, 
              we create stunning visual content for social media, websites, businesses, and personal memories.
            </p>
          </div>
          <div className="text-center">
            <div className="w-48 h-48 mx-auto bg-[var(--gradient-start)] rounded-full flex items-center justify-center border-4 border-[var(--accent)]/20">
              <span className="text-6xl text-[var(--accent)]">📸</span>
            </div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div className="bg-[var(--gradient-start)] rounded-lg p-4">
            <h3 className="text-[var(--secondary-alt)] font-semibold mb-2">Drone Media</h3>
            <p className="text-[var(--neutral-light)] text-sm">
              Professional aerial photography and videography for businesses and events
            </p>
          </div>
          <div className="bg-[var(--gradient-start)] rounded-lg p-4">
            <h3 className="text-[var(--secondary-alt)] font-semibold mb-2">Wedding Photography</h3>
            <p className="text-[var(--neutral-light)] text-sm">
              Capturing your special day with timeless, emotional storytelling
            </p>
          </div>
          <div className="bg-[var(--gradient-start)] rounded-lg p-4">
            <h3 className="text-[var(--secondary-alt)] font-semibold mb-2">Portrait Sessions</h3>
            <p className="text-[var(--neutral-light)] text-sm">
              Professional portraits for families, newborns, and individual clients
            </p>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-[var(--neutral-light)] drop-shadow-sm">
            Every project is approached with professionalism, creativity, and attention to detail. 
            Let&apos;s bring your vision to life through high-quality media tailored to your needs.
          </p>
        </div>
      </div>
    </div>
    </>
  );
}
