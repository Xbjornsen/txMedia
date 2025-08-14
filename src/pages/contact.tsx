import Head from "next/head";

export default function Contact() {
  return (
    <>
      <Head>
        <title>Contact Tx Media</title>
        <meta
          name="description"
          content="Get in touch with Tx Media for photography, videography, and drone media services in the NT."
        />
      </Head>
      <div
        className="px-4 py-12 bg-cover bg-center relative"
        style={{ backgroundImage: "url('/contact.jpg')" }}
      >
        {/* Overlay for background image */}
        <div className="absolute inset-0 bg-black/20 z-0" />
        <div className="section-container w-full max-w-4xl mx-auto relative z-10">
          <div className="flex justify-center">
            {/* Contact Information */}
            <div className="text-center bg-[var(--background)]/80 rounded-xl p-8 max-w-2xl w-full">
              <h1 className="text-4xl md:text-5xl font-bold text-[var(--neutral-light)] mb-8 tracking-tight">
                Let’s Create Something Amazing
              </h1>
              <p className="text-[var(--neutral-light)] text-lg mb-6">
                Whether it’s updating Business website content, portrait
                photography, or drone media for your next project, Tx Media is
                here to help. Reach out today!
              </p>
              <div className="flex flex-col items-center gap-4">
                {/* Email Link */}
                <a
                  href="mailto:txfotography@gmail.com"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--accent)]/10 transition-colors min-h-[44px]"
                >
                  <svg
                    className="w-6 h-6 text-[var(--neutral-light)]"
                    fill="none"
                    stroke="var(--secondary-alt)"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 8l9 6 9-6M3 8v8l9 6 9-6V8"
                    />
                  </svg>
                  <span className="text-[var(--neutral-light)] hover:text-[var(--accent)] transition-colors text-lg">
                    txfotography@gmail.com
                  </span>
                </a>
                {/* Instagram Link */}
                <a
                  href="https://www.instagram.com/txmedia_nt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--accent)]/10 transition-colors min-h-[44px]"
                >
                  <svg
                    className="w-6 h-6 text-[var(--secondary)]"
                    fill="none"
                    stroke="var(--secondary-alt)"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 3h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7a4 4 0 014-4z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 15a3 3 0 100-6 3 3 0 000 6z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 7h.01"
                    />
                  </svg>
                  <span className="text-[var(--neutral-light)] hover:text-[var(--accent)] transition-colors text-lg">
                    @txmedia_nt
                  </span>
                </a>
                <p className="text-[var(--neutral-light)] text-sm">
                  Based in the Northern Territory • Available for bookings
                  across Darwin
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
