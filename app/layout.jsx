import { Sarabun } from "next/font/google";
import "./globals.css";
import Navbar from "@/layout/navbar";
import Footer from "@/layout/footer";
import { AppProvider } from "@/context/app-context";

const kanit = Sarabun({
  subsets: ["thai"],
  weight: ["400", "600", "800"],
});

export const metadata = {
  title: "ezy-commerce",
  description: "ระบบซื้อขายออนไลน์",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${kanit.className} antialiased`}>
        <AppProvider>
          <Navbar />

          <div className="w-full bg-gray-50 h-full flex flex-col items-center">
            {children}
            <Footer />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
