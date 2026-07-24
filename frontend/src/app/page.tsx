import { ConnectButtonCustom } from "../features/auth/connect-button";

// Just proof of concept could definitely split up some things like the header or the footer into different files
export default function Home() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0B0E14] font-sans antialiased selection:bg-[#F59E0B] selection:text-[#0B0E14]">
      <nav className="border-b bg-primary border-[#0B0E14] px-6 py-4">
        <div className="text-[#F8FAFC] max-w-6xl mx-auto flex justify-between items-center">
          <div className="font-mono font-bold text-2xl tracking-tight">
            wwwEd
          </div>
          <div className="flex items-center gap-6 text-sm font-medium">
            <ConnectButtonCustom />
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6">
        <section className="pt-15">
          <div className="">
            
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking text-[#0B0E14] leading-[1.08]">
              Private, verifiable education. <br />
            </h1>

            <p className="mt-6 text-lg text-slate-700 leading-relaxed max-w-2xl">
              Complete learning modules and receive tokens locked directly to your wallet address. They cannot be transferred, sold, or spoofed, giving employers and schools instantly verifiable proof.
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

      <footer className="text-center border-t border-[#0B0E14] py-8 text-xs font-mono text-slate-600">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <div>wwwEd - Decentralized Education Verification</div>
        </div>
      </footer>
    </div>
  );
}