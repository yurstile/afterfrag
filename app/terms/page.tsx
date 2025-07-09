import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, MessageSquare } from "lucide-react"
import { Logo } from "@/components/logo"

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-secondary text-glow-secondary" />
                <Logo size={28} />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Terms of Service</CardTitle>
            <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
                <p className="text-gray-700 leading-relaxed">
                  By accessing and using Afterfrag ("the Service"), you accept and agree to be bound by the terms and
                  provision of this agreement. If you do not agree to abide by the above, please do not use this
                  service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">2. Use License</h2>
                <p className="text-gray-700 leading-relaxed">
                  Permission is granted to temporarily download one copy of Afterfrag for personal, non-commercial
                  transitory viewing only. This is the grant of a license, not a transfer of title, and under this
                  license you may not:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
                  <li>modify or copy the materials</li>
                  <li>use the materials for any commercial purpose or for any public display</li>
                  <li>attempt to reverse engineer any software contained on the website</li>
                  <li>remove any copyright or other proprietary notations from the materials</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
                <p className="text-gray-700 leading-relaxed">
                  When you create an account with us, you must provide information that is accurate, complete, and
                  current at all times. You are responsible for safeguarding the password and for all activities that
                  occur under your account.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">4. Community Guidelines</h2>
                <p className="text-gray-700 leading-relaxed">
                  Users must follow our community guidelines when participating in Fragsubs. This includes but is not
                  limited to:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
                  <li>No harassment, bullying, or hate speech</li>
                  <li>No spam or excessive self-promotion</li>
                  <li>No illegal content or activities</li>
                  <li>Respect intellectual property rights</li>
                  <li>No impersonation of others</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">5. Content Policy</h2>
                <p className="text-gray-700 leading-relaxed">
                  You retain ownership of content you post on Afterfrag. However, by posting content, you grant us a
                  worldwide, non-exclusive, royalty-free license to use, copy, reproduce, process, adapt, modify,
                  publish, transmit, display and distribute such content.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">6. Privacy</h2>
                <p className="text-gray-700 leading-relaxed">
                  Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the
                  Service, to understand our practices.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">7. Termination</h2>
                <p className="text-gray-700 leading-relaxed">
                  We may terminate or suspend your account and bar access to the Service immediately, without prior
                  notice or liability, under our sole discretion, for any reason whatsoever including without limitation
                  if you breach the Terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">8. Disclaimer</h2>
                <p className="text-gray-700 leading-relaxed">
                  The information on this website is provided on an "as is" basis. To the fullest extent permitted by
                  law, this Company excludes all representations, warranties, conditions and terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">9. Contact Information</h2>
                <p className="text-gray-700 leading-relaxed">
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
