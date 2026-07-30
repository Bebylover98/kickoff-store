export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#09090B] text-white px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">Terms &amp; Conditions</h1>
        <p className="text-white/40 text-sm mb-8">Last updated: {new Date().getFullYear()}</p>
        <div className="space-y-6 text-white/70 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">1. Acceptance of Terms</h2>
            <p>By accessing or using KickoffStore, you agree to be bound by these Terms &amp; Conditions. If you do not agree, please do not use our website.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">2. Products &amp; Orders</h2>
            <p>All products are subject to availability. We reserve the right to limit quantities, refuse or cancel any order at our discretion, including in cases of pricing errors or suspected fraud.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">3. Pricing</h2>
            <p>All prices are listed in Nepalese Rupees (NPR) and are subject to change without notice. We are not liable for typographical errors in pricing.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">4. Payment</h2>
            <p>Payment is currently accepted via Cash on Delivery. Additional payment methods may be added in the future.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">5. Account Responsibility</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">6. Changes to Terms</h2>
            <p>We may update these Terms from time to time. Continued use of the site after changes constitutes acceptance of the revised Terms.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">7. Contact</h2>
            <p>For questions about these Terms, please contact us through our official social channels linked on our website.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
