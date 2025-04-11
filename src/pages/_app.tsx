import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Header from "./header";
import Footer from "./footer";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)]">
      <Header />
      <main className="flex flex-col flex-grow">
        <Component {...pageProps} />
      </main>
      <Footer />
    </div>
  );
}
