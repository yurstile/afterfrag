import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <header className="bg-slate-800/90 backdrop-blur-sm shadow-lg border-b border-blue-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-blue-300 hover:text-blue-100 hover:bg-blue-800/50"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-wygsedFsbzUPP0F7Z988Qqr7NPP93N.png"
                  alt="Logo"
                  className="h-6 w-6"
                />
                <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  Afterfrag
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-slate-800/50 backdrop-blur-sm border-blue-500/20 shadow-xl shadow-blue-500/10">
          <CardHeader>
            <CardTitle className="text-3xl text-white">Terms of Service</CardTitle>
            <p className="text-blue-300">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose max-w-none text-slate-300">
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3 text-white">1. Acceptance of Terms</h2>
                <p className="leading-relaxed">
                  By accessing and using Afterfrag ("the Service"), you accept and agree to be bound by the terms and
                  provision of this agreement. If you do not agree to abide by the above, please do not use this
                  service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-white">2. Use License</h2>
                <p className="leading-relaxed">
                  Permission is granted to temporarily download one copy of Afterfrag for personal, non-commercial
                  transitory viewing only. This is the grant of a license, not a transfer of title, and under this
                  license you may not:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>modify or copy the materials</li>
                  <li>use the materials for any commercial purpose or for any public display</li>
                  <li>attempt to reverse engineer any software contained on the website</li>
                  <li>remove any copyright or other proprietary notations from the materials</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-white">3. User Accounts</h2>
                <p className="leading-relaxed">
                  When you create an account with us, you must provide information that is accurate, complete, and
                  current at all times. You are responsible for safeguarding the password and for all activities that
                  occur under your account.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-white">4. Community Guidelines</h2>
                <p className="leading-relaxed">
                  Users must follow our community guidelines when participating in Fragsubs. This includes but is not
                  limited to:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>No harassment, bullying, or hate speech</li>
                  <li>No spam or excessive self-promotion</li>
                  <li>No illegal content or activities</li>
                  <li>Respect intellectual property rights</li>
                  <li>No impersonation of others</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-white">5. Content Policy</h2>
                <p className="leading-relaxed">
                  You retain ownership of content you post on Afterfrag. However, by posting content, you grant us a
                  worldwide, non-exclusive, royalty-free license to use, copy, reproduce, process, adapt, modify,
                  publish, transmit, display and distribute such content.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-white">6. Privacy</h2>
                <p className="leading-relaxed">
                  Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the
                  Service, to understand our practices.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-white">7. Termination</h2>
                <p className="leading-relaxed">
                  We may terminate or suspend your account and bar access to the Service immediately, without prior
                  notice or liability, under our sole discretion, for any reason whatsoever including without limitation
                  if you breach the Terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-white">8. Disclaimer</h2>
                <p className="leading-relaxed">
                  The information on this website is provided on an "as is" basis. To the fullest extent permitted by
                  law, this Company excludes all representations, warranties, conditions and terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-white">9. Contact Information</h2>
                <p className="leading-relaxed">
                  If you have any questions about these Terms of Service, please contact us at legal@afterfrag.com.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
