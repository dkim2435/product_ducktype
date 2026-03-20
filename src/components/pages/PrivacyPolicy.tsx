interface PrivacyPolicyProps {
  onBack: () => void;
}

export function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
  return (
    <article className="max-w-[700px] mx-auto px-6 py-10 text-text leading-[1.8] text-[15px]">
      <button onClick={onBack} className="mb-6 text-sm">
        &larr; Back
      </button>
      <h1 className="text-main text-[28px] mb-2">
        Privacy Policy
      </h1>
      <p className="text-sub mb-8 text-[13px]">
        Last updated: February 2026
      </p>

      <section className="mb-7">
        <h2 className="text-lg text-main mb-3">1. Introduction</h2>
        <p>
          DuckType ("we", "our", "us") is a free online typing test tool. We are committed to
          protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard
          information when you visit our website.
        </p>
      </section>

      <section className="mb-7">
        <h2 className="text-lg text-main mb-3">2. Information We Collect</h2>
        <p className="mb-3">
          <strong className="text-text">Local Data:</strong> We store your
          preferences (theme, language, font settings) locally on your device. If you create an
          account, your typing progress (history, achievements, level) is securely synced to our
          cloud servers to enable cross-device access.
        </p>
        <p>
          <strong className="text-text">Cookies & Analytics:</strong> We use Google
          AdSense for advertising, which may use cookies to serve personalized ads based on your
          browsing history. Google Analytics may also collect anonymized usage data such as page
          views, session duration, and browser type. These services are operated by Google and are
          subject to Google's Privacy Policy.
        </p>
      </section>

      <section className="mb-7">
        <h2 className="text-lg text-main mb-3">3. How We Use Information</h2>
        <ul className="pl-5">
          <li className="mb-2">To save your typing preferences and personal bests locally on your device</li>
          <li className="mb-2">To display relevant advertisements through Google AdSense</li>
          <li className="mb-2">To understand how visitors use our site and improve the user experience</li>
        </ul>
      </section>

      <section className="mb-7">
        <h2 className="text-lg text-main mb-3">4. Third-Party Services</h2>
        <p className="mb-3">
          We use the following third-party services:
        </p>
        <ul className="pl-5">
          <li className="mb-2">
            <strong className="text-text">Google AdSense:</strong> Displays
            advertisements. Google may use cookies to serve ads based on your visit to this site
            and other sites on the Internet. You may opt out of personalized advertising by
            visiting Google Ads Settings.
          </li>
          <li className="mb-2">
            <strong className="text-text">Google Fonts:</strong> We load fonts
            from Google Fonts for display purposes. Google may collect your IP address when
            loading these fonts.
          </li>
        </ul>
      </section>

      <section className="mb-7">
        <h2 className="text-lg text-main mb-3">5. Data Retention</h2>
        <p>
          Settings are stored locally in your browser. If you have an account, your typing progress
          is stored on our secure cloud servers and can be deleted by contacting us. You can clear
          local settings at any time through your browser settings.
        </p>
      </section>

      <section className="mb-7">
        <h2 className="text-lg text-main mb-3">6. Children's Privacy</h2>
        <p>
          Our service is available to users of all ages. We do not knowingly collect personal
          information from children. Account creation is optional and only requires an email address.
        </p>
      </section>

      <section className="mb-7">
        <h2 className="text-lg text-main mb-3">7. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Any changes will be reflected on this
          page with an updated revision date. We encourage you to review this page periodically.
        </p>
      </section>

      <section className="mb-7">
        <h2 className="text-lg text-main mb-3">8. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please use the feedback
          widget at the bottom-right corner of the screen to contact us.
        </p>
      </section>
    </article>
  );
}
