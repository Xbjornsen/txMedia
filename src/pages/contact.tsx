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
      
      {/* Full viewport height container with background */}
      <div className="min-h-screen relative flex items-center justify-center">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/contact.jpg')" }}
        >
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60" />
        </div>
        
        {/* Content Container */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Side - Hero Content */}
            <div className="text-white space-y-6">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-tight">
                  Let&apos;s Create
                  <span className="block text-[var(--accent)]">Something Amazing</span>
                </h1>
                <p className="text-xl lg:text-2xl text-gray-200 leading-relaxed">
                  Ready to capture your special moments? 
                  <span className="block">Get in touch today.</span>
                </p>
              </div>
              
              {/* Services List */}
              <div className="grid sm:grid-cols-2 gap-4 pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[var(--accent)] rounded-full"></div>
                  <span className="text-gray-300">Drone Photography</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[var(--accent)] rounded-full"></div>
                  <span className="text-gray-300">Wedding Photography</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[var(--accent)] rounded-full"></div>
                  <span className="text-gray-300">Portrait Sessions</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[var(--accent)] rounded-full"></div>
                  <span className="text-gray-300">Commercial Content</span>
                </div>
              </div>
            </div>
            
            {/* Right Side - Contact Card */}
            <div className="flex justify-center lg:justify-end">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 lg:p-10 shadow-2xl max-w-lg w-full">
                <div className="text-center space-y-6">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    Get In Touch
                  </h2>
                  
                  {/* Contact Methods */}
                  <div className="space-y-4">
                    {/* Email */}
                    <a
                      href="mailto:txfotography@gmail.com"
                      className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all duration-300 group min-h-[60px]"
                    >
                      <div className="w-12 h-12 bg-[var(--accent)]/10 rounded-full flex items-center justify-center group-hover:bg-[var(--accent)]/20 transition-colors">
                        <svg
                          className="w-6 h-6 text-[var(--accent)]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">Email</p>
                        <p className="text-[var(--accent)] font-medium">txfotography@gmail.com</p>
                      </div>
                    </a>
                    
                    {/* Instagram */}
                    <a
                      href="https://www.instagram.com/txmedia_nt"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all duration-300 group min-h-[60px]"
                    >
                      <div className="w-12 h-12 bg-[var(--accent)]/10 rounded-full flex items-center justify-center group-hover:bg-[var(--accent)]/20 transition-colors">
                        <svg
                          className="w-6 h-6 text-[var(--accent)]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
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
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">Instagram</p>
                        <p className="text-[var(--accent)] font-medium">@txmedia_nt</p>
                      </div>
                    </a>

                    {/* Phone (if you want to add it) */}
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 min-h-[60px]">
                      <div className="w-12 h-12 bg-[var(--accent)]/10 rounded-full flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-[var(--accent)]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">Location</p>
                        <p className="text-gray-600">Darwin, Northern Territory</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Response Time */}
                  <div className="pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Usually responds within 24 hours
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
