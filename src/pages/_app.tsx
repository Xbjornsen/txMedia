import "@/styles/globals.css";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Footer from "./footer";
import Header from "./header";

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  
  // Fix hydration mismatch by removing router.isReady check
  const isGalleryPage = router.pathname.startsWith('/gallery');
  const isAdminPage = router.pathname.startsWith('/admin');

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }
  }, []);

  return (
    <>
      {isGalleryPage || isAdminPage ? (
        // Gallery and admin pages don't use NextAuth SessionProvider
        <Component {...pageProps} />
      ) : (
        // Main pages use NextAuth SessionProvider
        <SessionProvider session={pageProps.session}>
          <div className="flex flex-col min-h-screen bg-[var(--background)]">
            <Header />
            <main className="flex flex-col flex-grow">
              <Component {...pageProps} />
            </main>
            <Footer />
          </div>
        </SessionProvider>
      )}
    </>
  );
}
