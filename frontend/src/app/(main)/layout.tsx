import AuthHeader from "@/components/layout/auth-header";
import Footer from "@/components/layout/footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0B0E14] font-sans antialiased selection:bg-[#F59E0B] selection:text-[#0B0E14]">
      <AuthHeader />
      <main className="flex-1 max-w-6xl mx-auto px-6 w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
}