import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { GiftingModeProvider } from "@/context/GiftingModeContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

export const metadata: Metadata = {
  title: "The Achar Project",
  description: "Authentic, homemade Rajasthani pickles straight from Jaipur.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <GiftingModeProvider>
            <Navbar />
            <CartDrawer />
            <main style={{ minHeight: 'calc(100vh - 300px)' }}>
              {children}
            </main>
            <Footer />
          </GiftingModeProvider>
        </CartProvider>
      </body>
    </html>
  );
}

