import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import Header from "./header";
import Footer from "./footer";
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
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
