export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#09090B] text-white px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-white/40 text-sm mb-8">Last updated: {new Date().getFullYear()}</p>
        <div className="space-y-6 text-white/70 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">1. Information We Collect</h2>
            <p>When you create an account or place an order, we collect your name, email address, phone number, and delivery address in order to process and fulfill your orders.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">2. How We Use Your Information</h2>
            <p>We use your information solely to process orders, communicate with you about your account or purchases, and improve our services. We do not sell your personal information to third parties.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">3. Data Storage</h2>
            <p>Your data is stored securely using industry-standard practices. Passwords are hashed and never stored in plain text.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">4. Third-Party Services</h2>
            <p>We use trusted third-party services for authentication (Google), image hosting (Cloudinary), and database hosting (Supabase). These providers have their own privacy policies governing their handling of data.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">5. Cookies</h2>
            <p>We use cookies to maintain your login session and improve your browsing experience.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">6. Your Rights</h2>
            <p>You may request access to, correction of, or deletion of your personal data at any time by contacting us.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">7. Contact</h2>
            <p>For privacy-related questions, please reach out to us through our official social channels linked on our website.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
