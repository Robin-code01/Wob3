// src/app/page.tsx
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import AuthHeader from "@/components/layout/auth-header";
import Footer from "@/components/layout/footer";

export default async function Home() {
  const session = await auth();

  // If already logged in, send them straight to /home
  if (session) {
    redirect("/home");
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0B0E14] font-sans antialiased selection:bg-[#F59E0B] selection:text-[#0B0E14]">
      <AuthHeader />

      <main className="flex-1 max-w-6xl mx-auto px-6">
        <section className="pt-15">
          <div>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking text-[#0B0E14] leading-[1.08]">
              Concrete, verifiable education. <br />
            </h1>
            <p className="mt-6 text-lg text-slate-700 leading-relaxed max-w-2xl">
              Complete learning modules and receive tokens locked directly to your wallet address.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="font-mono text-xs font-bold tracking-widest text-slate-500 uppercase mb-8">
            How it works
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 border border-[#0B0E14] bg-white">
              <div className="font-mono text-xl font-bold text-primary mb-2">01</div>
              <h3 className="font-bold text-lg mb-2">Sign In with your wallet</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Connect your web3 wallet to establish your identity. No bloated accounts or passwords needed.
              </p>
            </div>

            <div className="p-6 border border-[#0B0E14] bg-white">
              <div className="font-mono text-xl font-bold text-primary mb-2">02</div>
              <h3 className="font-bold text-lg mb-2">Complete Modules</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Complete education modules. Once passed, mint an untransferable certification.
              </p>
            </div>

            <div className="p-6 border border-[#0B0E14] bg-white">
              <div className="font-mono text-xl font-bold text-primary mb-2">03</div>
              <h3 className="font-bold text-lg mb-2">Verify Yourself</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Use your certifications as proof for the workplace, for your education, and more.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}