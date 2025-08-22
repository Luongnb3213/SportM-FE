import "./globals.css";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import { geistSans, geistMono, bigShoulders } from "@/styles/fonts";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${bigShoulders.variable}`}
    >
      {/* body mặc định dùng Geist (font-sans) */}
      <body className="flex flex-col min-h-screen font-sans">
        <Header />
        <main className="flex-1 p-6">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
