import "./globals.css";
import Navbar from "@/components/elements/Navbar";
import Footer from "@/components/elements/Footer";




export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
      
      
    </>
    
  );
}
