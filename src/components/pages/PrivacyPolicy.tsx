interface PrivacyPolicyProps {
  onBack: () => void;
}

export function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
  return (
    <article style={{
      maxWidth: '700px',
      margin: '0 auto',
      padding: '40px 24px',
      color: 'var(--text-color)',
      lineHeight: 1.8,
      fontSize: '15px',
    }}>
      <button onClick={onBack} style={{ marginBottom: '24px', fontSize: '14px' }}>
        &larr; Back
      </button>
      <h1 style={{ color: 'var(--main-color)', fontSize: '28px', marginBottom: '8px' }}>
        Privacy Policy
      </h1>
      <p style={{ color: 'var(--sub-color)', marginBottom: '32px', fontSize: '13px' }}>
        Last updated: February 2026
      </p>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '18px', color: 'var(--main-color)', marginBottom: '12px' }}>1. Introduction</h2>
        <p>
          DuckType ("we", "our", "us") is a free online typing test tool. We are committed to
          protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard
          information when you visit our website.
        </p>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '18px', color: 'var(--main-color)', marginBottom: '12px' }}>2. Information We Collect</h2>
        <p style={{ marginBottom: '12px' }}>
          <strong style={{ color: 'var(--text-color)' }}>Local Storage Data:</strong> We store your
          preferences (theme, language, font settings) and typing test history locally on your
          device using browser localStorage. This data never leaves your device and is not
          transmitted to any server.
        </p>
        <p>
          <strong style={{ color: 'var(--text-color)' }}>Cookies & Analytics:</strong> We use Google
          AdSense for advertising, which may use cookies to serve personalized ads based on your
          browsing history. Google Analytics may also collect anonymized usage data such as page
          views, session duration, and browser type. These services are operated by Google and are
          subject to Google's Privacy Policy.
        </p>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '18px', color: 'var(--main-color)', marginBottom: '12px' }}>3. How We Use Information</h2>
        <ul style={{ paddingLeft: '20px' }}>
          <li style={{ marginBottom: '8px' }}>To save your typing preferences and personal bests locally on your device</li>
          <li style={{ marginBottom: '8px' }}>To display relevant advertisements through Google AdSense</li>
          <li style={{ marginBottom: '8px' }}>To understand how visitors use our site and improve the user experience</li>
        </ul>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '18px', color: 'var(--main-color)', marginBottom: '12px' }}>4. Third-Party Services</h2>
        <p style={{ marginBottom: '12px' }}>
          We use the following third-party services:
        </p>
        <ul style={{ paddingLeft: '20px' }}>
          <li style={{ marginBottom: '8px' }}>
            <strong style={{ color: 'var(--text-color)' }}>Google AdSense:</strong> Displays
            advertisements. Google may use cookies to serve ads based on your visit to this site
            and other sites on the Internet. You may opt out of personalized advertising by
            visiting Google Ads Settings.
          </li>
          <li style={{ marginBottom: '8px' }}>
            <strong style={{ color: 'var(--text-color)' }}>Google Fonts:</strong> We load fonts
            from Google Fonts for display purposes. Google may collect your IP address when
            loading these fonts.
          </li>
        </ul>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '18px', color: 'var(--main-color)', marginBottom: '12px' }}>5. Data Retention</h2>
        <p>
          All typing data and preferences are stored locally in your browser. You can clear this
          data at any time through your browser settings or by clearing localStorage. We do not
          maintain any server-side databases of user data.
        </p>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '18px', color: 'var(--main-color)', marginBottom: '12px' }}>6. Children's Privacy</h2>
        <p>
          Our service is available to users of all ages. We do not knowingly collect personal
          information from children. Since all data is stored locally and we do not require account
          creation, no personal data is transmitted to our servers.
        </p>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '18px', color: 'var(--main-color)', marginBottom: '12px' }}>7. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Any changes will be reflected on this
          page with an updated revision date. We encourage you to review this page periodically.
        </p>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '18px', color: 'var(--main-color)', marginBottom: '12px' }}>8. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us
          at <span style={{ color: 'var(--main-color)' }}>ducktype.contact@gmail.com</span>.
        </p>
      </section>
    </article>
  );
}
