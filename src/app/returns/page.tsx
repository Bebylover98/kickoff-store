export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-[#09090B] text-white px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">Returns &amp; Refund Policy</h1>
        <p className="text-white/40 text-sm mb-8">Last updated: {new Date().getFullYear()}</p>
        <div className="space-y-6 text-white/70 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">1. Return Eligibility</h2>
            <p>Items may be returned within 7 days of delivery if they are unused, unworn, and in their original packaging with tags attached.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">2. Non-Returnable Items</h2>
            <p>Customized or personalized jerseys (e.g., with custom names or numbers) cannot be returned unless they arrive damaged or defective.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">3. How to Request a Return</h2>
            <p>Contact us through our official social channels with your order number and reason for return. We will guide you through the next steps.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">4. Refunds</h2>
            <p>Once your return is received and inspected, we will notify you of the approval status. Approved refunds are processed within 5-7 business days via the original payment method or store credit.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">5. Damaged or Defective Items</h2>
            <p>If you receive a damaged or defective item, please contact us within 48 hours of delivery with photos of the issue for a free replacement or full refund.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">6. Exchanges</h2>
            <p>Size exchanges are subject to stock availability. Contact us to arrange an exchange.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
